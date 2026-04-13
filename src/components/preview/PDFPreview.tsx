"use client";

import React, { useState, useEffect } from "react";
import { useTechPackStore } from "@/store";
import { Loader2 } from "lucide-react";
import { TechPackDocument } from "../pdf/TechPackDocument";
import { saveAs } from "file-saver";
import { pdf } from "@react-pdf/renderer";
import { PDFErrorBoundary } from "../pdf/PDFErrorBoundary";

export default function PDFPreview() {
  const { collections, activeCollectionId, activeArticleId } = useTechPackStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const activeCollection = (collections || []).find((c: any) => c.id === activeCollectionId);
  const activeArticle = (activeCollection?.products || []).find((a: any) => a.id === activeArticleId);

  useEffect(() => {
    let active = true;
    const generatePreview = async () => {
      if (!activeArticle) return;
      try {
        const doc = <TechPackDocument article={activeArticle} collectionName={activeCollection?.name || "VLV"} />;
        const asPdf = pdf(doc);
        const blob = await asPdf.toBlob();
        if (active) {
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        }
      } catch (err) {
        console.error("Fout bij genereren PDF preview:", err);
      }
    };
    
    generatePreview();
    
    return () => {
      active = false;
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [activeArticle, activeCollection]);

  if (!activeArticle) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-100">
         <p className="text-xs font-bold text-slate-400 uppercase">Selecteer een artikel voor de PDF preview</p>
      </div>
    );
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await pdf(<TechPackDocument article={activeArticle} collectionName={activeCollection?.name || "VLV"} />).toBlob();
      const sanitizeFileName = (name: string) => name.replace(/[^a-z0-9]/gi, '_').toUpperCase();
      const fileName = `${sanitizeFileName(activeArticle.article_code || "VLV-ARTICLE")}.pdf`;
      saveAs(blob, fileName);
    } catch (err) {
      console.error(err);
      alert("Er is iets misgegaan bij het downloaden van de PDF. Bekijk de console.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <PDFErrorBoundary>
      <div className="flex-1 flex flex-col h-full bg-slate-800">
        <div className="p-4 bg-slate-900 border-b border-white/5 flex items-center justify-between">
           <span className="text-white text-[11px] font-bold tracking-widest uppercase">Live PDF Preview</span>
           <button 
              onClick={handleDownload}
              disabled={isDownloading || !pdfUrl}
              className="px-3 py-1.5 bg-[#22c981] text-[#0b1912] rounded-lg text-[10px] font-black uppercase hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
           >
              {isDownloading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Download PDF
           </button>
        </div>
        
        <div className="flex-1 overflow-hidden bg-slate-500 relative">
          {pdfUrl ? (
            <iframe 
              src={`${pdfUrl}#view=FitH`} 
              className="w-full h-full border-none"
              title="PDF Voorvertoning"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-white/50">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">Gereedmaken...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </PDFErrorBoundary>
  );
}
