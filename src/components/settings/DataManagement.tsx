/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useRef, useState } from "react";
import {  useUIStore, useDataStore, useCollaborationStore , useTechPackStore } from "@/store";
import { assetStorage } from "@/store/useDataStore";
import { Download, Upload, Trash2, AlertTriangle, CheckCircle2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { BulkTechPackDocument } from "../pdf/TechPackDocument";
import { resolveCollectionAssets } from "@/lib/pdf-utils";
import UserManagement from "./UserManagement";

export default function DataManagement() {
  const { collections, activeCollectionId, activeArticleId, profile } = useTechPackStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const activeCollection = collections.find((c: any) => c.id === activeCollectionId);

  const handleBulkPDFExport = async () => {
    if (!activeCollection) return;
    setIsGenerating(true);
    try {
      // 1. Resolve all assets for all articles in the collection
      const resolvedArticles = await resolveCollectionAssets(activeCollection.articles);
      
      // 2. Generate the PDF blob
      const blob = await pdf(
        <BulkTechPackDocument 
          articles={resolvedArticles} 
          collectionName={activeCollection.name} 
        />
      ).toBlob();
      
      // 3. Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `VLV-Collection-${activeCollection.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Bulk PDF Export Error:", err);
      alert("Er is een fout opgetreden bij het genereren van de PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    // Collect all asset IDs from all articles across all collections
    const assetIds: string[] = [];
    for (const col of collections) {
      for (const art of col.articles) {
        // Check images
        for (const img of art.images || []) {
          if (img.public_url?.startsWith('asset:')) {
            assetIds.push(img.public_url.split(':')[1]);
          }
        }
        // Check artwork placements
        for (const p of art.placements || []) {
          if (p.artwork_url?.startsWith('asset:')) {
            assetIds.push(p.artwork_url.split(':')[1]);
          }
        }
      }
    }

    // Fetch all asset data from IndexedDB
    const assets: Record<string, string> = {};
    await Promise.all(
      assetIds.map(async (id) => {
        const data = await assetStorage.get(id);
        if (data) assets[id] = data;
      })
    );

    const exportData = {
      collections,
      activeCollectionId,
      activeArticleId,
      assets,
      exportedAt: new Date().toISOString(),
      version: "2.0"
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vlv-techpack-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus('idle');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.collections) throw new Error('Geen geldige VLV backup');

        // Restore assets to IndexedDB first (v2.0 backups include assets)
        if (json.assets && typeof json.assets === 'object') {
          await Promise.all(
            Object.entries(json.assets).map(([id, data]) =>
              assetStorage.set(id, data as string)
            )
          );
        }

        // Restore collections state
        useDataStore.setState({ collections: json.collections });
        useUIStore.setState({
          activeCollectionId: json.activeCollectionId || null,
          activeArticleId: json.activeArticleId || null
        });

        setImportStatus('success');
        setTimeout(() => setImportStatus('idle'), 4000);
      } catch (err) {
        console.error('Import error:', err);
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 4000);
      } finally {
        setIsImporting(false);
        // Reset file input so same file can be re-imported
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 space-y-8 bg-white rounded-3xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          Gegevensbeheer
        </h2>
        <p className="text-xs text-slate-400 font-medium">Beheer je collecties en maak back-ups van je werk.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Card */}
        <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Download className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-800">Download Back-up</h3>
              <p className="text-[10px] text-slate-500 mt-1">Sla je volledige collectie op als een bestand op je computer. Doe dit regelmatig!</p>
            </div>
          </div>
          <Button 
            onClick={handleExport}
            className="w-full bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm h-10 text-xs font-bold gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            Systeemkopie Downloaden (incl. afbeeldingen)
          </Button>
        </div>

        {/* Import Card */}
        <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Upload className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-800">Herstel Back-up</h3>
              <p className="text-[10px] text-slate-500 mt-1">Upload een eerder gedownloade back-up om je gegevens te herstellen.</p>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".json" 
            className="hidden" 
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className={`w-full shadow-sm h-10 text-xs font-bold gap-2 transition-all ${
              importStatus === 'success'
                ? 'bg-green-500 text-white border-green-500'
                : importStatus === 'error'
                ? 'bg-red-100 text-red-700 border-red-200'
                : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isImporting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {importStatus === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
            {importStatus === 'error' && <AlertTriangle className="w-3.5 h-3.5" />}
            {isImporting
              ? 'Importeren...'
              : importStatus === 'success'
              ? 'Succesvol geïmporteerd!'
              : importStatus === 'error'
              ? 'Fout bij importeren'
              : 'Bestand Selecteren'}
          </Button>
        </div>

        {/* Bulk PDF Export Card */}
        {activeCollection && (
          <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/30 space-y-4 md:col-span-2">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Bulk PDF Export</h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  Download de volledige collectie <strong>"{activeCollection.name}"</strong> ({activeCollection.articles.length} producten) als één gecombineerd document.
                </p>
              </div>
            </div>
            <Button 
              onClick={handleBulkPDFExport}
              disabled={isGenerating || activeCollection.articles.length === 0}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-md h-10 text-xs font-bold gap-2 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  PDF WORDT GEGENEREERD...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Download Volledige Collectie (PDF)
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-3">
        <div className="shrink-0 pt-0.5">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
        </div>
        <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
          <strong>Tip voor veiligheid:</strong> Jouw gegevens worden automatisch opgeslagen in deze browser. 
          Het downloaden van een back-up is een extra zekerheid voor als je van computer wisselt of je browser-geschiedenis wist.
        </p>
      </div>

      {/* Admin Section */}
      {profile?.email === 'toon@vivelevelo.be' && (
        <div className="pt-8 border-t border-slate-100">
          <UserManagement />
        </div>
      )}

      <div className="pt-4 border-t border-slate-100">
         <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <h4 className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Gevaarlijke Zone</h4>
            </div>
            <p className="text-[10px] text-red-600/80 leading-relaxed font-medium">
              Het verwijderen van alle gegevens is definitief. Zorg dat je een back-up hebt.
            </p>
            <Button 
              variant="ghost"
              className="text-red-600 hover:bg-red-100 hover:text-red-700 h-8 text-[10px] font-bold w-fit"
              onClick={() => {
                if(confirm("Weet je zeker dat je ALLE collections wilt verwijderen? Dit kan niet ongedaan worden gemaakt.")) {
                  useDataStore.setState({ collections: [] });
                  useUIStore.setState({ activeCollectionId: null, activeArticleId: null });
                }
              }}
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Reset Alle Gegevens
            </Button>
         </div>
      </div>
    </div>
  );
}
