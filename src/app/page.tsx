"use client";

import React, { useMemo } from "react";
import Shell from "@/components/layout/Shell";
import Sidebar from "@/components/sidebar/Sidebar";
import WizardEngine from "@/components/wizard/WizardEngine";
import { Users, Info, Loader2 } from "lucide-react";
import {  useDataStore, useCollaborationStore , useTechPackStore } from "@/store";
import { supabase } from "@/lib/supabase";
import LoginForm from "@/components/auth/LoginForm";
import { cn } from "@/lib/utils";

function PresenceBanner() {
  const { activeUsers = [], profile } = useTechPackStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Combine activeUsers with current profile to ensure "self" is always visible
  const displayUsers = useMemo(() => {
    if (!Array.isArray(activeUsers)) return [];
    
    const list = [...activeUsers];
    if (profile?.id && !list.some(u => u?.id === profile.id)) {
      list.push({
        ...profile,
        status: 'active'
      } as any);
    }
    // Deduplicate and filter out nulls/undefineds
    return list.filter((u, idx, arr) => 
      u && u.id && arr.findIndex(x => x?.id === u.id) === idx
    );
  }, [activeUsers, profile]);

  const onlineCount = displayUsers.length;

  if (!mounted) {
    return (
      <div className="flex items-center justify-between px-6 py-2 bg-[#0b1912] border-b border-white/[0.05] h-[40px] shadow-lg z-50 animate-pulse">
        <div className="flex items-center gap-3">
           <div className="w-10 h-3 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-6 py-2 bg-[#0b1912] border-b border-white/[0.05] text-white shadow-lg z-50">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-1.5">
          {displayUsers
            .slice(0, 3)
            .map((u: any) => (
            <div key={u.id} className={cn(
              "w-5 h-5 rounded-full border-2 border-[#0b1912] flex items-center justify-center text-[8px] font-black shadow-sm",
              profile?.id && u.id === profile.id ? "ring-2 ring-[#22c981] ring-offset-1 ring-offset-[#0b1912]" : ""
            )} style={{ backgroundColor: u.avatar_color || "#1D9E75" }}>
              {(u.full_name || u.initials || "U").charAt(0).toUpperCase()}
            </div>
          ))}
          {onlineCount > 3 && (
            <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-500 shadow-sm">
              +{onlineCount - 3}
            </div>
          )}
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
          {onlineCount} <span className="text-white/20 font-medium">{onlineCount === 1 ? "GEBRUIKER" : "GEBRUIKERS"} ONLINE</span>
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
  const [initializing, setInitializing] = React.useState(false);
  
  // Start socket connection when logged in
  useSocket();

  React.useEffect(() => {
    // Initial check with timeout to prevent hanging on Vercel
    const initAuth = async () => {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 1500)
      );

      try {
        const { data: { session } } = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ]) as any;

        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchCollections();
        }
      } catch (err) {
        console.error("Auth init error or timeout:", err);
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
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, fetchCollections]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
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
