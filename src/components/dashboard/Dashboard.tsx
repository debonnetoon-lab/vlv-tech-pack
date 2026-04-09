"use client";

import React, { useState } from "react";
import { useTechPackStore, useUIStore } from "@/store";
import { TechPackArticle } from "@/types/tech-pack";
import { Search, Filter, Folder, Image as ImageIcon, Copy, Trash2, MoreVertical, Plus } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export default function Dashboard() {
  const { collections, duplicateArticle, removeArticle } = useTechPackStore();
  const { setActiveArticle, setActiveCollection, setCollectionModalOpen } = useUIStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filtering logic
  const filteredCollections = collections.map(col => {
    const filteredArticles = col.articles.filter(article => {
      const matchesSearch = 
        article.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        article.reference_code?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || article.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    return {
      ...col,
      articles: filteredArticles
    };
  }).filter(col => col.articles.length > 0 || searchQuery === "");

  const handleDuplicate = (collectionId: string, articleId: string) => {
    duplicateArticle(collectionId, articleId);
  };

  const handleDelete = (collectionId: string, articleId: string) => {
    if (window.confirm("Weet je zeker dat je dit artikel wilt verwijderen?")) {
      removeArticle(collectionId, articleId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Goedgekeurd</span>;
      case 'review': return <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest">In Review</span>;
      default: return <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 text-[10px] font-bold uppercase tracking-widest">WIP</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black italic tracking-tighter text-[#0b1912] uppercase leading-none">Dashboard</h1>
           <p className="text-slate-500 font-medium mt-2">Beheer centraal al je collecties en artikelen.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                 type="text" 
                 placeholder="Zoek artikel..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full h-10 pl-10 pr-4 rounded-xl border-2 border-slate-100 focus:border-[#22c981] focus:ring-0 transition-all font-medium text-sm"
              />
           </div>
           
           <select 
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
             className="h-10 px-4 rounded-xl border-2 border-slate-100 hover:border-slate-200 focus:border-[#22c981] focus:ring-0 transition-all font-bold text-sm text-[#0b1912] uppercase tracking-wide appearance-none bg-white min-w-[120px]"
           >
             <option value="all">Alle Statussen</option>
             <option value="draft">WIP (Draft)</option>
             <option value="review">In Review</option>
             <option value="approved">Goedgekeurd</option>
           </select>
        </div>
      </div>

      {/* RENDER COLLECTIONS */}
      {filteredCollections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
           <Folder className="w-10 h-10 text-slate-300 mb-4" />
           <p className="text-slate-500 font-medium">Geen artikelen gevonden voor deze filters.</p>
           {searchQuery === "" && (
             <button onClick={() => setCollectionModalOpen(true)} className="mt-4 px-6 py-2.5 bg-[#22c981] text-[#0b1912] rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">
                Nieuwe Collectie
             </button>
           )}
        </div>
      ) : (
        <div className="space-y-12">
          {filteredCollections.map(collection => (
            <div key={collection.id} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
                <h2 className="text-base font-black uppercase tracking-widest text-[#0b1912] flex items-center gap-2">
                   <Folder className="w-4 h-4 text-[#22c981]" />
                   {collection.name} 
                   <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-2">{collection.articles.length}</span>
                </h2>
              </div>
              
              {collection.articles.length === 0 ? (
                 <div className="py-6 px-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lege collectie</p>
                 </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {collection.articles.map(article => {
                    // Extract thumbnail securely
                    const thumbnail = article.images?.find(i => i.view === 'front')?.public_url 
                      || article.images?.[0]?.public_url;

                    return (
                      <div key={article.id} className="group relative bg-white border border-slate-100 rounded-2xl p-4 hover:border-[#22c981]/30 hover:shadow-xl hover:shadow-[#22c981]/5 transition-all">
                        
                        {/* Thumbnail */}
                        <div 
                          className="w-full aspect-[4/3] bg-slate-50 rounded-xl mb-4 overflow-hidden relative cursor-pointer"
                          onClick={() => {
                            setActiveCollection(collection.id);
                            setActiveArticle(article.id);
                          }}
                        >
                          {thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={thumbnail} alt={article.product_name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                               <ImageIcon className="w-6 h-6 mb-2 opacity-50" />
                               <span className="text-[10px] uppercase font-bold tracking-widest">Geen Afrb.</span>
                            </div>
                          )}
                          <div className="absolute top-2 left-2">
                            {getStatusBadge(article.status)}
                          </div>
                        </div>

                        {/* Article Info */}
                        <div className="flex items-start justify-between">
                          <div 
                            className="flex-1 cursor-pointer pr-4"
                            onClick={() => {
                              setActiveCollection(collection.id);
                              setActiveArticle(article.id);
                            }}
                          >
                            <h3 className="font-bold text-[#0b1912] text-sm truncate">{article.product_name || "Naamloos Artikel"}</h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 truncate">{article.reference_code || "Geen ref."}</p>
                          </div>

                          {/* Quick Actions */}
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-[#0b1912] transition-colors -mr-2">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content align="end" className="bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 p-1 min-w-[150px] z-[200] animate-in fade-in zoom-in-95 duration-200">
                                <DropdownMenu.Item 
                                  onClick={() => handleDuplicate(collection.id, article.id)}
                                  className="flex items-center gap-2 w-full px-3 py-2.5 text-xs font-bold text-slate-600 hover:text-[#0b1912] hover:bg-slate-50 rounded-lg outline-none cursor-pointer mb-1 uppercase tracking-widest"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  Dupliceren
                                </DropdownMenu.Item>
                                
                                <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />
                                
                                <DropdownMenu.Item 
                                  onClick={() => handleDelete(collection.id, article.id)}
                                  className="flex items-center gap-2 w-full px-3 py-2.5 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg outline-none cursor-pointer uppercase tracking-widest mt-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Verwijderen
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* New Article Box inside Collection */}
                  <div 
                    onClick={() => {
                        setActiveCollection(collection.id);
                        useTechPackStore.getState().addArticle(collection.id, { product_name: "Nieuw Artikel" });
                    }}
                    className="group border border-slate-100 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#22c981] hover:bg-[#22c981]/5 transition-all text-slate-400 hover:text-[#22c981] min-h-[200px]"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Nieuw Artikel Toevoegen</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
