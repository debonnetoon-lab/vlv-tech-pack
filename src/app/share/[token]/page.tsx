"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  FileText, 
  Download, 
  ShieldCheck, 
  Clock, 
  Package, 
  Palette, 
  Ruler,
  Maximize2,
  ChevronRight,
  Loader2,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { TechPackDocument } from "@/components/pdf/TechPackDocument";

export default function SharePage() {
  const { token } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShare() {
      try {
        const res = await fetch(`/api/share/${token}`);
        if (!res.ok) throw new Error("Link niet langer geldig of verwijderd.");
        const json = await res.ok ? await res.json() : null;
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchShare();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-[#22c981] animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Secure Link...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
           <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">Toegang Geweigerd</h1>
        <p className="text-slate-400 font-medium max-w-sm">{error || "Deze link is niet langer beschikbaar."}</p>
        <a href="/" className="mt-8 text-[10px] font-black uppercase tracking-widest text-[#22c981] hover:underline">Ga naar VLV Portal</a>
      </div>
    );
  }

  const { product, organization } = data;

  return (
    <div className="min-h-screen bg-[#FDFDFD] selection:bg-[#22c981]/20">
      {/* HEADER */}
      <header className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 flex items-center px-10 justify-between">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Shared via</h1>
            <p className="font-black italic text-slate-900 uppercase tracking-tighter">{organization?.name}</p>
          </div>
          <div className="h-4 w-px bg-slate-100" />
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-[#22c981] rounded-full">
            <ShieldCheck className="w-3 h-3" />
            <span className="text-[9px] font-black uppercase tracking-widest">Geverifieerd Tech Pack</span>
          </div>
        </div>

        <PDFDownloadLink
          document={<TechPackDocument article={product} organization={organization} collectionName="Public Share" />}
          fileName={`TP_GLOBAL_${product.article_code || 'WIP'}.pdf`}
        >
          {({ loading: pdfLoading }) => (
            <button 
              disabled={pdfLoading}
              className="h-12 px-6 bg-[#0b1912] text-[#22c981] rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#22c981]/10"
            >
              {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {pdfLoading ? "Voorbereiden..." : "Download PDF"}
            </button>
          )}
        </PDFDownloadLink>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto pt-32 pb-40 px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* LEFT COLUMN: VISUALS */}
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-4">
              <h1 className="text-6xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">{product.name}</h1>
              <p className="text-2xl font-black text-slate-300 uppercase tracking-widest">{product.article_code || "REFERENCE PENDING"}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
               {(product.images || []).length > 0 ? (product.images || []).map((img: any, i: number) => (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   key={i} 
                   className="aspect-[4/5] bg-white rounded-[32px] border border-slate-100 p-8 flex items-center justify-center relative group"
                 >
                    <img src={img.public_url} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" alt="Visual" />
                    <span className="absolute top-6 left-6 text-[8px] font-black uppercase tracking-widest text-slate-300">{img.view}</span>
                 </motion.div>
               )) : (
                 <div className="col-span-2 aspect-video bg-slate-50 rounded-[32px] border border-slate-100 border-dashed flex flex-col items-center justify-center gap-4 text-slate-200">
                    <Package className="w-12 h-12 pb-2" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Geen visuals beschikbaar</p>
                 </div>
               )}
            </div>
          </div>

          {/* RIGHT COLUMN: SPECS */}
          <div className="lg:col-span-5 space-y-10">
            
            {/* COMPONENT CARDS */}
            <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
               <h3 className="text-xl font-black italic tracking-tighter uppercase text-slate-900 border-b border-slate-100 pb-4">Key Specifications</h3>
               
               <div className="space-y-6">
                  <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                        <Palette className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Colorways</p>
                        <div className="flex flex-wrap gap-2">
                           {(product.colorways || []).map((c: any, i: number) => (
                             <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex_code }} />
                                <span className="text-[9px] font-bold text-slate-600 truncate">{c.pantone_code || c.name}</span>
                             </div>
                           ))}
                           {(product.colorways || []).length === 0 && <span className="text-[10px] text-slate-300 italic">Geen kleuren gespecificeerd</span>}
                        </div>
                     </div>
                  </div>

                  <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Materials</p>
                        <p className="text-xs font-bold text-slate-700">
                          {(product.materials || []).map((m: any) => m.name).join(', ') || "Nog te bepalen"}
                        </p>
                     </div>
                  </div>

                  <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                        <Ruler className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Sizes</p>
                        <div className="flex gap-2">
                           {["XS", "S", "M", "L", "XL"].map(s => (
                             <span key={s} className="text-[10px] font-black text-slate-400">{s}</span>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* ACTION CARD */}
            <div className="p-8 bg-[#0b1912] rounded-[40px] text-white relative overflow-hidden group">
               <Download className="absolute -right-8 -bottom-8 w-40 h-40 text-white opacity-[0.03] group-hover:scale-110 transition-transform duration-1000" />
               <h4 className="text-xl font-black italic tracking-tighter uppercase mb-2">Productie-klaar?</h4>
               <p className="text-xs text-white/50 font-medium leading-relaxed mb-8">Download de volledige PDF voor alle technische details, BOM en constructie-instructies.</p>
               
               <PDFDownloadLink
                document={<TechPackDocument article={product} organization={organization} collectionName="Public Share" />}
                fileName={`TP_GLOBAL_${product.article_code || 'WIP'}.pdf`}
               >
                {({ loading: pdfLoading }) => (
                  <button className="w-full py-4 bg-[#22c981] text-[#0b1912] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                    {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#0b1912]" /> : <FileText className="w-4 h-4" />}
                    Download Volledig Pack
                  </button>
                )}
               </PDFDownloadLink>
            </div>

            {/* INFO */}
            <div className="px-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px]">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic leading-none">Status: Active Link</p>
               </div>
               <p className="text-[8px] text-slate-300 font-bold uppercase mt-2">Gegenereerd op {new Date(data.metadata.created_at).toLocaleDateString()}</p>
            </div>

          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-10 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
          <p>© {new Date().getFullYear()} {organization?.name}</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            <a href="#" className="flex items-center gap-2 hover:text-slate-900 transition-colors">
               Powered by VLV <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
