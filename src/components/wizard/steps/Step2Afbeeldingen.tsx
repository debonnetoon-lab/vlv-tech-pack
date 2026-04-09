/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { TechPackArticle, ArticleImage } from "@/types/tech-pack";
import {  useDataStore , useTechPackStore } from "@/store";
import { Label } from "@/components/ui/label";
import { ImageIcon, Plus, Trash2, FileText, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import SmartImage from "@/components/ui/SmartImage";
import { Button } from "@/components/ui/button";
import AIPrintOverlay from "@/components/ui/AIPrintOverlay";
import { supabase } from "@/lib/supabase";

const DROPZONES: { id: ArticleImage['view']; title: string; desc: string }[] = [
  { id: "front", title: "Voorkant", desc: "Mockup voorkant" },
  { id: "back", title: "Achterkant", desc: "Mockup achterkant" },
  { id: "artwork", title: "Artwork", desc: "Logo / Print file" },
];

export default function Step2Afbeeldingen({ article, collectionId }: { article: TechPackArticle, collectionId: string }) {
  const { updateArticle, uploadArticleImage } = useTechPackStore();
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
  const [dragOverZone, setDragOverZone] = React.useState<string | null>(null);
  const [localPreviews, setLocalPreviews] = React.useState<Record<string, string>>({});


  const handleAIAnalyze = async (image: ArticleImage) => {
    if (!image.public_url) return;
    setIsAnalyzing(true);
    try {
      // For AI analysis, we use the public URL
      const response = await fetch("/api/measure-print", {
        method: "POST",
        body: JSON.stringify({
          image_url: image.public_url,
          garment_sku: "STANLEY_STELLA_L",
          flat_width_cm: 54.0,
          garment_type: article.garment_type || "jersey",
        }),
      });
      const data = await response.json();
      if (data.print) {
        updateArticle(collectionId, article.id, {
          ai_measurement: data
        });
      }
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent, view: ArticleImage["view"]) => {
    let file: File | undefined;
    if ('target' in e && (e.target as HTMLInputElement).files) {
      file = (e.target as HTMLInputElement).files?.[0];
    } else if ('dataTransfer' in e) {
      file = e.dataTransfer.files?.[0];
    }

    if (!file) return;

    // Check file size (max 20MB) to prevent "stuck" uploads
    if (file.size > 20 * 1024 * 1024) {
      alert("Bestand is te groot. Maximum bestandsgrootte is 20MB voor previews. Voor grotere AI bestanden kun je deze beter via WeTransfer of mail bezorgen.");
      return;
    }

    // Instant preview mechanism
    const objectUrl = URL.createObjectURL(file);
    setLocalPreviews(prev => ({ ...prev, [view]: objectUrl }));

    setIsUploading(view);
    try {
      const publicUrl = await uploadArticleImage(article.id, file, view);
      if (publicUrl) {
        await useDataStore.getState().fetchCollections();
      }
    } catch (err: any) {
      console.error("Upload failed:", err);
      // Remove local preview on failure
      setLocalPreviews(prev => {
         const updated = { ...prev };
         delete updated[view];
         return updated;
      });
      alert("Er is iets misgegaan bij het uploaden: " + (err.message || "Onbekende fout."));
    } finally {
      setIsUploading(null);
      setDragOverZone(null);
    }
  };

  const removeImage = async (imageId: string) => {
    setIsDeleting(imageId);
    try {
      const { error } = await supabase.from('article_images').delete().eq('id', imageId);
      if (error) {
         console.error("Delete failed:", error);
         alert("De afbeelding kon niet worden verwijderd. Mogelijks een database restrictie.");
      } else {
         await useDataStore.getState().fetchCollections();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-900">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Voeg afbeeldingen toe</h2>
        <p className="text-slate-500">Sleep bestanden naar de juiste zone of klik om te bladeren.</p>
        <p className="text-[10px] text-orange-500 font-bold bg-orange-50 p-2 rounded-xl border border-orange-100">
           LET OP: Upload hier de uiteindelijke preview als PNG of JPG voor de PDF generatie. Het ruwe .AI ontwerpbestand voeg je apart bij in de mail naar de fabrikant.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {DROPZONES.map((zone) => {
          const image = article.images?.find(img => img.view === zone.id);
          const localPreview = localPreviews[zone.id];
          const hasImage = image || localPreview;

          return (
            <div key={zone.id} className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{zone.title}</Label>
              {hasImage ? (
                <div className={cn(
                  "relative aspect-[16/6] rounded-2xl overflow-hidden border bg-white group shadow-sm transition-all",
                  isUploading === zone.id ? "opacity-70 border-indigo-200" : "border-slate-200 hover:shadow-md"
                )}>
                   {isUploading === zone.id && (
                     <div className="absolute inset-x-0 top-0 h-1 bg-slate-100 overflow-hidden z-20">
                       <div className="h-full bg-indigo-500 w-1/2 rounded-r-full animate-[progress_1.5s_ease-in-out_infinite]" />
                     </div>
                   )}
                   <SmartImage src={localPreview || image?.public_url} alt={zone.title} className={cn(
                      "w-full h-full object-contain p-4",
                      isUploading === zone.id ? "grayscale-[0.5] blur-[2px]" : ""
                   )} />
                   {zone.id === "front" && article.ai_measurement && !isUploading && (
                      <AIPrintOverlay measurement={article.ai_measurement} />
                   )}
                   <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                     <button 
                        type="button"
                        disabled={(isDeleting === image?.id) || (isUploading === zone.id)}
                        onClick={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           if (image?.id) removeImage(image.id);
                        }}
                        className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
                      >
                       {isDeleting === image?.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                     </button>
                   </div>
                   <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold shadow-sm">
                        {isUploading === zone.id ? "Uploaden & Synchroniseren..." : (image?.file_name || "Lokaal Bestand")}
                      </span>
                      {zone.id === "front" && !article.ai_measurement && !isUploading && (
                         <Button
                            onClick={(e) => {
                               e.stopPropagation();
                               if (image) handleAIAnalyze(image);
                            }}
                            disabled={isAnalyzing || !image}
                            className="pointer-events-auto bg-slate-900 text-white rounded-full px-4 h-8 text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 border border-white/20 hover:scale-105 active:scale-95 transition-all"
                         >
                            {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-orange-400" />}
                            {isAnalyzing ? "Analyseren..." : "Meet met AI"}
                         </Button>
                      )}
                      {zone.id === "front" && article.ai_measurement && !isUploading && (
                         <div className="pointer-events-auto bg-green-500 text-white rounded-full px-4 h-8 text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 border border-white/20">
                            <Sparkles className="w-3 h-3" />
                            AI Analyse Klaar
                         </div>
                      )}
                   </div>
                </div>
              ) : (
                <div 
                  className="relative group"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverZone(zone.id);
                  }}
                  onDragLeave={() => setDragOverZone(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFileUpload(e as any, zone.id as any);
                  }}
                >
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => handleFileUpload(e, zone.id as any)}
                    accept="image/*,.ai,.pdf"
                  />
                  <div 
                    className={cn(
                      "aspect-[16/6] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer",
                      dragOverZone === zone.id 
                        ? "border-[#22c981] bg-[#22c981]/5 scale-[1.02] shadow-lg shadow-[#22c981]/10" 
                        : "border-slate-200 hover:border-slate-900 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full border flex items-center justify-center transition-all shadow-sm",
                      dragOverZone === zone.id 
                        ? "bg-[#22c981] border-[#22c981] scale-110" 
                        : "bg-slate-50 border-slate-100 group-hover:scale-110"
                    )}>
                      {isUploading === zone.id ? (
                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      ) : (
                        <Plus className={cn(
                          "w-5 h-5 transition-colors",
                          dragOverZone === zone.id ? "text-white" : "text-slate-400 group-hover:text-slate-900"
                        )} />
                      )}
                    </div>
                    <div className="text-center">
                      <p className={cn(
                        "text-sm font-bold transition-colors",
                        dragOverZone === zone.id ? "text-[#0b1912]" : "text-slate-700"
                      )}>
                        {isUploading === zone.id ? "Uploading..." : (dragOverZone === zone.id ? "Drop om te uploaden" : zone.desc)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium tracking-tight">PNG, JPG of AI</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
