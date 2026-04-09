"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/sw-register";
import { initSentry } from "@/lib/sentry";

export function PWARegistry() {
  useEffect(() => {
    // Note: Sentry DSN should come from .env
    initSentry(process.env.NEXT_PUBLIC_SENTRY_DSN || "", process.env.NODE_ENV);
    registerServiceWorker();

    const handleUpdate = () => {
      // In a real app, show a toast. For now, we log it.
      console.log("VLV: Update available! Please refresh the page to see changes.");
    };

    window.addEventListener('vlv-update-available', handleUpdate);
    return () => window.removeEventListener('vlv-update-available', handleUpdate);
  }, []);

  return null;
}
