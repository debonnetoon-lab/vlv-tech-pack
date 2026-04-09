"use client";

import React, { useState } from "react";
import {  useUIStore, useDataStore , useTechPackStore } from "@/store";
import { FileText, Command, ChevronRight, ChevronLeft, Save, Printer, Loader2 } from "lucide-react";
import { TechPackDocument } from "../pdf/TechPackDocument";
import { saveAs } from "file-saver";

export default function PDFPreview() {
  const { collections, activeCollectionId, activeArticleId } = useTechPackStore();
  const [isDownloading, setIsDownloading] = useState(false);

  const activeCollection = collections.find((c: any) => c.id === activeCollectionId);
  const activeArticle = activeCollection?.articles.find((a: any) => a.id === activeArticleId);


  if (!activeArticle) {
    return (
      <div className="flex-1 flex flex-col items-center justify-between p-10 bg-white">
        <div className="w-full flex items-center justify-between border-b pb-4 border-slate-100">
           <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Preview</span>
           <span className="px-2 py-1 bg-slate-50 border rounded-full text-[9px] font-black uppercase text-slate-400">In afwachting</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
           {/* Punt 4: Sketch Placeholder */}
           <div className="w-40 h-[220px] rounded-3xl border-2 border-dashed border-slate-200 p-4 flex flex-col gap-4 opacity-40 hover:opacity-60 transition-opacity">
              <div className="h-6 w-3/4 bg-slate-100 rounded-lg" />
              <div className="flex-1 bg-slate-100 rounded-2xl flex items-center justify-center">
                 <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <div className="space-y-2">
                 <div className="h-2 w-full bg-slate-100 rounded-full" />
                 <div className="h-2 w-2/3 bg-slate-100 rounded-full" />
              </div>
              <div className="h-6 w-1/2 bg-emerald-50 rounded-lg self-center" />
           </div>
           
           <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
              Selecteer of maak een artikel<br />aan om de preview te zien.
           </p>
        </div>

        {/* Punt 8: Keyboard shortcuts footer */}
        <div className="w-full space-y-3 pt-6 border-t border-slate-50">
           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-4">Sneltoetsen</span>
           
           <div className="space-y-2.5">
              <Shortcut item="Volgende stap" keys={["⌘", "→"]} />
              <Shortcut item="Vorige stap" keys={["⌘", "←"]} />
              <Shortcut item="Opslaan" keys={["⌘", "S"]} />
              <Shortcut item="PDF exporteren" keys={["⌘", "P"]} />
           </div>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!activeArticle) return;
    setIsDownloading(true);
    await new Promise(resolve => setTimeout(resolve, 50));
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(<TechPackDocument article={activeArticle} collectionName={activeCollection?.name || "VLV"} />).toBlob();
      
      const sanitizeFileName = (name: string) => name.replace(/[^a-z0-9]/gi, '_').toUpperCase();
      const fileName = `${sanitizeFileName(activeArticle.reference_code || "VLV-ARTICLE")}.pdf`;

      // Reliable Download combining File System Access API and file-saver
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
          return;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error("SaveFilePicker fallback needed:", err);
      }
      
      saveAs(blob, fileName);
    } catch (err) {
      console.error(err);
      alert("Er is iets misgegaan bij het genereren van de PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-800">
      <div className="p-4 bg-slate-900 border-b border-white/5 flex items-center justify-between">
         <span className="text-white text-[11px] font-bold tracking-widest uppercase">Live PDF Preview</span>
         <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-3 py-1.5 bg-[#22c981] text-[#0b1912] rounded-lg text-[10px] font-black uppercase hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
         >
            {isDownloading && <Loader2 className="w-3 h-3 animate-spin" />}
            {isDownloading ? "Wachten..." : "Download PDF"}
         </button>
      </div>
      
      <div className="flex-1 overflow-auto bg-slate-200 p-8 custom-scrollbar">
         {/* Smart Preview representing the Tech Pack state */}
         <div className="w-full max-w-[595px] aspect-[1/1.414] bg-white shadow-2xl mx-auto rounded-sm p-12 space-y-8">
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div className="text-2xl font-black italic tracking-tighter uppercase">TECH PACK</div>
              <div className="text-right">
                <div className="text-xs font-bold uppercase">{activeArticle.product_name || "Naamloos Product"}</div>
                <div className="text-[10px] text-slate-400">{activeArticle.reference_code || "CODE-TBA"}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 h-32 bg-slate-50 border-2 border-dashed border-slate-100 rounded-2xl p-2 overflow-hidden">
               {['front', 'back', 'artwork', 'design'].map((view) => {
                  const img = activeArticle.images?.find((img: any) => img.view === view);
                  if (!img && view === 'design') return null; // Skip redundant design check if artwork handled
                  
                  // Deduplicate artwork/design visually
                  if (view === 'artwork' && !img) {
                     const designImg = activeArticle.images?.find((i: any) => i.view === 'design');
                     if (designImg) return null;
                  }

                  return (
                    <div key={view} className="relative bg-white border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden h-full">
                       {img?.public_url ? (
                         <img src={img.public_url} alt={view} className="w-full h-full object-contain p-2" />
                       ) : (
                         <span className="text-slate-300 text-[8px] font-black uppercase tracking-widest">{view}</span>
                       )}
                    </div>
                  );
               }).slice(0, 3)}
            </div>

            
            <div className="space-y-6">
               <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                     <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Garment</p>
                     <p className="text-[9px] font-bold truncate">{activeArticle.garment_type || "-"}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Gender/Fit</p>
                     <p className="text-[9px] font-bold truncate">{activeArticle.gender || "-"} / {activeArticle.fit || "-"}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Fabric</p>
                     <p className="text-[9px] font-bold truncate">{activeArticle.fabric_main || "-"}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-8 py-4 border-y border-slate-50">
                  <div className="space-y-3">
                     <div className="space-y-1">
                        <p className="text-[7px] font-black text-slate-400 uppercase">Labels & Packaging</p>
                        <p className="text-[9px] text-slate-600 leading-tight">
                           {activeArticle.label_type ? `${activeArticle.label_type} op ${activeArticle.label_position || 'nek'}` : "Geen labels"}
                        </p>
                        <p className="text-[9px] text-slate-600 italic">
                           {activeArticle.packaging_notes || "Standaard verpakking"}
                        </p>
                     </div>
                  </div>
                  <div className="space-y-3">
                     <div className="grid grid-cols-1 gap-2">
                        <div className="space-y-0.5 border-b border-slate-50 pb-2">
                           <p className="text-[7px] font-black text-slate-400 uppercase">Kleuren</p>
                           <p className="text-[9px] font-bold">
                             {activeArticle.colors?.length ? activeArticle.colors.map((c: any) => c.color_name).join(", ") : "Geen kleuren"}
                           </p>
                        </div>
                        <div className="space-y-0.5">
                           <p className="text-[7px] font-black text-slate-400 uppercase">Prints & Posities ({activeArticle.placements?.length || 0})</p>
                           <ViewPlacements placements={activeArticle.placements || []} />
                        </div>
                     </div>
                  </div>
               </div>

               {activeArticle.disclaimer_enabled !== false && (
                  <div className="pt-2">
                     <p className="text-[6px] font-black text-slate-300 uppercase mb-1">Productie Disclaimer</p>
                     <p className="text-[7px] text-slate-400 leading-tight border-l-2 border-slate-100 pl-2">
                        {activeArticle.disclaimer_text || "Standaard disclaimer actief..."}
                     </p>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

function ViewPlacements({ placements }: { placements: any[] }) {
  if (!placements || placements.length === 0) return <p className="text-[9px] text-slate-400">Nog geen prints toegevoegd.</p>;
  return (
    <div className="flex flex-col gap-1">
      {placements.map((p, i) => (
        <div key={i} className="text-[8px] flex items-center gap-2">
          <span className="w-3 h-3 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold">{i + 1}</span>
          <span className="font-bold">{p.placement_name}</span>
          <span className="text-slate-400">({p.technique || "Print"})</span>
        </div>
      ))}
    </div>
  );
}

function Shortcut({ item, keys }: { item: string; keys: string[] }) {
  return (
    <div className="flex items-center justify-between">
       <span className="text-[11px] font-bold text-slate-400">{item}</span>
       <div className="flex gap-1">
          {keys.map((k, i) => (
            <kbd key={i} className="min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-500 shadow-sm">
              {k}
            </kbd>
          ))}
       </div>
    </div>
  );
}
