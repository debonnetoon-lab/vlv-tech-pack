"use client";

import React from "react";
import { useTechPackStore } from "@/store";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { id: 1, title: "Basisgegevens", sub: "Wat maak je?", shortcut: "⌘1" },
  { id: 2, title: "Afbeeldingen", sub: "Voeg visuals toe", shortcut: "⌘2" },
  { id: 3, title: "Print & Plaatsing", sub: "Waar komt het?", shortcut: "⌘3" },
  { id: 4, title: "Kleuren", sub: "Welke kleuren?", shortcut: "⌘4" },
  { id: 5, title: "Extra Info", sub: "Labels & verpakking", shortcut: "⌘5" },
  { id: 6, title: "Controle", sub: "Alles nakijken", shortcut: "⌘6" },
  { id: 7, title: "Maten & Aantallen", sub: "Stanley & Stella", shortcut: "⌘7" },
  { id: 8, title: "Klaar voor Export", sub: "Download PDF", shortcut: "⌘8" },
];

export default function WizardStepper() {
  const { activeStep, setActiveStep, activeArticleId } = useTechPackStore();

  if (!activeArticleId) return null;

  const progress = (activeStep / STEPS.length) * 100;

  return (
    <div className="flex flex-col gap-0 p-3">
      {/* Step Counter & Progress Bar */}
      <div className="px-1 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[9px] font-black text-[#2a5a40] uppercase tracking-[0.15em]">Stappenplan</h3>
          <span className="text-[9px] font-bold text-[#2a5a40]">{activeStep} / {STEPS.length}</span>
        </div>
        <div className="h-[2px] w-full bg-[#0b1912]/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#22c981] transition-all duration-500 ease-out shadow-[0_0_8px_rgba(34,201,129,0.4)]" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-0 relative">
        {STEPS.map((step, index) => {
          const isActive = activeStep === step.id;
          const isCompleted = activeStep > step.id;
          const isLast = index === STEPS.length - 1;

          return (
            <div key={step.id} className="relative">
              {!isLast && (
                <div className={cn(
                  "absolute left-[19px] top-[40px] w-[1px] h-[calc(100%-20px)] transition-colors duration-300 z-0",
                  isCompleted ? "bg-[#22c981]/30" : "bg-[#0b1912]/10"
                )} />
              )}
              
              <button
                onClick={() => setActiveStep(step.id)}
                className={cn(
                  "relative z-10 w-full flex items-center gap-4 p-2.5 rounded-xl transition-all text-left group",
                  isActive 
                    ? "bg-[#22c981]/10 border border-[#22c981]/20 shadow-sm" 
                    : "hover:bg-[#0b1912]/5"
                )}
              >
                <div className={cn(
                  "w-[22px] h-[22px] rounded-md flex items-center justify-center text-[10px] font-bold transition-all duration-300 shrink-0",
                  isActive 
                    ? "bg-[#22c981] text-[#0b1912] shadow-[0_0_10px_rgba(34,201,129,0.3)]" 
                    : (isCompleted 
                        ? "bg-[#22c981]/15 text-[#22c981]" 
                        : "bg-[#0b1912]/5 text-[#2a5040]/60")
                )}>
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3px]" /> : step.id}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-[12px] font-bold leading-tight mb-0.5 transition-colors",
                    isActive ? "text-[#0b1912]" : (isCompleted ? "text-[#2d7a55]" : "text-[#5a8a6a]")
                  )}>
                    {step.title}
                  </p>
                  <p className={cn(
                    "text-[10px] truncate transition-colors",
                    isActive ? "text-[#22c981]" : "text-[#1d4a30]/60"
                  )}>
                    {step.sub}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                   <span className={cn(
                     "text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#0b1912]/5 text-[#2a4a35]/60 transition-opacity duration-300",
                     isActive || "group-hover:opacity-100 opacity-0"
                   )}>
                     {step.shortcut}
                   </span>
                   <span className={cn(
                     "text-[12px] text-[#22c981] transition-all duration-300",
                     isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                   )}>
                     ›
                   </span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
