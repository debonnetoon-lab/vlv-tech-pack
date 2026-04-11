"use client";

import React from "react";
import { useUIStore, useTechPackStore } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, CheckCircle, Clock, Trash2, Copy, FileText, ChevronRight } from "lucide-react";
import WizardStepper from "./WizardStepper";
import { ArticlePresence } from "../collaboration/ArticlePresence";

// Steps mappings
import Step1Basis from "./steps/Step1Basis";
import Step2Afbeeldingen from "./steps/Step2Afbeeldingen";
import Step3PrintPlaatsing from "./steps/Step3PrintPlaatsing";
import Step4Kleuren from "./steps/Step4Kleuren";
import Step3Materials from "./steps/Step3Materials";
import Step6SizeSpecs from "./steps/Step6SizeSpecs";
import Step5BOM from "./steps/Step5BOM";
import Step5ExtraInfo from "./steps/Step5ExtraInfo";
import Step7Export from "./steps/Step7Export";
import Dashboard from "../dashboard/Dashboard";

function InlineEdit({ 
  value, 
  onSave, 
  className, 
  placeholder,
  label,
  readOnly = false
}: { 
  value: string, 
  onSave: (val: string) => void, 
  className: string, 
  placeholder: string,
  label: string,
  readOnly?: boolean
}) {
  const [editingValue, setEditingValue] = React.useState(value || "");
  const [isFocused, setIsFocused] = React.useState(false);
  
  React.useEffect(() => {
    setEditingValue(value || "");
  }, [value]);

  if (readOnly) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest ml-1">
          {label}
        </span>
        <div className={className}>{value || placeholder}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 group/edit">
      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 opacity-0 group-hover/edit:opacity-100 transition-opacity">
        {label}
      </span>
      <div className="relative flex items-center">
        <input 
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => { 
            setIsFocused(false);
            if (editingValue !== (value || "")) onSave(editingValue); 
          }}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
          placeholder={placeholder}
          className={`bg-transparent border-none outline-none hover:bg-slate-50 focus:bg-white focus:ring-2 ring-[#22c981]/10 rounded-xl px-3 py-2 -ml-3 transition-all truncate ${className}`}
        />
        <Edit3 className={`w-4 h-4 text-[#22c981] opacity-0 group-hover/edit:opacity-100 transition-opacity absolute right-4 pointer-events-none ${isFocused ? 'hidden' : ''}`} />
      </div>
    </div>
  );
}

export default function WizardEngine() {
  const { 
    collections, 
    activeArticleId, 
    activeStep, 
    activeCollectionId,
    updateProduct,
    userRole
  } = useTechPackStore();

  const isViewer = userRole === 'viewer';

  const activeCollection = (collections || []).find((c: any) => c.id === activeCollectionId);
  const activeProduct = (activeCollection?.products || []).find((p: any) => p.id === activeArticleId);

  if (!activeProduct) {
    return <Dashboard />;
  }

  const stepComponents: Record<number, React.ReactNode> = {
    1: <Step1Basis article={activeProduct} collectionId={activeCollectionId!} />,
    2: <Step2Afbeeldingen article={activeProduct} collectionId={activeCollectionId!} />,
    3: <Step3PrintPlaatsing article={activeProduct} collectionId={activeCollectionId!} />,
    4: <Step4Kleuren article={activeProduct} collectionId={activeCollectionId!} />,
    5: <Step3Materials article={activeProduct} collectionId={activeCollectionId!} />,
    6: <Step6SizeSpecs article={activeProduct} collectionId={activeCollectionId!} />,
    7: <Step5BOM article={activeProduct} collectionId={activeCollectionId!} />,
    8: <Step5ExtraInfo article={activeProduct} collectionId={activeCollectionId!} />,
    9: isViewer ? (
      <div className="py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-900">Export Beperkt</h3>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">Je hebt op dit moment een 'viewer' rol. Alleen designers en beheerders kunnen officiële Tech Pack PDF-bestanden exporteren.</p>
      </div>
    ) : <Step7Export article={activeProduct} collectionId={activeCollectionId!} />,
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* V3 TABBED NAVIGATION */}
      <WizardStepper />

      {/* EDITOR HEADER */}
      <div className="bg-white border-b border-slate-50">
        <div className="max-w-[1000px] mx-auto px-8 py-10 flex items-center justify-between gap-12">
          <div className="flex-1 space-y-2">
            <InlineEdit 
              label="Product Naam"
              value={activeProduct.name}
              onSave={(val) => updateProduct(activeCollectionId!, activeProduct.id, { name: val })}
              placeholder="Naamloos Product"
              className="text-5xl font-black italic tracking-tighter text-slate-900 uppercase leading-none h-16 w-full"
              readOnly={isViewer}
            />
            
            <div className="flex items-center gap-6 mt-2 ml-1">
              <InlineEdit 
                label="Referentie Code"
                value={activeProduct.article_code}
                onSave={(val) => updateProduct(activeCollectionId!, activeProduct.id, { article_code: val })}
                placeholder="bv. VLV-2026-001"
                className="text-sm font-bold text-slate-400 tracking-widest uppercase"
                readOnly={isViewer}
              />
              <div className="h-4 w-px bg-slate-100" />
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Status:</span>
                 <div className="px-3 py-1 bg-emerald-50 text-[#22c981] rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100/50">
                   {activeProduct.status || 'WIP'}
                 </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end gap-4">
             <ArticlePresence articleId={activeProduct.id} />
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Laatst bewerkt: Just now</span>
             </div>
          </div>
        </div>
      </div>

      {/* STEP CONTENT CONTENT */}
      <div className="flex-1 bg-white">
        <div className="max-w-[1000px] mx-auto px-8 py-16 pb-40">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeStep}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.3, ease: "easeOut" }}
             >
               {stepComponents[activeStep] || (
                 <div className="py-20 text-center opacity-30">
                    <p className="text-sm font-black uppercase tracking-widest italic">Section In Development</p>
                 </div>
               )}
             </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
