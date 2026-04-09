/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState } from "react";
import {  useUIStore , useTechPackStore } from "@/store";
import { cn } from "@/lib/utils";

export function SaveStatus() {
  const { isOnline, isSaving } = useTechPackStore();
  const [lastSaved, setLastSaved] = useState<string>("");

  useEffect(() => {
    if (!isSaving) {
      const now = new Date();
      setLastSaved(new Intl.DateTimeFormat("nl-BE", { 
        hour: "2-digit", 
        minute: "2-digit" 
      }).format(now));
    }
  }, [isSaving]);

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "w-1.5 h-1.5 rounded-full transition-colors duration-500",
        isSaving ? "bg-amber-400 animate-pulse" : (isOnline !== false ? "bg-[#22c981]" : "bg-red-500")
      )} />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
        {isSaving ? "Opslaan..." : (isOnline !== false ? `Opgeslagen om ${lastSaved}` : "Offline stand")}
      </span>
    </div>
  );
}
