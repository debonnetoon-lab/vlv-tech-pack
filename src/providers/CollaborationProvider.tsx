"use client";

import React, { useEffect } from "react";
import { socket } from "@/lib/socket";
import {  useUIStore, useCollaborationStore , useTechPackStore } from "@/store";
import { FieldLock } from "@/types/collaboration";

export function CollaborationProvider({ children }: { children: React.ReactNode }) {
  const { 
    profile, 
    setFieldLock, 
    removeFieldLock, 
    setArticleLocks,
    activeArticleId,
    setActiveUsers,
    removeAllLocksForUser
  } = useTechPackStore();

  useEffect(() => {
    if (!profile) return;

    if (!socket.connected) {
      socket.connect();
    }

    // Listen for field locking events
    const onFieldLock = (lock: FieldLock) => {
      setFieldLock(lock);
    };

    const onFieldUnlock = (data: { article_id: string; field_key: string; all_for_user?: string }) => {
      if (data.all_for_user) {
        removeAllLocksForUser(data.all_for_user);
      } else {
        removeFieldLock(data.article_id, data.field_key);
      }
    };

    const onArticleLocks = (locks: FieldLock[]) => {
      setArticleLocks(locks);
    };

    socket.on("field:lock", onFieldLock);
    socket.on("field:unlock", onFieldUnlock);
    socket.on("article:locks", onArticleLocks);

    return () => {
      socket.off("field:lock", onFieldLock);
      socket.off("field:unlock", onFieldUnlock);
      socket.off("article:locks", onArticleLocks);
    };
  }, [profile, setFieldLock, removeFieldLock, setArticleLocks]);

  // Join article room when active article changes
  useEffect(() => {
    if (activeArticleId && socket.connected) {
      socket.emit("article:join", activeArticleId);
      
      return () => {
        socket.emit("article:leave", activeArticleId);
      };
    }
  }, [activeArticleId]);

  return <>{children}</>;
}
