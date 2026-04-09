"use client";

import React from "react";
import Shell from "@/components/layout/Shell";
import Sidebar from "@/components/sidebar/Sidebar";
import WizardEngine from "@/components/wizard/WizardEngine";
import { Users, Info, Loader2 } from "lucide-react";
import {  useDataStore, useCollaborationStore , useTechPackStore } from "@/store";
import { supabase } from "@/lib/supabase";
import LoginForm from "@/components/auth/LoginForm";
import { cn } from "@/lib/utils";

function PresenceBanner() {
  const { activeUsers } = useTechPackStore();
  
  return (
    <div className="flex items-center justify-between px-6 py-2 bg-slate-900 text-white shadow-lg z-50">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-1.5">
          {activeUsers
            .filter((u: any, idx: number, arr: any[]) => arr.findIndex((x: any) => x.id === u.id) === idx)
            .slice(0, 3)
            .map((u: any, i: number) => (
            <div key={u.id} className={cn(
              "w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center text-[8px] font-black shadow-sm",
              u.avatar_color === "indigo" ? "bg-indigo-500" : "bg-emerald-500"
            )}>
              {(u.full_name || u.initials || u.id || "?").charAt(0).toUpperCase()}
            </div>
          ))}
          {activeUsers.length > 3 && (
            <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-500 shadow-sm">
              +{activeUsers.length - 3}
            </div>
          )}
          {activeUsers.length === 0 && (
            <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-500 shadow-sm">
              ?
            </div>
          )}
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
          {activeUsers.length} <span className="text-slate-600 font-medium">{activeUsers.length === 1 ? "gebruiker" : "gebruikers"} online</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Cloud Sync Actief</span>
        </div>
      </div>
    </div>
  );
}
import WizardStepper from "@/components/wizard/WizardStepper";
import dynamic from "next/dynamic";

// PDF components often need dynamic import with ssr: false in Next.js
const PDFPreview = dynamic(() => import("@/components/preview/PDFPreview"), {
  ssr: false,
});

import { useSocket } from "@/hooks/useSocket";

export default function Home() {
  const { user, setUser, fetchCollections } = useTechPackStore();
  const [initializing, setInitializing] = React.useState(true);
  
  // Start socket connection when logged in
  useSocket();

  React.useEffect(() => {
    // Initial check
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchCollections();
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setInitializing(false);
      }
    };

    initAuth();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchCollections();
      } else {
        // Clear local collections if needed or let store handle it
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, fetchCollections]);

  if (initializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Beveiligde verbinding maken...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <LoginForm />
      </div>
    );
  }

  return (
    <Shell
      sidebar={
        <div className="flex flex-col h-full overflow-hidden">
          <PresenceBanner />
          <div className="flex-1 min-h-0">
            <Sidebar />
          </div>
          <div className="border-t border-slate-100 bg-white flex-shrink-0 p-2">
            <WizardStepper />
          </div>
        </div>
      }
      form={<WizardEngine />}
      preview={<PDFPreview />}
    />
  );
}
