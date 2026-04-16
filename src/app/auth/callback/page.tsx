"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      
      if (!code) {
        // If no code, check if we already have a session (idempotency)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus("success");
          router.push("/");
          return;
        }
        setStatus("error");
        setErrorMsg("Geen bevestigingscode gevonden in de URL.");
        return;
      }

      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;

        setStatus("success");
        // Brief delay for visual feedback
        setTimeout(() => {
          router.push("/");
          router.refresh(); // Ensure server components are updated
        }, 1500);
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setStatus("error");
        setErrorMsg(err.message || "Er is een fout opgetreden bij het verwerken van je aanmelding.");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
        {status === "loading" && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-[#22c981]/10 rounded-3xl flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-[#22c981] animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Account Bevestigen...</h2>
              <p className="text-slate-500 text-sm font-medium">Een moment geduld, we maken je workspace klaar.</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 text-emerald-600">Gelukt!</h2>
              <p className="text-slate-500 text-sm font-medium">Je account is bevestigd. We sturen je nu door naar het dashboard.</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 text-red-600">Oeps!</h2>
              <p className="text-slate-500 text-sm font-medium">{errorMsg}</p>
            </div>
            <button 
              onClick={() => router.push("/")}
              className="w-full h-12 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all mt-4"
            >
              Terug naar Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
