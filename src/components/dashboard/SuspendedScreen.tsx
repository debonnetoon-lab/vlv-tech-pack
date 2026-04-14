"use client";

import React from "react";
import { ShieldAlert, LogOut, Mail, ExternalLink, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

export default function SuspendedScreen() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 relative overflow-hidden">
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white rounded-[48px] shadow-2xl shadow-red-900/10 border border-slate-100 p-12 text-center relative z-10"
      >
        <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center mx-auto mb-10 group transition-transform hover:scale-105 active:scale-95">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>

        <div className="space-y-4 mb-10">
          <div className="px-4 py-1.5 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] inline-block">
            Toegang Geblokkeerd
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">
            Account <span className="text-red-500">Geschorst</span>
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            De toegang tot deze organisatie is tijdelijk stopgezet door de beheerder. Mogelijk is er een administratieve reden of is de accountbeveiliging in onderzoek.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-10 text-left">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Wat betekent dit?</p>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Je kunt momenteel geen tech packs bekijken, bewerken of exporteren. Alle data blijft veilig bewaard, maar is tijdelijk niet toegankelijk.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <a 
            href="mailto:support@vivelevelo.be"
            className="flex-1 h-14 bg-[#0b1912] text-[#22c981] rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#0b1912]/10"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </a>
          <button 
            onClick={handleLogout}
            className="flex-1 h-14 bg-white text-slate-400 border border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all hover:bg-slate-50 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Log Uit
          </button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <ShieldAlert className="w-3 h-3" /> Secure Access
          </span>
          <div className="w-1 h-1 bg-slate-200 rounded-full" />
          <span>VLV Tech Pack Builder</span>
        </div>
      </motion.div>
    </div>
  );
}
