"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Package, 
  Settings, 
  ChevronLeft, 
  Plus, 
  Search,
  LogOut,
  ChevronRight,
  Building
} from "lucide-react";
import { useTechPackStore, useUIStore, useDataStore } from "@/store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const { 
    user, 
    profile, 
    organization,
    collections, 
    setActiveCollection,
    setActiveArticle,
    activeCollectionId,
    activeArticleId,
    userRole
  } = useTechPackStore();

  const isViewer = userRole === 'viewer';
  
  const { setSettingsOpen, setCollectionModalOpen } = useUIStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "collections" | "products" | "settings">("dashboard");
  const [expandedCollections, setExpandedCollections] = useState<string[]>([]);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "collections", label: "Collecties", icon: FolderKanban },
    { id: "settings", label: "Instellingen", icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id as any);
    if (id === "dashboard") {
      setActiveArticle(null);
      setActiveCollection(null);
      setSettingsOpen(false);
    } else if (id === "settings") {
      setSettingsOpen(true);
    }
  };

  const toggleCollection = (colId: string) => {
    setExpandedCollections(prev =>
      prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="flex flex-col h-full bg-[#0b1912] text-white select-none border-r border-white/[0.05] transition-all duration-300 ease-in-out relative group overflow-hidden"
    >
      {/* ── LOGO & COLLAPSE ── */}
      <div className="h-20 flex items-center px-6 justify-between border-b border-white/[0.03] shrink-0">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-[#22c981] flex items-center justify-center shadow-[0_0_20px_rgba(34,201,129,0.3)]">
                <span className="font-black italic text-black text-sm">V</span>
              </div>
              <h1 className="font-black italic tracking-tighter text-lg uppercase">VLV <span className="text-[#22c981]">V3</span></h1>
            </motion.div>
          )}
        </AnimatePresence>

        {isCollapsed && (
           <div className="w-8 h-8 rounded-xl bg-[#22c981] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,201,129,0.3)]">
             <span className="font-black italic text-black text-sm">V</span>
           </div>
        )}

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-[#22c981] text-[#0b1912] flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 active:scale-95 z-50"
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform duration-300", isCollapsed && "rotate-180")} />
        </button>
      </div>

      {/* ── SEARCH ── */}
      {!isCollapsed && (
        <div className="px-4 py-4 shrink-0">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#22c981] transition-colors" />
            <input 
              type="text" 
              placeholder="Zoeken..."
              className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#22c981]/50 placeholder:text-white/10 transition-all"
            />
          </div>
        </div>
      )}

      {/* ── NAVIGATION ── */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => handleNavClick(item.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all relative group",
                activeTab === item.id 
                  ? "bg-[#22c981] text-[#0b1912] font-black shadow-lg shadow-[#22c981]/10" 
                  : "text-white/40 hover:bg-white/[0.03] hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", activeTab === item.id ? "text-[#0b1912]" : "text-[#22c981]/60 group-hover:text-[#22c981]")} />
              {!isCollapsed && (
                <span className="text-xs uppercase tracking-widest leading-none mt-0.5 flex-1 text-left">{item.label}</span>
              )}
              {/* Badge: collection count */}
              {!isCollapsed && item.id === "collections" && collections.length > 0 && (
                <span className={cn(
                  "text-[9px] font-black px-1.5 py-0.5 rounded-full",
                  activeTab === item.id ? "bg-[#0b1912]/20 text-[#0b1912]" : "bg-white/10 text-white/40"
                )}>
                  {collections.length}
                </span>
              )}
            </button>

            {/* ── COLLECTION LIST (only in collections tab) ── */}
            {item.id === "collections" && activeTab === "collections" && !isCollapsed && (
              <div className="mt-1 ml-3 space-y-0.5">
                {collections.length === 0 ? (
                  <p className="text-[10px] text-white/20 px-3 py-2 font-medium">Geen collecties</p>
                ) : (
                  collections.map((col: any) => (
                    <div key={col.id}>
                      <button
                        onClick={() => {
                          setActiveCollection(col.id);
                          toggleCollection(col.id);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all",
                          activeCollectionId === col.id
                            ? "bg-white/10 text-white"
                            : "text-white/30 hover:text-white/60 hover:bg-white/[0.03]"
                        )}
                      >
                        <FolderKanban className="w-3.5 h-3.5 shrink-0 text-[#22c981]/40" />
                        <span className="text-[11px] font-bold truncate flex-1">{col.name}</span>
                        <ChevronRight className={cn(
                          "w-3 h-3 shrink-0 transition-transform text-white/20",
                          expandedCollections.includes(col.id) && "rotate-90"
                        )} />
                      </button>

                      {/* Product sub-list */}
                      {expandedCollections.includes(col.id) && col.products?.length > 0 && (
                        <div className="ml-4 mt-0.5 space-y-0.5">
                          {col.products.map((prod: any) => (
                            <div key={prod.id} className="group/item relative">
                              <button
                                onClick={() => {
                                  setActiveCollection(col.id);
                                  setActiveArticle(prod.id);
                                }}
                                className={cn(
                                  "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-all",
                                  activeArticleId === prod.id
                                    ? "bg-[#22c981]/10 text-[#22c981]"
                                    : "text-white/20 hover:text-white/50 hover:bg-white/[0.03]"
                                )}
                              >
                                <Package className="w-3 h-3 shrink-0" />
                                <span className="text-[10px] font-medium truncate flex-1">{prod.name}</span>
                              </button>
                              
                              {/* [NEW] Duplicate Action */}
                              {!isViewer && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Gooi dit artikel (${prod.name}) in de kopieermachine?`)) {
                                      useDataStore.getState().duplicateProduct(col.id, prod.id);
                                    }
                                  }}
                                  title="Dupliceer artikel"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 p-1 rounded-md bg-[#22c981]/10 text-[#22c981] hover:bg-[#22c981] hover:text-[#0b1912] transition-all"
                                >
                                  <Plus className="w-2.5 h-2.5 rotate-45" /> {/* Using Plus rotated for a 'cross' or duplicate feel, or I can use Copy if I import it */}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}

                {/* New Collection button */}
                {!isViewer && (
                  <button
                    onClick={() => setCollectionModalOpen(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/20 hover:text-[#22c981] hover:bg-[#22c981]/5 transition-all group mt-1"
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Nieuwe Collectie</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* ── ORGANIZATION & PROFILE ── */}
      <div className="p-4 border-t border-white/[0.03] bg-white/[0.01] shrink-0">
        {!isCollapsed && (
          <div className="mb-4 px-2">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#22c981]/5 border border-[#22c981]/10">
              <div className="w-8 h-8 rounded-lg bg-[#22c981]/20 flex items-center justify-center shrink-0">
                <Building className="w-4 h-4 text-[#22c981]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase text-[#22c981] tracking-tighter">Workspace</p>
                <p className="text-xs font-bold text-white truncate italic">{organization?.name || "VLV Studio"}</p>
              </div>
            </div>
          </div>
        )}

        <div className={cn(
          "flex items-center gap-3 px-2 w-full group cursor-pointer",
          isCollapsed && "justify-center px-0"
        )}>
           <div 
             className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-black text-sm shadow-xl shrink-0 transform transition-transform group-hover:scale-105"
             style={{ backgroundColor: (profile as any)?.avatar_color || "#22c981" }}
           >
             {(profile as any)?.initials || (profile?.full_name?.charAt(0) || "U")}
           </div>
           
           {!isCollapsed && (
             <div className="flex-1 min-w-0">
               <p className="text-xs font-black text-white truncate uppercase tracking-tight">{profile?.full_name || "Fashion Designer"}</p>
               <div className="flex items-center gap-1.5">
                 <p className="text-[10px] text-white/30 truncate font-medium">{user?.email}</p>
                 <span className="text-[8px] px-1 bg-white/10 text-white/40 rounded-sm uppercase font-bold tracking-tighter">{userRole}</span>
               </div>
             </div>
           )}

           {!isCollapsed && (
             <button
               onClick={handleLogout}
               title="Uitloggen"
               className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
             >
               <LogOut className="w-3.5 h-3.5" />
             </button>
           )}
        </div>
      </div>
    </motion.div>
  );
}


