"use client";

import React from "react";
import { Clock, ShieldCheck, Mail, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function PendingScreen() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 border border-slate-100 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-amber-400" />
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-400/5 rounded-full blur-2xl" />

        <div className="mb-8 relative">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto text-amber-500 shadow-inner">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
            <ShieldCheck className="w-6 h-6 text-slate-300" />
          </div>
        </div>

        <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase leading-tight mb-4">
          Aanvraag in <span className="text-amber-500">Behandeling</span>
        </h1>
        
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
          Welkom bij VLV Tech Pack Builder. Je nieuwe werkruimte staat klaar, maar we controleren eerst even de configuratie. 
          Je ontvangt een bericht zodra je aan de slag kunt.
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Vragen?</p>
              <p className="text-xs font-bold text-slate-900">studio@vivelevelo.be</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full h-12 flex items-center justify-center gap-3 text-slate-400 hover:text-red-500 hover:bg-red-50 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            Uitloggen
          </button>
        </div>
      </div>

      <p className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
        Vive le Vélo Technical Portal V3
      </p>
    </div>
  );
}
