"use client";

import React from "react";
import { TechPackArticle, ArtworkPlacement } from "@/types/tech-pack";
import {  useDataStore , useTechPackStore } from "@/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Info, Sparkles, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldWrapper } from "../../collaboration/FieldWrapper";
import { supabase } from "@/lib/supabase";

const POSITION_PRESETS = [
  { id: "Chest Center", label: "Borst Centraal", icon: "⏹" },
  { id: "Chest Left (Heart)", label: "Borst Links (Hart)", icon: "❤️" },
  { id: "Back", label: "Rug", icon: "▅" },
  { id: "Sleeve", label: "Mouw", icon: "▎" },
  { id: "Pants Top", label: "Bovenkant broek", icon: "👖" },
  { id: "Pants Bottom", label: "Onderkant broek", icon: "👟" },
];

const TECHNIQUES = [
  { id: "Screenprint", label: "🎨 Bedrukken" },
  { id: "Brodé", label: "🧵 Borduren" },
  { id: "Patch/Applicatie", label: "🏷️ Patch" },
  { id: "Easy Puff", label: "☁️ Easy Puff" },
];

const TECHNIQUE_SUBTYPES: Record<string, { id: string, label: string }[]> = {
  "Screenprint": [
    { id: "Zeefdruk", label: "Zeefdruk" },
    { id: "DTF Transfer", label: "DTF Transfer" },
    { id: "Full Colour Transfer", label: "Full Colour Transfer" },
    { id: "Flex", label: "Flex" },
    { id: "Sublimatie", label: "Sublimatie" },
  ],
  "Brodé": [
    { id: "Flat Embroidery", label: "Flat Embroidery" },
    { id: "3D Puff Embroidery", label: "3D Puff Embroidery" },
    { id: "Chenille", label: "Chenille" },
  ],
  "Patch/Applicatie": [
    { id: "Geweven patch", label: "Geweven patch" },
    { id: "Leren patch", label: "Leren patch" },
    { id: "Pvc patch", label: "PVC patch" },
  ],
  "Easy Puff": [
    { id: "Easy Puff Standard", label: "Easy Puff Standard" },
    { id: "Siliconen Puff", label: "Siliconen Puff" },
  ]
};

const APPLICATION_METHODS = [
  { id: "Hittepers", label: "🔥 Hittepers" },
  { id: "Carrousel", label: "Carousel" },
  { id: "Borduuroptiek", label: "Borduurmachine" },
  { id: "Handmatig", label: "✋ Handmatig" },
];

const REFERENCE_POINTS = [
  { id: "Halsnaad", label: "Halsnaad" },
  { id: "Zijnaad", label: "Zijnaad" },
  { id: "Schoudernaad", label: "Schoudernaad" },
  { id: "Andere", label: "Andere" },
];

