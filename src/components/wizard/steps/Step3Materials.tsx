"use client";

import React from "react";
import { useTechPackStore } from "@/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Trash2, 
  Droplets, 
  Info,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTechPackValidation } from "@/hooks/useTechPackValidation";
import { FieldWrapper } from "../../collaboration/FieldWrapper";

export default function Step3Materials({ article, collectionId }: { article: any, collectionId: string }) {
  const { updateProduct } = useTechPackStore();
  const { missingFields } = useTechPackValidation(article);
  const [materials, setMaterials] = React.useState<any[]>(article.materials || []);

  const getError = (field: string) => {
    return missingFields.find(f => f.step === 5 && f.field === field);
  };

  const addMaterial = () => {
    const newMaterial = {
      id: crypto.randomUUID(),
      name: "",
      composition: "",
      weight_gsm: "",
      supplier: "",
      color_reference: "",
      percentage: 100
    };
    const updated = [...materials, newMaterial];
    setMaterials(updated);
    updateProduct(collectionId, article.id, { materials: updated });
  };

  const updateMaterial = (id: string, updates: any) => {
    const updated = materials.map(m => m.id === id ? { ...m, ...updates } : m);
    setMaterials(updated);
    updateProduct(collectionId, article.id, { materials: updated });
  };

  const removeMaterial = (id: string) => {
    const updated = materials.filter(m => m.id !== id);
    setMaterials(updated);
    updateProduct(collectionId, article.id, { materials: updated });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">Materialen & Stoffen</h2>
          <p className="text-slate-400 font-medium">Beheer de basismaterialen van dit product.</p>
        </div>
        <button 
          onClick={addMaterial}
          className="flex items-center gap-2 h-12 px-6 bg-[#22c981] text-[#0b1912] rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#22c981]/10"
        >
          <Plus className="w-4 h-4" />
          Materiaal Toevoegen
        </button>
      </div>

      <div className={cn(
        "bg-white rounded-[40px] border shadow-xl overflow-hidden transition-colors",
        getError("materials") ? "border-red-100 ring-4 ring-red-50" : "border-slate-100"
      )}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 italic">
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Type / Naam</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Samenstelling</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">GSM</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Leverancier</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <AnimatePresence mode="popLayout">
              {materials.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className={cn(
                        "w-20 h-20 rounded-[28px] shadow-sm flex items-center justify-center transition-all duration-500",
                        getError("materials") ? "bg-red-500 text-white shadow-red-200" : "bg-slate-50 text-slate-200"
                      )}>
                        {getError("materials") ? <AlertCircle className="w-10 h-10" /> : <Droplets className="w-10 h-10" />}
                      </div>
                      <div className="space-y-1">
                        <p className={cn(
                          "text-[10px] font-black uppercase tracking-[0.3em]",
                          getError("materials") ? "text-red-600 animate-pulse" : "text-slate-300"
                        )}>
                          {getError("materials") ? "Stofgegevens Verplicht" : "Geen materialen gedefinieerd"}
                        </p>
                        {getError("materials") && (
                          <p className="text-[10px] font-bold text-red-300 uppercase">Voeg minimaal de hoofdstof toe voor productie</p>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                materials.map((m, idx) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={m.id} 
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <FieldWrapper articleId={article.id} fieldKey={`mat-${m.id}-name`} error={idx === 0 && getError("fabric_name") ? "!" : undefined}>
                        <input 
                          value={m.name}
                          onChange={(e) => updateMaterial(m.id, { name: e.target.value })}
                          placeholder="bv. Single Jersey"
                          className="bg-transparent border-none outline-none font-black text-slate-900 uppercase italic tracking-tight placeholder:text-slate-200 w-full"
                        />
                      </FieldWrapper>
                    </td>
                    <td className="px-8 py-6">
                      <FieldWrapper articleId={article.id} fieldKey={`mat-${m.id}-comp`} error={idx === 0 && getError("fabric_comp") ? "!" : undefined}>
                        <input 
                          value={m.composition}
                          onChange={(e) => updateMaterial(m.id, { composition: e.target.value })}
                          placeholder="bv. 100% Katoen"
                          className="bg-transparent border-none outline-none text-slate-500 font-bold w-full uppercase text-xs"
                        />
                      </FieldWrapper>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <FieldWrapper articleId={article.id} fieldKey={`mat-${m.id}-gsm`} error={idx === 0 && getError("fabric_gsm") ? "!" : undefined}>
                        <input 
                          type="number"
                          value={m.weight_gsm}
                          onChange={(e) => updateMaterial(m.id, { weight_gsm: e.target.value })}
                          placeholder="180"
                          className="bg-transparent border-none outline-none text-slate-900 font-black text-center w-20 mx-auto text-lg italic"
                        />
                      </FieldWrapper>
                    </td>
                    <td className="px-8 py-6">
                      <input 
                        value={m.supplier}
                        onChange={(e) => updateMaterial(m.id, { supplier: e.target.value })}
                        placeholder="Naam leverancier..."
                        className="bg-transparent border-none outline-none text-slate-400 text-[10px] font-black uppercase tracking-widest w-full"
                      />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => removeMaterial(m.id)}
                        className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Info Card */}
      <div className="p-10 bg-[#0b1912] rounded-[40px] text-white flex items-center gap-8 shadow-2xl relative overflow-hidden">
        <Droplets className="absolute -right-8 -bottom-8 w-48 h-48 text-white opacity-[0.03]" />
        <div className="w-16 h-16 rounded-[24px] bg-[#22c981] flex items-center justify-center shrink-0 shadow-xl shadow-[#22c981]/20">
          <Info className="w-8 h-8 text-[#0b1912]" />
        </div>
        <div className="space-y-2 relative z-10">
          <h4 className="text-lg font-black uppercase tracking-tight italic">Pro Tip: Materialen & BOM</h4>
          <p className="text-sm text-white/50 font-medium leading-relaxed">
            De materialen die je hier toevoegt verschijnen automatisch als opties in je **Bill of Materials (Stap 07)**. 
            Zo voorkom je dubbele invoer en fouten in je specificaties.
          </p>
        </div>
      </div>
    </div>
  );
}
