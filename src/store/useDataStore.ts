import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { get, set, del } from 'idb-keyval';
import { supabase } from "@/lib/supabase";

import { useUIStore } from "./useUIStore";
import { useCollaborationStore } from "./useCollaborationStore";
import { TechPackArticle, Collection, ArticleImage } from "@/types/tech-pack";
import { PresenceUser } from "@/types/collaboration";

// Helper to debounce async functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  get: async (id: string): Promise<string | undefined> => {
    return await get(`asset:${id}`);
  },
  set: async (id: string, data: string): Promise<void> => {
    await set(`asset:${id}`, data);
  },
  remove: async (id: string): Promise<void> => {
    await del(`asset:${id}`);
  },
};

interface DataStore {
  collections: Collection[];
  
  isSaving: boolean;
  
  fetchCollections: () => Promise<void>;
  addCollection: (name: string, details?: Partial<Collection>) => Promise<void>;
  addArticle: (collectionId: string, article: Partial<TechPackArticle>) => Promise<void>;
  updateArticle: (collectionId: string, articleId: string, updates: Partial<TechPackArticle>) => Promise<void>;
  removeArticle: (collectionId: string, articleId: string) => Promise<void>;
  removeCollection: (collectionId: string) => Promise<void>;
  duplicateArticle: (collectionId: string, articleId: string) => Promise<void>;
  reorderArticles: (collectionId: string, articles: TechPackArticle[]) => void;
  sortArticlesByName: (collectionId: string) => void;
  uploadArticleImage: (articleId: string, file: File, view: ArticleImage['view']) => Promise<string>;
}

