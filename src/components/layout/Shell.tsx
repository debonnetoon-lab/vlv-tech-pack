"use client";

import React, { useState, useEffect } from "react";
import { SaveStatus } from "./SaveStatus";
import {  useUIStore, useDataStore , useTechPackStore } from "@/store";
import { Menu, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";

const DataManagement = dynamic(() => import("../settings/DataManagement"), {
  ssr: false,
  loading: () => <div className="p-10 flex items-center justify-center"><Plus className="w-8 h-8 animate-spin text-slate-200" /></div>
});

const AdminDashboard = dynamic(() => import("../admin/AdminDashboard"), {
  ssr: false,
  loading: () => <div className="p-10 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-200" /></div>
});

import { Loader2 } from "lucide-react";

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

  const { isSettingsOpen, setSettingsOpen, isAdminDashboardOpen } = useUIStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0b1912] animate-spin" />
    </div>;
  }

  const activeCollection = (collections || []).find((c: any) => c.id === activeCollectionId);
  const activeArticle = (activeCollection?.products || []).find((a: any) => a.id === activeArticleId);

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
        {/* TOP BAR & NAVIGATION AREA */}
        <header className="bg-white border-b border-slate-100 flex-shrink-0 z-40">
          <div className="h-[70px] px-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Hamburger for Mobile */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumbs V3 */}
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-300">
                <button onClick={resetToCollections} className="hover:text-slate-900 transition-colors">Workspace</button>
                <span className="text-slate-200">/</span>
                <button 
                  onClick={resetToCollection} 
                  className={cn(
                    "transition-colors truncate max-w-[150px]",
                    activeCollection ? "hover:text-slate-900 cursor-pointer" : "opacity-30"
                  )}
                >
                  {isAdminDashboardOpen ? "Global Admin" : (activeCollection?.name || "Collectie")}
                </button>
                {activeArticle && !isAdminDashboardOpen && (
                  <>
                    <span className="text-slate-200">/</span>
                    <span className="text-slate-900 truncate max-w-[250px] italic">
                      {activeArticle.product_name || activeArticle.name}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <SaveStatus />
              <div className="h-6 w-px bg-slate-100 mx-2" />
              <button 
                onClick={handleNextStep}
                disabled={!activeArticle || activeStep === 10}
                className="h-10 px-6 rounded-xl bg-[#0b1912] text-[#22c981] text-[10px] font-black uppercase tracking-widest hover:scale-105 disabled:opacity-30 transition-all shadow-lg active:scale-95"
              >
                Volgende Stap →
              </button>
            </div>
          </div>
        </header>

        {/* SCROLL AREA */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#FDFDFD]">
          {isAdminDashboardOpen ? (
            <div className="p-10 max-w-[1400px] mx-auto">
              <AdminDashboard />
            </div>
          ) : (
            form
          )}
        </main>
      </div>

      {/* ── PREVIEW PANEL (Inklapbaar op kleine schermen) ── */}
      {!isAdminDashboardOpen && (
        <section className="hidden xl:flex w-[380px] bg-white border-l border-[#1D9E75]/10 flex-shrink-0 flex flex-col">
          {preview}
        </section>
      )}

      {/* ── SETTINGS MODAL (Moved from Sidebar for centering) ── */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#0b1912]/80 backdrop-blur-md flex items-center justify-center p-4" 
            onClick={() => setSettingsOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] bg-white rounded-[40px] overflow-hidden shadow-2xl relative" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-full overflow-y-auto p-10 custom-scrollbar">
                <button 
                  onClick={() => setSettingsOpen(false)} 
                  className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full z-10 transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45 text-slate-400" />
                </button>
                <DataManagement />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
