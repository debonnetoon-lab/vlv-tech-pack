-- ─────────────────────────────────────────────
--  0. CLEAN START (Automated)
-- ─────────────────────────────────────────────
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Ensure the public schema is accessible again
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO dashboard_user;

-- ─────────────────────────────────────────────
--  1. ORGANIZATIONS & USERS
-- ─────────────────────────────────────────────

CREATE TYPE public.org_status AS ENUM ('pending', 'active', 'suspended');

CREATE TABLE public.organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  logo_url      TEXT,
  currency      TEXT DEFAULT 'EUR',
  size_system   TEXT DEFAULT 'EU',
  status        org_status DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL DEFAULT '',
  avatar_url    TEXT,
  role          TEXT DEFAULT 'input',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.organization_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT CHECK (role IN ('owner','admin','designer','viewer')),
  invited_by      UUID REFERENCES auth.users(id),
  accepted_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- ─────────────────────────────────────────────
--  2. COLLECTIONS & PRODUCTS
-- ─────────────────────────────────────────────

CREATE TABLE public.collections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  season          TEXT CHECK (season IN ('SS','FW','Resort','Cruise')),
  year            INT,
  status          TEXT CHECK (status IN ('draft','active','archived')) DEFAULT 'draft',
  cover_image_url TEXT,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  collection_id   UUID REFERENCES collections(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  article_code    TEXT,
  category        TEXT,
  gender          TEXT CHECK (gender IN ('men','women','unisex','kids')),
  status          TEXT CHECK (status IN ('draft','in_review','approved','rejected')) DEFAULT 'draft',
  description     TEXT,
  customer_po     TEXT,
  garment_type    TEXT,
  fabric_main     TEXT,
  fabric_secondary TEXT,
  weight_gsm      INT,
  ai_measurement  JSONB DEFAULT '{}',
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
--  3. SECTIONS & STRUCTURED DATA
-- ─────────────────────────────────────────────

-- Flexible sections (construction, labels, packaging, etc.)
CREATE TABLE public.tech_pack_sections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID REFERENCES products(id) ON DELETE CASCADE,
  section_type TEXT CHECK (section_type IN (
                'general','sketches','materials','colorways',
                'measurements','construction','bom','labels')),
  data         JSONB DEFAULT '{}',
  order_index  INT DEFAULT 0,
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.materials (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       UUID REFERENCES products(id) ON DELETE CASCADE,
  name             TEXT,
  composition      TEXT,
  weight_gsm       INT,
  supplier         TEXT,
  color_reference  TEXT,
  pantone_code     TEXT,
  hex_code         TEXT,
  percentage       INT
);

CREATE TABLE public.size_charts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  size_system TEXT,
  sizes       JSONB DEFAULT '[]',
  measurements JSONB DEFAULT '{}'
);

CREATE TABLE public.colorways (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID REFERENCES products(id) ON DELETE CASCADE,
  name         TEXT,
  pantone_code TEXT,
  hex_code     TEXT,
  image_url    TEXT
);

CREATE TABLE public.bom_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  category    TEXT,
  description TEXT,
  supplier    TEXT,
  unit        TEXT,
  quantity    NUMERIC,
  unit_price  NUMERIC,
  currency    TEXT DEFAULT 'EUR'
);

CREATE TABLE public.measurement_points (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID REFERENCES products(id) ON DELETE CASCADE,
  label        TEXT NOT NULL,
  description  TEXT,
  tolerance    TEXT,
  order_index  INT DEFAULT 0
);

CREATE TABLE public.measurement_values (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  point_id     UUID REFERENCES measurement_points(id) ON DELETE CASCADE,
  size_label   TEXT NOT NULL,
  value_cm     NUMERIC NOT NULL DEFAULT 0
);

-- ─────────────────────────────────────────────
--  4. FILES & COLLABORATION
-- ─────────────────────────────────────────────

