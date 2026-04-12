"use client";

import React, { useState, useEffect } from "react";
import { useTechPackStore, useUIStore } from "@/store";
import { 
  Search, 
  Folder, 
  Image as ImageIcon, 
  Copy, 
  Trash2, 
  MoreVertical, 
  Plus, 
  Users,
  Grid,
  List,
  Calendar,
  CloudSun,
  Loader2
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import StatsCards from "./StatsCards";
import ActivityFeed from "./ActivityFeed";
import CollectionModal from "./CollectionModal";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { 
    collections, 
    duplicateProduct, 
    removeProduct, 
    addProduct,
    fetchCollections,
    organization,
    organizationId,
    repairOrganization,
    isSaving
  } = useTechPackStore();
  
  const { setActiveArticle, setActiveCollection, setCollectionModalOpen } = useUIStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleDuplicate = (collectionId: string, productId: string) => {
    duplicateProduct(collectionId, productId);
  };

  const handleDelete = (collectionId: string, productId: string) => {
    if (window.confirm("Weet je zeker dat je dit product wilt verwijderen?")) {
      removeProduct(collectionId, productId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">Goedgekeurd</span>;
      case 'in_review': return <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest">In Review</span>;
      case 'rejected': return <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest">Afgewezen</span>;
      default: return <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest">Concept</span>;
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* ── TOP HEADER & QUICK ACTIONS ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
        {/* Abstract background blobs */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#22c981] opacity-[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500 opacity-[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
           <div className="flex items-center gap-3 mb-3">
              <div className="px-3 py-1 bg-emerald-100 text-[#1D9E75] rounded-full text-[10px] font-black uppercase tracking-widest">
                V3 SaaS Active
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                {organization?.name || "Laden..."}
              </div>
           </div>
           <h1 className="text-5xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
             Dashboard
           </h1>
           <p className="text-slate-400 font-medium mt-4 max-w-md leading-relaxed">
             Welkom terug in je fashion portal. Beheer hier je volledige collectie en werk samen met je team.
           </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10">
           <button 
             onClick={() => setCollectionModalOpen(true)}
             className="flex items-center gap-3 h-14 px-8 bg-[#0b1912] text-[#22c981] rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#22c981]/10"
           >
              <Plus className="w-5 h-5" />
              Nieuwe Collectie
           </button>
           <button className="flex items-center gap-3 h-14 px-8 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all">
              <Users className="w-5 h-5" />
              Teamlid Uitnodigen
           </button>
        </div>
      </div>

      {/* ── STATS TILES ── */}
      <StatsCards />

      {/* ── MAIN CONTENT (GRID + ACTIVITY) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* COLLECTIONS LIST (LEFT) */}
        <div className="xl:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
               <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Mijn Collecties</h2>
               <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded-lg transition-all", viewMode === "grid" ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}>
                    <Grid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded-lg transition-all", viewMode === "list" ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}>
                    <List className="w-4 h-4" />
                  </button>
               </div>
            </div>

            <div className="relative w-64 group">
              <Search className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#22c981] transition-colors" />
              <input 
                 type="text" 
                 placeholder="Zoek product..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-100 bg-white focus:border-[#22c981] focus:ring-0 transition-all font-medium text-sm"
              />
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {(!organization && !organizationId && collections.length === 0) ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 bg-amber-50 rounded-[40px] border border-amber-100 border-dashed"
              >
                <div className="w-20 h-20 bg-amber-100/50 rounded-full flex items-center justify-center mb-6 text-amber-600">
                   <Users className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-amber-900 uppercase italic text-center px-6">Configuratie Vereist</h3>
                <p className="text-amber-700/60 text-sm font-bold mt-2 text-center max-w-sm px-10">
                  Je account is nog niet gekoppeld aan een werkruimte. Klik op de knop hieronder om je werkruimte automatisch te herstellen.
                </p>
                <button 
                  onClick={() => repairOrganization()}
                  className="mt-8 px-10 h-14 bg-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-600/20 flex items-center gap-3"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  {isSaving ? "Bezig met herstel..." : "Werkruimte Herstellen"}
                </button>
              </motion.div>
            ) : collections.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-slate-100 border-dashed"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                   <Folder className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase italic">Geen collecties</h3>
                <p className="text-slate-400 text-sm font-medium mt-2">Start door je eerste collectie aan te maken.</p>
                <button onClick={() => setCollectionModalOpen(true)} className="mt-8 px-8 py-3 bg-[#22c981] text-[#0b1912] rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#22c981]/20">
                   Collectie Starten
                </button>
              </motion.div>
            ) : (
              <div className="space-y-12">
                {collections.map((collection: any) => (
                  <motion.div 
                    layout
                    key={collection.id} 
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-4 px-1">
                      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-[#22c981] shadow-lg">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                           <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">{collection.name}</h3>
                           <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{collection.products?.length || 0} ITEMS</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                           <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             <CloudSun className="w-3 h-3" />
                             {collection.season || "Geen Seizoen"}
                           </div>
                           <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             <Calendar className="w-3 h-3" />
                             {collection.year || "2026"}
                           </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {collection.products?.filter((p: any) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((product: any) => {
                        const thumbnail = product.images?.[0]?.public_url;
                        return (
                          <motion.div 
                            key={product.id}
                            whileHover={{ y: -5 }}
                            className="group bg-white border border-slate-100 rounded-3xl p-5 hover:border-[#22c981]/30 hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex flex-col h-full"
                          >
                            <div 
                              className="w-full aspect-square bg-slate-50 rounded-2xl mb-5 overflow-hidden relative cursor-pointer group-hover:bg-[#22c981]/5 transition-colors"
                              onClick={() => {
                                setActiveCollection(collection.id);
                                setActiveArticle(product.id);
                              }}
                            >
                              {thumbnail ? (
                                <img src={thumbnail} alt={product.name} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700" />
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-200">
                                   <ImageIcon className="w-8 h-8 mb-2 opacity-30" />
                                   <span className="text-[9px] uppercase font-black tracking-[0.2em] opacity-30">No Visualization</span>
                                </div>
                              )}
                              <div className="absolute top-3 left-3">
                                {getStatusBadge(product.status)}
                              </div>
                            </div>

                            <div className="flex items-start justify-between flex-1">
                              <div 
                                className="flex-1 cursor-pointer"
                                onClick={() => {
                                  setActiveCollection(collection.id);
                                  setActiveArticle(product.id);
                                }}
                              >
                                <h4 className="font-black text-slate-900 text-sm uppercase leading-tight truncate">{product.name}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{product.article_code || "REF-TBA"}</p>
                              </div>

                              <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                  <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all">
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                  <DropdownMenu.Content align="end" className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 min-w-[200px] z-[200] animate-in fade-in zoom-in-95 duration-200">
                                    <DropdownMenu.Item onClick={() => handleDuplicate(collection.id, product.id)} className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl outline-none cursor-pointer tracking-widest transition-colors mb-1">
                                      <Copy className="w-4 h-4 text-amber-500" />
                                      Dupliceren
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item onClick={() => handleDelete(collection.id, product.id)} className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl outline-none cursor-pointer tracking-widest transition-colors">
                                      <Trash2 className="w-4 h-4 outline-none" />
                                      Verwijderen
                                    </DropdownMenu.Item>
                                  </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                              </DropdownMenu.Root>
                            </div>
                          </motion.div>
                        );
                      })}
                      
                      {/* ADD PRODUCT CARD */}
                      <button 
                         onClick={() => {
                            setActiveCollection(collection.id);
                            addProduct(collection.id, { name: "Nieuw Product" });
                         }}
                         className="group border border-slate-100 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center gap-4 transition-all hover:border-[#22c981] hover:bg-[#22c981]/5 min-h-[300px]"
                      >
                         <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-white flex items-center justify-center text-slate-300 group-hover:text-[#22c981] group-hover:scale-110 transition-all shadow-sm">
                            <Plus className="w-6 h-6" />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[#22c981]">Product Toevoegen</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* ACTIVITY FEED (RIGHT) */}
        <div className="xl:col-span-4 sticky top-8">
           <ActivityFeed />
        </div>

      </div>

      {/* Global Modals */}
      <CollectionModal />

    </div>
  );
}
