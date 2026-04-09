"use client";

import React, { useState } from "react";
import { SaveStatus } from "./SaveStatus";
import {  useUIStore, useDataStore , useTechPackStore } from "@/store";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface ShellProps {
  sidebar: React.ReactNode;
  form: React.ReactNode;
  preview: React.ReactNode;
}

export default function Shell({ sidebar, form, preview }: ShellProps) {
  const { 
    collections, 
    activeCollectionId, 
    activeArticleId,
    activeStep,
    setActiveCollection,
    setActiveArticle,
    setActiveStep
  } = useTechPackStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeCollection = collections.find((c: any) => c.id === activeCollectionId);
  const activeArticle = activeCollection?.articles.find((a: any) => a.id === activeArticleId);

  const handleNextStep = () => {
    if (activeStep < 8) setActiveStep(activeStep + 1);
  };

  const resetToCollection = () => {
    setActiveArticle(null);
  };

  const resetToCollections = () => {
    setActiveCollection(null);
    setActiveArticle(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden text-[#0b1912] font-sans selection:bg-[#22c981]/20 relative">
      
      {/* ── MOBILE OVERLAY (BACKDROP) ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0b1912]/60 backdrop-blur-md z-[90] lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR (Punt 15: Inklapbaar) ── */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-[280px] bg-[#0b1912] z-[100] transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0 lg:z-10 flex flex-col border-r border-[#1D9E75]/10",
        isMobileMenuOpen ? "translate-x-0 shadow-[20px_0_60px_rgba(0,0,0,0.5)]" : "-translate-x-full"
      )}>
        {/* Mobile Close Button Overlay */}
        {isMobileMenuOpen && (
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden absolute top-4 -right-12 w-10 h-10 bg-[#0b1912] text-[#22c981] flex items-center justify-center rounded-r-xl border-y border-r border-white/10 active:scale-90 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="h-full w-full overflow-hidden">
          {sidebar}
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8F7] relative">
        {/* TOP BAR */}
        <header className="h-[60px] bg-white border-b border-[#1D9E75]/10 px-4 lg:px-8 flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-4">
            {/* Hamburger for Mobile */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-[#0b1912] transition-colors active:scale-90"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Punt 11: Interactive Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <button onClick={resetToCollections} className="hover:text-[#0b1912] transition-colors cursor-pointer whitespace-nowrap">Collecties</button>
              <span className="text-slate-200">/</span>
              <button 
                onClick={resetToCollection} 
                className={cn(
                  "transition-colors truncate max-w-[80px] lg:max-w-[150px]",
                  activeCollection ? "hover:text-[#0b1912] cursor-pointer" : "opacity-30"
                )}
              >
                {activeCollection?.name || "Selectie"}
              </button>
              {activeArticle && (
                <>
                  <span className="text-slate-200">/</span>
                  <span className="text-[#0b1912] truncate max-w-[100px] lg:max-w-[250px]">{activeArticle.product_name}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="hidden md:block">
               <SaveStatus />
            </div>
            <div className="hidden md:block h-4 w-[1px] bg-slate-100 mx-1" />
            <button 
              onClick={handleNextStep}
              disabled={!activeArticle || activeStep === 8}
              className="px-4 lg:px-6 py-2.5 rounded-xl bg-[#0b1912] text-[#22c981] text-[10px] font-black uppercase tracking-widest hover:bg-[#12281d] disabled:opacity-30 transition-all transform active:scale-[0.98] shadow-xl shadow-[#0b1912]/10"
            >
              <span className="hidden sm:inline">VOLGENDE STAP</span>
              <span className="sm:hidden">STAP {activeStep + 1}</span>
              <span className="ml-2">→</span>
            </button>
          </div>
        </header>

        {/* WIZARD SCROLL AREA */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto p-6 lg:p-16 pb-40">
            {form}
          </div>
        </main>
      </div>

      {/* ── PREVIEW PANEL (Inklapbaar op kleine schermen) ── */}
      <section className="hidden xl:flex w-[380px] bg-white border-l border-[#1D9E75]/10 flex-shrink-0 flex flex-col">
        {preview}
      </section>
    </div>
  );
}
