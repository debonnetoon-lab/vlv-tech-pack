/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React from "react";
import { TechPackArticle, Collection } from "@/types/tech-pack";
import { Button } from "@/components/ui/button";
import { Download, Share2, Printer, CheckCircle2, Loader2, Save, FileText } from "lucide-react";
import { TechPackDocument } from "../../pdf/TechPackDocument";
import { CollectionDocument } from "../../pdf/CollectionDocument";
import {  useDataStore, useCollaborationStore , useTechPackStore } from "@/store";
import { saveAs } from "file-saver";

function PdfDownloadButtons({
  resolvedArticle,
  resolvedCollection,
  activeCollectionName,
  articleFileName,
  collectionFileName,
}: {
  resolvedArticle: TechPackArticle;
  resolvedCollection: unknown;
  activeCollectionName: string;
  articleFileName: string;
  collectionFileName: string;
}) {
  const [articleLoading, setArticleLoading] = React.useState(false);
  const [collectionLoading, setCollectionLoading] = React.useState(false);

  // Industry-standard reliable download combining File System Access API and file-saver
  const reliableDownload = async (blob: Blob, fileName: string) => {
    try {
      if ('showSaveFilePicker' in window) {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'PDF Document',
            accept: { 'application/pdf': ['.pdf'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return; // Success
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return; // User cancelled
      console.error("SaveFilePicker fallback needed:", err);
    }
    // Fallback if API not supported or failed
    saveAs(blob, fileName);
  };

  const handleDownloadArticle = async () => {
    setArticleLoading(true);
    await new Promise(resolve => setTimeout(resolve, 50)); // UI update tick
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(<TechPackDocument article={resolvedArticle} collectionName={activeCollectionName} />).toBlob();
      
      await reliableDownload(blob, articleFileName);
    } catch (err) {
      console.error("Fout bij genereren artikel PDF:", err);
      alert("Er is een fout opgetreden bij het genereren van de PDF.");
    } finally {
      setArticleLoading(false);
    }
  };

  const handleDownloadCollection = async () => {
    setCollectionLoading(true);
    await new Promise(resolve => setTimeout(resolve, 50));
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(<CollectionDocument collection={resolvedCollection as Collection} />).toBlob();
      
      await reliableDownload(blob, collectionFileName);
    } catch (err) {
      console.error("Fout bij genereren collectie PDF:", err);
      alert("Er is een fout opgetreden bij het genereren van de collectie PDF.");
    } finally {
      setCollectionLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={handleDownloadArticle}
        disabled={articleLoading}
        className={`w-full h-16 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-3 transition-transform ${
          articleLoading 
            ? "bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none" 
            : "bg-white text-slate-900 hover:bg-slate-100 hover:scale-[1.02]"
        }`}
      >
        {articleLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            PDF Maken (even geduld)...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Download Enkele Fiche
          </>
        )}
      </Button>

      <div className="pt-2">
        <div 
          onClick={collectionLoading ? undefined : handleDownloadCollection}
          className={`p-6 border border-slate-100 rounded-3xl flex items-center justify-between transition-colors ${
            collectionLoading 
              ? "bg-slate-50 opacity-50 cursor-wait" 
              : "bg-slate-50 hover:bg-slate-100 cursor-pointer group"
          }`}
        >
          <div className="flex items-center gap-4">
            {collectionLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <span className="text-xl">📦</span>
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-slate-900">
                {collectionLoading ? "Collectie wordt gegenereerd..." : "Volledige Collectie PDF"}
              </p>
              <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                {collectionLoading ? "Dit kan even duren..." : `Download alle fiches in ${activeCollectionName}`}
              </p>
            </div>
          </div>
          {!collectionLoading && (
             <Button variant="ghost" className="text-xs font-bold text-slate-500 hover:text-slate-900 px-4 py-2 pointer-events-none">
                KLIK OM TE DOWNLOADEN
             </Button>
          )}
        </div>
      </div>
    </>
  );
}

export default function Step7Export({ article, collectionId }: { article: TechPackArticle, collectionId: string }) {
  const { collections, duplicateArticle, setActiveStep } = useTechPackStore();
  const profile = useTechPackStore(state => state.profile);
  const activeCollection = collections.find((c: any) => c.id === collectionId);
  const [isDuplicating, setIsDuplicating] = React.useState(false);

  if (!activeCollection) return null;

  const canExportPDF = profile?.role !== 'input';

  const sanitizeFileName = (name: string) => name.replace(/[^a-z0-9]/gi, '_').toUpperCase();

  const articleFileName = `${sanitizeFileName(article.reference_code || "VLV-ARTICLE")}.pdf`;
  const collectionFileName = `COLLECTIE_${sanitizeFileName(activeCollection.name)}.pdf`;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-900">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Klaar voor Export</h2>
        <p className="text-slate-500">Gefeliciteerd! Je technische fiche is klaar om verstuurd te worden.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="p-10 border-2 border-slate-900 rounded-[2.5rem] bg-slate-900 text-white flex flex-col items-center text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Alles staat klaar</h3>
            <p className="text-slate-400 text-sm max-w-[300px]">Download de PDF en stuur deze rechtstreeks naar je leverancier.</p>
          </div>

          <div className="w-full grid grid-cols-1 gap-3 pt-4">
            {canExportPDF ? (
              <PdfDownloadButtons
                resolvedArticle={article}
                resolvedCollection={activeCollection}
                activeCollectionName={activeCollection.name}
                articleFileName={articleFileName}
                collectionFileName={collectionFileName}
              />
            ) : (
              <div className="p-8 bg-white/5 border border-white/10 rounded-3xl text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto text-white/40">
                  <FileText className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-white uppercase tracking-tight">Geen Export Rechten</p>
                <p className="text-[10px] text-white/40 leading-relaxed max-w-[200px] mx-auto">
                  Jouw account heeft enkel 'Input' rechten. Neem contact op met Toon om PDF's te genereren.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-14 rounded-2xl border-white/20 text-white hover:bg-white/10 flex items-center justify-center gap-2">
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button variant="outline" className="h-14 rounded-2xl border-white/20 text-white hover:bg-white/10 flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                Delen
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <Button
            disabled={isDuplicating}
            onClick={async () => {
               setIsDuplicating(true);
               await duplicateArticle(collectionId, article.id);
               setActiveStep(1);
               setIsDuplicating(false);
            }}
            className="w-full h-20 rounded-[2rem] bg-indigo-50 border-2 border-indigo-200 text-indigo-900 hover:bg-indigo-100 font-extrabold text-xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] shadow-xl shadow-indigo-500/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-xl">
              {isDuplicating ? <Loader2 className="w-5 h-5 animate-spin" /> : "➕"}
            </div>
            <div>
              <p className="text-left font-extrabold uppercase">Start Volgende Product</p>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest leading-none">Behoudt kleuren, labels & placements</p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
