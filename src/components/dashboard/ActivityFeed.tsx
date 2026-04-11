"use client";

import React from "react";
import { useTechPackStore } from "@/store";
import { motion } from "framer-motion";
import { 
  PlusCircle, 
  FileEdit, 
  Trash2, 
  Copy, 
  Download, 
  CheckCircle2, 
  UserPlus,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

export default function ActivityFeed() {
  const { activityLogs, fetchActivityLogs } = useTechPackStore();

  React.useEffect(() => {
    fetchActivityLogs();
    // Refresh periodically
    const interval = setInterval(fetchActivityLogs, 30000);
    return () => clearInterval(interval);
  }, [fetchActivityLogs]);

  const getIcon = (action: string) => {
    switch (action) {
      case 'created': return <PlusCircle className="w-4 h-4 text-emerald-500" />;
      case 'updated': return <FileEdit className="w-4 h-4 text-blue-500" />;
      case 'deleted': return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'duplicated': return <Copy className="w-4 h-4 text-amber-500" />;
      case 'exported': return <Download className="w-4 h-4 text-purple-500" />;
      case 'approved': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'joined': return <UserPlus className="w-4 h-4 text-pink-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatAction = (log: any) => {
    const name = log.profiles?.full_name || "Iemand";
    const entity = log.entity_type === 'product' ? 'een product' : log.entity_type === 'collection' ? 'een collectie' : 'iets';
    
    switch (log.action) {
      case 'created': return `${name} heeft ${entity} aangemaakt`;
      case 'updated': return `${name} heeft ${entity} bewerkt`;
      case 'deleted': return `${name} heeft ${entity} verwijderd`;
      case 'duplicated': return `${name} heeft ${entity} gedupliceerd`;
      case 'exported': return `${name} heeft ${entity} geëxporteerd`;
      case 'approved': return `${name} heeft ${entity} goedgekeurd`;
      case 'organization_created': return `${name} heeft de organisatie aangemaakt`;
      default: return `${name} heeft een actie uitgevoerd`;
    }
  };

  if (!activityLogs || activityLogs.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 italic text-slate-400 text-sm">
        Nog geen recente activiteit gevonden.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <h3 className="font-black italic uppercase tracking-tighter text-slate-900">Recente Activiteit</h3>
        <span className="text-[10px] font-bold text-[#22c981] bg-[#22c981]/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Live</span>
      </div>
      
      <div className="divide-y divide-slate-50">
        {activityLogs.map((log: any, index: number) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            key={log.id} 
            className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors group"
          >
            <div className="mt-1">
              {getIcon(log.action)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-700 leading-snug">
                {formatAction(log)}
                {log.metadata?.name && (
                  <span className="text-slate-400 font-medium"> — "{log.metadata.name}"</span>
                )}
              </p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium italic">
                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: nl })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