export const useDataStore = create<DataStore>()(
  persist(
    (set, getData) => ({
      collections: [],
      isSaving: false,

      fetchCollections: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Sync local collaboration state
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          useCollaborationStore.getState().setUser(user);
          // Omit email error in strictly typed interfaces for now until types are cleaned up
          useCollaborationStore.getState().setProfile({ 
            ...profileData, 
            email: user.email 
          } as unknown as PresenceUser);
        }

        const { data, error } = await supabase
          .from('collections')
          .select(`
            *,
            articles (
              *,
              sizes (*),
              artwork_placements (*),
              pantone_colors (*),
              article_images (*),
              bom_items (*),
              measurement_points (*, measurement_values (*))
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching collections:", error);
        } else {
          // Bridge database names to frontend property names
          const mappedCollections = (data as any[] || []).map(col => ({
            ...col,
            articles: (col.articles || []).map((art: any) => ({
              ...art,
              images: art.article_images || [],
              placements: art.artwork_placements || [],
              colors: art.pantone_colors || [],
              sizes: art.sizes || [],
              bom_items: art.bom_items || [],
              measurement_points: (art.measurement_points || []).map((mp: any) => ({
                ...mp,
                values: mp.measurement_values || []
              }))
            }))
          })) as unknown as Collection[];

          set({ collections: mappedCollections });
          
          const uiStore = useUIStore.getState();
          if (!uiStore.activeCollectionId && mappedCollections.length > 0) {
            uiStore.setActiveCollection(mappedCollections[0].id);
            const firstColArticles = mappedCollections[0].articles;
            uiStore.setActiveArticle(firstColArticles?.[0]?.id || null);
          }
        }
      },

      addCollection: async (name: string, details?: Partial<Collection>) => {
        const user = useCollaborationStore.getState().user;
        if (!user) return;

        set({ isSaving: true });
        const { data, error } = await supabase
          .from('collections')
          .insert([{ 
            name, 
            created_by: user.id,
            season: details?.season || "",
            year: details?.year || new Date().getFullYear(),
            description: details?.description || ""
          }])
          .select()
          .single();

        set({ isSaving: false });
        if (error) console.error("Error adding collection:", error);
        else {
          set((state) => ({
            collections: [
              { ...data, articles: [] },
              ...state.collections
            ],
          }));
          useUIStore.getState().setActiveCollection(data.id);
        }
      },

      addArticle: async (collectionId: string, article: Partial<TechPackArticle>) => {
        const user = useCollaborationStore.getState().user;
        if (!user) return;

        set({ isSaving: true });
        const { data, error } = await supabase
          .from('articles')
          .insert([{ 
            collection_id: collectionId, 
            product_name: article.product_name || "Nieuw Artikel",
            reference_code: article.reference_code || "",
            status: "draft",
            created_by: user.id
          }])
          .select()
          .single();

        set({ isSaving: false });
        if (error) {
          console.error("Error adding article:", error);
          return;
        }

        set((state) => {
          const newArticle = {
            ...data,
            sizes: [],
            placements: [],
            colors: [],
            images: [],
          } as TechPackArticle;

          return {
            collections: state.collections.map((col) =>
              col.id === collectionId 
                ? { ...col, articles: [newArticle, ...col.articles] }
                : col
            ),
          };
        });
        
        const uiStore = useUIStore.getState();
        uiStore.setActiveArticle(data.id);
      },

      updateArticle: async (collectionId: string, articleId: string, updates: Partial<TechPackArticle>) => {
        // Optimistic UI
        set((state) => ({
          collections: state.collections.map((col) =>
            col.id === collectionId
              ? {
                  ...col,
                  articles: col.articles.map((art) =>
                    art.id === articleId ? { ...art, ...updates } : art
                  ),
                }
              : col
          ),
          isSaving: true,
        }));

        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        const { sizes, placements, colors, images, ...baseFields } = updates;

        try {
          if (Object.keys(baseFields).length > 0) {
            const { error } = await supabase.from('articles').update(baseFields).eq('id', articleId);
            if (error) console.error("Error updating article:", error);
          }

          // Handle relational
          if (sizes) {
            await supabase.from('sizes').delete().eq('article_id', articleId);
            if (sizes.length > 0) await supabase.from('sizes').insert(sizes.map(s => ({ ...s, article_id: articleId })));
          }
          if (colors) {
            await supabase.from('pantone_colors').delete().eq('article_id', articleId);
            if (colors.length > 0) await supabase.from('pantone_colors').insert(colors.map(c => ({ ...c, article_id: articleId })));
          }
          if (placements) {
            await supabase.from('artwork_placements').delete().eq('article_id', articleId);
            if (placements.length > 0) await supabase.from('artwork_placements').insert(placements.map(p => ({ ...p, article_id: articleId })));
          }
          if (updates.bom_items) {
            await supabase.from('bom_items').delete().eq('article_id', articleId);
            if (updates.bom_items.length > 0) await supabase.from('bom_items').insert(updates.bom_items.map(b => ({ ...b, article_id: articleId })));
          }
          if (updates.measurement_points) {
            // This is more complex because of nested values
            await supabase.from('measurement_points').delete().eq('article_id', articleId);
            for (const mp of updates.measurement_points) {
              const { values, ...pointData } = mp;
              const { data: newPoint, error: pError } = await supabase
                .from('measurement_points')
                .insert([{ ...pointData, article_id: articleId }])
                .select()
                .single();
              
              if (!pError && newPoint && values?.length) {
                await supabase.from('measurement_values').insert(
                  values.map(v => ({ ...v, point_id: newPoint.id }))
                );
              }
            }
          }
        } finally {
          set({ isSaving: false });
        }
      },

      removeArticle: async (collectionId: string, articleId: string) => {
        const { error } = await supabase.from('articles').delete().eq('id', articleId);
        if (error) console.error("Error removing article:", error);

        set((state) => {
          const collection = state.collections.find((c) => c.id === collectionId);
          const remainingArticles = collection?.articles.filter((a) => a.id !== articleId) || [];
          
          const uiStore = useUIStore.getState();
          if (uiStore.activeArticleId === articleId) {
             uiStore.setActiveArticle(remainingArticles[0]?.id ?? null);
          }

          return {
            collections: state.collections.map((col) =>
              col.id === collectionId ? { ...col, articles: remainingArticles } : col
            ),
          };
        });
      },
      
      removeCollection: async (collectionId: string) => {
        const { error } = await supabase.from('collections').delete().eq('id', collectionId);
        if (error) console.error("Error removing collection:", error);

        set((state) => {
          const remainingCollections = state.collections.filter((c) => c.id !== collectionId);
          
          const uiStore = useUIStore.getState();
          if (uiStore.activeCollectionId === collectionId) {
             const newColId = remainingCollections[0]?.id ?? null;
             uiStore.setActiveCollection(newColId);
             uiStore.setActiveArticle(remainingCollections[0]?.articles?.[0]?.id ?? null);
          }

          return {
            collections: remainingCollections,
          };
        });
      },

      duplicateArticle: async (collectionId: string, articleId: string) => {
        const user = useCollaborationStore.getState().user;
        if (!user) return;

        const { data: original, error: fetchError } = await supabase
          .from('articles')
          .select('*, sizes(*), artwork_placements(*), pantone_colors(*), article_images(*), bom_items(*), measurement_points(*, measurement_values(*))')
          .eq('id', articleId)
          .single();

        if (fetchError || !original) return;

        const { data: duplicate, error: insertError } = await supabase
          .from('articles')
          .insert([{
            collection_id: collectionId,
            product_name: `${original.product_name} (Copy)`,
            reference_code: original.reference_code,
            garment_type: original.garment_type,
            gender: original.gender,
            fit: original.fit,
            brand: original.brand,
            customer_po: original.customer_po,
            disclaimer_enabled: original.disclaimer_enabled,
            disclaimer_text: original.disclaimer_text,
            fabric_main: original.fabric_main,
            fabric_secondary: original.fabric_secondary,
            weight_gsm: original.weight_gsm,
            label_type: original.label_type,
            label_position: original.label_position,
            label_content: original.label_content,
            packaging: original.packaging,
            packaging_notes: original.packaging_notes,
            status: "draft",
            created_by: user.id
          }])
          .select()
          .single();

        if (insertError || !duplicate) return;

        if (original.sizes?.length) await supabase.from('sizes').insert(original.sizes.map((item: Record<string, unknown>) => { const { id, created_at, ...rest } = item; return { ...rest, article_id: duplicate.id }; }));
        if (original.pantone_colors?.length) await supabase.from('pantone_colors').insert(original.pantone_colors.map((item: Record<string, unknown>) => { const { id, created_at, ...rest } = item; return { ...rest, article_id: duplicate.id }; }));
        if (original.artwork_placements?.length) await supabase.from('artwork_placements').insert(original.artwork_placements.map((item: Record<string, unknown>) => { const { id, created_at, ...rest } = item; return { ...rest, article_id: duplicate.id }; }));
        if (original.article_images?.length) await supabase.from('article_images').insert(original.article_images.map((item: Record<string, unknown>) => { const { id, created_at, ...rest } = item; return { ...rest, article_id: duplicate.id }; }));
        if (original.bom_items?.length) await supabase.from('bom_items').insert(original.bom_items.map((item: Record<string, unknown>) => { const { id, created_at, ...rest } = item; return { ...rest, article_id: duplicate.id }; }));
        
        if (original.measurement_points?.length) {
          for (const mp of original.measurement_points) {
            const { id: oldId, created_at: ca, measurement_values, ...pointData } = mp;
            const { data: newPoint } = await supabase.from('measurement_points').insert([{ ...pointData, article_id: duplicate.id }]).select().single();
            if (newPoint && measurement_values?.length) {
               await supabase.from('measurement_values').insert(measurement_values.map((v: any) => {
                 const { id, created_at, ...valData } = v;
                 return { ...valData, point_id: newPoint.id };
               }));
            }
          }
        }

        await getData().fetchCollections();
        useUIStore.getState().setActiveArticle(duplicate.id);
      },
      
      reorderArticles: (collectionId: string, articles: TechPackArticle[]) =>
        set((state) => ({
          collections: state.collections.map((col) =>
            col.id === collectionId ? { ...col, articles } : col
          ),
        })),

      sortArticlesByName: (collectionId: string) =>
        set((state) => ({
          collections: state.collections.map((col) =>
            col.id === collectionId
              ? {
                  ...col,
                  articles: [...col.articles].sort((a, b) => {
                    const nameA = (a.reference_code || a.product_name || "").toLowerCase();
                    const nameB = (b.reference_code || b.product_name || "").toLowerCase();
                    return nameA.localeCompare(nameB);
                  }),
                }
              : col
          ),
        })),

      uploadArticleImage: async (articleId: string, file: File, view: ArticleImage['view']) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${articleId}/${view}_${Date.now()}.${fileExt}`;
        
        let timeoutId: NodeJS.Timeout;
        const timeout = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error("De upload duurt te lang. Controleer je internetverbinding.")), 60000);
        });

        try {
          const uploadPromise = supabase.storage.from('tech-pack-assets').upload(fileName, file);
          const { data, error: uploadError } = await (Promise.race([uploadPromise, timeout]) as any);
          
          clearTimeout(timeoutId!); // Ensure we always clear the ghost error
          
          if (uploadError) {
             console.error("Supabase Upload Reject:", uploadError);
             throw new Error(uploadError.message || "Upload geblokkeerd (misschien ontbreekt de 'tech-pack-assets' Storage Bucket)");
          }
          if (!data?.path) throw new Error("Geen bestandspad ontvangen na upload.");

          const { data: { publicUrl } } = supabase.storage.from('tech-pack-assets').getPublicUrl(data.path);

          // Record in DB
          const { error: insertError } = await supabase.from('article_images').insert([{
            article_id: articleId,
            view,
            storage_path: data.path,
            public_url: publicUrl,
            file_name: file.name,
            file_size_kb: Math.round(file.size / 1024)
          }]);

          if (insertError) {
             console.error("Database Insert Reject:", insertError);
             throw insertError;
          }

          return publicUrl;
        } catch (err: any) {
          clearTimeout(timeoutId!);
          console.error("Storage upload helper error:", err);
          throw err;
        }
      },
    }),
    {
      name: "tech-pack-data-storage",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
