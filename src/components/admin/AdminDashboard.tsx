"use client";

import React, { useEffect } from "react";
import { useTechPackStore, useUIStore } from "@/store";
import { 
  X, 
  UserCheck, 
  Building2, 
  Mail, 
  Calendar,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale/nl";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { 
    pendingOrganizations, 
    pendingCount,
    fetchPendingOrganizations,
    approveOrganization,
    isSaving,
    switchOrganization
  } = useTechPackStore();
  
  const { setAdminDashboardOpen } = useUIStore();

  useEffect(() => {
    fetchPendingOrganizations();
  }, [fetchPendingOrganizations]);

  const handleImpersonate = async (orgId: string) => {
    try {
      await switchOrganization(orgId);
      setAdminDashboardOpen(false);
    } catch (err) {
      console.error("Impersonation failed:", err);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* ── HEADER ── */}
      <div className="bg-slate-900 p-10 rounded-[40px] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-[0.1] rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest inline-block border border-indigo-500/30">
              System Administrator Access
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
              VLV <span className="text-indigo-400">Control</span> Panel
            </h1>
            <p className="text-slate-400 font-medium max-w-md">
              Beveiligde omgeving voor het beheren van organisaties en het goedkeuren van nieuwe leden.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Wachtend</span>
              </div>
              <p className="text-3xl font-black text-amber-500">{pendingCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── PENDING REQUESTS ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Openstaande Aanvragen</h2>
          </div>
          {pendingCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse shadow-lg shadow-amber-500/20">
              Actie Vereist
            </span>
          )}
        </div>

        {pendingOrganizations.length === 0 ? (
          <div className="py-24 bg-white rounded-[40px] border border-slate-100 border-dashed text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-4 transition-transform group-hover:scale-110">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-tighter text-lg">Geen lopende aanvragen</p>
            <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mt-1">Alle accounts zijn tot nu toe verwerkt.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingOrganizations.map((org: any) => (
              <div 
                key={org.id} 
                className="group bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all flex flex-col md:flex-row md:items-center gap-8 relative overflow-hidden"
              >
                {/* Accent line */}
                <div className="absolute top-0 left-0 w-2 h-full bg-amber-500 opacity-20 group-hover:opacity-100 transition-opacity" />

                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">{org.name}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{org.slug}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Wacht op goedkeuring</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Eigenaar</p>
                        <p className="text-xs font-black text-slate-900">{org.owner_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">E-mail</p>
                        <p className="text-xs font-black text-slate-900">{org.owner_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 col-span-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Registratiedatum</p>
                        <p className="text-xs font-black text-slate-900">
                          {org.created_at ? format(new Date(org.created_at), 'd MMMM yyyy HH:mm', { locale: nl }) : 'Onbekend'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8 shrink-0">
                  <button 
                    disabled={isSaving}
                    onClick={() => approveOrganization(org.id)}
                    className="h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 active:scale-95"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                    Account Activeren
                  </button>
                  <button 
                    onClick={() => handleImpersonate(org.id)}
                    className="w-14 h-14 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl flex items-center justify-center transition-all"
                    title="Bekijk Details"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-8 bg-indigo-50 rounded-3xl border border-indigo-100/50 flex items-center gap-4">
        <AlertCircle className="w-6 h-6 text-indigo-500" />
        <div className="space-y-1">
          <p className="text-xs font-black text-indigo-900 uppercase tracking-tight">Beveiligde Database Verbinding</p>
          <p className="text-[10px] font-medium text-indigo-600/70 uppercase tracking-widest">
            Alle acties worden gelogd in de activity_logs voor audit doeleinden.
          </p>
        </div>
      </div>
    </div>
  );
}
