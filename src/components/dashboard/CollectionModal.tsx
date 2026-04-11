"use client";

import React from "react";
import { useTechPackStore, useUIStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  X, 
  Loader2, 
  FolderPlus, 
  Calendar, 
  CloudRain, 
  Sun,
  Waves,
  Leaf,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CollectionModal() {
  const { addCollection, isSaving } = useTechPackStore();
  const { isCollectionModalOpen, setCollectionModalOpen } = useUIStore();
  
  const [name, setName] = React.useState("");
  const [season, setSeason] = React.useState<"SS" | "FW" | "Resort" | "Cruise" | "">("");
  const [year, setYear] = React.useState(new Date().getFullYear());
  const [status, setStatus] = React.useState<"draft" | "active">("draft");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await addCollection(name.trim(), { 
        season: season || undefined, 
        year, 
        status 
      });
      setName("");
      setCollectionModalOpen(false);
    }
  };

  if (!isCollectionModalOpen) return null;

  const seasons = [
    { id: "SS", label: "Spring/Summer", icon: Sun, color: "text-amber-500" },
    { id: "FW", label: "Fall/Winter", icon: CloudRain, color: "text-blue-500" },
    { id: "Resort", label: "Resort", icon: Waves, color: "text-cyan-500" },
    { id: "Cruise", label: "Cruise", icon: Leaf, color: "text-emerald-500" },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-[#0b1912]/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div 
        className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10 relative overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={() => setCollectionModalOpen(false)}
          className="absolute top-8 right-8 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 mb-8">
          <h3 className="text-3xl font-black italic tracking-tighter uppercase text-[#0b1912]">Nieuwe Collectie</h3>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">Organiseer je tech packs in collecties</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Naam Collectie</Label>
            <Input 
              id="name"
              autoFocus
              placeholder="bv. SS2026 - Main Collection"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 px-6 rounded-2xl border-2 border-slate-100 focus:border-[#22c981] font-black text-lg text-[#0b1912] placeholder:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year" className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Jaar</Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <Input 
                  id="year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="h-12 pl-12 rounded-2xl border-2 border-slate-100 focus:border-[#22c981] font-bold text-slate-700"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Status</Label>
               <div className="flex bg-slate-50 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setStatus("draft")}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                      status === "draft" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("active")}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                      status === "active" ? "bg-[#22c981] text-[#0b1912] shadow-sm shadow-[#22c981]/20" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Actief
                  </button>
               </div>
            </div>
          </div>

          {/* Season Selector */}
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Seizoen</Label>
            <div className="grid grid-cols-4 gap-3">
              {seasons.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeason(s.id as any)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all group",
                    season === s.id 
                      ? "border-[#22c981] bg-[#22c981]/5 shadow-lg shadow-[#22c981]/5" 
                      : "border-slate-50 hover:border-slate-100 bg-white"
                  )}
                >
                  <s.icon className={cn("w-5 h-5", season === s.id ? s.color : "text-slate-300 group-hover:text-slate-400")} />
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-tighter",
                    season === s.id ? "text-slate-900" : "text-slate-400"
                  )}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Cover Image Placeholder */}
          <div className="p-6 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-50 relative group cursor-not-allowed">
             <ImageIcon className="w-6 h-6 text-slate-100" />
             <span className="text-[8px] font-black uppercase tracking-widest text-slate-200">Cover Image — Fase 3</span>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={!name.trim() || isSaving}
              className="flex-1 h-14 rounded-2xl bg-[#0b1912] text-[#22c981] font-black uppercase tracking-widest hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <FolderPlus className="w-5 h-5" />}
              {isSaving ? "Aanmaken..." : "Collectie Starten"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