CREATE TABLE public.product_files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  file_type   TEXT CHECK (file_type IN (
              'technical_sketch','reference_image',
              'pdf','cad','other')),
  file_url    TEXT,
  public_url  TEXT,
  view        TEXT CHECK (view IN ('front', 'back', 'detail', 'artwork')),
  file_name   TEXT,
  version     INT DEFAULT 1,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.shares (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     UUID REFERENCES products(id) ON DELETE CASCADE,
  collection_id  UUID REFERENCES collections(id) ON DELETE CASCADE,
  token          TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  shared_by      UUID REFERENCES auth.users(id),
  expires_at     TIMESTAMPTZ,
  requires_login BOOLEAN DEFAULT false,
  permission     TEXT CHECK (permission IN ('view','comment')),
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.comments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID REFERENCES products(id) ON DELETE CASCADE,
  section_type TEXT,
  user_id      UUID REFERENCES auth.users(id),
  content      TEXT NOT NULL,
  resolved     BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.export_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  exported_by UUID REFERENCES auth.users(id),
  format      TEXT CHECK (format IN ('pdf','excel','zip')),
  file_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.activity_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id),
  action          TEXT NOT NULL,
  entity_type     TEXT NOT NULL,
  entity_id       UUID,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
--  5. TRIGGERS & RLS
-- ─────────────────────────────────────────────

-- Trigger: Create Org on Auth Sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  org_name TEXT;
  full_name TEXT;
  existing_org_id UUID;
