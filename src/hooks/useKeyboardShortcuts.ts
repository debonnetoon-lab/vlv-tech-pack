"use client";

import { useEffect } from "react";
import {  useUIStore , useTechPackStore } from "@/store";

export function useKeyboardShortcuts() {
  const { 
    activeStep, 
    setActiveStep, 
    activeArticleId 
  } = useTechPackStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Meta (Mac ⌘) or Control (Win/Linux)
      const isCmd = e.metaKey || e.ctrlKey;

      if (!isCmd) return;

      // ⌘1-8: Switch steps directly
      if (e.key >= '1' && e.key <= '8') {
        e.preventDefault();
        setActiveStep(parseInt(e.key));
      }

      // ⌘→: Next step
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (activeStep < 8) setActiveStep(activeStep + 1);
      }

      // ⌘←: Previous step
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (activeStep > 1) setActiveStep(activeStep - 1);
      }

      // ⌘S: Save (Visual feedback only as saving is auto)
      if (e.key === 's') {
        e.preventDefault();
        console.log("Manual save triggered (already auto-saving)");
        // We could trigger a sync here if needed
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStep, setActiveStep, activeArticleId]);
}
