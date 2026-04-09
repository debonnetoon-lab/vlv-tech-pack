/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React from "react";
import { Folder, FileText, Plus, Copy, Trash2, Settings, Download, ArrowDownAZ, GripVertical, WifiOff, ChevronRight, Check } from "lucide-react";
import {  useUIStore, useDataStore, useCollaborationStore , useTechPackStore } from "@/store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import DataManagement from "../settings/DataManagement";
import { PresenceBanner } from "../collaboration/PresenceBanner";
import WizardStepper from "../wizard/WizardStepper";

export default function Sidebar() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(window.navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { 
    collections, 
    activeCollectionId, 
    activeArticleId,
    activeStep,
    setActiveCollection,
    setActiveArticle,
    setActiveStep,
    addCollection,
    addArticle,
    profile,
    user
  } = useTechPackStore();

  const { setSettingsOpen } = useUIStore();
  const [showNewCollectionModal, setShowNewCollectionModal] = React.useState(false);
  const [newCollectionName, setNewCollectionName] = React.useState("");

  const activeCollection = collections.find((c: any) => c.id === activeCollectionId);
  const activeArticle = activeCollection?.articles.find((a: any) => a.id === activeArticleId);

  const handleCreateCollection = () => {
    setShowNewCollectionModal(true);
  };

  const submitNewCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      addCollection(newCollectionName.trim());
      setNewCollectionName("");
      setShowNewCollectionModal(false);
    }
  };

  const handleCreateArticle = (colId: string) => {
    addArticle(colId, { product_name: "Nieuw Artikel", reference_code: "" });
  };

  return (
    <div className="flex flex-col h-full bg-[#0b1912] text-white/70 font-sans select-none border-r border-white/[0.05]">
      {/* ── BRAND HEADER ── */}
      <div className="p-4 flex items-center justify-between border-b border-white/[0.03] bg-white/[0.01]">
        <div className="flex items-center gap-2.5">
           <div className={cn(
             "w-2.5 h-2.5 rounded-full shadow-[0_0_12px_rgba(34,201,129,0.5)]",
             isOnline ? "bg-[#22c981]" : "bg-red-500"
           )} />
           <h1 className="font-black italic tracking-tighter text-sm text-white uppercase">VLV BUILDER</h1>
        </div>
        
        <button 
          onClick={handleCreateCollection}
          className="w-7 h-7 rounded-lg bg-white/[0.07] border border-white/10 flex items-center justify-center text-[#22c981] hover:bg-white/10 hover:text-white transition-all transform active:scale-[0.98]"
          title="Nieuwe Collectie"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* ── STATUS / PRESENCE (Punt 7) ── */}
      <div className="px-2 border-b border-white/[0.03] bg-white/[0.01]">
        <PresenceBanner />
      </div>

      {/* ── COLLECTIONS SELECTOR ── */}
      <div className="p-3 border-b border-white/[0.03]">
         <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[9px] font-black text-[#2d7a55] uppercase tracking-widest">Collecties</span>
         </div>
         <div className="space-y-1">
            {collections.slice(0, 5).map((col: any) => (
               <div key={col.id} className="space-y-1">
                 <button 
                    onClick={() => { setActiveCollection(col.id); setActiveArticle(col.articles?.[0]?.id || null); setActiveStep(1); }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold transition-all",
                      activeCollectionId === col.id ? "bg-[#22c981]/10 text-white border border-[#22c981]/20 shadow-md" : "hover:bg-white/5 text-slate-500"
                    )}
                 >
                    <Folder className="w-3 h-3 text-[#22c981]" />
                    <span className="truncate flex-1 text-left">{col.name}</span>
                 </button>

                 {/* Geneste lijst van artikelen als collectie open is */}
                 {activeCollectionId === col.id && (
                    <div className="pl-5 pr-1 py-2 space-y-1 mb-2 border-l-2 border-white/5 ml-3">
                       {col.articles?.map((art: any) => (
                          <button
                            key={art.id}
                            onClick={() => { setActiveArticle(art.id); setActiveStep(1); }}
                            className={cn(
                               "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold transition-all group",
                               activeArticleId === art.id ? "text-[#22c981] bg-[#22c981]/5 shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                          >
                             <FileText className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                             <span className="truncate flex-1 text-left">{art.product_name || "Naamloos Item"}</span>
                          </button>
                       ))}
                       <button
                         onClick={() => { addArticle(col.id, { product_name: "Nieuw Artikel" }); setActiveStep(1); }}
                         className="w-full flex items-center gap-2 px-3 py-2 mt-2 rounded-lg text-[10px] font-bold transition-all text-white/40 hover:text-[#22c981] hover:bg-[#22c981]/5 border border-dashed border-white/10 hover:border-[#22c981]/30"
                       >
                         <Plus className="w-3 h-3" />
                         Tech Pack Toevoegen
                       </button>
                    </div>
                 )}
               </div>
            ))}
         </div>
      </div>

      {/* ── STAPPENPLAN (Punt 2, 3, 6) ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
        {activeArticle ? (
           <WizardStepper />
        ) : (
           <div className="py-12 px-4 text-center space-y-4 opacity-40">
              <div className="w-10 h-10 rounded-2xl bg-white/5 mx-auto flex items-center justify-center">
                 <FileText className="w-5 h-5 text-slate-700" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                 Selecteer een artikel<br />om te navigeren
              </p>
           </div>
        )}
      </div>

      {/* ── FOOTER / SETTINGS (Punt 13) ── */}
      <div className="p-3 border-t border-white/[0.03] space-y-3 bg-[#0b1912]">
        <button 
           onClick={() => setSettingsOpen(true)}
           className="w-full flex items-center gap-3 p-3 rounded-2xl text-slate-500 hover:bg-white/[0.03] hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
        >
           <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
              <Settings className="w-3.5 h-3.5" />
           </div>
           Instellingen & Back-up
        </button>

        <div className="flex items-center gap-3 px-1 pt-1 opacity-80">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#fff] font-black text-[10px] shadow-inner"
            style={{ backgroundColor: profile?.avatar_color || "#1D9E75" }}
          >
            {profile?.initials || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black text-white/90 truncate uppercase tracking-tight">{profile?.full_name || "Toon Vive Le Vélo"}</p>
            <p className="text-[9px] text-slate-500 truncate">{user?.email || "toon@vivelevelo.be"}</p>
          </div>
          <WifiOff className={cn("w-3 h-3 transition-colors", isOnline ? "text-slate-800" : "text-red-500")} />
        </div>
      </div>

      {/* Modals styles unchanged */}

      {showNewCollectionModal && (
        <div className="fixed inset-0 z-50 bg-[#0b1912]/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowNewCollectionModal(false)}>
          <div className="w-full max-w-sm bg-white rounded-[40px] shadow-2xl p-10 space-y-6 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
             <div className="space-y-1">
                <h3 className="text-2xl font-black italic tracking-tighter uppercase text-[#0b1912]">Nieuwe Collectie</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Geef je collectie een naam</p>
             </div>
             <form onSubmit={submitNewCollection} className="space-y-4">
                <input 
                   autoFocus
                   type="text"
                   className="w-full h-14 px-5 rounded-2xl border-2 border-slate-100 focus:border-[#22c981] focus:ring-0 transition-all font-black text-lg text-[#0b1912] placeholder:text-slate-200"
                   placeholder="bv. SS2026 - Main"
                   value={newCollectionName}
                   onChange={(e) => setNewCollectionName(e.target.value)}
                />
                <div className="flex gap-2 pt-2">
                   <button type="button" onClick={() => setShowNewCollectionModal(false)} className="flex-1 h-14 rounded-2xl text-slate-400 font-bold hover:bg-slate-50 transition-colors uppercase text-[10px] tracking-widest">Annuleren</button>
                   <button type="submit" disabled={!newCollectionName.trim()} className="flex-[2] h-14 rounded-2xl bg-[#0b1912] text-[#22c981] font-black hover:scale-[1.03] disabled:opacity-50 disabled:hover:scale-100 transition-all uppercase text-[10px] tracking-widest shadow-xl active:scale-[0.98]">Aanmaken</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
