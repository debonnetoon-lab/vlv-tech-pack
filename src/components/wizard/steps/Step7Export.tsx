"use client";

import React from "react";
import { useTechPackStore, useUIStore } from "@/store";
import { 
  Download, 
  Share2, 
  Check, 
  FileText, 
  Globe,
  Loader2,
  ShieldCheck,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { TechPackDocument } from "@/components/pdf/TechPackDocument";
import { motion, AnimatePresence } from "framer-motion";
import { useTechPackValidation } from "@/hooks/useTechPackValidation";

export default function Step7Export({ article, collectionId }: { article: any, collectionId: string }) {
  const { createShare, logExport, organization, collections } = useTechPackStore();
  const { setActiveStep } = useUIStore();
  const [shareToken, setShareToken] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const { isValid, missingFields } = useTechPackValidation(article);
  const activeCollection = (collections || []).find((c: any) => c.id === collectionId);

  const handleCreateShare = async () => {
    setIsGenerating(true);
    const token = await createShare(article.id);
    setShareToken(token);
    setIsGenerating(false);
  };

  const copyToClipboard = () => {
    if (!shareToken) return;
    const url = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">Klaar voor Productie</h2>
        <p className="text-slate-400 font-medium">Exporteer je tech pack of deel het direct met je leverancier.</p>
      </div>

      {!isValid && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-[32px] p-8 space-y-4"
        >
          <div className="flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-6 h-6" />
            <h3 className="text-lg font-black uppercase italic tracking-tight">Onvolledige Gegevens</h3>
          </div>
          <p className="text-sm text-amber-700/80 font-medium">
            Je kunt dit Tech Pack nog niet exporteren. De volgende velden ontbreken of zijn ongeldig:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {missingFields.map((f, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(f.step)}
                className="flex items-center justify-between p-4 bg-white/50 hover:bg-white rounded-2xl border border-amber-100 transition-all text-left group"
              >
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Stap {f.step}</p>
                  <p className="text-xs font-bold text-slate-900">{f.label}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* PDF EXPORT CARD */}
        <div className={cn(
          "bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm transition-all group flex flex-col justify-between overflow-hidden relative",
          isValid ? "hover:shadow-xl" : "opacity-60 grayscale-[0.5]"
        )}>
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#22c981] flex items-center justify-center mb-8">
               <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black italic tracking-tighter text-slate-900 uppercase mb-4">Industriële PDF</h3>
            <p className="text-sm font-medium text-slate-400 leading-relaxed mb-10">
              Gereed voor Alfa Shirt productie. Bevat BOM, maattabellen, artwork specs en alle technische details.
            </p>
          </div>

          <div className="relative z-10">
            {isValid ? (
              <PDFDownloadLink
                document={<TechPackDocument article={article} organization={organization} collectionName={activeCollection?.name} />}
                fileName={`TP_${article.article_code || 'WIP'}_${article.name.replace(/\s+/g, '_')}.pdf`}
                onClick={() => logExport(article.id, 'pdf')}
              >
                {({ loading }) => (
                  <button 
                    disabled={loading}
                    className="w-full h-14 bg-[#0b1912] text-[#22c981] rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-[#22c981]/10"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                    {loading ? "Genereren..." : "Download Tech Pack"}
                  </button>
                )}
              </PDFDownloadLink>
            ) : (
                <button 
                  disabled
                  className="w-full h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest cursor-not-allowed"
                >
                  <AlertCircle className="w-5 h-5" />
                  Bevestig gegevens eerst
                </button>
            )}
          </div>
        </div>

        {/* PUBLIC SHARE CARD */}
        <div className="bg-slate-900 rounded-[40px] p-10 shadow-2xl flex flex-col justify-between overflow-hidden relative group">
          <Globe className="absolute -right-12 -top-12 w-64 h-64 text-white opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-white/10 text-[#22c981] flex items-center justify-center mb-8">
               <Share2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase mb-4">Live Sharing</h3>
            <p className="text-sm font-medium text-white/40 leading-relaxed mb-10">
              Deel een beveiligde, read-only versie van dit Tech Pack. De ontvanger hoeft geen account aan te maken.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <AnimatePresence mode="wait">
              {!shareToken ? (
                <motion.button 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleCreateShare}
                  disabled={isGenerating || !isValid}
                  className={cn(
                    "w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest active:scale-95 transition-all",
                    !isValid ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
                  {isGenerating ? "Token Genereren..." : "Delen via Link"}
                </motion.button>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex bg-white/5 rounded-2xl p-2 border border-white/10 gap-2">
                     <div className="flex-1 px-4 py-2 text-[10px] text-white/50 font-mono truncate items-center flex">
                        {window.location.origin}/share/{shareToken}
                     </div>
                     <button 
                       onClick={copyToClipboard}
                       className={cn(
                         "h-10 px-4 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                         copied ? "bg-[#22c981] text-[#0b1912]" : "bg-white text-[#0b1912]"
                       )}
                     >
                       {copied ? <Check className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                       {copied ? "Gecopieerd" : "Copy"}
                     </button>
                  </div>
                  <p className="text-[10px] text-center text-white/30 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                     <ShieldCheck className="w-3 h-3 text-[#22c981]" /> Beveiligde link actief
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
