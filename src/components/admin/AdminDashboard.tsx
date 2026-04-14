"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldAlert,
  Loader2,
  ExternalLink,
  Users
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Organization {
  id: string;
  name: string;
  slug: string;
  status: 'pending' | 'active' | 'suspended';
  created_at: string;
  members: Array<{
    user_id: string;
    role: string;
  }>;
}

export default function AdminDashboard() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/admin/organizations", {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data.organizations || []);
      }
    } catch (err) {
      console.error("Fout bij ophalen organisaties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleUpdateStatus = async (orgId: string, newStatus: string) => {
    setActionLoading(orgId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/admin/organizations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id: orgId, status: newStatus })
      });

      if (res.ok) {
        setOrganizations(prev => prev.map(org => 
          org.id === orgId ? { ...org, status: newStatus as any } : org
        ));
      }
    } catch (err) {
      console.error("Update mislukt:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          org.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || org.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: organizations.length,
    pending: organizations.filter(o => o.status === 'pending').length,
    active: organizations.filter(o => o.status === 'active').length
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* ── HEADER ── */}
      <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-[0.03] rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4">
            Global Admin Access
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
            VLV <span className="text-indigo-600">Control</span> Panel
          </h1>
          <p className="text-slate-400 font-medium mt-4 max-w-md">
            Beheer alle organisaties en keur nieuwe aanvragen goed.
          </p>
        </div>

        {/* STATS AREA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {[
            { label: 'Totaal', value: stats.total, icon: Building2, color: 'text-slate-900' },
            { label: 'Wachtend', value: stats.pending, icon: Clock, color: 'text-amber-500' },
            { label: 'Actief', value: stats.active, icon: CheckCircle2, color: 'text-emerald-500' },
          ].map((stat, i) => (
            <div key={i} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100/50">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className={cn("w-4 h-4", stat.color)} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
              </div>
              <p className={cn("text-3xl font-black", stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FILTERS & LIST ── */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Zoek op naam of slug..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-100 bg-white focus:border-indigo-500 focus:ring-0 transition-all font-medium text-sm"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            {['all', 'pending', 'active', 'suspended'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  filterStatus === s ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {s === 'all' ? 'Alle' : s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4 text-slate-300">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest">Organisaties laden...</p>
            </div>
          ) : filteredOrgs.length === 0 ? (
            <div className="py-20 bg-white rounded-[40px] border border-slate-100 border-dashed text-center">
              <Building2 className="w-12 h-12 text-slate-100 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Geen organisaties gevonden.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredOrgs.map((org) => (
                <motion.div 
                  layout
                  key={org.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-100 rounded-[32px] p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                        <Building2 className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">{org.name}</h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                            org.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            org.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                            "bg-red-50 text-red-600 border-red-100"
                          )}>
                            {org.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md truncate max-w-[200px]">{org.slug}</p>
                          <span className="text-[10px] text-slate-300 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {new Date(org.created_at).toLocaleDateString('nl-BE')}
                          </span>
                          <span className="text-[10px] text-slate-300 flex items-center gap-1.5">
                            <Users className="w-3 h-3" />
                            {org.members?.length || 0} leden
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {org.status === 'pending' ? (
                        <button 
                          onClick={() => handleUpdateStatus(org.id, 'active')}
                          disabled={actionLoading === org.id}
                          className="h-11 px-8 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2"
                        >
                          {actionLoading === org.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Goedkeuren
                        </button>
                      ) : org.status === 'active' ? (
                        <button 
                          onClick={() => handleUpdateStatus(org.id, 'suspended')}
                          disabled={actionLoading === org.id}
                          className="h-11 px-6 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all flex items-center gap-2"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUpdateStatus(org.id, 'active')}
                          disabled={actionLoading === org.id}
                          className="h-11 px-6 bg-white border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                          Herstelho
                        </button>
                      )}

                      <button className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
