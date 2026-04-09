-- ============================================================
--  VLV Tech Pack Builder v2 — Supabase Schema
--  Voer dit uit in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────
--  EXTENSIES
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
--  ENUM TYPES
-- ─────────────────────────────────────────────
CREATE TYPE garment_type AS ENUM (
  'jersey', 'bib_shorts', 'jacket', 'vest', 'gloves',
  'socks', 'cap', 'skinsuit', 'other'
);

CREATE TYPE gender_type AS ENUM ('men', 'women', 'unisex', 'kids');

CREATE TYPE fit_type AS ENUM ('race', 'sport', 'relaxed', 'custom');

CREATE TYPE label_position AS ENUM (
  'neck', 'hem', 'sleeve', 'inside', 'outside', 'none'
);

CREATE TYPE packaging_type AS ENUM (
  'polybag', 'hanger', 'box', 'custom', 'none'
);

-- ─────────────────────────────────────────────
--  TABEL: profiles  (uitbreiding op auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL DEFAULT '',
  initials      TEXT GENERATED ALWAYS AS (
                  UPPER(SUBSTRING(full_name FROM 1 FOR 1))
                ) STORED,
  avatar_color  TEXT NOT NULL DEFAULT '#E63946',  -- VLV rood als default
  role          TEXT NOT NULL DEFAULT 'user',     -- 'admin' | 'user' | 'input'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  TABEL: organizations
-- ─────────────────────────────────────────────
CREATE TABLE public.organizations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  TABEL: organization_members
-- ─────────────────────────────────────────────
CREATE TABLE public.organization_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'member', -- 'owner' | 'admin' | 'member'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- ─────────────────────────────────────────────
--  TABEL: shares (Token based read access)
-- ─────────────────────────────────────────────
CREATE TABLE public.shares (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id   UUID, -- foreign key added later to avoid circular dependency
  article_id      UUID, -- foreign key added later
  token           TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ─────────────────────────────────────────────
--  TABEL: collections
-- ─────────────────────────────────────────────
CREATE TABLE public.collections (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  season          TEXT,                             -- bijv. 'SS2025'
  year            SMALLINT,
  description     TEXT,
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Voeg foreign keys toe aan shares (nu collections en articles (hierna) bestaan)
ALTER TABLE public.shares ADD CONSTRAINT fk_shares_collection FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE CASCADE;
-- Voor article_id doen we het nadat articles tabel is aangemaakt.

-- ─────────────────────────────────────────────
--  TABEL: articles  (kledingstukken / producten)
-- ─────────────────────────────────────────────
CREATE TABLE public.articles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id   UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  reference_code  TEXT,                           -- bijv. 'VLV-JRS-001'
  product_name    TEXT NOT NULL DEFAULT '',
  garment_type    garment_type NOT NULL DEFAULT 'jersey',
  gender          gender_type NOT NULL DEFAULT 'unisex',
  fit             fit_type NOT NULL DEFAULT 'race',
  brand           TEXT DEFAULT 'Vive le Vélo',
  season          TEXT,
  year            SMALLINT,
  description     TEXT,

  -- Stap 1 — Basisgegevens (extra velden)
  fabric_main     TEXT,
  fabric_secondary TEXT,
  weight_gsm      SMALLINT,

  -- Stap 6 — Label
  label_type      TEXT,
  label_position  label_position DEFAULT 'neck',
  label_content   TEXT,

  -- Stap 7 — Verpakking
  packaging       packaging_type DEFAULT 'polybag',
  packaging_notes TEXT,

  -- Status & beheer
  status          TEXT NOT NULL DEFAULT 'draft',  -- 'draft' | 'review' | 'approved'
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.shares ADD CONSTRAINT fk_shares_article FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE;

-- ─────────────────────────────────────────────
--  TABEL: sizes  (Stap 2 — Afmetingen)
-- ─────────────────────────────────────────────
CREATE TABLE public.sizes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id      UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  size_label      TEXT NOT NULL,                      -- 'XS', 'S', 'M', 'L', 'XL', 'XXL'
  chest_cm        NUMERIC(5,1),
  waist_cm        NUMERIC(5,1),
  hip_cm          NUMERIC(5,1),
  length_cm       NUMERIC(5,1),
  sleeve_cm       NUMERIC(5,1),
  inseam_cm       NUMERIC(5,1),
  order_quantity  INTEGER DEFAULT 0,                  -- bestelhoeveelheid per maat
  sort_order      SMALLINT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  TABEL: artwork_placements  (Stap 3 — Artwork)
-- ─────────────────────────────────────────────
CREATE TABLE public.artwork_placements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id      UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  placement_name  TEXT NOT NULL,                  -- bijv. 'Front chest', 'Back hem'
  position_x      NUMERIC(6,2),                  -- % van breedte
  position_y      NUMERIC(6,2),                  -- % van hoogte
  width_cm        NUMERIC(5,1),
  height_cm       NUMERIC(5,1),
  artwork_url     TEXT,                           -- Supabase Storage URL
  technique       TEXT,                           -- bijv. 'Sublimatie', 'Borduurwerk'
  notes           TEXT,
  sort_order      SMALLINT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  TABEL: pantone_colors  (Stap 4 — Pantone)
-- ─────────────────────────────────────────────
CREATE TABLE public.pantone_colors (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id    UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  pantone_code  TEXT NOT NULL,                    -- bijv. 'PMS 032 C'
  color_name    TEXT,                             -- bijv. 'VLV Rood'
  hex_value     TEXT,                             -- bijv. '#E63946'
  usage         TEXT,                             -- bijv. 'Logo, pijlen'
  fabric_part   TEXT,                             -- bijv. 'Voorkant paneel'
  sort_order    SMALLINT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  TABEL: article_images  (Visuele assets via Supabase Storage)
-- ─────────────────────────────────────────────
CREATE TABLE public.article_images (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id    UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  view          TEXT NOT NULL,                    -- 'front' | 'back' | 'detail' | 'artwork'
  storage_path  TEXT NOT NULL,                    -- pad in Supabase Storage bucket
  public_url    TEXT NOT NULL,
  file_name     TEXT,
  file_size_kb  INTEGER,
  uploaded_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  TABEL: field_locks  (Realtime field-level locking)
-- ─────────────────────────────────────────────
CREATE TABLE public.field_locks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id  UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  field_key   TEXT NOT NULL,                      -- bijv. 'product_name', 'sizes[0].chest_cm'
  locked_by   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  locked_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 seconds'),
  UNIQUE(article_id, field_key)
);

-- ─────────────────────────────────────────────
--  TABEL: activity_log  (Audit trail)
-- ─────────────────────────────────────────────
CREATE TABLE public.activity_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  article_id  UUID REFERENCES public.articles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,                      -- 'created' | 'updated' | 'exported_pdf' | 'deleted'
  field_key   TEXT,
  old_value   TEXT,
  new_value   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
--  INDEXEN
-- ═══════════════════════════════════════════════
CREATE INDEX idx_org_members_user       ON public.organization_members(user_id);
CREATE INDEX idx_collections_org        ON public.collections(organization_id);
CREATE INDEX idx_articles_collection    ON public.articles(collection_id);
CREATE INDEX idx_articles_status        ON public.articles(status);
CREATE INDEX idx_sizes_article          ON public.sizes(article_id);
CREATE INDEX idx_artwork_article        ON public.artwork_placements(article_id);
CREATE INDEX idx_pantone_article        ON public.pantone_colors(article_id);
CREATE INDEX idx_images_article         ON public.article_images(article_id);
CREATE INDEX idx_locks_article          ON public.field_locks(article_id);
CREATE INDEX idx_locks_expires          ON public.field_locks(expires_at);
CREATE INDEX idx_log_article            ON public.activity_log(article_id);
CREATE INDEX idx_log_user               ON public.activity_log(user_id);
CREATE INDEX idx_shares_token           ON public.shares(token);

-- ═══════════════════════════════════════════════
--  AUTOMATISCHE updated_at TRIGGERS
-- ═══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_organizations_updated
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_collections_updated
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_articles_updated
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ═══════════════════════════════════════════════
--  AUTOMATISCH PROFIEL AANMAKEN BIJ REGISTRATIE
-- ═══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  user_name TEXT;
BEGIN
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));

  -- 1. Create Profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, user_name);

  -- 2. Create Personal Organization
  INSERT INTO public.organizations (name, created_by)
  VALUES (user_name || ' Workspace', NEW.id)
  RETURNING id INTO new_org_id;

  -- 3. Add user as owner of their Workspace
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════
--  VAKOPEN VERLOPEN LOCKS OPRUIMEN (elke 60s)
-- ═══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.cleanup_expired_locks()
RETURNS void AS $$
BEGIN
  DELETE FROM public.field_locks WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS) - SaaS MODEL
