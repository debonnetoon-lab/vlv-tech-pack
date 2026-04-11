"use client";

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [syncFailed, setSyncFailed] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [lastOnline, setLastOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      checkSync();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Heartbeat check every 30 seconds
    const interval = setInterval(checkSync, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const checkSync = async () => {
    if (!navigator.onLine) {
      setIsOffline(true);
      return;
    }

    try {
      // Simple heartbeat query
      const { error } = await supabase.from('organizations').select('id').limit(1);
      setSyncFailed(!!error);
    } catch (err) {
      setSyncFailed(true);
    }
  };

  const handleRetry = async () => {
    setReconnecting(true);
    await checkSync();
    setTimeout(() => setReconnecting(false), 1000);
  };

  if (!isOffline && !syncFailed) {
    if (!lastOnline) {
       // Show brief success message when back online
       setTimeout(() => setLastOnline(true), 3000);
       return (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-green-500 text-white py-2 px-4 flex items-center justify-center gap-2 animate-in slide-in-from-top-full duration-500">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Verbinding Hersteld - Synchronisatie Actief</span>
        </div>
       );
    }
    return null;
  }

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-[9999] py-3 px-6 flex items-center justify-between gap-4 transition-all duration-500 shadow-2xl",
      isOffline ? "bg-red-600 text-white" : "bg-amber-500 text-white"
    )}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
          <WifiOff className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-black uppercase tracking-tight">
            {isOffline ? "Geen Verbinding" : "Synchronisatie Probleem"}
          </p>
          <p className="text-[10px] font-medium opacity-80">
            {isOffline 
              ? "Je bent offline. Wijzigingen worden lokaal opgeslagen maar nog niet gesynchroniseerd." 
              : "Verbinding met de database is verbroken. We proberen de verbinding te herstellen."}
          </p>
        </div>
      </div>

      <button 
        onClick={handleRetry}
        disabled={reconnecting}
        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
      >
        <RefreshCw className={cn("w-3 h-3", reconnecting && "animate-spin")} />
        {reconnecting ? "Verbinden..." : "Herproberen"}
      </button>
    </div>
  );
}
