"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import { useTechPackStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, Eye, EyeOff, AlertCircle, CheckCircle, KeyRound } from "lucide-react";

interface LoginFormProps {
  onRegisterClick?: () => void;
}

export default function LoginForm({ onRegisterClick }: LoginFormProps) {
  const { setUser } = useTechPackStore();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [view, setView] = React.useState<"login" | "forgot">("login");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (view === "login") {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        setUser(data.user);
      } else if (view === "forgot") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback`,
        });
        if (resetError) throw resetError;
        setSuccessMsg("Wachtwoord reset link is verstuurd naar je e-mailadres via Resend.");
        setView("login");
      }
    } catch (err: any) {
      setError(err.message || "Er is een onbekende fout opgetreden.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm p-8 bg-white rounded-3xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black tracking-tighter text-slate-900 italic uppercase">Log In</h1>
        <p className="text-slate-500 text-sm font-medium">
          {view === "login" ? "Beheer je fashion tech packs" : "Herstel je toegang"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">E-mail</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="naam@vlv.be" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            className="rounded-xl border-slate-200 focus:ring-[#22c981] h-11"
          />
        </div>
        
        {view === "login" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <Label htmlFor="password" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Wachtwoord</Label>
              <button 
                type="button" 
                onClick={() => { setView("forgot"); setError(null); setSuccessMsg(null); }}
                className="text-[10px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-tight cursor-pointer"
              >
                Vergeten?
              </button>
            </div>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={view === "login"}
                className="rounded-xl border-slate-200 focus:ring-[#22c981] pr-10 h-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-emerald-700 leading-tight uppercase">
              {successMsg}
            </p>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-red-600 leading-tight italic">
              {error}
            </p>
          </div>
        )}

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-12 rounded-xl bg-[#0b1912] text-[#22c981] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#22c981]/5 mt-4"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : view === "login" ? <LogIn className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
          {loading ? "Even geduld..." : view === "login" ? "Inloggen" : "Reset Link Versturen"}
        </Button>
      </form>

      <div className="border-t border-slate-100 pt-6 flex flex-col items-center gap-3">
         {view === "login" ? (
           <p className="text-xs text-slate-500 font-medium tracking-tight text-center">
             Nog geen account? <br/>
             <button onClick={onRegisterClick} className="text-[#22c981] font-bold hover:underline cursor-pointer mt-1">Maak Gratis Organisatie Aan</button>
           </p>
         ) : (
           <p className="text-xs text-slate-500 font-medium tracking-tight">
             Terug naar <button onClick={() => { setView("login"); setError(null); setSuccessMsg(null); }} className="text-[#22c981] font-bold hover:underline cursor-pointer">inloggen</button>
           </p>
         )}
      </div>
    </div>
  );
}
