"use client";

import React from "react";
import { TechPackProduct, ArtworkPlacement } from "@/types/tech-pack";
import { useTechPackStore } from "@/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Info, Sparkles, Image as ImageIcon, Upload, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldWrapper } from "../../collaboration/FieldWrapper";
import { supabase } from "@/lib/supabase";
import { useTechPackValidation } from "@/hooks/useTechPackValidation";

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

export default function Step3PrintPlaatsing({ article, collectionId }: { article: TechPackProduct, collectionId: string }) {
  const { updateProduct } = useTechPackStore();
  const { missingFields } = useTechPackValidation(article);

  const getPlacementError = (index: number, field: string) => {
    const pName = article.placements?.[index]?.placement_name || `Print ${index + 1}`;
    return missingFields.find(f => f.step === 3 && f.label.startsWith(pName) && f.field === field);
  };

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
    updateProduct(collectionId, article.id, { placements: newPlacements });
  };

  const updatePlacement = (index: number, updates: Partial<ArtworkPlacement>) => {
    const currentPlacements = [...(article.placements || [])];
    if (currentPlacements[index]) {
      currentPlacements[index] = { ...currentPlacements[index], ...updates };
      updateProduct(collectionId, article.id, { placements: currentPlacements });
    }
  };

  const removePlacement = (index: number) => {
    const currentPlacements = article.placements || [];
    updateProduct(collectionId, article.id, {
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
    
    const { width_cm, height_cm, pos_under_neck_cm, technique } = article.ai_measurement.print;
    
    const currentPlacements = article.placements || [];
    const newPlacements: ArtworkPlacement[] = [
      ...currentPlacements,
      { 
        placement_name: "Chest Center", 
        notes: `${pos_under_neck_cm} cm onder de kraag`, 
        width_cm: width_cm, 
        height_cm: height_cm, 
        technique: technique === "screenprint" ? "Screenprint" : "Brodé",
        print_order_number: currentPlacements.length + 1,
        tolerance_cm: 0.5,
        reference_point: "Halsnaad",
        reference_distance: pos_under_neck_cm,
        technique_subtype: "Zeefdruk",
        application_method: "Handmatig",
        color_ids: []
      }
    ];
    updateProduct(collectionId, article.id, { placements: newPlacements });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight italic uppercase tracking-tighter">Print & Plaatsing</h2>
        <p className="text-slate-500 font-medium">Geef aan waar de bedrukking of borduring moet komen.</p>
        
        {article.ai_measurement && (
           <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-[24px] flex items-center justify-between animate-in slide-in-from-left-4 duration-500">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-6 h-6 text-orange-500" />
                 </div>
                 <div>
                    <h4 className="text-xs font-black text-orange-950 uppercase tracking-widest">AI Analyse Beschikbaar</h4>
                    <p className="text-[11px] text-orange-700 font-bold">Gedetecteerd: {article.ai_measurement.print.width_cm} x {article.ai_measurement.print.height_cm}cm.</p>
                 </div>
              </div>
              <Button 
                onClick={applyAIMeasurement}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl px-8 h-12 font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
              >
                Gebruik AI Maten
              </Button>
           </div>
        )}
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 ml-1">Snelle selectie</Label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {POSITION_PRESETS.map((p) => (
              <Button
                key={p.id}
                variant="outline"
                className="h-20 flex flex-col gap-2 border-slate-100 hover:border-slate-900 hover:bg-slate-50 rounded-[20px] shadow-sm transition-all group"
                onClick={() => addPlacement(p.id)}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{p.icon}</span>
                <span className="text-[9px] font-black uppercase tracking-tight text-slate-400 group-hover:text-slate-900 leading-none">{p.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {(article.placements || []).map((p: any, i: number) => {
            const techError = getPlacementError(i, "technique");
            const dimError = getPlacementError(i, "dimensions");
            const distError = getPlacementError(i, "reference_distance");

            return (
              <div key={i} className={cn(
                "p-10 border rounded-[40px] bg-white shadow-xl space-y-10 relative group animate-in zoom-in-95 duration-300",
                (techError || dimError || distError) ? "border-red-100 ring-2 ring-red-50" : "border-slate-100"
              )}>
                <button 
                  onClick={() => removePlacement(i)}
                  className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 p-2.5 rounded-full"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col gap-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Druk Nr.</Label>
                        <Input 
                          type="number"
                          value={p.print_order_number || (i + 1)}
                          onChange={(e) => updatePlacement(i, { print_order_number: parseInt(e.target.value) || 0 })}
                          className="w-20 h-12 text-center text-xl font-black bg-slate-900 text-[#22c981] rounded-2xl border-none shadow-2xl"
                        />
                    </div>
                    <div>
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plaatsing</Label>
                        <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{p.placement_name}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
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
                          "flex flex-col items-center justify-center w-36 h-24 rounded-[24px] border-2 border-dashed transition-all cursor-pointer overflow-hidden relative shadow-sm",
                          p.artwork_url ? "border-[#22c981]/30 bg-[#22c981]/5" : "border-slate-100 bg-slate-50 hover:border-slate-300"
                        )}
                      >
                        {uploadingIndex === i ? (
                          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        ) : p.artwork_url ? (
                          <>
                            <img src={p.artwork_url} alt="Mockup" className="w-full h-full object-contain p-4 transition-transform group-hover/mockup:scale-105" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/mockup:opacity-100 flex items-center justify-center transition-opacity">
                               <Upload className="w-6 h-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-2 opacity-30 text-slate-600">
                             <ImageIcon className="w-6 h-6" />
                             <span className="text-[9px] font-black uppercase tracking-widest">Mockup</span>
                          </div>
                        )}
                      </label>
                    </div>
                    
                    <div className="bg-[#22c981]/10 px-6 py-4 rounded-[24px] flex flex-col items-end justify-center min-w-[120px] border border-[#22c981]/20">
                       <span className="text-[10px] font-black text-[#0b1912]/40 uppercase tracking-widest">Surface</span>
                       <span className="text-lg font-black text-[#0b1912]">{(p.width_cm * p.height_cm).toFixed(1)} cm²</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-10 border-t border-slate-50">
                  {/* Kolom 1: Maten & Referentie */}
                  <div className="lg:col-span-4 space-y-8">
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                           📐 Dimensions & Tolerance
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          <FieldWrapper articleId={article.id} fieldKey={`placement-${i}-w`} label="W (cm)" error={dimError ? "W!" : undefined}>
                              <Input placeholder="W" type="number" className="h-12" value={p.width_cm || ""} onChange={(e) => updatePlacement(i, { width_cm: parseFloat(e.target.value) || 0 })} />
                          </FieldWrapper>
                          <FieldWrapper articleId={article.id} fieldKey={`placement-${i}-h`} label="H (cm)" error={dimError ? "H!" : undefined}>
                              <Input placeholder="H" type="number" className="h-12" value={p.height_cm || ""} onChange={(e) => updatePlacement(i, { height_cm: parseFloat(e.target.value) || 0 })} />
                          </FieldWrapper>
                          <FieldWrapper articleId={article.id} fieldKey={`placement-${i}-tol`} label="± (cm)">
                              <Input placeholder="0.5" type="number" step="0.1" className="h-12 border-none bg-slate-50" value={p.tolerance_cm ?? ""} onChange={(e) => updatePlacement(i, { tolerance_cm: parseFloat(e.target.value) || 0 })} />
                          </FieldWrapper>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                           📍 Positioning
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <FieldWrapper articleId={article.id} fieldKey={`placement-${i}-dist`} label="Dist (cm)" error={distError ? "Req" : undefined}>
                              <Input type="number" className="h-12" value={p.reference_distance ?? ""} onChange={(e) => updatePlacement(i, { reference_distance: parseFloat(e.target.value) || 0 })} />
                          </FieldWrapper>
                          <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-700">From</label>
                              <select 
                                value={p.reference_point || "Halsnaad"}
                                onChange={(e) => updatePlacement(i, { reference_point: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#22c981]/20 transition-all"
                              >
                                {REFERENCE_POINTS.map(rp => <option key={rp.id} value={rp.id}>{rp.label}</option>)}
                              </select>
                          </div>
                        </div>
                    </div>
                  </div>

                  {/* Kolom 2: Techniek & Methode */}
                  <div className="lg:col-span-4 space-y-8 lg:border-l lg:border-slate-50 lg:pl-10">
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                           ⚡ Technique Specs
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {TECHNIQUES.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => updatePlacement(i, { technique: t.id })}
                              className={cn(
                                "p-3 rounded-2xl border text-[10px] font-black tracking-widest uppercase transition-all shadow-sm",
                                p.technique === t.id 
                                  ? "bg-slate-900 text-[#22c981] border-slate-900 shadow-xl" 
                                  : (techError ? "bg-red-50 text-red-600 border-red-100" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300")
                              )}
                            >
                              {t.label.split(' ')[1] || t.label}
                            </button>
                          ))}
                        </div>

                        {p.technique && TECHNIQUE_SUBTYPES[p.technique] && (
                           <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-1">
                              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sub-Type Selector</Label>
                              <select 
                                value={p.technique_subtype || ""}
                                onChange={(e) => updatePlacement(i, { technique_subtype: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 text-sm font-black uppercase tracking-tight"
                              >
                                 <option value="">Selecteer sub-type...</option>
                                 {TECHNIQUE_SUBTYPES[p.technique].map((ts: any) => (
                                   <option key={ts.id} value={ts.id}>{ts.label}</option>
                                 ))}
                              </select>
                           </div>
                        )}

                        <div className="space-y-2 pt-2">
                          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Application Method</Label>
                          <select 
                            value={p.application_method || ""}
                            onChange={(e) => updatePlacement(i, { application_method: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold"
                          >
                             <option value="">Selecteer methode...</option>
                             {APPLICATION_METHODS.map(am => <option key={am.id} value={am.id}>{am.label}</option>)}
                          </select>
                        </div>
                    </div>
                  </div>

                  {/* Kolom 3: Drukkleuren */}
                  <div className="lg:col-span-4 space-y-6 lg:border-l lg:border-slate-50 lg:pl-10">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                        🎨 Color Selection
                    </h4>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">Assign project colors to this print.</p>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                        {article.colorways && article.colorways.length > 0 ? (
                          article.colorways.map((c, ci) => {
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
                                  "flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-tight transition-all",
                                  isSelected 
                                    ? "bg-slate-900 text-white border-slate-900 shadow-xl scale-105" 
                                    : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                                )}
                              >
                                 <div className="w-3 h-3 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: c.hex_code }} />
                                 {c.name}
                              </button>
                            );
                          })
                        ) : (
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 p-6 rounded-[24px] w-full text-center border border-dashed border-slate-200">
                             ⚠️ NO COLORS IN STEP 4
                          </div>
                        )}
                    </div>

                    <div className="pt-6">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Special Instructions</Label>
                        <Input 
                          placeholder="bv. Extra dikke inktlaag..." 
                          className="h-12 mt-2 font-medium"
                          value={p.notes || ""}
                          onChange={(e) => updatePlacement(i, { notes: e.target.value })}
                        />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {(!article.placements || article.placements.length === 0) && (
            <div className="py-20 border-2 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center justify-center gap-4 text-slate-300 bg-slate-50/20">
               <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <Plus className="w-8 h-8 opacity-20" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em]">No placements added yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