-- ═══════════════════════════════════════════════

-- Activeer RLS op alle tabellen
ALTER TABLE public.organizations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sizes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artwork_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pantone_colors     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_images     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_locks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares             ENABLE ROW LEVEL SECURITY;

-- ── HELPER FUNCTIE VOOR RLS ──
CREATE OR REPLACE FUNCTION public.is_member_of(_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _org_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ORGANIZATIONS
CREATE POLICY "org_select" ON public.organizations FOR SELECT TO authenticated USING (public.is_member_of(id));
CREATE POLICY "org_update" ON public.organizations FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- ORGANIZATION MEMBERS
CREATE POLICY "members_select" ON public.organization_members FOR SELECT TO authenticated USING (public.is_member_of(organization_id));

-- PROFILES
CREATE POLICY "profiles_select_all"   ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- COLLECTIONS
CREATE POLICY "collections_select"    ON public.collections FOR SELECT TO authenticated USING (public.is_member_of(organization_id));
CREATE POLICY "collections_insert"    ON public.collections FOR INSERT TO authenticated WITH CHECK (public.is_member_of(organization_id));
CREATE POLICY "collections_update"    ON public.collections FOR UPDATE TO authenticated USING (public.is_member_of(organization_id));
CREATE POLICY "collections_delete"    ON public.collections FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = collections.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- ARTICLES
CREATE POLICY "articles_select" ON public.articles FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND public.is_member_of(c.organization_id))
);
CREATE POLICY "articles_insert" ON public.articles FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND public.is_member_of(c.organization_id))
);
CREATE POLICY "articles_update" ON public.articles FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND public.is_member_of(c.organization_id))
);
CREATE POLICY "articles_delete" ON public.articles FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND public.is_member_of(c.organization_id))
);

