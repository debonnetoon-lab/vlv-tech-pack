"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PDFErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("PDF Rendering Crash:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-red-100 animate-in fade-in duration-500">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 mb-2">PDF Generator Vastgelopen</h3>
          <p className="text-xs text-slate-400 font-medium max-w-[240px] leading-relaxed mb-8">
            Er is een technisch probleem bij het opbouwen van de preview. Dit komt meestal door een corrupt afbeeldingsbestand.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-[200px]">
            <Button 
               onClick={() => this.setState({ hasError: false, error: null })}
               className="bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-[10px] h-12 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Probeer Opnieuw
            </Button>
            <p className="text-[10px] text-red-400 font-bold uppercase">Error: {this.state.error?.message.substring(0, 50)}...</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
