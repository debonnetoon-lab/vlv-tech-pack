import { create } from "zustand";
import { PresenceUser, FieldLock } from "@/types/collaboration";

// Temporary any for User model to resolve lint errors later
// Define a proper interface or use Supabase's User type
import { User } from "@supabase/supabase-js";

interface CollaborationStore {
  user: User | null;
  profile: PresenceUser | null;
  activeUsers: PresenceUser[];
  lockedFields: Record<string, FieldLock>; // Key: article_id:field_key
  
  setUser: (user: User | null) => void;
  setProfile: (profile: PresenceUser | null) => void;
  setActiveUsers: (users: PresenceUser[]) => void;
  setFieldLock: (lock: FieldLock) => void;
  removeFieldLock: (articleId: string, fieldKey: string) => void;
  setArticleLocks: (locks: FieldLock[]) => void;
}

export const useCollaborationStore = create<CollaborationStore>((set) => ({
  user: null,
  profile: null,
  activeUsers: [],
  lockedFields: {},

  setUser: (user: User | null) => set({ user }),
  setProfile: (profile: PresenceUser | null) => set({ profile }),
  setActiveUsers: (users: PresenceUser[]) => set({ activeUsers: users }),
  setFieldLock: (lock: FieldLock) => set((state) => ({
    lockedFields: {
      ...state.lockedFields,
      [`${lock.article_id}:${lock.field_key}`]: lock
    }
  })),
  removeFieldLock: (articleId: string, fieldKey: string) => set((state) => {
    const newLocks = { ...state.lockedFields };
    delete newLocks[`${articleId}:${fieldKey}`];
    return { lockedFields: newLocks };
  }),
  setArticleLocks: (locks: FieldLock[]) => set((state) => {
    const newLocks = { ...state.lockedFields };
    locks.forEach(lock => {
      newLocks[`${lock.article_id}:${lock.field_key}`] = lock;
    });
    return { lockedFields: newLocks };
  }),
}));
