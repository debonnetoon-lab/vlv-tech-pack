/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize Supabase with Service Role for admin tasks (cleanup, overrides)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("CRITICAL: Supabase environment variables missing!");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// State management
const activeUsers = new Map(); // socketId -> UserInfo

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // --- PRESENCE EVENTS ---
  socket.on('presence:join', (user) => {
    activeUsers.set(socket.id, {
      ...user,
      status: 'active',
      last_active: new Date().toISOString()
    });
    broadcastPresence();
  });

  socket.on('presence:update_location', (articleId) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      user.current_article_id = articleId;
      user.last_active = new Date().toISOString();
      broadcastPresence();
    }
  });

  // --- ARTICLE ROOMS ---
  socket.on('article:join', async (articleId) => {
    socket.join(`article:${articleId}`);
    
    // Fetch existing locks from Supabase
    const { data: locks, error } = await supabase
      .from('field_locks')
      .select('*, profile:profiles(full_name, avatar_color, initials)')
      .eq('article_id', articleId);

    if (!error && locks) {
      socket.emit('article:locks', locks);
    }
  });

  socket.on('article:leave', async (articleId) => {
    socket.leave(`article:${articleId}`);
    
    // Cleanup any locks held by this socket's user in this article
    const user = activeUsers.get(socket.id);
    if (user) {
      await supabase
        .from('field_locks')
        .delete()
        .eq('article_id', articleId)
        .eq('locked_by', user.id);
      
      io.to(`article:${articleId}`).emit('field:unlock', { article_id: articleId, all_for_user: user.id });
    }
  });

  // --- FIELD LOCKING EVENTS ---
  socket.on('field:lock', async ({ article_id, field_key }) => {
    const user = activeUsers.get(socket.id);
    if (!user) return;

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min lock

    const { data: lock, error } = await supabase
      .from('field_locks')
      .upsert({
        article_id,
        field_key,
        locked_by: user.id,
        expires_at: expiresAt
      }, { onConflict: 'article_id,field_key' })
      .select('*, profile:profiles(full_name, avatar_color, initials)')
      .single();

    if (!error && lock) {
      io.to(`article:${article_id}`).emit('field:lock', lock);
    } else {
      console.error("Lock error:", error);
    }
  });

  socket.on('field:unlock', async ({ article_id, field_key }) => {
    const user = activeUsers.get(socket.id);
    if (!user) return;

    const { error } = await supabase
      .from('field_locks')
      .delete()
      .match({ article_id, field_key, locked_by: user.id });

    if (!error) {
      io.to(`article:${article_id}`).emit('field:unlock', { article_id, field_key });
    }
  });

  // --- DISCONNECT ---
  socket.on('disconnect', async () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      // Cleanup locks for this user across all articles
      await supabase
        .from('field_locks')
        .delete()
        .eq('locked_by', user.id);
      
      activeUsers.delete(socket.id);
      broadcastPresence();
    }
    console.log('User disconnected:', socket.id);
  });

  function broadcastPresence() {
    const allUsers = Array.from(activeUsers.values());
    // Deduplicate by user.id — keep the most recent entry per user
    const seen = new Map();
    for (const u of allUsers) {
      if (u.id) seen.set(u.id, u);
    }
    const users = Array.from(seen.values());
    io.emit('presence:update', users);
  }
});

// PERIODIC CLEANUP OF EXPIRED LOCKS (every 30 seconds)
setInterval(async () => {
  const { error } = await supabase
    .from('field_locks')
    .delete()
    .lt('expires_at', new Date().toISOString());
    
  if (error) console.error("Cleanup error:", error);
}, 30000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO Collaboration Server running on port ${PORT}`);
});
