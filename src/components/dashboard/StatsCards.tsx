"use client";

import React from "react";
import { useTechPackStore } from "@/store";
import { 
  FolderKanban, 
  Package, 
  Clock, 
  Download,
  TrendingUp,
  ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";

export default function StatsCards() {
  const { collections } = useTechPackStore();

  const stats = React.useMemo(() => {
    const totalCollections = collections.length;
    let totalProducts = 0;
    let pendingProducts = 0;

    collections.forEach((col: any) => {
      totalProducts += (col.products?.length || 0);
      pendingProducts += (col.products?.filter((p: any) => p.status === 'in_review')?.length || 0);
    });

    return [
      { 
        label: "Collecties", 
        value: totalCollections, 
        icon: FolderKanban, 
        color: "bg-blue-500",
        trend: "+2 deze maand" 
      },
      { 
        label: "Producten", 
        value: totalProducts, 
        icon: Package, 
        color: "bg-[#22c981]",
        trend: "+8 deze week"
      },
      { 
        label: "In Review", 
        value: pendingProducts, 
        icon: Clock, 
        color: "bg-amber-500",
        trend: "Actie vereist"
      },
      { 
        label: "Exports", 
        value: 24, // Mock for now, will connect to export_logs in Phase 5
        icon: Download, 
        color: "bg-purple-500",
        trend: "ZIP/PDF/XLS"
      },
    ];
  }, [collections]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          key={stat.label}
          className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-default relative overflow-hidden"
        >
          {/* Decorative background element */}
          <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.color} opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700`} />

          <div className="flex items-start justify-between relative z-10">
            <div className={`p-3 rounded-2xl ${stat.color} bg-opacity-10`}>
              <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
          </div>

          <div className="mt-6 relative z-10">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 leading-none">
                {stat.value}
              </h2>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full uppercase tracking-tight">
                Totaal
              </span>
            </div>
            
            <div className="mt-4 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter whitespace-nowrap">
                {stat.trend}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