BEGIN
  full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));
  org_name := COALESCE(NEW.raw_user_meta_data->>'org_name', full_name || ' Workspace');

  -- 1. Create/Update Profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, full_name)
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

  -- 2. Check if user already has an organization (e.g. invited before signup)
  SELECT organization_id INTO existing_org_id 
  FROM public.organization_members 
  WHERE user_id = NEW.id 
  LIMIT 1;

  IF existing_org_id IS NOT NULL THEN
    -- User already belongs to an org, don't create a new one
    RETURN NEW;
  END IF;

  -- 3. Create Organization
  INSERT INTO public.organizations (name, slug, status)
  VALUES (org_name, LOWER(REGEXP_REPLACE(org_name, '\s+', '-', 'g')) || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8), 'active')
  RETURNING id INTO new_org_id;

  -- 4. Add user as Owner
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');

  -- 5. Log Activity
  INSERT INTO public.activity_logs (organization_id, user_id, action, entity_type, entity_id)
  VALUES (new_org_id, NEW.id, 'created', 'organization', new_org_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Deletion Safeguards (Triggers)
CREATE OR REPLACE FUNCTION public.check_member_deletion()
RETURNS TRIGGER AS $$
DECLARE
    deleter_id UUID := auth.uid();
    deleter_role TEXT;
    target_role TEXT := OLD.role;
    owner_count INTEGER;
BEGIN
    -- 0. Global Admin (Toon) can delete anyone EXCEPT himself
    IF public.is_global_admin(deleter_id) THEN
        IF OLD.user_id = deleter_id THEN
            RAISE EXCEPTION 'Toon kan zichzelf niet verwijderen.';
        END IF;
        RETURN OLD;
    END IF;

    -- 1. Prevent self-deletion
    IF OLD.user_id = deleter_id THEN
        RAISE EXCEPTION 'Je kunt jezelf niet verwijderen. Neem contact op met een andere beheerder.';
    END IF;

    -- Get deleter role
    SELECT role INTO deleter_role FROM public.organization_members 
    WHERE organization_id = OLD.organization_id AND user_id = deleter_id;

    -- 2. Admin cannot delete Owner
    IF deleter_role = 'admin' AND target_role = 'owner' THEN
        RAISE EXCEPTION 'Een beheerder kan de eigenaar van de organisatie niet verwijderen.';
    END IF;

    -- 3. Ensure at least one owner remains
    IF target_role = 'owner' THEN
        SELECT COUNT(*) INTO owner_count FROM public.organization_members 
        WHERE organization_id = OLD.organization_id AND role = 'owner';
        
        IF owner_count <= 1 THEN
            RAISE EXCEPTION 'De laatste eigenaar van de organisatie kan niet worden verwijderd.';
        END IF;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_member_deletion ON public.organization_members;
CREATE TRIGGER trg_check_member_deletion
BEFORE DELETE ON public.organization_members
FOR EACH ROW EXECUTE FUNCTION public.check_member_deletion();

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_pack_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.size_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colorways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bom_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Dynamic Membership Check Function: Includes Global Admin & Organization Status
CREATE OR REPLACE FUNCTION public.is_member_of(_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Global Admin always has access
  IF public.is_global_admin(auth.uid()) THEN
    RETURN TRUE;
  END IF;

  -- Normal users check membership AND org status
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members m
    JOIN public.organizations o ON o.id = m.organization_id
    WHERE m.organization_id = _org_id 
    AND m.user_id = auth.uid()
    AND o.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- New: Role Check Helper: Includes Global Admin & Organization Status
CREATE OR REPLACE FUNCTION public.has_role_in_org(_org_id UUID, _allowed_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  -- Global Admin always counts as having the role
  IF public.is_global_admin(auth.uid()) THEN
    RETURN TRUE;
  END IF;

  -- Normal users check role AND org status
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members m
    JOIN public.organizations o ON o.id = m.organization_id
    WHERE m.organization_id = _org_id 
    AND m.user_id = auth.uid() 
    AND m.role = ANY(_allowed_roles)
    AND o.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────
--  5b. RPC: Ensure user has an organization (called on login)
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.ensure_user_organization()
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
  v_full_name TEXT;
  v_org_name TEXT;
  v_slug TEXT;
BEGIN
  -- 1. Check if user already has an ACTIVE org (Prioritize active over pending)
  SELECT m.organization_id INTO v_org_id
  FROM public.organization_members m
  JOIN public.organizations o ON o.id = m.organization_id
  WHERE m.user_id = auth.uid()
  ORDER BY (o.status = 'active') DESC, m.created_at ASC
  LIMIT 1;

  IF v_org_id IS NOT NULL THEN
    RETURN v_org_id;
  END IF;

  -- 2. Get user info
  SELECT COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
  INTO v_full_name
  FROM auth.users WHERE id = auth.uid();

  v_org_name := v_full_name || ' Workspace';
  v_slug := lower(regexp_replace(v_org_name, '\s+', '-', 'g')) || '-' || substring(gen_random_uuid()::text, 1, 8);

  -- Ensure profile exists
  INSERT INTO public.profiles (id, full_name)
  VALUES (auth.uid(), v_full_name)
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

  -- Create org
  INSERT INTO public.organizations (name, slug)
  VALUES (v_org_name, v_slug)
  RETURNING id INTO v_org_id;

  -- Add as owner
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (v_org_id, auth.uid(), 'owner');

  -- Log activity
  INSERT INTO public.activity_logs (organization_id, user_id, action, entity_type, entity_id)
  VALUES (v_org_id, auth.uid(), 'created', 'organization', v_org_id);

  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────
--  6. POLICIES (RBAC ENFORCED)
-- ─────────────────────────────────────────────

-- Organizations: Read-only for members
CREATE POLICY "org_select" ON public.organizations FOR SELECT TO authenticated USING (public.is_member_of(id));

-- Profiles: Own profile access
CREATE POLICY "profile_access" ON public.profiles FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Organization Members: Only Owner/Admin can modify
CREATE POLICY "member_select" ON public.organization_members FOR SELECT TO authenticated USING (public.is_member_of(organization_id));
CREATE POLICY "member_modify" ON public.organization_members FOR ALL TO authenticated 
  USING (public.has_role_in_org(organization_id, ARRAY['owner','admin']))
  WITH CHECK (public.has_role_in_org(organization_id, ARRAY['owner','admin']));

-- Collections & Products: Read for all members, Write for Owner/Admin/Designer
CREATE POLICY "collection_select" ON public.collections FOR SELECT TO authenticated USING (public.is_member_of(organization_id));
CREATE POLICY "collection_modify" ON public.collections FOR ALL TO authenticated 
  USING (public.has_role_in_org(organization_id, ARRAY['owner','admin','designer']))
  WITH CHECK (public.has_role_in_org(organization_id, ARRAY['owner','admin','designer']));

CREATE POLICY "product_select" ON public.products FOR SELECT TO authenticated USING (public.is_member_of(organization_id));
CREATE POLICY "product_modify" ON public.products FOR ALL TO authenticated 
  USING (public.has_role_in_org(organization_id, ARRAY['owner','admin','designer']))
  WITH CHECK (public.has_role_in_org(organization_id, ARRAY['owner','admin','designer']));

-- Technical Tables: Strictly restricted to editors
CREATE POLICY "section_modify" ON public.tech_pack_sections FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.has_role_in_org(p.organization_id, ARRAY['owner','admin','designer']))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.has_role_in_org(p.organization_id, ARRAY['owner','admin','designer']))
);

