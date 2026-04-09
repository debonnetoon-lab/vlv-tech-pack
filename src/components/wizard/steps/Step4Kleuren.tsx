"use client";

import React from "react";
import { TechPackArticle, PantoneColor } from "@/types/tech-pack";
import {  useDataStore , useTechPackStore } from "@/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_COLORS = [
  { hex: "#000000", name: "Black", p: "Pantone Black C" },
  { hex: "#FFFFFF", name: "White", p: "Pantone White" },
  { hex: "#FF0000", name: "Red", p: "Pantone 200 C" },
  { hex: "#000080", name: "Navy", p: "Pantone 289 C" },
  { hex: "#808080", name: "Grey", p: "Pantone Cool Gray 8 C" },
  { hex: "#FFFF00", name: "Yellow", p: "Pantone Yellow C" },
  { hex: "#00FF00", name: "Green", p: "Pantone 354 C" },
];

export default function Step4Kleuren({ article, collectionId }: { article: TechPackArticle, collectionId: string }) {
  const { updateArticle } = useTechPackStore();

  const addColor = (color?: Partial<PantoneColor>) => {
    const currentColors = article.colors || [];
    const newColors: PantoneColor[] = [
      ...currentColors,
      { 
        hex_value: color?.hex_value || "#CCCCCC", 
        color_name: color?.color_name || "", 
        pantone_code: color?.pantone_code || "" 
      }
    ];
    updateArticle(collectionId, article.id, { colors: newColors });
  };

  const updateColor = (index: number, updates: Partial<PantoneColor>) => {
    const currentColors = [...(article.colors || [])];
    if (currentColors[index]) {
      currentColors[index] = { ...currentColors[index], ...updates };
      updateArticle(collectionId, article.id, { colors: currentColors });
    }
  };

  const removeColor = (index: number) => {
    const currentColors = article.colors || [];
    updateArticle(collectionId, article.id, {
      colors: currentColors.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Welke kleuren?</h2>
        <p className="text-slate-500">Definieer de kleuren die gebruikt worden voor dit artikel.</p>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Snel toevoegen</Label>
          <div className="flex gap-4">
            {QUICK_COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => addColor({ hex_value: c.hex, color_name: c.name, pantone_code: c.p })}
                className="group flex flex-col items-center gap-2"
              >
                <div 
                  className="w-12 h-12 rounded-full border-2 border-white shadow-md group-hover:scale-110 transition-transform" 
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[10px] font-bold text-slate-500">{c.name}</span>
              </button>
            ))}
            <button
               onClick={() => addColor()}
               className="w-12 h-12 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center hover:border-slate-900 transition-colors"
            >
               <Plus className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {(article.colors || []).map((c, i) => (
            <div key={i} className="flex items-center gap-6 p-4 border border-slate-200 rounded-2xl bg-white shadow-sm group animate-in slide-in-from-right-4 duration-300">
               <div className="relative">
                 <input 
                   type="color" 
                   value={c.hex_value} 
                   onChange={(e) => updateColor(i, { hex_value: e.target.value })}
                   className="w-16 h-16 rounded-xl border-none p-0 cursor-pointer overflow-hidden"
                 />
                 <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                    <Palette className="w-3.5 h-3.5 text-slate-900" />
                 </div>
               </div>

               <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-1">
                   <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kleur Naam</Label>
                   <Input 
                      placeholder="bv. VLV Red" 
                      value={c.color_name || ""}
                      onChange={(e) => updateColor(i, { color_name: e.target.value })}
                      className="h-10 border-slate-100 focus:border-[#22c981] font-bold"
                    />
                 </div>
                 <div className="space-y-1">
                   <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pantone Code</Label>
                   <Input 
                      placeholder="bv. Pantone 200 C" 
                      value={c.pantone_code || ""}
                      onChange={(e) => updateColor(i, { pantone_code: e.target.value })}
                      className="h-10 border-slate-100 focus:border-[#22c981]"
                    />
                 </div>
                 <div className="space-y-1">
                   <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HEX / RGB</Label>
                   <Input 
                      value={c.hex_value} 
                      onChange={(e) => updateColor(i, { hex_value: e.target.value })}
                      className="h-10 border-slate-100 focus:border-[#22c981] font-mono text-center"
                    />
                 </div>
               </div>

               <button 
                onClick={() => removeColor(i)}
                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
               >
                <Trash2 className="w-5 h-5" />
               </button>
            </div>
          ))}

          {(!article.colors || article.colors.length === 0) && (
            <div className="py-20 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-50/30">
               <Palette className="w-8 h-8 opacity-20" />
               <p className="text-sm font-medium">Klik op een kleur hierboven om te starten</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
