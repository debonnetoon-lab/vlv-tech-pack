"use client";

import { useCallback } from "react";
import {  useCollaborationStore , useTechPackStore } from "@/store";
import { socket } from "@/lib/socket";

export function useFieldLock(articleId: string, fieldKey: string) {
  const { lockedFields, profile } = useTechPackStore();
  
  const lockKey = `${articleId}:${fieldKey}`;
  const lock = lockedFields[lockKey];
  
  const isLocked = !!lock && lock.locked_by !== profile?.id;
  const lockedBy = lock?.profile?.full_name || "Another user";

  const acquireLock = useCallback(() => {
    if (!profile || isLocked) return;
    socket.emit("field:lock", { article_id: articleId, field_key: fieldKey });
  }, [articleId, fieldKey, profile, isLocked]);

  const releaseLock = useCallback(() => {
    if (!profile) return;
    socket.emit("field:unlock", { article_id: articleId, field_key: fieldKey });
  }, [articleId, fieldKey, profile]);

  return { isLocked, lockedBy, acquireLock, releaseLock };
}
