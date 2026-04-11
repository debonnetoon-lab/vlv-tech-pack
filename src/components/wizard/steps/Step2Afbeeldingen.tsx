"use client";

import React from "react";
import { TechPackProduct, ProductImage } from "@/types/tech-pack";
import { useDataStore, useTechPackStore } from "@/store";
import { Label } from "@/components/ui/label";
import { ImageIcon, Plus, Trash2, FileText, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import SmartImage from "@/components/ui/SmartImage";
import { Button } from "@/components/ui/button";
import AIPrintOverlay from "@/components/ui/AIPrintOverlay";
import { supabase } from "@/lib/supabase";
import { useTechPackValidation } from "@/hooks/useTechPackValidation";

const DROPZONES: { id: ProductImage['view']; title: string; desc: string }[] = [
  { id: "front", title: "Voorkant", desc: "Mockup voorkant" },
  { id: "back", title: "Achterkant", desc: "Mockup achterkant" },
  { id: "artwork", title: "Artwork", desc: "Logo / Print file" },
];

export default function Step2Afbeeldingen({ article, collectionId }: { article: TechPackProduct, collectionId: string }) {
  const { updateProduct, uploadProductImage, userRole } = useTechPackStore();
  const isViewer = userRole === 'viewer';
  const { missingFields } = useTechPackValidation(article);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
  const [dragOverZone, setDragOverZone] = React.useState<string | null>(null);
  const [localPreviews, setLocalPreviews] = React.useState<Record<string, string>>({});

  const getError = (field: string) => {
    return missingFields.find(f => f.step === 2 && f.field === field);
  };

  const handleAIAnalyze = async (image: ProductImage) => {
    if (isViewer || !image.public_url) return;
    setIsAnalyzing(true);
    try {
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
        updateProduct(collectionId, article.id, {
          ai_measurement: data
        });
      }
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent, view: ProductImage["view"]) => {
    if (isViewer) return;
    let file: File | undefined;
    if ('target' in e && (e.target as HTMLInputElement).files) {
      file = (e.target as HTMLInputElement).files?.[0];
    } else if ('dataTransfer' in e) {
      file = e.dataTransfer.files?.[0];
    }

    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert("Bestand is te groot. Maximum bestandsgrootte is 20MB voor previews. Voor grotere AI bestanden kun je deze beter via WeTransfer of mail bezorgen.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreviews(prev => ({ ...prev, [view]: objectUrl }));

    setIsUploading(view);
    try {
      const publicUrl = await uploadProductImage(article.id, file, view);
      if (publicUrl) {
        await useDataStore.getState().fetchCollections();
      }
    } catch (err: any) {
      console.error("Upload failed:", err);
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
    if (isViewer) return;
    setIsDeleting(imageId);
    try {
      const { error } = await supabase.from('product_files').delete().eq('id', imageId);
      if (error) {
         console.error("Delete failed:", error);
         alert("De afbeelding kon niet worden verwijderd.");
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
        <h2 className="text-3xl font-extrabold tracking-tight italic uppercase tracking-tighter">Voeg afbeeldingen toe</h2>
        <p className="text-slate-500 font-medium">Sleep bestanden naar de juiste zone of klik om te bladeren.</p>
        <div className="text-[10px] text-orange-600 font-black uppercase tracking-widest bg-orange-50 p-4 rounded-[20px] border border-orange-200 flex items-center gap-3">
           <AlertCircle className="w-5 h-5 text-orange-500" />
           LET OP: Upload hier de uiteindelijke preview als PNG of JPG voor de PDF generatie. Het ruwe .AI ontwerpbestand voeg je apart bij in de mail naar de fabrikant.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {DROPZONES.map((zone) => {
          const image = article.images?.find(img => img.view === zone.id);
          const localPreview = localPreviews[zone.id];
          const hasImage = image || localPreview;
          const isError = zone.id === 'front' && getError("images");

          return (
            <div key={zone.id} className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <Label className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-colors",
                  isError ? "text-red-500" : "text-slate-400"
                )}>
                  {zone.title} {zone.id === 'front' && "*"}
                </Label>
                {isError && (
                  <span className="text-[10px] font-black uppercase text-red-500 animate-pulse">Minimaal één voorkant vereist</span>
                )}
              </div>
              
              {hasImage ? (
                <div className={cn(
                  "relative aspect-[16/6] rounded-[32px] overflow-hidden border bg-white group shadow-sm transition-all",
                  isUploading === zone.id ? "opacity-70 border-indigo-200" : "border-slate-100 hover:shadow-xl hover:border-slate-200"
                )}>
                   {isUploading === zone.id && (
                     <div className="absolute inset-x-0 top-0 h-1 bg-slate-100 overflow-hidden z-20">
                       <div className="h-full bg-indigo-500 w-1/2 rounded-r-full animate-[progress_1.5s_ease-in-out_infinite]" />
                     </div>
                   )}
                   <SmartImage src={localPreview || image?.public_url} alt={zone.title} className={cn(
                      "w-full h-full object-contain p-8",
                      isUploading === zone.id ? "grayscale-[0.5] blur-[2px]" : ""
                   )} />
                   {zone.id === "front" && article.ai_measurement && !isUploading && (
                      <AIPrintOverlay measurement={article.ai_measurement} />
                   )}
                   {!isViewer && (
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button 
                         type="button"
                         disabled={(isDeleting === image?.id) || (isUploading === zone.id)}
                         onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (image?.id) removeImage(image.id);
                         }}
                         className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-2xl disabled:opacity-50 hover:scale-110 active:scale-95"
                       >
                        {isDeleting === image?.id ? <Loader2 className="w-6 h-6 animate-spin" /> : <Trash2 className="w-6 h-6" />}
                      </button>
                    </div>
                   )}
                   <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none z-10">
                      <span className="px-4 py-2 bg-white/95 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-slate-100">
                        {isUploading === zone.id ? "Synchroniseren..." : (image?.file_name || "Lokaal Bestand")}
                      </span>
                      {zone.id === "front" && !article.ai_measurement && !isUploading && (
                         <Button
                            onClick={(e) => {
                               e.stopPropagation();
                               if (image) handleAIAnalyze(image);
                            }}
                            disabled={isAnalyzing || !image}
                            className="pointer-events-auto bg-[#0b1912] text-white rounded-full px-5 h-10 text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2 border border-white/10 hover:scale-[1.02] active:scale-95 transition-all"
                         >
                            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#22c981]" />}
                            {isAnalyzing ? "Analyseren..." : "Meet met AI"}
                         </Button>
                      )}
                   </div>
                </div>
              ) : (
                <div 
                  className="relative group h-full"
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
                    disabled={isViewer}
                    className={cn(
                      "absolute inset-0 w-full h-full opacity-0 z-10",
                      isViewer ? "cursor-not-allowed" : "cursor-pointer"
                    )}
                    onChange={(e) => handleFileUpload(e, zone.id as any)}
                    accept="image/*,.ai,.pdf"
                  />
                  <div 
                    className={cn(
                      "aspect-[16/6] border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all cursor-pointer",
                      dragOverZone === zone.id 
                        ? "border-[#22c981] bg-[#22c981]/5 scale-[1.01] shadow-2xl shadow-[#22c981]/10" 
                        : (isError ? "border-red-300 bg-red-50/20" : "border-slate-100 hover:border-slate-900 hover:bg-slate-50")
                    )}
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-full border flex items-center justify-center transition-all shadow-sm",
                      dragOverZone === zone.id 
                        ? "bg-[#22c981] border-[#22c981] scale-110" 
                        : (isError ? "bg-red-50 border-red-100" : "bg-white border-slate-100 group-hover:scale-110")
                    )}>
                      {isUploading === zone.id ? (
                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                      ) : (
                        <Plus className={cn(
                          "w-6 h-6 transition-colors",
                          dragOverZone === zone.id ? "text-white" : (isError ? "text-red-400" : "text-slate-300 group-hover:text-slate-900")
                        )} />
                      )}
                    </div>
                    <div className="text-center">
                      <p className={cn(
                        "text-sm font-black italic uppercase tracking-tight transition-colors",
                        dragOverZone === zone.id ? "text-[#0b1912]" : (isError ? "text-red-600" : "text-slate-900")
                      )}>
                        {isUploading === zone.id ? "Uploading..." : (dragOverZone === zone.id ? "Drop om te uploaden" : zone.desc)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">PNG, JPG of AI</p>
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
