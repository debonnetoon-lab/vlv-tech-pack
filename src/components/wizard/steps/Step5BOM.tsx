"use client";

import React from "react";
import { TechPackArticle, BOMItem } from "@/types/tech-pack";
import { useTechPackStore } from "@/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Package } from "lucide-react";

const CATEGORIES = ["Hoofdstof", "Secundair", "Voering", "Garen", "Knopen", "Rits", "Label", "Verpakking", "Overig"];

export default function Step5BOM({ article, collectionId }: { article: TechPackArticle, collectionId: string }) {
  const { updateArticle } = useTechPackStore();

  const addItem = () => {
    const currentBOM = article.bom_items || [];
    const newItem: BOMItem = {
      article_id: article.id,
      category: "Hoofdstof",
      description: "",
      specification: "",
      supplier: "",
      quantity: 0,
      unit: "pcs"
    };
    updateArticle(collectionId, article.id, { bom_items: [...currentBOM, newItem] });
  };

  const updateItem = (index: number, updates: Partial<BOMItem>) => {
    const currentBOM = [...(article.bom_items || [])];
    if (currentBOM[index]) {
      currentBOM[index] = { ...currentBOM[index], ...updates };
      updateArticle(collectionId, article.id, { bom_items: currentBOM });
    }
  };

  const removeItem = (index: number) => {
    const currentBOM = article.bom_items || [];
    updateArticle(collectionId, article.id, {
      bom_items: currentBOM.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Materiaallijst (BOM)</h2>
        <p className="text-slate-500">Geef alle materialen en fournituren aan die nodig zijn voor de productie.</p>
      </div>

      <div className="space-y-6">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 italic">
                <th className="text-left py-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[140px]">Categorie</th>
                <th className="text-left py-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Omschrijving</th>
                <th className="text-left py-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[150px]">Specificatie</th>
                <th className="text-left py-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[120px]">Leverancier</th>
                <th className="text-left py-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[80px]">Hoeveelh.</th>
                <th className="text-left py-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[60px]">Unit</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(article.bom_items || []).map((item, i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-2 px-2">
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(i, { category: e.target.value })}
                      className="w-full h-9 px-2 bg-white rounded-lg border border-slate-200 text-xs font-bold focus:ring-0 focus:border-[#22c981]"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </td>
                  <td className="py-2 px-2">
                    <Input 
                      value={item.description}
                      onChange={(e) => updateItem(i, { description: e.target.value })}
                      placeholder="bv. 100% Katoen Single Jersey"
                      className="h-9 text-xs border-slate-200 focus:border-[#22c981]"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <Input 
                      value={item.specification || ""}
                      onChange={(e) => updateItem(i, { specification: e.target.value })}
                      placeholder="bv. 180 GSM"
                      className="h-9 text-xs border-slate-200 focus:border-[#22c981]"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <Input 
                      value={item.supplier || ""}
                      onChange={(e) => updateItem(i, { supplier: e.target.value })}
                      placeholder="bv. VLV Supplier"
                      className="h-9 text-xs border-slate-200 focus:border-[#22c981]"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <Input 
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(i, { quantity: parseFloat(e.target.value) || 0 })}
                      className="h-9 text-xs border-slate-200 focus:border-[#22c981] text-right"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <Input 
                      value={item.unit}
                      onChange={(e) => updateItem(i, { unit: e.target.value })}
                      placeholder="m"
                      className="h-9 text-xs border-slate-200 focus:border-[#22c981]"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <button 
                      onClick={() => removeItem(i)}
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

        {(!article.bom_items || article.bom_items.length === 0) && (
          <div className="py-20 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-50/30">
            <Package className="w-8 h-8 opacity-20" />
            <p className="text-sm font-medium">Nog geen materialen toegevoegd.</p>
          </div>
        )}

        <button
          onClick={addItem}
          className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:border-[#22c981] hover:bg-[#22c981]/5 hover:text-[#22c981] transition-all font-black uppercase tracking-widest text-[10px]"
        >
          <Plus className="w-4 h-4" />
          Nieuw Item Toevoegen
        </button>
      </div>
    </div>
  );
}
