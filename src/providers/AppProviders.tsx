"use client";

import { CollaborationProvider } from "./CollaborationProvider";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export function AppProviders({ children }: { children: React.ReactNode }) {
  // Punt 8: Activate global keyboard shortcuts (⌘1-8, Arrows, etc.)
  useKeyboardShortcuts();

  return (
    <CollaborationProvider>
      {children}
    </CollaborationProvider>
  );
}
