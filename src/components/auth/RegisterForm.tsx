"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle, Building2 } from "lucide-react";

interface RegisterFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

export default function RegisterForm({ onSuccess, onBackToLogin }: RegisterFormProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [orgName, setOrgName] = React.useState("");
  
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            org_name: orgName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Er is een fout opgetreden bij de registratie.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-3xl shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Check je mailbox</h2>
          <p className="text-slate-500 text-sm font-medium">
            We hebben een bevestigingsmail gestuurd naar <span className="text-emerald-600 font-bold">{email}</span>.
            Klik op de link om je account te activeren.
          </p>
        </div>
        <Button 
          onClick={onBackToLogin}
          className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest hover:scale-[1.02] transition-all"
        >
          Terug naar Login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm p-8 bg-white rounded-3xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black tracking-tighter text-slate-900 italic uppercase">Word Lid</h1>
        <p className="text-slate-500 text-sm font-medium">Start je eigen tech pack workspace</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Persoonlijke Info */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Volledige Naam</Label>
            <div className="relative">
              <Input 
                id="fullName" 
                placeholder="Jan Jansen" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
                className="rounded-xl border-slate-200 focus:ring-[#22c981] h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgName" className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Organisatie Naam</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                id="orgName" 
                placeholder="VLV Studio" 
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required 
                className="rounded-xl border-slate-200 focus:ring-[#22c981] h-11 pl-10"
              />
            </div>
          </div>
        </div>

        {/* Account Info */}
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

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Wachtwoord</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                minLength={6}
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Bevestig Wachtwoord</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
              className="rounded-xl border-slate-200 focus:ring-[#22c981] h-11"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-red-600 leading-tight">
              {error}
            </p>
          </div>
        )}

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-12 rounded-xl bg-[#0b1912] text-[#22c981] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#22c981]/5 mt-4"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
          {loading ? "Registreren..." : "Account Aanmaken"}
        </Button>
      </form>

      <div className="border-t border-slate-100 pt-6 text-center">
        <p className="text-xs text-slate-500 font-medium tracking-tight">
          Al een account? <button onClick={onBackToLogin} className="text-[#22c981] font-bold hover:underline cursor-pointer">Log hier in</button>
        </p>
      </div>
    </div>
  );
}
