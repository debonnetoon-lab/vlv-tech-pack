"use client";

import React from "react";
import { useTechPackStore } from "@/store";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  Info, 
  Image as ImageIcon, 
  Droplets, 
  Palette, 
  Ruler, 
  Hammer, 
  ListChecks, 
  Tag,
  Download
} from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  { id: 1, type: 'general', title: "Algemeen", icon: Info },
  { id: 2, type: 'sketches', title: "Visuals", icon: ImageIcon },
  { id: 3, type: 'prints', title: "Prints", icon: Palette },
  { id: 4, type: 'colorways', title: "Colorways", icon: Droplets },
  { id: 5, type: 'materials', title: "Materialen", icon: Droplets },
  // { id: 6, type: 'size specs', title: "Size Specs", icon: Ruler }, // HIDDEN BY REQUEST
  { id: 7, type: 'order qty', title: "Order QTY", icon: ListChecks },
  { id: 8, type: 'labels', title: "Labels", icon: Tag },
  { id: 9, type: 'export', title: "Export", icon: Download },
];

export default function WizardStepper() {
  const { activeStep, setActiveStep } = useTechPackStore();

  return (
    <div className="w-full bg-white border-b border-slate-100 px-8 py-2 sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-[1600px] mx-auto overflow-x-auto no-scrollbar gap-2">
        {STEPS.map((step, index) => {
          const isActive = activeStep === step.id;
          const isCompleted = activeStep > step.id;

          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={cn(
                "flex items-center gap-3 px-5 py-4 min-w-max border-b-2 transition-all relative group",
                isActive 
                  ? "border-[#22c981] text-slate-900" 
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                isActive 
                  ? "bg-[#22c981] text-[#0b1912] shadow-lg shadow-[#22c981]/20" 
                  : (isCompleted ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-400")
              )}>
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
              </div>
              
              <div className="text-left">
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest leading-none mb-1",
                  isActive ? "text-[#22c981]" : "text-slate-300"
                )}>
                  Stap 0{index + 1}
                </p>
                <p className="text-xs font-black uppercase tracking-tight whitespace-nowrap">
                  {step.title}
                </p>
              </div>

              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-[#22c981] shadow-[0_0_10px_rgba(34,201,129,0.5)]"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
