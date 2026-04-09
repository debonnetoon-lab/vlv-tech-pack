"use client";

import { useEffect } from "react";
import {  useUIStore, useCollaborationStore , useTechPackStore } from "@/store";
import { socket } from "@/lib/socket";
import { PresenceUser, FieldLock } from "@/types/collaboration";

/**
 * Main socket hook — handles connection lifecycle, presence, and field locking.
 * Uses the singleton socket instance from lib/socket.ts with correct event names
 * matching the server (server/index.js).
 */
export function useSocket() {
  const { 
    profile, 
    activeArticleId, 
    setActiveUsers, 
    setFieldLock, 
    removeFieldLock,
    setArticleLocks 
  } = useTechPackStore();

  // Connect and setup listeners
  useEffect(() => {
    if (!profile) return;

    if (!socket.connected) {
      socket.connect();
    }

    // Join presence
    socket.emit("presence:join", profile);

    // Listeners
    const handlePresenceUpdate = (users: PresenceUser[]) => {
      setActiveUsers(users);
    };

    const handleFieldLock = (lock: FieldLock) => {
      setFieldLock(lock);
    };

    const handleFieldUnlock = (data: { article_id: string; field_key?: string; all_for_user?: string }) => {
      if (data.field_key) {
        removeFieldLock(data.article_id, data.field_key);
      }
      // all_for_user cleanup is handled by re-fetching locks when joining article
    };

    const handleArticleLocks = (locks: FieldLock[]) => {
      setArticleLocks(locks);
    };

    socket.on("presence:update", handlePresenceUpdate);
    socket.on("field:lock", handleFieldLock);
    socket.on("field:unlock", handleFieldUnlock);
    socket.on("article:locks", handleArticleLocks);

    return () => {
      socket.off("presence:update", handlePresenceUpdate);
      socket.off("field:lock", handleFieldLock);
      socket.off("field:unlock", handleFieldUnlock);
      socket.off("article:locks", handleArticleLocks);
    };
  }, [profile, setActiveUsers, setFieldLock, removeFieldLock, setArticleLocks]);

  // Track which article the user is viewing
  useEffect(() => {
    if (!socket.connected || !profile) return;

    if (activeArticleId) {
      socket.emit("article:join", activeArticleId);
      socket.emit("presence:update_location", activeArticleId);
    }

    return () => {
      if (activeArticleId) {
        socket.emit("article:leave", activeArticleId);
      }
    };
  }, [activeArticleId, profile]);
}
