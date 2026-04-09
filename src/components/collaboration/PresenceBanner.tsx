"use client";

import React from "react";
import { usePresence } from "@/hooks/usePresence";
import { motion, AnimatePresence } from "framer-motion";
import { PresenceUser } from "@/types/collaboration";

export function PresenceBanner() {
  const { onlineUsers } = usePresence();

  // Deduplicate users just in case the server/socket sends duplicates
  const uniqueUsers = Array.from(new Map<string, PresenceUser>(onlineUsers.map((u: PresenceUser) => [u.id, u])).values());

  if (uniqueUsers.length === 0) return null;

  return (
    <div className="flex -space-x-2 overflow-hidden py-1 px-2 items-center">
      <AnimatePresence>
        {uniqueUsers.map((user: PresenceUser) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.5, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: -10 }}
            className="relative inline-block h-8 w-8 rounded-full ring-2 ring-white"
            style={{ backgroundColor: user.avatar_color }}
            title={`${user.full_name} (${user.status})`}
          >
            <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white uppercase tracking-tighter">
              {user.initials}
            </span>
            {user.status === 'active' && (
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white animate-pulse" />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      <span className="ml-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest whitespace-nowrap">
        {uniqueUsers.length} online
      </span>
    </div>
  );
}
