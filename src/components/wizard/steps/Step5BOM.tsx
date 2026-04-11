"use client";

import React from "react";
import { useTechPackStore } from "@/store";
import { Calculator, AlertCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTechPackValidation } from "@/hooks/useTechPackValidation";
import { sanitizeQuantity } from "@/lib/order-utils";

export default function Step5BOM({ article, collectionId }: { article: any, collectionId: string }) {
  const { updateProduct, userRole } = useTechPackStore();
  const { missingFields } = useTechPackValidation(article);
  const isViewer = userRole === 'viewer';
  const isError = missingFields.some(f => f.step === 7 && f.field === 'order_quantity');
  
  const totalQuantity = (article.sizes || []).reduce((acc: number, s: any) => acc + (s.order_quantity || 0), 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
           <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">Order Quantities</h2>
           <p className="text-slate-400 font-medium">Specifieer de gewenste aantallen per maat.</p>
        </div>
        <div className={cn(
          "text-right px-8 py-4 rounded-[24px] border transition-all duration-500",
          totalQuantity > 0 ? "bg-slate-900 text-white border-slate-900 shadow-2xl" : "bg-white text-slate-400 border-slate-100"
        )}>
           <p className={cn(
             "text-[10px] font-black uppercase tracking-widest leading-none mb-1",
             totalQuantity > 0 ? "text-[#22c981]" : "text-slate-300"
           )}>Totaal Aanvraag</p>
           <h3 className="text-3xl font-black italic tracking-tighter">{totalQuantity} <span className="text-sm font-bold uppercase opacity-40">pcs</span></h3>
        </div>
      </div>

      <div className={cn(
        "bg-white rounded-[40px] p-10 border transition-all duration-500",
        isError ? "border-red-100 ring-4 ring-red-50 bg-red-50/10" : "border-slate-100 shadow-xl"
      )}>
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Quantities per size
          </h4>
          {isError && (
            <div className="flex items-center gap-2 text-red-500 animate-pulse">
               <AlertCircle className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Minimaal één maat vereist</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-4">
          {["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"].map(size => {
            const qty = article.sizes?.find((s: any) => s.size_label === size)?.order_quantity || 0;
            return (
              <div key={size} className={cn(
                "p-5 rounded-[24px] border border-slate-100 flex flex-col items-center transition-all group hover:scale-105",
                qty > 0 ? "bg-[#0b1912] border-[#0b1912] shadow-xl" : "bg-white hover:border-[#22c981]"
              )}>
                <div className={cn(
                  "text-[10px] font-black uppercase mb-3 tracking-widest transition-colors",
                  qty > 0 ? "text-[#22c981]" : "text-slate-300 group-hover:text-slate-900"
                )}>{size}</div>
                <input 
                  type="number"
                  min="0"
                  value={qty || ""}
                  disabled={isViewer}
                  onChange={(e) => {
                    if (isViewer) return;
                    const num = sanitizeQuantity(e.target.value);
                    const existingSizes = article.sizes || [];
                    let newSizes;
                    if (existingSizes.some((s: any) => s.size_label === size)) {
                      newSizes = existingSizes.map((s: any) => s.size_label === size ? { ...s, order_quantity: num } : s);
                    } else {
                      newSizes = [...existingSizes, { size_label: size, order_quantity: num }];
                    }
                    updateProduct(collectionId, article.id, { sizes: newSizes });
                  }}
                  className={cn(
                    "w-full text-center text-2xl font-black bg-transparent border-none outline-none transition-colors italic tracking-tighter disabled:opacity-50",
                    qty > 0 ? "text-white" : "text-slate-900"
                  )}
                  placeholder="0"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-8 bg-[#f8fafc] rounded-[40px] border border-slate-100 flex items-start gap-6">
         <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
            <Info className="w-6 h-6 text-slate-400" />
         </div>
         <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Order Info</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
               Deze aantallen worden gebruikt door de fabrikant om de productie te plannen. 
               Zorg dat de totale oplage overeenkomt met je offerte of inkooporder.
            </p>
         </div>
      </div>
    </div>
  );
}
