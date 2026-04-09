"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/sw-register";
import { initSentry } from "@/lib/sentry";

export function PWARegistry() {
  useEffect(() => {
    // Note: Sentry DSN should come from .env
    initSentry(process.env.NEXT_PUBLIC_SENTRY_DSN || "", process.env.NODE_ENV);
    registerServiceWorker();
  }, []);

  return null;
}
