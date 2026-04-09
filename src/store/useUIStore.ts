import { create } from "zustand";

interface UIStore {
  activeCollectionId: string | null;
  activeArticleId: string | null;
  activeStep: number;
  isOnline: boolean;
  isSettingsOpen: boolean;
  isCollectionModalOpen: boolean;
  
  setActiveCollection: (id: string | null) => void;
  setActiveArticle: (id: string | null) => void;
  setActiveStep: (step: number) => void;
  setIsOnline: (online: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setCollectionModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeCollectionId: null,
  activeArticleId: null,
  activeStep: 1,
  isOnline: true,
  isSettingsOpen: false,
  isCollectionModalOpen: false,

  setActiveCollection: (id: string | null) => set({ activeCollectionId: id }),
  setActiveArticle: (id: string | null) => set({ activeArticleId: id, activeStep: 1 }),
  setActiveStep: (step: number) => set({ activeStep: step }),
  setIsOnline: (online: boolean) => set({ isOnline: online }),
  setSettingsOpen: (open: boolean) => set({ isSettingsOpen: open }),
  setCollectionModalOpen: (open: boolean) => set({ isCollectionModalOpen: open }),
}));
