import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { get, set, del } from 'idb-keyval';
import { supabase } from "@/lib/supabase";

import { useUIStore } from "./useUIStore";
import { useCollaborationStore } from "./useCollaborationStore";
import { TechPackProduct, Collection, ProductImage } from "@/types/tech-pack";
import { PresenceUser } from "@/types/collaboration";
import imageCompression from 'browser-image-compression';

// Helper to debounce async functions
function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

const debouncedSet = debounceAsync(set, 1000);

const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    debouncedSet(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export const assetStorage = {
  get: async (id: string) => await get(`asset:${id}`),
  set: async (id: string, data: string) => await set(`asset:${id}`, data),
  del: async (id: string) => await del(`asset:${id}`)
};

interface DataStore {
  collections: Collection[];
  organizationId: string | null;
  organization: any | null;
  activityLogs: any[];
  isSaving: boolean;
  userRole: 'owner' | 'admin' | 'designer' | 'viewer' | null;
  isGlobalAdmin: boolean;
  
  repairOrganization: () => Promise<void>;
  fetchOrganization: () => Promise<void>;
  fetchCollections: () => Promise<void>;
  fetchActivityLogs: () => Promise<void>;
  createShare: (productId: string) => Promise<string | null>;
  logExport: (productId: string, format: string) => Promise<void>;
  logActivity: (action: string, entityType: string, entityId: string, metadata?: any) => Promise<void>;
  addCollection: (name: string, details?: Partial<Collection>) => Promise<void>;
  addProduct: (collectionId: string, product: Partial<TechPackProduct>) => Promise<void>;
  updateProduct: (collectionId: string, productId: string, updates: Partial<TechPackProduct>) => Promise<void>;
  removeProduct: (collectionId: string, productId: string) => Promise<void>;
  removeCollection: (collectionId: string) => Promise<void>;
  duplicateProduct: (collectionId: string, productId: string) => Promise<void>;
  uploadProgress: number;
  uploadProductImage: (productId: string, file: File, view: ProductImage['view']) => Promise<string>;
  uploadPlacementArtwork: (productId: string, file: File, index: number) => Promise<string>;
  removeProductFile: (fileId: string, storagePath: string) => Promise<void>;
  deleteFileByUrl: (url: string) => Promise<void>;
  setOrganization: (org: any | null) => void;
  switchOrganization: (orgId: string) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useDataStore = create<DataStore>()(
  persist(
    (set, getData) => ({
      collections: [],
      organizationId: null,
      organization: null,
      activityLogs: [],
      isSaving: false,
      userRole: null,
      isGlobalAdmin: false,
      uploadProgress: 0,

      setOrganization: (org: any | null) => set({ organization: org }),

      switchOrganization: async (orgId: string) => {
        const { isGlobalAdmin } = getData();
        if (!isGlobalAdmin) return;

        // Reset active selection in UIStore (it lives there, not in DataStore)
        useUIStore.getState().setActiveCollection(null);
        useUIStore.getState().setActiveArticle(null);
        
        // Fetch new org details
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgId)
          .single();
        
        if (orgData) set({ organization: orgData });

        // Re-fetch collections for this org
        await getData().fetchCollections();
      },

      fetchOrganization: async () => {
        const { organizationId } = getData();

        if (!organizationId) return;
        const { data } = await supabase.from('organizations').select('*').eq('id', organizationId).single();
        if (data) set({ organization: data });
      },

      logActivity: async (action, entityType, entityId, metadata) => {
        const { organizationId } = getData();
        const user = useCollaborationStore.getState().user;
        if (!organizationId || !user) return;

        await supabase.from('activity_logs').insert([{
          organization_id: organizationId,
          user_id: user.id,
          action,
          entity_type: entityType,
          entity_id: entityId,
          metadata
        }]);
      },

      repairOrganization: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        set({ isSaving: true });
        try {
          // 1. Create Organization
          const orgName = `${user.email?.split('@')[0] || 'My'} Workspace`;
          const { data: org, error: orgErr } = await supabase
            .from('organizations')
            .insert([{ 
              name: orgName, 
              slug: `${orgName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}` 
            }])
            .select()
            .single();

          if (orgErr || !org) throw new Error("Failed to create organization: " + orgErr?.message);

          // 2. Add as member
          const { error: memErr } = await supabase
            .from('organization_members')
            .insert([{ 
              organization_id: org.id, 
              user_id: user.id, 
              role: 'owner' 
            }]);

          if (memErr) throw new Error("Failed to create membership: " + memErr.message);

          set({ organizationId: org.id, organization: org });
          await getData().fetchCollections();
        } catch (err: any) {
          console.error("Repair failed:", err);
          alert("Reparatie mislukt: " + err.message);
        } finally {
          set({ isSaving: false });
        }
      },

      fetchCollections: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // ── STEP 1: Ensure org exists ──
        let orgId = getData().organizationId;
        
        if (!orgId) {
          const { data, error: rpcError } = await supabase.rpc('ensure_user_organization');
          if (!rpcError && data) {
            orgId = data;
          } else {
            // Fallback: Check organization_members without .single() to avoid PGRST116 errors on multiple rows
            const { data: mems } = await supabase
              .from('organization_members')
              .select('organization_id')
              .eq('user_id', user.id)
              .limit(1);
            if (mems && mems.length > 0) {
              orgId = mems[0].organization_id;
            }
          }
        }

        if (orgId) {
          set({ organizationId: orgId });
          // Also fetch the full organization object (avoiding single just in case)
          const { data: orgs } = await supabase.from('organizations').select('*').eq('id', orgId).limit(1);
          if (orgs && orgs.length > 0) set({ organization: orgs[0] });

          // Fetch user role for this org (avoiding single)
          const { data: mems } = await supabase
            .from('organization_members')
            .select('role')
            .eq('organization_id', orgId)
            .eq('user_id', user.id)
            .limit(1);
          
          if (mems && mems.length > 0) set({ userRole: mems[0].role as any });
        }

        // ── STEP 1b: Check for Global Admin (Toon) ──
        const { data: globalAdminCheck } = await supabase.rpc('is_global_admin', { user_id: user.id });
        set({ isGlobalAdmin: !!globalAdminCheck });

        // ── STEP 2: Load profile into collaboration store ──
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          useCollaborationStore.getState().setUser(user);
          useCollaborationStore.getState().setProfile({ ...profileData, email: user.email } as unknown as PresenceUser);
        }

        // ── STEP 3: Fetch collections ──
        let { data, error } = await supabase
          .from('collections')
          .select(`
            *,
            products!collection_id (
              *,
              bom_items (*),
              materials (*),
              colorways (*),
              size_charts (*),
              measurement_points (*, values:measurement_values(*)),
              tech_pack_sections (*),
              images:product_files (*)
            )
          `)
          .order('created_at', { ascending: false });

        // Fallback if the complex join fails (e.g. missing tables)
        if (error) {
          console.warn("Complex fetch failed, falling back to simple fetch:", error.message);
          const simpleFetch = await supabase
            .from('collections')
            .select('*, products!collection_id(*)')
            .order('created_at', { ascending: false });
          
          data = simpleFetch.data;
          error = simpleFetch.error;
        }

        if (error) {
          console.error("Error fetching collections:", error);
        } else {
          const mappedCollections = (data as any[] || []).map(col => ({
            ...col,
            products: (col.products || []).map((prod: any) => {
              // Extract placements from tech_pack_sections
              const sketchesSection = prod.tech_pack_sections?.find((s: any) => s.section_type === 'sketches');
              const placements = sketchesSection?.data?.placements || [];

              return {
                ...prod,
                materials: prod.materials || [],
                colorways: prod.colorways || [],
                size_charts: prod.size_charts || [],
                bom_items: prod.bom_items || [],
                images: prod.images || [],
                placements: placements,
                measurement_points: prod.measurement_points || []
              };
            })
          })) as unknown as Collection[];

          set({ collections: mappedCollections });

          // ── EMERGENCY FALLBACK: If org is still null but we HAVE collections, infer orgId from collection ──
          if (!getData().organization && mappedCollections.length > 0) {
            const inferredOrgId = mappedCollections[0].organization_id;
            if (inferredOrgId) {
              set({ organizationId: inferredOrgId });
              const { data: orgs } = await supabase.from('organizations').select('*').eq('id', inferredOrgId).limit(1);
              if (orgs && orgs.length > 0) set({ organization: orgs[0] });
            }
          }

          const uiStore = useUIStore.getState();
          if (!uiStore.activeCollectionId && mappedCollections.length > 0) {
            uiStore.setActiveCollection(mappedCollections[0].id);
          }
        }
      },

      fetchActivityLogs: async () => {
        const { organizationId } = getData();
        if (!organizationId) return;

        const { data, error } = await supabase
          .from('activity_logs')
          .select(`
            *,
            profiles (full_name, avatar_url)
          `)
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data) {
          set({ activityLogs: data });
        }
      },

      createShare: async (productId: string) => {
        const { organizationId } = getData();
        if (!organizationId) return null;

        const { data, error } = await supabase
          .from('shares')
          .insert([{ 
            organization_id: organizationId, 
            product_id: productId 
          }])
          .select()
          .single();

        if (error) {
          console.error("Error creating share:", error);
          return null;
        }

        return data.token;
      },

      logExport: async (productId: string, format: string) => {
        const { organizationId, logActivity } = getData();
        if (!organizationId) return;

        await supabase.from('export_logs').insert([{
          organization_id: organizationId,
          product_id: productId,
          format
        }]);

        await logActivity('exported', 'product', productId, { format });
      },

      addCollection: async (name: string, details?: Partial<Collection>) => {
        const { organizationId, logActivity } = getData();
        let orgId = organizationId;

        // Fetch user once, at top level so it's always in scope
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          alert("Sessie verlopen. Log opnieuw in.");
          return;
        }

        // Ensure we have an organization ID without single() crashes
        if (!orgId) {
          const { data: orgMember } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', user.id)
            .limit(1);
            
          if (orgMember && orgMember.length > 0) { 
            orgId = orgMember[0].organization_id; 
            set({ organizationId: orgId }); 
          }
        }

        if (!orgId) {
          // If literally no organization exists, run repair right now
          await getData().repairOrganization();
          orgId = getData().organizationId;
        }

        set({ isSaving: true });
        
        const payload = { 
            name, 
            organization_id: orgId,
            season: details?.season || "FW", // prevent empty string check violation
            year: details?.year || new Date().getFullYear(),
            created_by: user.id
        };

        let insertRes = await supabase.from('collections').insert([payload]).select().single();

        // ── EMERGENCY AUTO-REPAIR FOR RLS OR MISSING ORG FAILURES ──
        if (insertRes.error && insertRes.error.message.includes('security')) {
           console.warn("RLS block detected! Auto-repairing organization and retrying...");
           await getData().repairOrganization();
           payload.organization_id = getData().organizationId;
           insertRes = await supabase.from('collections').insert([payload]).select().single();
        }

        set({ isSaving: false });
        
        if (insertRes.error) {
          console.error("Error creating collection:", insertRes.error);
          alert("Systeemfout bij opslaan: " + insertRes.error.message);
        } else if (insertRes.data) {
          set((state) => ({ collections: [{ ...insertRes.data, products: [] }, ...state.collections] }));
          logActivity('created', 'collection', insertRes.data.id, { name });
          useUIStore.getState().setCollectionModalOpen(false);
        }
      },

      addProduct: async (collectionId: string, product: Partial<TechPackProduct>) => {
        const { organizationId, logActivity } = getData();
        const user = useCollaborationStore.getState().user;
        if (!user || !organizationId) return;

        set({ isSaving: true });
        const { data, error } = await supabase
          .from('products')
          .insert([{ 
            collection_id: collectionId, 
            organization_id: organizationId,
            name: product.name || "Nieuw Product",
            article_code: product.article_code || "",
            status: "draft",
            created_by: user.id
          }])
          .select()
          .single();

        set({ isSaving: false });
        if (!error && data) {
          set((state) => ({
            collections: state.collections.map((col) =>
              col.id === collectionId ? { ...col, products: [data, ...col.products] } : col
            ),
          }));
          logActivity('created', 'product', data.id, { name: data.name });
          useUIStore.getState().setActiveArticle(data.id);
        }
      },

      updateProduct: async (collectionId: string, productId: string, updates: Partial<TechPackProduct>) => {
        const { logActivity } = getData();
        set((state) => ({
          collections: state.collections.map((col) =>
            col.id === collectionId
              ? {
                  ...col,
                  products: col.products.map((p) =>
                    p.id === productId ? { ...p, ...updates } : p
                  ),
                }
              : col
          ),
          isSaving: true,
        }));

        // Safety timeout to clear saving state if Supabase hangs
        const safetyTimeout = setTimeout(() => set({ isSaving: false }), 10000);

        const { bom_items, materials, colorways, placements, measurement_points, sizes, ...baseFields } = updates as any; 
        
        try {
          if (Object.keys(baseFields).length > 0) {
            await supabase.from('products').update(baseFields).eq('id', productId);
          }

          if (sizes !== undefined) {
             await supabase.from('size_charts').delete().eq('product_id', productId);
             if (sizes.length > 0) {
               await supabase.from('size_charts').insert([{ product_id: productId, sizes: sizes }]);
             }
          }

          if (bom_items && bom_items.length > 0) {
            await supabase.from('bom_items').delete().eq('product_id', productId);
            await supabase.from('bom_items').insert(bom_items.map((b: any) => ({ ...b, product_id: productId })));
          }

          if (materials && materials.length > 0) {
            await supabase.from('materials').delete().eq('product_id', productId);
            await supabase.from('materials').insert(materials.map((m: any) => ({ ...m, product_id: productId })));
          }

          if (colorways && colorways.length > 0) {
            await supabase.from('colorways').delete().eq('product_id', productId);
            await supabase.from('colorways').insert(colorways.map((c: any) => ({ ...c, product_id: productId })));
          }

          if (measurement_points && measurement_points.length > 0) {
            await supabase.from('measurement_points').delete().eq('product_id', productId);
            for (const point of measurement_points) {
               const { id, values, ...pData } = point;
               const { data: newPoint } = await supabase.from('measurement_points').insert([{ ...pData, product_id: productId }]).select().single();
               if (newPoint && values && values.length > 0) {
                  await supabase.from('measurement_values').insert(values.map((v: any) => ({ ...v, point_id: newPoint.id })));
               }
            }
          }

          if (placements) {
            // Store placements in tech_pack_sections for now
            await supabase.from('tech_pack_sections').delete().eq('product_id', productId).eq('section_type', 'sketches');
            await supabase.from('tech_pack_sections').insert([{
              product_id: productId,
              section_type: 'sketches',
              data: { placements },
              order_index: 0
            }]);
          }
          
          logActivity('updated', 'product', productId, { fields: Object.keys(updates) });
        } finally {
          clearTimeout(safetyTimeout);
          set({ isSaving: false });
        }
      },

      removeProduct: async (collectionId: string, productId: string) => {
        const { logActivity } = getData();
        
        try {
          // 1. Cleanup Storage
          const { data: files } = await supabase.storage.from('tech-pack-assets').list(productId);
          if (files && files.length > 0) {
            await supabase.storage.from('tech-pack-assets').remove(files.map(f => `${productId}/${f.name}`));
          }

          // 2. Delete DB Record (Cascades will handles sub-entities)
          await supabase.from('products').delete().eq('id', productId);
          
          set((state) => ({
            collections: state.collections.map((col) =>
              col.id === collectionId ? { ...col, products: col.products.filter(p => p.id !== productId) } : col
            ),
          }));
          
          logActivity('deleted', 'product', productId);
        } catch (error) {
          console.error("Failed to fully remove product:", error);
          alert("Verwijderen mislukt: Probeer het later opnieuw.");
        }
      },

      removeCollection: async (collectionId: string) => {
        const { logActivity } = getData();
        await supabase.from('collections').delete().eq('id', collectionId);
        set((state) => ({ collections: state.collections.filter(c => c.id !== collectionId) }));
        logActivity('deleted', 'collection', collectionId);
      },

      duplicateProduct: async (collectionId: string, productId: string) => {
        const { organizationId, fetchCollections, logActivity } = getData();
        const user = useCollaborationStore.getState().user;
        if (!user || !organizationId) return;

        set({ isSaving: true });
        
        // Track for rollback
        let newProductId: string | null = null;
        const copiedPaths: string[] = [];

        try {
          // 1. Fetch Original with Full State
          const { data: orig, error: fetchErr } = await supabase
            .from('products')
            .select(`
              *,
              bom_items(*),
              materials(*),
              colorways(*),
              measurement_points(*, values:measurement_values(*)),
              product_files(*),
              tech_pack_sections(*)
            `)
            .eq('id', productId)
            .single();

          if (fetchErr || !orig) throw new Error("Could not fetch original product data");

          // 2. Create New Product Record
          const { data: copy, error: copyErr } = await supabase.from('products').insert([{
            collection_id: collectionId,
            organization_id: organizationId,
            name: `${orig.name} (Copy)`,
            article_code: orig.article_code ? `${orig.article_code}-COPY` : "",
            category: orig.category,
            gender: orig.gender,
            description: orig.description,
            customer_po: orig.customer_po,
            garment_type: orig.garment_type,
            fabric_main: orig.fabric_main,
            fabric_secondary: orig.fabric_secondary,
            weight_gsm: orig.weight_gsm,
            status: "draft",
            created_by: user.id
          }]).select().single();

          if (copyErr || !copy) throw new Error("Failed to create product record");
          newProductId = copy.id;

          // 3. Replicate Storage Files
          if (orig.product_files?.length) {
            for (const file of orig.product_files) {
              const fileExt = file.file_url.split('.').pop();
              const newPath = `${newProductId}/${file.view}_${Date.now()}.${fileExt}`;
              
              const { error: storageErr } = await supabase.storage
                .from('tech-pack-assets')
                .copy(file.file_url, newPath);

              if (storageErr) throw new Error(`Storage copy failed: ${storageErr.message}`);
              copiedPaths.push(newPath);

              const { data: { publicUrl } } = supabase.storage.from('tech-pack-assets').getPublicUrl(newPath);

              await supabase.from('product_files').insert([{
                product_id: newProductId,
                file_type: file.file_type,
                file_url: newPath,
                public_url: publicUrl,
                view: file.view,
                file_name: file.file_name,
                uploaded_by: user.id
              }]);
            }
          }

          // 4. Duplicate Sub-Entities (Batch)
          if (orig.bom_items?.length) await supabase.from('bom_items').insert(orig.bom_items.map((b: any) => { const { id, ...rest } = b; return { ...rest, product_id: newProductId }; }));
          if (orig.materials?.length) await supabase.from('materials').insert(orig.materials.map((m: any) => { const { id, ...rest } = m; return { ...rest, product_id: newProductId }; }));
          if (orig.colorways?.length) await supabase.from('colorways').insert(orig.colorways.map((c: any) => { const { id, ...rest } = c; return { ...rest, product_id: newProductId }; }));
          if (orig.tech_pack_sections?.length) await supabase.from('tech_pack_sections').insert(orig.tech_pack_sections.map((s: any) => { const { id, ...rest } = s; return { ...rest, product_id: newProductId }; }));

          // 5. Duplicate POMs with nested values
          if (orig.measurement_points?.length) {
            for (const point of orig.measurement_points) {
              const { id: oldPointId, values, ...pointData } = point;
              const { data: newPoint, error: pointErr } = await supabase
                .from('measurement_points')
                .insert([{ ...pointData, product_id: newProductId }])
                .select()
                .single();
              
              if (!pointErr && newPoint && values?.length) {
                await supabase.from('measurement_values').insert(values.map((v: any) => {
                  const { id, point_id, ...valRest } = v;
                  return { ...valRest, point_id: newPoint.id };
                }));
              }
            }
          }
          
          await fetchCollections();
          if (newProductId) {
            logActivity('duplicated', 'product', newProductId, { original_id: productId });
            useUIStore.getState().setActiveArticle(newProductId);
          }

        } catch (error: any) {
          console.error("Atomic Duplication Failed:", error);
          
          // Cleanup / Rollback
          if (copiedPaths.length > 0) {
            await supabase.storage.from('tech-pack-assets').remove(copiedPaths);
          }
          if (newProductId) {
            await supabase.from('products').delete().eq('id', newProductId);
          }

          alert(`Dupliceren mislukt: ${error.message || "Onbekende fout"}`);
        } finally {
          set({ isSaving: false });
        }
      },

      uploadProductImage: async (productId: string, file: File, view: ProductImage['view']) => {
        const { prepareImageForUpload } = getDataHelpers();
        const { fileToUpload, fileExt } = await prepareImageForUpload(file);

        const fileName = `${productId}/${view}_${Date.now()}.${fileExt}`;
        set({ uploadProgress: 90 });
        const { data: uploadData, error: uploadErr } = await supabase.storage.from('tech-pack-assets').upload(fileName, fileToUpload);
        
        if (uploadErr || !uploadData) {
          set({ uploadProgress: 0 });
          throw new Error("Upload failed: " + uploadErr?.message);
        }

        const { data: { publicUrl } } = supabase.storage.from('tech-pack-assets').getPublicUrl(uploadData.path);
        
        const { error: dbErr } = await supabase.from('product_files').insert([{
          product_id: productId,
          file_type: view === 'artwork' ? 'other' : 'technical_sketch',
          file_url: uploadData.path,
          public_url: publicUrl,
          view,
          file_name: file.name
        }]);

        set({ uploadProgress: 100 });
        setTimeout(() => set({ uploadProgress: 0 }), 1000);

        if (dbErr) throw dbErr;
        return publicUrl;
      },

      uploadPlacementArtwork: async (productId: string, file: File, index: number) => {
        const { prepareImageForUpload } = getDataHelpers();
        const { fileToUpload, fileExt } = await prepareImageForUpload(file);

        const fileName = `${productId}/placement_${index}_${Date.now()}.${fileExt}`;
        set({ uploadProgress: 90 });
        const { data: uploadData, error: uploadErr } = await supabase.storage.from('tech-pack-assets').upload(fileName, fileToUpload);
        
        if (uploadErr || !uploadData) {
          set({ uploadProgress: 0 });
          throw new Error("Placement upload failed: " + uploadErr?.message);
        }

        const { data: { publicUrl } } = supabase.storage.from('tech-pack-assets').getPublicUrl(uploadData.path);
        set({ uploadProgress: 100 });
        setTimeout(() => set({ uploadProgress: 0 }), 1000);
        
        return publicUrl;
      },

      removeProductFile: async (fileId: string, storagePath: string) => {
        const { fetchCollections } = getData();
        set({ isSaving: true });
        try {
          // 1. Delete from Storage
          await supabase.storage.from('tech-pack-assets').remove([storagePath]);
          
          // 2. Delete from DB
          const { error } = await supabase.from('product_files').delete().eq('id', fileId);
          if (error) throw error;

          await fetchCollections();
        } catch (err: any) {
          console.error("Cleanup failed:", err);
          alert("Bestand kon niet volledig verwijderd worden: " + err.message);
        } finally {
          set({ isSaving: false });
        }
      },

      deleteFileByUrl: async (url: string) => {
        if (!url || !url.includes('/storage/v1/object/public/tech-pack-assets/')) return;
        const path = url.split('/storage/v1/object/public/tech-pack-assets/')[1];
        if (path) {
          await supabase.storage.from('tech-pack-assets').remove([path]);
        }
      },

      initialize: async () => {
        // Alias for fetchCollections — satisfies the DataStore interface
        await getData().fetchCollections();
      },
    }),
    {
      name: "vlv-data-storage-v3",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);

/**
 * INTERNAL HELPERS FOR DATA PROCESSING
 */
const getDataHelpers = () => ({
  prepareImageForUpload: async (file: File): Promise<{ fileToUpload: Blob, fileExt: string }> => {
    if (!file.type.startsWith('image/')) {
      return { fileToUpload: file, fileExt: file.name.split('.').pop() || 'tmp' };
    }

    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 2000;
          if (width > MAX_SIZE || height > MAX_SIZE) {
            const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
            width = width * ratio;
            height = height * ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Canvas 2D failed");
          
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(objectUrl);
            if (blob) resolve({ fileToUpload: blob, fileExt: 'jpg' });
            else reject(new Error("Canvas export failed"));
          }, 'image/jpeg', 0.85);
        } catch(err) {
          URL.revokeObjectURL(objectUrl);
          reject(err);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Corrupt image"));
      };
      img.src = objectUrl;
    });
  }
});
