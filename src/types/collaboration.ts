export interface PresenceUser {
  id: string;
  full_name: string;
  initials: string;
  avatar_color: string;
  current_article_id?: string;
  last_active: string;
  status: 'active' | 'idle' | 'offline';
  role?: 'admin' | 'user' | 'input' | string;
  email?: string;
}

export interface FieldLock {
  id?: string;
  article_id: string;
  field_key: string;
  locked_by: string; // user ID
  locked_at: string;
  expires_at: string;
  profile?: {
    full_name: string;
    avatar_color: string;
    initials: string;
  };
}

export interface ServerToClientEvents {
  'presence:update': (users: PresenceUser[]) => void;
  'field:lock': (lock: FieldLock) => void;
  'field:unlock': (data: { article_id: string; field_key: string }) => void;
  'article:locks': (locks: FieldLock[]) => void;
}

export interface ClientToServerEvents {
  'presence:join': (user: Partial<PresenceUser>) => void;
  'presence:update_location': (articleId: string | null) => void;
  'article:join': (articleId: string) => void;
  'article:leave': (articleId: string) => void;
  'field:lock': (data: { article_id: string; field_key: string }) => void;
  'field:unlock': (data: { article_id: string; field_key: string }) => void;
}
