/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useFieldLock } from "@/hooks/useFieldLock";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FieldWrapperProps {
  articleId: string;
  fieldKey: string;
  label?: string;
  children: React.ReactElement;
  className?: string;
  error?: string; // New prop for validation errors
}

export function FieldWrapper({ articleId, fieldKey, label, children, className, error }: FieldWrapperProps) {
  const { isLocked, lockedBy, acquireLock, releaseLock } = useFieldLock(articleId, fieldKey);

  const handleFocus = () => {
    acquireLock();
  };

  const handleBlur = () => {
    releaseLock();
  };

  return (
    <div className={`relative ${className || ""}`}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <label className={cn(
            "text-sm font-medium transition-colors",
            error ? "text-red-500" : "text-gray-700"
          )}>
            {label}
          </label>
          <AnimatePresence>
            {isLocked && (
              <motion.div
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                className="flex items-center text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"
              >
                <Lock size={10} className="mr-1" />
                <span>{lockedBy} is editing</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      
      <div 
        onFocusCapture={handleFocus}
        onBlurCapture={handleBlur}
        className="relative"
      >
        {React.cloneElement(children as React.ReactElement<any>, {
          disabled: isLocked || (children.props as any).disabled,
          className: cn(
            (children.props as any).className || "",
            isLocked ? "bg-gray-50 cursor-not-allowed opacity-75 ring-amber-200" : "",
            error ? "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50/30" : ""
          )
        })}
        
        {isLocked && (
          <div className="absolute inset-0 z-10 cursor-not-allowed" title={`${lockedBy} is editing`} />
        )}
      </div>

      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
