"use client";

import React from "react";
import {  useUIStore, useDataStore , useTechPackStore } from "@/store";
import Step1Basis from "./steps/Step1Basis";
import Step2Afbeeldingen from "./steps/Step2Afbeeldingen";
import Step3PrintPlaatsing from "./steps/Step3PrintPlaatsing";
import Step4Kleuren from "./steps/Step4Kleuren";
import Step5ExtraInfo from "./steps/Step5ExtraInfo";
import Step6Controle from "./steps/Step6Controle";
import Step7Export from "./steps/Step7Export";
import Step8Order from "./steps/Step8Order";
import Dashboard from "../dashboard/Dashboard";
import { ArticlePresence } from "../collaboration/ArticlePresence";
import { Plus, Clock, FileText, ChevronRight, Edit2, Folder } from "lucide-react";

function InlineEdit({ 
  value, 
  onSave, 
  className, 
  placeholder 
}: { 
  value: string, 
  onSave: (val: string) => void, 
  className: string, 
  placeholder: string 
}) {
  const [editingValue, setEditingValue] = React.useState(value || "");
  
  React.useEffect(() => {
    setEditingValue(value || "");
  }, [value]);

  return (
    <div className="relative group/edit flex items-center w-full max-w-2xl">
      <input 
        value={editingValue}
        onChange={(e) => setEditingValue(e.target.value)}
        onBlur={() => { if (editingValue !== (value || "")) onSave(editingValue) }}
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
        placeholder={placeholder}
        className={`bg-transparent border-none outline-none hover:bg-slate-50 focus:bg-white focus:ring-2 ring-[#22c981]/30 rounded-lg px-2 py-1 -ml-2 transition-all w-full truncate ${className}`}
      />
      <Edit2 className="w-4 h-4 text-slate-300 opacity-0 group-hover/edit:opacity-100 transition-opacity absolute right-4 pointer-events-none" />
    </div>
  );
}


export default function WizardEngine() {
  const { 
    collections, 
    activeArticleId, 
    activeStep, 
    activeCollectionId,
    addArticle,
    setActiveArticle,
    setActiveStep
  } = useTechPackStore();

  const { setCollectionModalOpen } = useUIStore();

  // Keyboard shortcuts (punt 8)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      
      // Step shortcuts (1-8)
      if (isMod && e.key >= "1" && e.key <= "8") {
        e.preventDefault();
        setActiveStep(parseInt(e.key));
      }

      // Next / Prev shortcuts
      if (isMod && e.key === "ArrowRight") {
        e.preventDefault();
        if (activeStep < 8) setActiveStep(activeStep + 1);
      }
      if (isMod && e.key === "ArrowLeft") {
        e.preventDefault();
        if (activeStep > 1) setActiveStep(activeStep - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeStep, setActiveStep]);

  const activeCollection = collections.find((c: any) => c.id === activeCollectionId);
  const activeArticle = activeCollection?.articles.find((a: any) => a.id === activeArticleId);

  if (!activeArticle) {
    return <Dashboard />;
  }

  // Render original wizard steps based on activeStep
  const stepComponents: Record<number, React.ReactNode> = {
    1: <Step1Basis article={activeArticle} collectionId={activeCollectionId!} />,
    2: <Step2Afbeeldingen article={activeArticle} collectionId={activeCollectionId!} />,
    3: <Step3PrintPlaatsing article={activeArticle} collectionId={activeCollectionId!} />,
    4: <Step4Kleuren article={activeArticle} collectionId={activeCollectionId!} />,
    5: <Step5ExtraInfo article={activeArticle} collectionId={activeCollectionId!} />,
    6: <Step6Controle article={activeArticle} collectionId={activeCollectionId!} />,
    7: <Step8Order article={activeArticle} collectionId={activeCollectionId!} />,
    8: <Step7Export article={activeArticle} collectionId={activeCollectionId!} />,
  };

  const { updateArticle } = useTechPackStore();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-[#1D9E75]/10 pb-6 mb-10 group">
        <div className="space-y-1 w-full max-w-2xl">
          <InlineEdit 
            value={activeArticle.product_name}
            onSave={(val) => updateArticle(activeCollectionId!, activeArticle.id, { product_name: val })}
            placeholder="Naamloos Artikel"
            className="text-4xl font-black italic tracking-tighter text-[#0b1912] uppercase leading-none h-12"
          />
          
          <div className="flex items-center text-sm font-medium text-slate-400 tracking-wide uppercase">
            <span className="shrink-0 mr-2 opacity-50">Stap {activeStep}:</span>
            <InlineEdit 
              value={activeArticle.reference_code}
              onSave={(val) => updateArticle(activeCollectionId!, activeArticle.id, { reference_code: val })}
              placeholder="Typ een referentiecode..."
              className="text-sm font-medium text-slate-400 tracking-wide uppercase h-8 mt-0.5 max-w-[250px]"
            />
          </div>
        </div>
        <ArticlePresence articleId={activeArticle.id} />
      </div>

      <div className="bg-white rounded-3xl p-8 border border-[#1D9E75]/5 shadow-2xl shadow-[#1D9E75]/5">
         {stepComponents[activeStep]}
      </div>
    </div>
  );
}
