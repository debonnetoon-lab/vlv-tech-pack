"use client";

import React from "react";
import { usePresence } from "@/hooks/usePresence";
import { motion, AnimatePresence } from "framer-motion";

export function ArticlePresence({ articleId }: { articleId: string }) {
  const { usersOnArticle } = usePresence();
  const collaborators = usersOnArticle(articleId);

  if (collaborators.length === 0) return null;

  return (
    <div className="flex -space-x-1.5 overflow-hidden items-center group">
      <AnimatePresence>
        {collaborators.map((user: any) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="relative h-6 w-6 rounded-full border-2 border-white"
            style={{ backgroundColor: user.avatar_color }}
            title={user.full_name}
          >
            <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white uppercase">
              {user.initials}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
      <span className="ml-2 text-[10px] text-gray-400 font-medium group-hover:text-gray-600 transition-colors">
        {collaborators.length} collaborator{collaborators.length > 1 ? 's' : ''} viewing
      </span>
    </div>
  );
}
