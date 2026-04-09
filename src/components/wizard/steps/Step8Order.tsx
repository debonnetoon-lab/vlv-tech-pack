/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { TechPackArticle, SizeMeasurement } from "@/types/tech-pack";
import { useDataStore } from "@/store"
import { ClipboardList, Calculator, Info, CheckCircle2 } from "lucide-react";

const SIZE_GAMMAS = {
  "Unisex": ["3XS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
  "Dames": ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"],
  "Kids": ["3-4j", "5-6j", "7-8j", "9-11j", "12-14j"],
  "Baby": ["0/6m", "6/12m", "12/18m", "18/24m", "2/3j"]
};

interface Props {
  article: TechPackArticle;
  collectionId: string;
}

export default function Step8Order({ article, collectionId }: Props) {
  const updateArticle = useDataStore((state) => state.updateArticle);
  
  const currentCategory = (article.gender as string) || "Unisex";

  const handleCategoryChange = (category: string) => {
    // When category changes, we should probably clear or adjust sizes
    // For now, we'll just update the gender/category
    updateArticle(collectionId, article.id, {
      gender: category.toLowerCase() as any,
      sizes: [] // Clear sizes when category changes to trigger fresh start
    });
  };

  const handleQuantityChange = (sizeLabel: string, value: string) => {
    const num = parseInt(value) || 0;
    const existingSizes = article.sizes || [];
    let newSizes: SizeMeasurement[];

    if (existingSizes.some(s => s.size_label === sizeLabel)) {
      newSizes = existingSizes.map(s => 
        s.size_label === sizeLabel ? { ...s, order_quantity: num } : s
      );
    } else {
      newSizes = [...existingSizes, { size_label: sizeLabel, order_quantity: num }];
    }

    updateArticle(collectionId, article.id, { sizes: newSizes });
  };

  const totalQuantity = (article.sizes || []).reduce((acc, s) => acc + (s.order_quantity || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 text-slate-900">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm text-slate-900">
        <div className="flex items-start gap-5 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <ClipboardList className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight">
              Maten & Aantallen
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-1 uppercase tracking-wider">
              Stanley & Stella Bestelgamma
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {Object.keys(SIZE_GAMMAS).map((cat) => {
            const isActive = currentCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-6 py-4 rounded-2xl text-xs font-bold leading-none transition-all duration-300 uppercase ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]"
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {(SIZE_GAMMAS[currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1).toLowerCase() as keyof typeof SIZE_GAMMAS] || SIZE_GAMMAS["Unisex"]).map((size) => (
            <div key={size} className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                {size}
              </label>
              <input
                type="number"
                min="0"
                value={article.sizes?.find(s => s.size_label === size)?.order_quantity || ""}
                onChange={(e) => handleQuantityChange(size, e.target.value)}
                placeholder="0"
                className="w-full px-4 py-4 rounded-xl border-2 border-slate-50 bg-slate-50 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
              />
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-slate-900 rounded-[2rem] flex items-center justify-between shadow-2xl shadow-indigo-100/20">
          <div className="flex items-center gap-4 text-white">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Totaal Aantal</div>
              <div className="text-2xl font-black">{totalQuantity} stuks</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-indigo-400 font-bold uppercase text-[10px] tracking-widest bg-indigo-500/10 px-4 py-2 rounded-full">
            <Info className="w-3.5 h-3.5" />
            Auto-berekening
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-5 bg-indigo-50 border border-indigo-100 rounded-3xl">
        <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
        <p className="text-xs text-indigo-900/70 font-medium leading-relaxed uppercase tracking-wide">
           Deze maten zijn gebaseerd op het officiële Stanley & Stella gamma. 
           <span className="text-indigo-900 font-black ml-1 uppercase">Categorie: {currentCategory}</span>
        </p>
      </div>
    </div>
  );
}
