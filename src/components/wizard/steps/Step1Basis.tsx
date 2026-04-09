"use client";

import React from "react";
import { TechPackArticle, GarmentType } from "@/types/tech-pack";
import {  useDataStore , useTechPackStore } from "@/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FieldWrapper } from "../../collaboration/FieldWrapper";

const TEMPLATES: { id: GarmentType; name: string; icon: string }[] = [
  { id: "jersey", name: "Jersey", icon: "👕" },
  { id: "jacket", name: "Jacket", icon: "🧥" },
  { id: "vest", name: "Body / Vest", icon: "🦺" },
  { id: "bib_shorts", name: "Bib Shorts", icon: "🩳" },
  { id: "socks", name: "Sokken", icon: "🧦" },
  { id: "cap", name: "Koerspet", icon: "🧢" },
  { id: "other", name: "Overig", icon: "📦" },
];

export default function Step1Basis({ article, collectionId }: { article: TechPackArticle, collectionId: string }) {
  const { updateArticle } = useTechPackStore();

  const handleChange = (field: string, value: unknown) => {
    updateArticle(collectionId, article.id, { [field]: value });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Wat maak je?</h2>
        <p className="text-slate-500">Begin met de basisgegevens van het product.</p>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6">
          <FieldWrapper 
            articleId={article.id} 
            fieldKey="product_name" 
            label="Productnaam"
          >
            <Input 
              id="product_name"
              className="h-12 text-lg font-medium border-slate-200 focus:border-slate-900 transition-all shadow-sm"
              placeholder="bv. VIVE LE VELO T-shirt"
              value={article.product_name || ""}
              onChange={(e) => handleChange("product_name", e.target.value)}
            />
          </FieldWrapper>

          <div className="grid grid-cols-2 gap-6">
            <FieldWrapper 
              articleId={article.id} 
              fieldKey="reference_code" 
              label="Artikelcode"
            >
              <Input 
                id="reference_code"
                className="h-12 text-lg font-mono font-medium border-slate-200 focus:border-slate-900 transition-all shadow-sm"
                placeholder="bv. VLV-25-001"
                value={article.reference_code || ""}
                onChange={(e) => handleChange("reference_code", e.target.value)}
              />
            </FieldWrapper>

            <FieldWrapper 
              articleId={article.id} 
              fieldKey="customer_po" 
              label="Klant PO Nummer"
            >
              <Input 
                id="customer_po"
                className="h-12 text-lg font-mono font-medium border-slate-200 focus:border-slate-900 transition-all shadow-sm"
                placeholder="bv. 2026/65713"
                value={article.customer_po || ""}
                onChange={(e) => handleChange("customer_po", e.target.value)}
              />
            </FieldWrapper>
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Basis kledingstuk (Template)</Label>
          <div className="grid grid-cols-4 gap-4">
            {TEMPLATES.map((t) => (
              <Card 
                key={t.id}
                onClick={() => handleChange("garment_type", t.id)}
                className={cn(
                  "p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all border-2",
                  article.garment_type === t.id 
                    ? "border-slate-900 bg-slate-50 shadow-md transform scale-101" 
                    : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <span className="text-3xl">{t.icon}</span>
                <span className="text-xs font-bold">{t.name}</span>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <FieldWrapper articleId={article.id} fieldKey="fabric_main" label="Hoofdmateriaal">
            <Input 
              id="fabric_main"
              placeholder="bv. 100% Katoen"
              value={article.fabric_main || ""}
              onChange={(e) => handleChange("fabric_main", e.target.value)}
            />
          </FieldWrapper>
          <FieldWrapper articleId={article.id} fieldKey="fabric_secondary" label="Secundair materiaal">
            <Input 
              id="fabric_secondary"
              placeholder="bv. Mesh panels"
              value={article.fabric_secondary || ""}
              onChange={(e) => handleChange("fabric_secondary", e.target.value)}
            />
          </FieldWrapper>
          <FieldWrapper articleId={article.id} fieldKey="weight_gsm" label="Gewicht (GSM)">
            <Input 
              id="weight_gsm"
              type="number"
              placeholder="bv. 180"
              value={article.weight_gsm || ""}
              onChange={(e) => handleChange("weight_gsm", parseInt(e.target.value) || 0)}
            />
          </FieldWrapper>
        </div>
      </div>
    </div>
  );
}
