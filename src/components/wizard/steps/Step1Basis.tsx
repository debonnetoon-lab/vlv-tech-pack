"use client";

import React from "react";
import { TechPackProduct, GarmentType } from "@/types/tech-pack";
import { useTechPackStore } from "@/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FieldWrapper } from "../../collaboration/FieldWrapper";
import { useTechPackValidation } from "@/hooks/useTechPackValidation";
import { Info, Tag, Layers } from "lucide-react";

const TEMPLATES: { id: GarmentType; name: string; icon: string }[] = [
  { id: "jersey", name: "Jersey", icon: "👕" },
  { id: "jacket", name: "Jacket", icon: "🧥" },
  { id: "vest", name: "Body / Vest", icon: "🦺" },
  { id: "bib_shorts", name: "Bib Shorts", icon: "🩳" },
  { id: "socks", name: "Sokken", icon: "🧦" },
  { id: "cap", name: "Koerspet", icon: "🧢" },
  { id: "other", name: "Overig", icon: "📦" },
];

export default function Step1Basis({ article, collectionId }: { article: TechPackProduct, collectionId: string }) {
  const { updateProduct, userRole } = useTechPackStore();
  const { missingFields } = useTechPackValidation(article);
  const isViewer = userRole === 'viewer';

  const getError = (field: string) => {
    return missingFields.find(f => f.step === 1 && f.field === field)?.label ? "Verplicht veld" : undefined;
  };

  const handleChange = (field: string, value: unknown) => {
    if (isViewer) return;
    updateProduct(collectionId, article.id, { [field]: value });
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-2">
        <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Product Basis</h2>
        <p className="text-slate-400 font-medium">Begin met de algemene details van dit kledingstuk.</p>
      </div>

      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FieldWrapper 
            articleId={article.id} 
            fieldKey="name" 
            label="Productnaam"
            error={getError("name")}
          >
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#22c981] transition-colors">
                <Tag className="w-5 h-5" />
              </div>
              <Input 
                id="name"
                disabled={isViewer}
                className="h-16 pl-14 text-xl font-black uppercase italic tracking-tight border-slate-100 bg-slate-50/50 focus:bg-white focus:border-slate-900 transition-all rounded-2xl shadow-sm placeholder:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="bv. VIVE LE VELO T-shirt"
                value={article.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
          </FieldWrapper>

          <FieldWrapper 
            articleId={article.id} 
            fieldKey="article_code" 
            label="Artikelcode"
            error={getError("article_code")}
          >
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#22c981] transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <Input 
                id="article_code"
                disabled={isViewer}
                className="h-16 pl-14 text-xl font-mono font-black uppercase tracking-widest border-slate-100 bg-slate-50/50 focus:bg-white focus:border-slate-900 transition-all rounded-2xl shadow-sm placeholder:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="bv. VLV-2026-001"
                value={article.article_code || ""}
                onChange={(e) => handleChange("article_code", e.target.value)}
              />
            </div>
          </FieldWrapper>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between ml-1">
             <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Basis kledingstuk (Template)</Label>
             <div className="flex items-center gap-2 text-slate-300">
                <Info className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase">Bepaalt de PDF layout</span>
             </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
            {TEMPLATES.map((t) => (
              <Card 
                key={t.id}
                onClick={() => !isViewer && handleChange("garment_type", t.id)}
                className={cn(
                  "p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all border shadow-sm rounded-[24px] group",
                  article.garment_type === t.id 
                    ? "border-slate-900 bg-[#0b1912] text-white shadow-2xl scale-105" 
                    : "border-slate-100 hover:border-slate-300 hover:bg-slate-50 bg-white",
                  isViewer && "cursor-not-allowed opacity-50 grayscale hover:bg-white hover:border-slate-100"
                )}
              >
                <span className={cn(
                  "text-3xl transition-transform duration-500 group-hover:scale-125",
                  article.garment_type === t.id ? "drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" : ""
                )}>{t.icon}</span>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-tighter text-center leading-none",
                  article.garment_type === t.id ? "text-[#22c981]" : "text-slate-400"
                )}>{t.name}</span>
              </Card>
            ))}
          </div>
        </div>

        <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 flex items-start gap-6">
           <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
             <Info className="w-6 h-6 text-slate-400" />
           </div>
           <div className="space-y-1">
              <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Systeeminformatie</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                De productnaam en artikelcode zijn verplicht voor export. 
                De template keuze beïnvloedt welke maattabellen en technische tekeningen als basis worden gebruikt voor de fabrikant.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
