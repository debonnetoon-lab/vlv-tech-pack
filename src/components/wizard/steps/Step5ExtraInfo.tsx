/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { TechPackProduct } from "@/types/tech-pack";
import { useTechPackStore } from "@/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { AlertCircle, Tag, Box, Scale, User, Info } from "lucide-react";
import { useTechPackValidation } from "@/hooks/useTechPackValidation";

export default function Step5ExtraInfo({ article, collectionId }: { article: TechPackProduct, collectionId: string }) {
  const { updateProduct } = useTechPackStore();
  const { missingFields } = useTechPackValidation(article);

  const getError = (field: string) => missingFields.find(f => f.step === 8 && f.field === field);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-2">
        <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">Production Details</h2>
        <p className="text-slate-400 font-medium">Extra specificaties voor labels, verpakking en administratie.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Necklabel Section */}
          <div className={cn(
            "p-8 border rounded-[32px] transition-all duration-500 group",
            article.label_type ? "bg-white border-slate-900 shadow-2xl" : "bg-slate-50 border-slate-100 opacity-60"
          )}>
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm", 
                    article.label_type ? "bg-slate-900 text-[#22c981]" : "bg-white text-slate-200"
                  )}>
                    <Tag className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Labels</Label>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Neklabel / Carelabel</span>
                  </div>
               </div>
               <Switch 
                 checked={!!article.label_type}
                 onCheckedChange={(checked) => updateProduct(collectionId, article.id, { label_type: checked ? "Printed label" : "" })}
                 className="data-[state=checked]:bg-[#22c981]"
               />
            </div>
            {article.label_type && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <Input 
                  placeholder="bv. VLV Printed necklabel"
                  value={article.label_type || ""}
                  onChange={(e) => updateProduct(collectionId, article.id, { label_type: e.target.value })}
                  className="h-12 border-slate-100 focus:border-slate-900 rounded-xl font-bold text-slate-900 shadow-sm"
                />
                <Input 
                  placeholder="Positie (bv. Neck, Hem)"
                  value={article.label_position || ""}
                  onChange={(e) => updateProduct(collectionId, article.id, { label_position: e.target.value as any })}
                  className="h-12 border-slate-100 focus:border-slate-900 rounded-xl font-bold text-slate-900 shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Packaging Section */}
          <div className={cn(
            "p-8 border rounded-[32px] transition-all duration-500",
            article.packaging && article.packaging !== "none" ? "bg-white border-slate-900 shadow-2xl" : "bg-slate-50 border-slate-100 opacity-60"
          )}>
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                   <div className={cn(
                     "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm", 
                     article.packaging && article.packaging !== "none" ? "bg-slate-900 text-[#22c981]" : "bg-white text-slate-200"
                   )}>
                     <Box className="w-6 h-6" />
                   </div>
                   <div className="flex flex-col">
                      <Label className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Verpakking</Label>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Polybag / Bulk</span>
                   </div>
                </div>
                <Switch 
                  checked={!!article.packaging && article.packaging !== "none"}
                  onCheckedChange={(checked) => updateProduct(collectionId, article.id, { packaging: checked ? "polybag" : "none" })}
                  className="data-[state=checked]:bg-[#22c981]"
                />
             </div>
             {article.packaging && article.packaging !== "none" && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <Input 
                    placeholder="bv. Individueel verpakt in polybag"
                    value={article.packaging_notes || ""}
                    onChange={(e) => updateProduct(collectionId, article.id, { packaging_notes: e.target.value })}
                    className="h-12 border-slate-100 focus:border-slate-900 rounded-xl font-bold text-slate-900 shadow-sm"
                  />
                </div>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Author Section */}
          <div className={cn(
            "p-8 border rounded-[32px] bg-white transition-all duration-500 relative",
            getError("author_name") ? "border-red-100 ring-4 ring-red-50" : "border-slate-100 shadow-xl"
          )}>
              <div className="flex items-center gap-4 mb-6">
                 <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                    getError("author_name") ? "bg-red-500 text-white" : "bg-[#0b1912] text-[#22c981]"
                 )}>
                    <User className="w-6 h-6" />
                 </div>
                 <div className="flex-1">
                    <Label className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1 block">Designer / Author</Label>
                    {getError("author_name") && (
                      <div className="flex items-center gap-1.5 text-red-500">
                         <AlertCircle className="w-3.5 h-3.5" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Verplicht veld</span>
                      </div>
                    )}
                 </div>
              </div>
              <Input 
                placeholder="bv. Jane Doe"
                value={article.author_name || ""}
                onChange={(e) => updateProduct(collectionId, article.id, { author_name: e.target.value })}
                className={cn(
                  "h-14 border-slate-100 focus:border-slate-900 rounded-2xl font-black uppercase italic tracking-tight text-lg shadow-sm placeholder:text-slate-100 px-6 transition-all",
                  getError("author_name") ? "bg-red-50/50" : "bg-slate-50/30"
                )}
              />
          </div>

          {/* Fit Section */}
          <div className={cn(
            "p-8 border rounded-[32px] bg-white transition-all duration-500 relative",
            getError("fit") ? "border-red-100 ring-4 ring-red-50" : "border-slate-100 shadow-xl"
          )}>
              <div className="flex items-center gap-4 mb-6">
                 <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                    getError("fit") ? "bg-red-500 text-white" : "bg-[#0b1912] text-[#22c981]"
                 )}>
                    <Scale className="w-6 h-6" />
                 </div>
                 <div className="flex-1">
                    <Label className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1 block">Product Fit</Label>
                    {getError("fit") && (
                      <div className="flex items-center gap-1.5 text-red-500">
                         <AlertCircle className="w-3.5 h-3.5" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Verplicht veld</span>
                      </div>
                    )}
                 </div>
              </div>
              <Input 
                placeholder="bv. Regular Fit, Oversized"
                value={article.fit || ""}
                onChange={(e) => updateProduct(collectionId, article.id, { fit: e.target.value as any })}
                className={cn(
                  "h-14 border-slate-100 focus:border-slate-900 rounded-2xl font-black uppercase italic tracking-tight text-lg shadow-sm placeholder:text-slate-100 px-6 transition-all",
                  getError("fit") ? "bg-red-50/50" : "bg-slate-50/30"
                )}
              />
          </div>
        </div>

        {/* Disclaimer Section */}
        <div className={cn(
          "p-8 border rounded-[40px] transition-all duration-500",
          article.disclaimer_enabled ? "bg-[#0b1912] border-[#0b1912] text-white shadow-2xl" : "bg-slate-50 border-slate-100 opacity-60"
        )}>
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                 <div className={cn(
                   "w-16 h-16 rounded-[24px] flex items-center justify-center transition-all shadow-xl", 
                   article.disclaimer_enabled ? "bg-[#22c981] text-[#0b1912]" : "bg-white text-slate-200"
                 )}>
                   <Scale className="w-8 h-8" />
                 </div>
                 <div className="flex flex-col">
                    <Label className="text-lg font-black uppercase tracking-tight italic leading-none mb-2">Production Disclaimer</Label>
                    <span className={cn(
                      "text-xs font-medium uppercase tracking-widest",
                      article.disclaimer_enabled ? "text-white/50" : "text-slate-400"
                    )}>Zichtbaar op elke pagina van de Tech Pack PDF</span>
                 </div>
              </div>
              <Switch 
                checked={!!article.disclaimer_enabled}
                onCheckedChange={(checked) => updateProduct(collectionId, article.id, { disclaimer_enabled: checked })}
                className="data-[state=checked]:bg-[#22c981]"
              />
           </div>
           {article.disclaimer_enabled && (
              <div className="animate-in fade-in slide-in-from-top-6 duration-500 space-y-4">
                 <Textarea 
                   placeholder="Voer hier de officiële disclaimer tekst in..."
                   value={article.disclaimer_text || ""}
                   onChange={(e) => updateProduct(collectionId, article.id, { disclaimer_text: e.target.value })}
                   className="min-h-[160px] text-sm font-bold border-none focus:ring-4 focus:ring-[#22c981]/20 rounded-2xl bg-white/5 text-white placeholder:text-white/10 p-8 leading-relaxed italic"
                 />
              </div>
           )}
        </div>

        <div className="space-y-4 pt-4">
           <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 ml-1">Additional Notes</Label>
           <Textarea 
             placeholder="Voeg hier eventuele extra opmerkingen toe voor de fabrikant..." 
             className="min-h-[160px] rounded-[32px] border-slate-100 bg-slate-50 text-slate-900 font-bold focus:border-slate-900 shadow-sm p-8"
             value={article.description || ""}
             onChange={(e) => updateProduct(collectionId, article.id, { description: e.target.value })}
           />
        </div>
      </div>
    </div>
  );
}