CREATE POLICY "material_modify" ON public.materials FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.has_role_in_org(p.organization_id, ARRAY['owner','admin','designer']))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.has_role_in_org(p.organization_id, ARRAY['owner','admin','designer']))
);

CREATE POLICY "colorway_modify" ON public.colorways FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.has_role_in_org(p.organization_id, ARRAY['owner','admin','designer']))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.has_role_in_org(p.organization_id, ARRAY['owner','admin','designer']))
);

CREATE POLICY "size_chart_modify" ON public.size_charts FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.has_role_in_org(p.organization_id, ARRAY['owner','admin','designer']))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.has_role_in_org(p.organization_id, ARRAY['owner','admin','designer']))
);

CREATE POLICY "bom_modify" ON public.bom_items FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.has_role_in_org(p.organization_id, ARRAY['owner','admin','designer']))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.has_role_in_org(p.organization_id, ARRAY['owner','admin','designer']))
);

CREATE POLICY "measurement_point_modify" ON public.measurement_points FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.has_role_in_org(p.organization_id, ARRAY['owner','admin','designer']))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.has_role_in_org(p.organization_id, ARRAY['owner','admin','designer']))
);

CREATE POLICY "measurement_value_modify" ON public.measurement_values FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.measurement_points mp 
    JOIN public.products p ON mp.product_id = p.id 
    WHERE mp.id = point_id AND public.has_role_in_org(p.organization_id, ARRAY['owner','admin','designer'])
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.measurement_points mp 
    JOIN public.products p ON mp.product_id = p.id 
    WHERE mp.id = point_id AND public.has_role_in_org(p.organization_id, ARRAY['owner','admin','designer'])
  )
);

CREATE POLICY "file_modify" ON public.product_files FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.has_role_in_org(p.organization_id, ARRAY['owner','admin','designer']))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.has_role_in_org(p.organization_id, ARRAY['owner','admin','designer']))
);

-- Comments & Logs: Read for all, Write for members
CREATE POLICY "comment_read" ON public.comments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.is_member_of(p.organization_id))
);
CREATE POLICY "comment_insert" ON public.comments FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.is_member_of(p.organization_id))
);

CREATE POLICY "activity_log_access" ON public.activity_logs FOR SELECT TO authenticated USING (public.is_member_of(organization_id));
CREATE POLICY "activity_log_insert" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (public.is_member_of(organization_id));

-- Public Shares (Token-based)
CREATE POLICY "public_share_read" ON public.products FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM public.shares s WHERE s.product_id = products.id AND (s.expires_at IS NULL OR s.expires_at > now()))
);

-- ─────────────────────────────────────────────
--  7. PERMISSIONS & GRANTS
-- ─────────────────────────────────────────────

-- Enable RLS for all critical tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_pack_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.size_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colorways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bom_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurement_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurement_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Grant access to all existing tables, sequences and functions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Ensure future objects also have the correct permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- ─────────────────────────────────────────────
--  8. GLOBAL ADMIN HELPERS
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_global_admin(u_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = u_id;
    RETURN user_email = 'toon@vivelevelo.be';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
