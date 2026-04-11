"use client";

import React from "react";
import { TechPackProduct, MeasurementPoint } from "@/types/tech-pack";
import { useTechPackStore } from "@/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Ruler, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTechPackValidation } from "@/hooks/useTechPackValidation";

const SIZE_GAMMAS = {
  "unisex": ["3XS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
  "women": ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"],
  "kids": ["3-4j", "5-6j", "7-8j", "9-11j", "12-14j"],
  "baby": ["0/6m", "6/12m", "12/18m", "18/24m", "2/3j"]
};

export default function Step6SizeSpecs({ article, collectionId }: { article: TechPackProduct, collectionId: string }) {
  const { updateProduct } = useTechPackStore();
  const { missingFields } = useTechPackValidation(article);
  const isError = missingFields.some(f => f.step === 6 && f.field === 'measurement_points');
  
  const currentGamma = article.gender || "unisex";
  const sizes = SIZE_GAMMAS[currentGamma as keyof typeof SIZE_GAMMAS] || SIZE_GAMMAS["unisex"];

  const addPoint = () => {
    const currentPoints = article.measurement_points || [];
    const newPoint: MeasurementPoint = {
      id: crypto.randomUUID(),
      product_id: article.id,
      label: "",
      description: "",
      tolerance: "+/- 1cm",
      values: sizes.map(s => ({ id: crypto.randomUUID(), point_id: "", size_label: s, value_cm: 0 }))
    };
    updateProduct(collectionId, article.id, { measurement_points: [...currentPoints, newPoint] });
  };

  const updatePoint = (index: number, updates: Partial<MeasurementPoint>) => {
    const currentPoints = [...(article.measurement_points || [])];
    if (currentPoints[index]) {
      currentPoints[index] = { ...currentPoints[index], ...updates };
      updateProduct(collectionId, article.id, { measurement_points: currentPoints });
    }
  };

  const updateValue = (pointIndex: number, sizeLabel: string, value: string) => {
    const currentPoints = [...(article.measurement_points || [])];
    const point = currentPoints[pointIndex];
    if (point) {
      const num = parseFloat(value) || 0;
      const values = [...(point.values || [])];
      const valIndex = values.findIndex(v => v.size_label === sizeLabel);
      
      if (valIndex >= 0) {
        values[valIndex] = { ...values[valIndex], value_cm: num };
      } else {
        values.push({ id: crypto.randomUUID(), point_id: point.id || "", size_label: sizeLabel, value_cm: num });
      }
      
      currentPoints[pointIndex] = { ...point, values };
      updateProduct(collectionId, article.id, { measurement_points: currentPoints });
    }
  };

  const removePoint = (index: number) => {
    const currentPoints = article.measurement_points || [];
    updateProduct(collectionId, article.id, {
      measurement_points: currentPoints.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">Maattabel (Size Specs)</h2>
          <p className="text-slate-400 font-medium">Definieer de technische afmetingen per maat voor kwaliteitscontrole.</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
           <Label className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Measurement Gamma</Label>
           <select 
             value={currentGamma}
             onChange={(e) => updateProduct(collectionId, article.id, { gender: e.target.value as any })}
             className="h-10 px-4 rounded-xl border border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-[#22c981]/20 focus:border-[#22c981] cursor-pointer transition-all"
           >
             <option value="unisex">Unisex</option>
             <option value="women">Women</option>
             <option value="kids">Kids</option>
             <option value="baby">Baby</option>
           </select>
        </div>
      </div>

      <div className="space-y-6">
        <div className={cn(
          "overflow-x-auto -mx-8 px-8 pb-4 transition-all duration-500",
          isError ? "opacity-50 blur-[1px]" : ""
        )}>
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 italic">
                <th className="text-left py-4 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 w-[240px]">Meetpunt (POM)</th>
                <th className="text-left py-4 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 w-[120px]">Tol. (+/-)</th>
                {sizes.map(s => (
                  <th key={s} className="text-center py-4 px-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#22c981] w-[64px]">{s}</th>
                ))}
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(article.measurement_points || []).map((point, i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3">
                    <Input 
                      value={point.label}
                      onChange={(e) => updatePoint(i, { label: e.target.value })}
                      placeholder="bv. A: 1/2 Chest width"
                      className="h-11 text-xs border-slate-100 focus:border-[#22c981] font-black uppercase tracking-tight italic bg-white shadow-sm"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <Input 
                      value={point.tolerance || ""}
                      onChange={(e) => updatePoint(i, { tolerance: e.target.value })}
                      placeholder="+/- 1cm"
                      className="h-11 text-[10px] border-slate-50 bg-slate-50/50 focus:border-[#22c981] italic font-bold text-slate-500 text-center"
                    />
                  </td>
                  {sizes.map(size => (
                    <td key={size} className="py-3 px-1">
                      <Input 
                        type="number"
                        step="0.1"
                        value={point.values?.find(v => v.size_label === size)?.value_cm ?? ""}
                        onChange={(e) => updateValue(i, size, e.target.value)}
                        className="h-11 text-xs border-slate-100 focus:border-[#22c981] text-center p-0 font-black shadow-sm"
                      />
                    </td>
                  ))}
                  <td className="py-3 px-3">
                    <button 
                      onClick={() => removePoint(i)}
                      className="p-2.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!article.measurement_points || article.measurement_points.length === 0) && (
          <div className={cn(
            "py-32 border-2 border-dashed rounded-[40px] flex flex-col items-center justify-center gap-6 transition-all duration-500",
            isError ? "border-red-300 bg-red-50/20" : "border-slate-100 bg-slate-50/20"
          )}>
            <div className={cn(
               "w-20 h-20 rounded-[28px] shadow-sm flex items-center justify-center transition-all duration-500",
               isError ? "bg-red-500 text-white shadow-red-200 scale-110" : "bg-white text-slate-200"
            )}>
              {isError ? <AlertCircle className="w-10 h-10" /> : <Ruler className="w-10 h-10" />}
            </div>
            <div className="text-center space-y-1">
               <p className={cn(
                 "text-[10px] font-black uppercase tracking-[0.3em]",
                 isError ? "text-red-600 animate-pulse" : "text-slate-300"
               )}>
                 {isError ? "Meetpunten Vereist" : "Geen meetpunten gedefinieerd"}
               </p>
               {isError && (
                 <p className="text-[10px] font-bold text-red-300 uppercase leading-relaxed max-w-[300px] mx-auto">
                   Voeg minimaal één meetpunt (bv. borstbreedte) toe voor kwaliteitscontrole
                 </p>
               )}
            </div>
          </div>
        )}

        <button
          onClick={addPoint}
          className="w-full py-8 border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center gap-3 text-slate-300 hover:border-[#22c981] hover:bg-[#22c981]/5 hover:text-[#22c981] transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-[#22c981] group-hover:text-white flex items-center justify-center transition-all">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-black uppercase tracking-[0.2em] text-[10px]">Meetpunt toevoegen</span>
        </button>
      </div>
    </div>
  );
}
