"use client";

import React from "react";
import { useTechPackStore } from "@/store";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Palette, Droplets, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTechPackValidation } from "@/hooks/useTechPackValidation";

const QUICK_COLORS = [
  { hex: "#0b1912", name: "Deep Forest", p: "Black 6 C" },
  { hex: "#22c981", name: "VLV Emerald", p: "3272 C" },
  { hex: "#FFFFFF", name: "Optic White", p: "White" },
  { hex: "#f1f5f9", name: "Ghost Gray", p: "663 C" },
  { hex: "#000080", name: "Royal Navy", p: "289 C" },
  { hex: "#cd262b", name: "Iconic Red", p: "186 C" },
];

export default function Step4Kleuren({ article, collectionId }: { article: any, collectionId: string }) {
  const { updateProduct, userRole } = useTechPackStore();
  const { missingFields } = useTechPackValidation(article);
  const isViewer = userRole === 'viewer';
  const isError = missingFields.some(f => f.step === 4 && f.field === 'colorways');

  const addColor = (color?: any) => {
    const currentColors = article.colorways || [];
    const newColors = [
      ...currentColors,
      { 
        id: crypto.randomUUID(),
        hex_code: color?.hex || "#CCCCCC", 
        name: color?.name || "Nieuwe Kleur", 
        pantone_code: color?.p || "" 
      }
    ];
    updateProduct(collectionId, article.id, { colorways: newColors });
  };

  const updateColor = (id: string, updates: any) => {
    const currentColors = (article.colorways || []).map((c: any) => 
      c.id === id ? { ...c, ...updates } : c
    );
    updateProduct(collectionId, article.id, { colorways: currentColors });
  };

  const removeColor = (id: string) => {
    const currentColors = (article.colorways || []).filter((c: any) => c.id !== id);
    updateProduct(collectionId, article.id, { colorways: currentColors });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">Colorways & Pantone</h2>
          <p className="text-slate-400 font-medium">Definieer de kleurencombinaties voor dit product.</p>
        </div>
        <button 
          onClick={() => !isViewer && addColor()}
          disabled={isViewer}
          className={cn(
            "flex items-center gap-2 h-12 px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-2xl",
            isViewer ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-[#0b1912] text-[#22c981] hover:scale-105 active:scale-95 shadow-[#22c981]/10"
          )}
        >
          <Plus className="w-4 h-4" />
          Kleur Toevoegen
        </button>
      </div>

      <div className="space-y-8">
        {/* Quick Picks */}
        <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100/50">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 block">Sneltoetsen / Brand Colors</Label>
          <div className="flex flex-wrap gap-6">
            {QUICK_COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => addColor(c)}
                className="group flex flex-col items-center gap-3"
              >
                <div 
                  className="w-14 h-14 rounded-2xl border-4 border-white shadow-xl group-hover:scale-110 transition-all duration-300" 
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                  {c.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Color List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {(article.colorways || []).map((c: any) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={c.id} 
                className="flex items-center gap-6 p-6 border border-slate-100 rounded-[32px] bg-white shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group"
              >
                <div className="relative shrink-0">
                  <input 
                    type="color" 
                    value={c.hex_code} 
                    disabled={isViewer}
                    onChange={(e) => !isViewer && updateColor(c.id, { hex_code: e.target.value })}
                    className={cn(
                      "w-20 h-20 rounded-2xl border-none p-0 cursor-pointer overflow-hidden shadow-inner",
                      isViewer && "cursor-not-allowed opacity-50"
                    )}
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-50">
                     <Palette className="w-4 h-4 text-[#22c981]" />
                  </div>
                </div>

                <div className="flex-1 space-y-3 min-w-0">
                  <div className="space-y-1">
                    <Label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Kleur Naam</Label>
                    <input 
                      value={c.name}
                      disabled={isViewer}
                      onChange={(e) => !isViewer && updateColor(c.id, { name: e.target.value })}
                      className={cn(
                        "w-full bg-transparent border-none outline-none font-black text-slate-900 uppercase italic tracking-tight text-lg placeholder:text-slate-100",
                        isViewer && "opacity-60 cursor-not-allowed"
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-0.5">
                      <Label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Pantone</Label>
                      <input 
                        value={c.pantone_code}
                        disabled={isViewer}
                        onChange={(e) => !isViewer && updateColor(c.id, { pantone_code: e.target.value })}
                        placeholder="bv. 3272 C"
                        className={cn(
                          "w-full bg-slate-50 border-none rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 outline-none transition-colors",
                          isViewer ? "cursor-not-allowed opacity-60" : "focus:bg-emerald-50 focus:text-emerald-600"
                        )}
                      />
                    </div>
                    {!isViewer && (
                      <button 
                        onClick={() => removeColor(c.id)}
                        className="mt-4 p-2.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {(article.colorways || []).length === 0 && (
            <div className={cn(
               "md:col-span-2 py-32 border-2 border-dashed rounded-[40px] flex flex-col items-center justify-center gap-4 transition-all duration-500",
               isError ? "border-red-300 bg-red-50/20" : "border-slate-100 bg-slate-50/20 text-slate-300"
            )}>
               <div className={cn(
                  "w-20 h-20 rounded-[28px] shadow-sm flex items-center justify-center transition-all duration-500",
                  isError ? "bg-red-500 text-white shadow-red-200/50 scale-110" : "bg-white"
               )}>
                 {isError ? <AlertCircle className="w-10 h-10" /> : <Droplets className="w-10 h-10 opacity-20" />}
               </div>
               <div className="text-center space-y-1">
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-[0.3em]",
                    isError ? "text-red-600 animate-pulse" : "text-slate-300"
                  )}>
                    {isError ? "Kleurvereiste Onvoldaan" : "Geen colorways gedefinieerd"}
                  </p>
                  {isError && (
                    <p className="text-[10px] font-bold text-red-400/60 uppercase">Voeg minimaal één kleur toe voor productie</p>
                  )}
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Pantone Notice */}
      <div className="p-8 bg-[#0b1912] rounded-[40px] text-white flex items-center justify-between overflow-hidden relative shadow-2xl">
         <Palette className="absolute -right-8 -bottom-8 w-48 h-48 text-white opacity-[0.03]" />
         <div className="flex items-center gap-8 relative z-10">
            <div className="w-16 h-16 rounded-[24px] bg-[#22c981] flex items-center justify-center shadow-xl shadow-[#22c981]/20">
               <Info className="w-8 h-8 text-[#0b1912]" />
            </div>
            <div>
               <h4 className="text-lg font-black uppercase tracking-tight italic">Pantone Match</h4>
               <p className="text-sm text-white/50 font-medium">Alle kleuren worden geëxporteerd met de officiële Pantone-referentie voor productie.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
