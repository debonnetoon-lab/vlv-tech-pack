/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { UserPlus, Loader2, CheckCircle2, AlertCircle, Shield, User, Mail, Key, Eye, EyeOff, RefreshCw, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

type Role = 'admin' | 'user' | 'input';

interface AppUser {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  created_at: string;
}

const ROLE_LABELS: Record<Role, { label: string; color: string; bg: string }> = {
  admin:  { label: 'Beheerder', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-100' },
  user:   { label: 'Gebruiker', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
  input:  { label: 'Input',     color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-100'  },
};

export default function UserManagement() {
  // ─── Add user form state ─────────────────────────────────────────────
  const [email, setEmail]         = useState("");
  const [fullName, setFullName]   = useState("");
  const [password, setPassword]   = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [role, setRole]           = useState<'user' | 'input'>('user');
  const [isAdding, setIsAdding]   = useState(false);
  const [addStatus, setAddStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // ─── User list / reset state ─────────────────────────────────────────
  const [users, setUsers]                 = useState<AppUser[]>([]);
  const [loadingUsers, setLoadingUsers]   = useState(false);
  const [resetTarget, setResetTarget]     = useState<string | null>(null); // user id being reset
  const [newPassword, setNewPassword]     = useState("");
  const [resetStatus, setResetStatus]     = useState<{ id: string; type: 'success' | 'error'; message: string } | null>(null);

  // ─── Fetch existing users ────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/admin/users", {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error("Fout bij ophalen gebruikers:", e);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ─── Add new user ────────────────────────────────────────────────────
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setAddStatus(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Niet ingelogd");

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ email, full_name: fullName, password, role })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Er is iets misgegaan");

      setAddStatus({ type: 'success', message: `✅ ${email} is aangemaakt als ${ROLE_LABELS[role].label}.` });
      setEmail(""); setFullName(""); setPassword("");
      fetchUsers(); // refresh list
    } catch (err: any) {
      setAddStatus({ type: 'error', message: err.message });
    } finally {
      setIsAdding(false);
    }
  };

  // ─── Reset password ──────────────────────────────────────────────────
  const handleResetPassword = async (userId: string) => {
    if (!newPassword.trim()) return;
    setResetStatus(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Niet ingelogd");

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ user_id: userId, password: newPassword })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Reset mislukt");

      setResetStatus({ id: userId, type: 'success', message: "Wachtwoord succesvol gewijzigd." });
      setResetTarget(null);
      setNewPassword("");
    } catch (err: any) {
      setResetStatus({ id: userId, type: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            Gebruikersbeheer
          </h3>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Alleen zichtbaar voor beheerders
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          title="Lijst vernieuwen"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* ── Existing users list ── */}
      <div className="space-y-2">
        {loadingUsers ? (
          <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-medium">Gebruikers laden...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="py-6 text-center text-slate-400">
            <User className="w-6 h-6 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">Nog geen gebruikers aangemaakt</p>
          </div>
        ) : (
          users.map((u) => {
            const roleInfo = ROLE_LABELS[u.role] ?? ROLE_LABELS.input;
            const isResetting = resetTarget === u.id;
            return (
              <div key={u.id} className="p-4 bg-slate-50/60 border border-slate-100 rounded-2xl space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                      {(u.full_name || u.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{u.full_name || "—"}</p>
                      <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${roleInfo.bg} ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                    <button
                      onClick={() => { setResetTarget(isResetting ? null : u.id); setNewPassword(""); setResetStatus(null); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                      title="Wachtwoord resetten"
                    >
                      <Key className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Inline password reset */}
                {isResetting && (
                  <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Input
                      type="password"
                      placeholder="Nieuw wachtwoord..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-9 text-xs rounded-xl border-slate-200 bg-white flex-1"
                    />
                    <Button
                      onClick={() => handleResetPassword(u.id)}
                      disabled={!newPassword.trim()}
                      className="h-9 px-3 bg-indigo-600 text-white text-xs rounded-xl font-bold hover:bg-indigo-700"
                    >
                      Opslaan
                    </Button>
                  </div>
                )}

                {/* Reset status */}
                {resetStatus?.id === u.id && (
                  <div className={`p-2 rounded-xl flex items-center gap-2 text-[10px] font-bold animate-in fade-in duration-200 ${
                    resetStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {resetStatus.type === 'success' ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <AlertCircle className="w-3 h-3 shrink-0" />}
                    {resetStatus.message}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Add new user form ── */}
      <div className="pt-4 border-t border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <UserPlus className="w-3 h-3" /> Nieuwe collega toevoegen
        </p>

        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="um_full_name" className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Naam</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input id="um_full_name" placeholder="Jan Janssen" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="pl-9 h-10 bg-white border-slate-200 rounded-xl text-xs" required />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="um_email" className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input id="um_email" type="email" placeholder="jan@vivelevelo.be" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-10 bg-white border-slate-200 rounded-xl text-xs" required />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="um_password" className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tijdelijk wachtwoord</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input id="um_password" type={showPwd ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 h-10 bg-white border-slate-200 rounded-xl text-xs" required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rol</Label>
              <div className="flex gap-2 h-10">
                <button type="button" onClick={() => setRole('user')}
                  className={`flex-1 rounded-xl text-[10px] font-bold uppercase tracking-tight flex items-center justify-center gap-1.5 border transition-all ${
                    role === 'user' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                  }`}>
                  <Shield className="w-3 h-3" /> Gebruiker
                </button>
                <button type="button" onClick={() => setRole('input')}
                  className={`flex-1 rounded-xl text-[10px] font-bold uppercase tracking-tight flex items-center justify-center gap-1.5 border transition-all ${
                    role === 'input' ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200' : 'bg-white text-slate-500 border-slate-200 hover:border-amber-300'
                  }`}>
                  <User className="w-3 h-3" /> Input
                </button>
              </div>
              <p className="text-[9px] text-slate-400 font-medium">
                {role === 'user' ? '✅ Kan PDF\'s exporteren' : '⛔ Geen PDF export'}
              </p>
            </div>
          </div>

          {/* Status feedback */}
          {addStatus && (
            <div className={`p-3 rounded-xl flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300 ${
              addStatus.type === 'success' ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-700'
            }`}>
              {addStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <p className="text-xs font-medium">{addStatus.message}</p>
            </div>
          )}

          <Button type="submit" disabled={isAdding}
            className="w-full h-11 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-[0.98]">
            {isAdding ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />Aanmaken...</>
            ) : (
              <><UserPlus className="w-3.5 h-3.5 mr-2" />Gebruiker Toevoegen</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
