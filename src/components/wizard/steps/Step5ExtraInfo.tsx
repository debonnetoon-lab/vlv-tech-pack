/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { TechPackArticle } from "@/types/tech-pack";
import {  useDataStore , useTechPackStore } from "@/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export default function Step5ExtraInfo({ article, collectionId }: { article: TechPackArticle, collectionId: string }) {
  const { updateArticle } = useTechPackStore();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Extra info</h2>
        <p className="text-slate-500">Geef aan welke labels en verpakking nodig zijn.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {/* Necklabel Section */}
          <div className={cn(
            "p-6 border rounded-2xl transition-all duration-300",
            article.label_type ? "bg-white border-slate-900 shadow-md" : "bg-slate-50 border-slate-100 opacity-60"
          )}>
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-lg", article.label_type ? "bg-slate-900" : "bg-slate-200")}>🏷️</div>
                  <Label className="text-sm font-bold text-slate-900">Labels</Label>
               </div>
               <Switch 
                 checked={!!article.label_type}
                 onCheckedChange={(checked) => updateArticle(collectionId, article.id, { label_type: checked ? "Printed label" : "" })}
               />
            </div>
            {article.label_type && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <Input 
                  placeholder="bv. VLV Printed necklabel"
                  value={article.label_type || ""}
                  onChange={(e) => updateArticle(collectionId, article.id, { label_type: e.target.value })}
                  className="h-10 border-slate-200 focus:border-slate-900"
                />
                <Input 
                  placeholder="Positie (bv. Neck, Hem)"
                  value={article.label_position || ""}
                  onChange={(e) => updateArticle(collectionId, article.id, { label_position: e.target.value as any })}
                  className="h-10 border-slate-200 focus:border-slate-900"
                />
              </div>
            )}
          </div>

          {/* Packaging Section */}
          <div className={cn(
            "p-6 border rounded-2xl transition-all duration-300",
            article.packaging ? "bg-white border-slate-900 shadow-md" : "bg-slate-50 border-slate-100 opacity-60"
          )}>
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                   <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-lg", article.packaging ? "bg-slate-900" : "bg-slate-200")}>📦</div>
                   <Label className="text-sm font-bold text-slate-900">Verpakking</Label>
                </div>
                <Switch 
                  checked={!!article.packaging}
                  onCheckedChange={(checked) => updateArticle(collectionId, article.id, { packaging: checked ? "polybag" : "none" })}
                />
             </div>
             {article.packaging && article.packaging !== "none" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <Input 
                    placeholder="bv. Individueel verpakt in polybag"
                    value={article.packaging_notes || ""}
                    onChange={(e) => updateArticle(collectionId, article.id, { packaging_notes: e.target.value })}
                    className="h-10 border-slate-200 focus:border-slate-900"
                  />
                </div>
             )}
          </div>

          {/* Disclaimer Section */}
          <div className={cn(
            "p-6 border rounded-2xl transition-all duration-300",
            article.disclaimer_enabled ? "bg-white border-slate-900 shadow-md" : "bg-slate-50 border-slate-100 opacity-60"
          )}>
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                   <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-lg", article.disclaimer_enabled ? "bg-slate-900 shadow-lg" : "bg-slate-200")}>⚖️</div>
                   <div className="flex flex-col">
                      <Label className="text-sm font-black text-slate-900 uppercase tracking-tight">Productie Disclaimer</Label>
                      <span className="text-[10px] text-slate-500 font-medium">Zichtbaar onderaan elke PDF pagina</span>
                   </div>
                </div>
                <Switch 
                  checked={!!article.disclaimer_enabled}
                  onCheckedChange={(checked) => updateArticle(collectionId, article.id, { disclaimer_enabled: checked })}
                />
             </div>
             {article.disclaimer_enabled && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
                   <Textarea 
                     placeholder="Voer hier de disclaimer tekst in..."
                     value={article.disclaimer_text || ""}
                     onChange={(e) => updateArticle(collectionId, article.id, { disclaimer_text: e.target.value })}
                     className="min-h-[80px] text-xs font-medium border-slate-200 focus:border-slate-900 rounded-xl leading-relaxed"
                   />
                </div>
             )}
          </div>
        </div>

        <div className="space-y-2 pt-4">
           <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Extra Notities</Label>
           <Textarea 
             placeholder="Voeg hier eventuele extra opmerkingen toe voor de fabrikant..." 
             className="min-h-[120px] rounded-2xl border-slate-200 focus:border-slate-900 shadow-sm"
             value={article.description || ""}
             onChange={(e) => updateArticle(collectionId, article.id, { description: e.target.value })}
           />
        </div>
      </div>
    </div>
  );
}
