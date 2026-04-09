"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import {  useCollaborationStore , useTechPackStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginForm() {
  const { setUser } = useTechPackStore();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [forgotPasswordMsg, setForgotPasswordMsg] = React.useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setUser(data.user);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm p-8 bg-white rounded-3xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black tracking-tighter text-slate-900 italic">VLV TECH PACK</h1>
        <p className="text-slate-500 text-sm font-medium">Log in om je collecties te beheren</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="naam@vlv.be" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            className="rounded-xl border-slate-200 focus:ring-slate-900"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Wachtwoord</Label>
            <button 
              type="button" 
              onClick={() => setForgotPasswordMsg("Neem contact op met Toon om je wachtwoord te laten resetten.")}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-tight"
            >
              Wachtwoord vergeten?
            </button>
          </div>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="rounded-xl border-slate-200 focus:ring-slate-900 pr-10"
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

        {forgotPasswordMsg && (
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-indigo-700 leading-tight uppercase">
              {forgotPasswordMsg}
            </p>
          </div>
        )}
        
        {error && (
          <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">
            {error}
          </p>
        )}

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
          {loading ? "Inloggen..." : "Inloggen"}
        </Button>
      </form>
    </div>
  );
}
