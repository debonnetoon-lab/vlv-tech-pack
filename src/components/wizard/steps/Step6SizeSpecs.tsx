"use client";

import React from "react";
import { TechPackArticle, MeasurementPoint } from "@/types/tech-pack";
import { useTechPackStore } from "@/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Ruler } from "lucide-react";

const SIZE_GAMMAS = {
  "unisex": ["3XS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
  "women": ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"],
  "kids": ["3-4j", "5-6j", "7-8j", "9-11j", "12-14j"],
  "baby": ["0/6m", "6/12m", "12/18m", "18/24m", "2/3j"]
};

export default function Step6SizeSpecs({ article, collectionId }: { article: TechPackArticle, collectionId: string }) {
  const { updateArticle } = useTechPackStore();
  
  const currentGamma = article.gender || "unisex";
  const sizes = SIZE_GAMMAS[currentGamma as keyof typeof SIZE_GAMMAS] || SIZE_GAMMAS["unisex"];

  const addPoint = () => {
    const currentPoints = article.measurement_points || [];
    const newPoint: MeasurementPoint = {
      article_id: article.id,
      label: "",
      description: "",
      tolerance: "+/- 1cm",
      values: sizes.map(s => ({ point_id: "", size_label: s, value_cm: 0 }))
    };
    updateArticle(collectionId, article.id, { measurement_points: [...currentPoints, newPoint] });
  };

  const updatePoint = (index: number, updates: Partial<MeasurementPoint>) => {
    const currentPoints = [...(article.measurement_points || [])];
    if (currentPoints[index]) {
      currentPoints[index] = { ...currentPoints[index], ...updates };
      updateArticle(collectionId, article.id, { measurement_points: currentPoints });
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
        values.push({ point_id: point.id || "", size_label: sizeLabel, value_cm: num });
      }
      
      currentPoints[pointIndex] = { ...point, values };
      updateArticle(collectionId, article.id, { measurement_points: currentPoints });
    }
  };

  const removePoint = (index: number) => {
    const currentPoints = article.measurement_points || [];
    updateArticle(collectionId, article.id, {
      measurement_points: currentPoints.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">Maattabel (Size Specs)</h2>
          <p className="text-slate-500">Definieer de technische afmetingen per maat voor kwaliteitscontrole.</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
           <Label className="text-[10px] font-black uppercase text-slate-400">Gamma</Label>
           <select 
             value={currentGamma}
             onChange={(e) => updateArticle(collectionId, article.id, { gender: e.target.value as any })}
             className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold focus:ring-0 focus:border-[#22c981] cursor-pointer"
           >
             <option value="unisex">Unisex</option>
             <option value="women">Women</option>
             <option value="kids">Kids</option>
             <option value="baby">Baby</option>
           </select>
        </div>
      </div>

      <div className="space-y-6">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 italic">
                <th className="text-left py-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[200px]">Meetpunt (POM)</th>
                <th className="text-left py-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[100px]">Tol. (+/-)</th>
                {sizes.map(s => (
                  <th key={s} className="text-center py-3 px-1 text-[10px] font-black uppercase tracking-widest text-[#22c981] w-[60px]">{s}</th>
                ))}
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(article.measurement_points || []).map((point, i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-2 px-2">
                    <Input 
                      value={point.label}
                      onChange={(e) => updatePoint(i, { label: e.target.value })}
                      placeholder="bv. A: 1/2 Chest width"
                      className="h-9 text-xs border-slate-200 focus:border-[#22c981] font-bold"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <Input 
                      value={point.tolerance || ""}
                      onChange={(e) => updatePoint(i, { tolerance: e.target.value })}
                      placeholder="+/- 1cm"
                      className="h-9 text-xs border-slate-200 focus:border-[#22c981] italic"
                    />
                  </td>
                  {sizes.map(size => (
                    <td key={size} className="py-2 px-1">
                      <Input 
                        type="number"
                        step="0.1"
                        value={point.values?.find(v => v.size_label === size)?.value_cm ?? ""}
                        onChange={(e) => updateValue(i, size, e.target.value)}
                        className="h-9 text-xs border-slate-100 focus:border-[#22c981] text-center p-0 font-medium"
                      />
                    </td>
                  ))}
                  <td className="py-2 px-2">
                    <button 
                      onClick={() => removePoint(i)}
                      className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!article.measurement_points || article.measurement_points.length === 0) && (
          <div className="py-20 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-50/30">
            <Ruler className="w-8 h-8 opacity-20" />
            <p className="text-sm font-medium">Klik op de knop hieronder om meetpunten toe te voegen.</p>
          </div>
        )}

        <button
          onClick={addPoint}
          className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:border-[#22c981] hover:bg-[#22c981]/5 hover:text-[#22c981] transition-all font-black uppercase tracking-widest text-[10px]"
        >
          <Plus className="w-4 h-4" />
          Meetpunt toevoegen
        </button>
      </div>
    </div>
  );
}
