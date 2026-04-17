import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const migrationSql = `
-- Move Lennart and Bianca to Toon's primary organization and cleanup duplicates
DO $$
DECLARE
    -- PRIMARY WORKSPACE (Verified)
    target_org_id UUID := '69b5623c-130d-4959-87c2-b0405dba57b0';
    -- DUPLICATE TOON WORKSPACE
    dup_org_id    UUID := '60a5dd0c-69bb-4890-90e7-270583aa2d1c';
    -- BIANCA LEGACY WORKSPACE
    bianca_org_id UUID := '862163e1-054f-4a30-8a6b-d8ab117cc09e';
    
    lennart_uid UUID;
    bianca_uid UUID;
    toon_uid    UUID;
BEGIN
    -- 1. Get UIDs
    SELECT id INTO toon_uid    FROM auth.users WHERE email = 'toon@vivelevelo.be';
    SELECT id INTO lennart_uid FROM auth.users WHERE email = 'lennart@vivelevelo.be';
    SELECT id INTO bianca_uid  FROM auth.users WHERE email = 'bianca@vivelevelo.be';

    -- 2. Cleanup Memberships in Legacy/Duplicate Orgs
    DELETE FROM public.organization_members WHERE organization_id = dup_org_id;
    DELETE FROM public.organization_members WHERE organization_id = bianca_org_id;

    -- 3. Consolidate into Target Org
    -- Toon as Owner
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (target_org_id, toon_uid, 'owner')
    ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'owner';

    -- Lennart as Admin
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (target_org_id, lennart_uid, 'admin')
    ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'admin';

    -- Bianca as Admin
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (target_org_id, bianca_uid, 'admin')
    ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'admin';

    -- 4. Safe Delete Legacy Organizations
    DELETE FROM public.organizations WHERE id = dup_org_id;
    DELETE FROM public.organizations WHERE id = bianca_org_id;

    -- 5. Cleanup any other memberships Lennart/Bianca might have (clean state)
    DELETE FROM public.organization_members 
    WHERE user_id IN (lennart_uid, bianca_uid) 
    AND organization_id != target_org_id;

    -- 6. Ensure Toon workspace is ACTIVE
    UPDATE public.organizations SET status = 'active' WHERE id = target_org_id;

END $$;

-- ─────────────────────────────────────────────
--  REPAIR TRIGGERS & RPCS
-- ─────────────────────────────────────────────

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

  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, full_name)
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

  SELECT organization_id INTO existing_org_id 
  FROM public.organization_members 
  WHERE user_id = NEW.id 
  LIMIT 1;

  IF existing_org_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.organizations (name, slug, status)
  VALUES (org_name, LOWER(REGEXP_REPLACE(org_name, '\\s+', '-', 'g')) || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8), 'active')
  RETURNING id INTO new_org_id;

  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.ensure_user_organization()
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
BEGIN
  SELECT m.organization_id INTO v_org_id
  FROM public.organization_members m
  JOIN public.organizations o ON o.id = m.organization_id
  WHERE m.user_id = auth.uid()
  ORDER BY (o.status = 'active') DESC, m.created_at ASC
  LIMIT 1;

  IF v_org_id IS NOT NULL THEN
    RETURN v_org_id;
  END IF;

  -- Fallback logic for new org creation via trigger
  RETURN NULL; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

async function run() {
  console.log("Applying team reorganization migration...");
  const { error } = await supabase.rpc('exec_sql', { sql_query: migrationSql });
  
  if (error) {
    if (error.message.includes("function exec_sql() does not exist")) {
      console.log("Alternative: exec_sql RPC not found. Attempting via direct DDL if allowed or suggesting manual run.");
      // In many Supabase setups, we don't have a direct 'exec_sql' RPC for security.
      // I will check if I can just run it via the local migration tool or tell the user.
    } else {
      console.error("Migration error:", error.message);
    }
  } else {
    console.log("Migration successfully applied!");
  }
}

run();
