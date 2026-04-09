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

  // Punt 1: Empty state logic
  const handleCreateNew = () => {
    if (activeCollectionId) {
      addArticle(activeCollectionId, { product_name: "Nieuw tech pack", reference_code: "" });
    } else if (collections.length > 0) {
      addArticle(collections[0].id, { product_name: "Nieuw tech pack", reference_code: "" });
    }
  };

  // Mock recent items or fetch from store
  const recentArticles = activeCollection?.articles.slice(0, 3) || [];

  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-[#22c981]/10 rounded-[28px] flex items-center justify-center mb-8 border border-[#22c981]/20">
          <Folder className="w-10 h-10 text-[#22c981]" />
        </div>
        
        <div className="text-center space-y-3 mb-10 max-w-sm">
          <h2 className="text-2xl font-black italic tracking-tighter text-[#0b1912] uppercase">Welkom bij VLV Tech Pack</h2>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            Je hebt nog geen collecties. Maak direct je eerste collectie aan om artikelen toe te kunnen voegen.
          </p>
        </div>

        <button 
          onClick={() => setCollectionModalOpen(true)}
          className="group relative px-8 py-4 bg-[#0b1912] text-[#22c981] rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.03] transition-all active:scale-95 shadow-xl shadow-[#0b1912]/20"
        >
          <span className="flex items-center gap-3">
             <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
             Eerste Collectie Aanmaken
          </span>
        </button>
      </div>
    );
  }

  if (!activeArticle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-[#22c981]/10 rounded-[28px] flex items-center justify-center mb-8 border border-[#22c981]/20">
          <Plus className="w-10 h-10 text-[#22c981]" />
        </div>
        
        <div className="text-center space-y-3 mb-10 max-w-sm">
          <h2 className="text-2xl font-black italic tracking-tighter text-[#0b1912] uppercase">Nieuw tech pack starten</h2>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            Maak een artikel aan of selecteer een bestaand item om de wizard te starten.
          </p>
        </div>

        <button 
          onClick={handleCreateNew}
          className="group relative px-8 py-4 bg-[#0b1912] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.03] transition-all active:scale-95 shadow-xl shadow-[#0b1912]/20"
        >
          <span className="flex items-center gap-3">
             <Plus className="w-5 h-5 text-[#22c981] group-hover:rotate-90 transition-transform" />
             Artikel aanmaken
          </span>
        </button>

        {recentArticles.length > 0 && (
          <div className="mt-20 w-full max-w-sm">
             <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Clock className="w-3 h-3" />
                   Recent geopend
                </span>
             </div>
             <div className="space-y-2">
                {recentArticles.map((art: any) => (
                  <button
                    key={art.id}
                    onClick={() => setActiveArticle(art.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-[#22c981]/30 hover:shadow-lg transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-[#22c981]/10 transition-colors">
                      <FileText className="w-5 h-5 text-slate-400 group-hover:text-[#22c981]" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-bold text-[#0b1912]">{art.product_name || art.reference_code}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Bewerkt op 2 apr</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-[#22c981] group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
             </div>
          </div>
        )}
      </div>
    );
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
