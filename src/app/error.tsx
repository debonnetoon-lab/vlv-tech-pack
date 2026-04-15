"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Caught by src/app/error.tsx:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-red-50 p-6 flex-col">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
      <h2 className="text-2xl font-black text-red-900 uppercase tracking-widest mb-2">
        Applicatie Crash
      </h2>
      <p className="text-red-700 font-medium mb-8 text-center max-w-lg">
        {error.message || "Er is een onverwachte fout opgetreden in de applicatie."}
      </p>
      
      <div className="bg-white p-6 rounded-2xl border border-red-200 overflow-auto max-w-4xl w-full text-xs font-mono text-slate-800 shadow-xl mb-8">
        <strong>Error Stack:</strong>
        <pre className="mt-2 text-red-600 whitespace-pre-wrap">{error.stack}</pre>
      </div>

      <button
        onClick={() => reset()}
        className="px-8 py-4 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-red-700 transition"
      >
        Probeer Opnieuw
      </button>
    </div>
  );
}
