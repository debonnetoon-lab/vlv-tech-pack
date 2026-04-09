"use client";

import { useEffect, useMemo } from "react";
import {  useUIStore, useCollaborationStore , useTechPackStore } from "@/store";
import { socket } from "@/lib/socket";
import { PresenceUser } from "@/types/collaboration";

export function usePresence() {
  const { profile, activeUsers, setActiveUsers, activeArticleId } = useTechPackStore();

  useEffect(() => {
    if (!profile) return;

    // Connect and join presence
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("presence:join", profile);

    const handlePresenceUpdate = (users: PresenceUser[]) => {
      setActiveUsers(users);
    };

    socket.on("presence:update", handlePresenceUpdate);

    return () => {
      socket.off("presence:update", handlePresenceUpdate);
    };
  }, [profile, setActiveUsers]);

  // Update location when active article changes
  useEffect(() => {
    if (socket.connected) {
      socket.emit("presence:update_location", activeArticleId);
    }
  }, [activeArticleId]);

  const onlineUsers = activeUsers;
  
  const usersOnArticle = useMemo(() => {
    return (articleId: string) => activeUsers.filter((u: PresenceUser) => u.current_article_id === articleId && u.id !== profile?.id);
  }, [activeUsers, profile?.id]);

  return { onlineUsers, usersOnArticle };
}