export default function Step3PrintPlaatsing({ article, collectionId }: { article: TechPackArticle, collectionId: string }) {
  const { updateArticle } = useTechPackStore();

  const addPlacement = (position: string) => {
    const currentPlacements = article.placements || [];
    const newPlacements: ArtworkPlacement[] = [
      ...currentPlacements,
      { 
        placement_name: position, 
        notes: "", 
        width_cm: 0, 
        height_cm: 0, 
        technique: "Screenprint",
        print_order_number: currentPlacements.length + 1,
        tolerance_cm: 0.5,
        reference_point: "Halsnaad",
        reference_distance: 0,
        technique_subtype: "Full Colour Transfer",
        application_method: "Hittepers",
        color_ids: []
      }
    ];
    updateArticle(collectionId, article.id, { placements: newPlacements });
  };

  const updatePlacement = (index: number, updates: Partial<ArtworkPlacement>) => {
    const currentPlacements = [...(article.placements || [])];
    if (currentPlacements[index]) {
      currentPlacements[index] = { ...currentPlacements[index], ...updates };
      updateArticle(collectionId, article.id, { placements: currentPlacements });
    }
  };

  const removePlacement = (index: number) => {
    const currentPlacements = article.placements || [];
    updateArticle(collectionId, article.id, {
      placements: currentPlacements.filter((_, i) => i !== index)
    });
  };

  const [uploadingIndex, setUploadingIndex] = React.useState<number | null>(null);

  const handlePlacementArtworkUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${article.id}/placement_${index}_${Date.now()}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('tech-pack-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tech-pack-assets')
        .getPublicUrl(data.path);

      updatePlacement(index, { artwork_url: publicUrl });
    } catch (err) {
      console.error("Placement artwork upload failed:", err);
      alert("Fout bij uploaden artwork mockup.");
    } finally {
      setUploadingIndex(null);
    }
  };

  const applyAIMeasurement = () => {
    if (!article.ai_measurement) return;
    
    const { width_cm, height_cm, pos_under_neck_cm, technique } = article.ai_measurement;
    
    const currentPlacements = article.placements || [];
    const newPlacements: ArtworkPlacement[] = [
      ...currentPlacements,
      { 
        placement_name: "Chest Center", 
        notes: `${pos_under_neck_cm} cm onder de kraag`, 
        width_cm: width_cm, 
        height_cm: height_cm, 
        technique: technique === "screenprint" ? "Screenprint" : "Brodé"
      }
    ];
    updateArticle(collectionId, article.id, { placements: newPlacements });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Print & Plaatsing</h2>
        <p className="text-slate-500">Geef aan waar de bedrukking of borduring moet komen.</p>
        
        {article.ai_measurement && (
           <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-3xl flex items-center justify-between animate-in slide-in-from-left-4 duration-500">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                 </div>
                 <div>
                    <h4 className="text-sm font-black text-orange-950 uppercase tracking-tight">AI Analyse Beschikbaar</h4>
                    <p className="text-[11px] text-orange-700 font-medium">De print is gedetecteerd op {article.ai_measurement.width_cm} x {article.ai_measurement.height_cm}cm.</p>
                 </div>
              </div>
              <Button 
                onClick={applyAIMeasurement}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 font-bold shadow-lg shadow-orange-500/20"
              >
                Gebruik AI Maten
              </Button>
           </div>
        )}
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Snelle selectie</Label>
          <div className="grid grid-cols-4 gap-4">
            {POSITION_PRESETS.map((p) => (
              <Button
                key={p.id}
                variant="outline"
                className="h-16 flex flex-col gap-1 border-slate-200 hover:border-slate-900 hover:bg-slate-50 rounded-xl"
                onClick={() => addPlacement(p.id)}
              >
                <span className="text-lg">{p.icon}</span>
                <span className="text-[10px] font-bold uppercase">{p.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {(article.placements || []).map((p: any, i: number) => (
            <div key={i} className="p-8 border border-slate-200 rounded-[2rem] bg-white shadow-xl space-y-8 relative group animate-in zoom-in-95 duration-300">
              <button 
                onClick={() => removePlacement(i)}
                className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 p-2 rounded-full"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                   <div className="flex flex-col gap-1">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Druk Nr.</Label>
                      <Input 
                        type="number"
                        value={p.print_order_number || (i + 1)}
                        onChange={(e) => updatePlacement(i, { print_order_number: parseInt(e.target.value) || 0 })}
                        className="w-16 h-10 text-center font-black bg-slate-900 text-white rounded-xl"
                      />
                   </div>
                   <div>
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plaatsing</Label>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{p.placement_name}</h3>
                   </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Artwork / Mockup Field */}
                  <div className="relative group/mockup">
                    <input 
                      type="file" 
                      id={`placement-artwork-${i}`}
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handlePlacementArtworkUpload(i, e)}
                    />
                    <label 
                      htmlFor={`placement-artwork-${i}`}
                      className={cn(
                        "flex flex-col items-center justify-center w-32 h-20 rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden relative",
                        p.artwork_url ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-slate-50 hover:border-slate-400"
                      )}
                    >
                      {uploadingIndex === i ? (
                        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                      ) : p.artwork_url ? (
                        <>
                          <img src={p.artwork_url} alt="Mockup" className="w-full h-full object-contain p-2" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/mockup:opacity-100 flex items-center justify-center transition-opacity">
                             <Upload className="w-5 h-5 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1 opacity-40">
                           <ImageIcon className="w-5 h-5" />
                           <span className="text-[8px] font-black uppercase">Mockup</span>
                        </div>
                      )}
                    </label>
                  </div>
                  
                  <div className="bg-emerald-50 px-4 py-3 rounded-2xl flex flex-col items-end justify-center min-w-[100px]">
                     <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Oppervlakte</span>
                     <span className="text-sm font-black text-emerald-900">{(p.width_cm * p.height_cm).toFixed(1)} cm²</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-slate-50">
                {/* Kolom 1: Maten & Referentie */}
                <div className="lg:col-span-4 space-y-6">
                   <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                         📏 Maten & Tolerantie
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                         <FieldWrapper articleId={article.id} fieldKey={`placement-${i}-w`} label="B (cm)">
                            <Input placeholder="B" type="number" value={p.width_cm || ""} onChange={(e) => updatePlacement(i, { width_cm: parseFloat(e.target.value) || 0 })} />
                         </FieldWrapper>
                         <FieldWrapper articleId={article.id} fieldKey={`placement-${i}-h`} label="H (cm)">
                            <Input placeholder="H" type="number" value={p.height_cm || ""} onChange={(e) => updatePlacement(i, { height_cm: parseFloat(e.target.value) || 0 })} />
                         </FieldWrapper>
                         <FieldWrapper articleId={article.id} fieldKey={`placement-${i}-tol`} label="± (cm)">
                            <Input placeholder="0.5" type="number" step="0.1" value={p.tolerance_cm ?? ""} onChange={(e) => updatePlacement(i, { tolerance_cm: parseFloat(e.target.value) || 0 })} />
                         </FieldWrapper>
                      </div>
                   </div>

                   <div className="space-y-4 pt-2">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                         📍 Referentiepunt
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase pr-1">Afstand (cm)</Label>
                            <Input type="number" value={p.reference_distance ?? ""} onChange={(e) => updatePlacement(i, { reference_distance: parseFloat(e.target.value) || 0 })} />
                         </div>
                         <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase pr-1">Vanaf</Label>
                            <select 
                              value={p.reference_point || "Halsnaad"}
                              onChange={(e) => updatePlacement(i, { reference_point: e.target.value })}
                              className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                            >
                               {REFERENCE_POINTS.map(rp => <option key={rp.id} value={rp.id}>{rp.label}</option>)}
                            </select>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Kolom 2: Techniek & Methode */}
                <div className="lg:col-span-4 space-y-6 border-l border-slate-50 pl-8">
                   <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                         ⚡ Techniek Details
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {TECHNIQUES.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => updatePlacement(i, { technique: t.id })}
                            className={cn(
                              "p-2 rounded-xl border text-[10px] font-black tracking-tight transition-all",
                              p.technique === t.id 
                                ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                            )}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      {p.technique && TECHNIQUE_SUBTYPES[p.technique] && (
                         <div className="space-y-1.5 pt-2 animate-in fade-in slide-in-from-top-1">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase">Sub-Type</Label>
                            <select 
                              value={p.technique_subtype || ""}
                              onChange={(e) => updatePlacement(i, { technique_subtype: e.target.value })}
                              className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm font-bold"
                            >
                               <option value="">Selecteer sub-type...</option>
                               {TECHNIQUE_SUBTYPES[p.technique].map((ts: any) => (
                                 <option key={ts.id} value={ts.id}>{ts.label}</option>
                               ))}
                            </select>
                         </div>
                      )}

                      <div className="space-y-1.5 pt-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Applicatie Methode</Label>
                        <select 
                          value={p.application_method || ""}
                          onChange={(e) => updatePlacement(i, { application_method: e.target.value })}
                          className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                        >
                           <option value="">Selecteer methode...</option>
                           {APPLICATION_METHODS.map(am => <option key={am.id} value={am.id}>{am.label}</option>)}
                        </select>
                      </div>
                   </div>
                </div>

                {/* Kolom 3: Drukkleuren */}
                <div className="lg:col-span-4 space-y-4 border-l border-slate-50 pl-8">
                   <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      🎨 Drukkleuren
                   </h4>
                   <p className="text-[10px] text-slate-500 font-medium">Selecteer welke kleuren uit je projectpalet gebruikt worden voor deze druk.</p>
                   
                   <div className="flex flex-wrap gap-2 pt-2">
                      {article.colors && article.colors.length > 0 ? (
                        article.colors.map((c, ci) => {
                          const isSelected = (p.color_ids || []).includes(c.id || ci.toString());
                          return (
                            <button
                              key={ci}
                              onClick={() => {
                                const currentIds = p.color_ids || [];
                                const id = c.id || ci.toString();
                                const newIds = isSelected 
                                  ? currentIds.filter((cid: string) => cid !== id)
                                  : [...currentIds, id];
                                updatePlacement(i, { color_ids: newIds });
                              }}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-bold transition-all",
                                isSelected 
                                  ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900 ring-offset-2" 
                                  : "bg-white text-slate-600 border-slate-100 hover:border-slate-300"
                              )}
                            >
                               <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c.hex_value }} />
                               {c.color_name}
                            </button>
                          );
                        })
                      ) : (
                        <div className="text-[10px] text-slate-400 italic bg-slate-50 p-3 rounded-xl w-full text-center">
                           ⚠️ Voeg eerst kleuren toe in stap 4
                        </div>
                      )}
                   </div>

                   <div className="pt-4">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase">Extra Instructies</Label>
                      <Input 
                        placeholder="bv. Extra dikke inktlaag..." 
                        value={p.notes || ""}
                        onChange={(e) => updatePlacement(i, { notes: e.target.value })}
                        className="mt-1"
                      />
                   </div>
                </div>
              </div>
            </div>
          ))}

          {(!article.placements || article.placements.length === 0) && (
            <div className="py-12 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-50/30">
               <Info className="w-6 h-6 opacity-30" />
               <p className="text-sm font-medium">Nog geen plaatsingen toegevoegd</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
