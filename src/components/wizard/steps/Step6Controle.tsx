"use client";

import React from "react";
import { TechPackProduct } from "@/types/tech-pack";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Step6Controle({ article, collectionId }: { article: TechPackProduct, collectionId: string }) {
  const warnings = [];
  if (!article.article_code) warnings.push("Geen referentiecode (artikelcode) ingevuld.");
  if (!article.name) warnings.push("Geen productnaam ingevuld.");
  if (!article.images || article.images.length === 0) warnings.push("Geen afbeeldingen toegevoegd.");
  if (!article.colorways || article.colorways.length === 0) warnings.push("Geen kleuren gedefinieerd.");
  if (!article.placements || article.placements.length === 0) warnings.push("Geen print-plaatsingen opgegeven.");

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-900">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Controle</h2>
        <p className="text-slate-500">Kijk alles na voordat je de PDF genereert.</p>
      </div>

      <div className="space-y-6">
        <div className={cn(
          "p-6 rounded-3xl border-2 flex gap-4",
          warnings.length > 0 ? "bg-amber-50 border-amber-100" : "bg-green-50 border-green-100"
        )}>
           {warnings.length > 0 ? (
             <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
           ) : (
             <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
           )}
           <div>
              <h3 className={cn("font-bold text-sm uppercase tracking-wider mb-1", warnings.length > 0 ? "text-amber-700" : "text-green-700")}>
                {warnings.length > 0 ? "Aandachtspunten" : "Klaar voor productie"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {warnings.length > 0 
                  ? "Er zijn nog enkele zaken die je misschien wilt invullen voor een volledige technische fiche." 
                  : "Alle essentiële velden zijn ingevuld. Je kunt nu de PDF genereren."}
              </p>
           </div>
        </div>

        {warnings.length > 0 && (
          <div className="space-y-2">
            {warnings.map((w, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 shadow-sm">
                 <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                 {w}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
           <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Samenvatting</h4>
              <div className="space-y-2">
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500 text-left">Product:</span>
                    <span className="font-bold text-slate-900 text-right">{article.name || "-"}</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500 text-left">Ref Code:</span>
                    <span className="font-bold text-slate-900 text-right">{article.article_code || "-"}</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500 text-left">Basis:</span>
                    <span className="font-bold text-slate-900 text-right uppercase">{article.garment_type || "Geen"}</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500 text-left">Prints:</span>
                    <span className="font-bold text-slate-900 text-right">{article.placements?.length || 0}</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500 text-left">Kleuren:</span>
                    <span className="font-bold text-slate-900 text-right">{article.colorways?.length || 0}</span>
                 </div>
              </div>
           </div>
           
           <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center gap-2">
              <Info className="w-5 h-5 text-slate-300" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Tip</p>
              <p className="text-[10px] text-slate-500">Klik linksboven op de stappen om direct terug te gaan naar een onderdeel.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