-- SUB-TABELLEN (Relate back to articles)
CREATE POLICY "sizes_all"             ON public.sizes             FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.articles a JOIN public.collections c ON a.collection_id = c.id WHERE a.id = article_id AND public.is_member_of(c.organization_id))
) WITH CHECK (true);
CREATE POLICY "artwork_all"           ON public.artwork_placements FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.articles a JOIN public.collections c ON a.collection_id = c.id WHERE a.id = article_id AND public.is_member_of(c.organization_id))
) WITH CHECK (true);
CREATE POLICY "pantone_all"           ON public.pantone_colors    FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.articles a JOIN public.collections c ON a.collection_id = c.id WHERE a.id = article_id AND public.is_member_of(c.organization_id))
) WITH CHECK (true);
CREATE POLICY "images_all"            ON public.article_images    FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.articles a JOIN public.collections c ON a.collection_id = c.id WHERE a.id = article_id AND public.is_member_of(c.organization_id))
) WITH CHECK (true);
CREATE POLICY "locks_all"             ON public.field_locks       FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.articles a JOIN public.collections c ON a.collection_id = c.id WHERE a.id = article_id AND public.is_member_of(c.organization_id))
) WITH CHECK (true);

-- SHARES (enkel inzien als owner van de collectie/article)
CREATE POLICY "shares_select" ON public.shares FOR SELECT TO authenticated USING (
  (collection_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND public.is_member_of(c.organization_id)))
  OR 
  (article_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.articles a JOIN public.collections c ON a.collection_id = c.id WHERE a.id = article_id AND public.is_member_of(c.organization_id)))
);
CREATE POLICY "shares_insert" ON public.shares FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- ═══════════════════════════════════════════════
--  REALTIME PUBLICATIE
-- ═══════════════════════════════════════════════
-- Activeer realtime voor de tabellen die live updates nodig hebben
ALTER PUBLICATION supabase_realtime ADD TABLE public.articles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sizes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.artwork_placements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pantone_colors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.field_locks;

-- ═══════════════════════════════════════════════
--  STORAGE BUCKET
-- ═══════════════════════════════════════════════
-- Voer dit uit na het aanmaken van de tabellen:
INSERT INTO storage.buckets (id, name, public)
VALUES ('tech-pack-assets', 'tech-pack-assets', true)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "assets_select_all"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tech-pack-assets');

CREATE POLICY "assets_insert_authenticated"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'tech-pack-assets');

CREATE POLICY "assets_delete_authenticated"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'tech-pack-assets');
