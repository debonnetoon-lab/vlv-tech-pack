-- 1. GLOBAL ADMINS TABLE (IMMUTABLE)
CREATE TABLE IF NOT EXISTS public.global_admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Protect table from client-side writes
ALTER TABLE public.global_admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "global_admins_read_only" ON public.global_admins;
CREATE POLICY "global_admins_read_only" ON public.global_admins FOR SELECT TO authenticated USING (true);
-- No policies for INSERT, UPDATE, DELETE means they are denied by default for all users.

-- Populate with Toon
INSERT INTO public.global_admins (user_id)
SELECT id FROM auth.users WHERE email = 'toon@vivelevelo.be'
ON CONFLICT DO NOTHING;

-- 2. HARDENED ADMIN CHECK FUNCTION
CREATE OR REPLACE FUNCTION public.is_global_admin(u_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.global_admins WHERE user_id = u_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. HARDENED ORGANIZATIONS RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_select_hardened" ON public.organizations;
CREATE POLICY "org_select_hardened" ON public.organizations 
FOR SELECT TO authenticated 
USING (
    public.is_global_admin(auth.uid()) OR 
    EXISTS (
        SELECT 1 FROM public.organization_members m 
        WHERE m.organization_id = id AND m.user_id = auth.uid()
    )
);

-- 4. PENDING ORGANIZATIONS RPC
CREATE OR REPLACE FUNCTION public.get_pending_organizations()
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    created_at TIMESTAMPTZ,
    owner_email TEXT,
    owner_name TEXT
) AS $$
BEGIN
    -- Security Check
    IF NOT public.is_global_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied. Global Admin only.';
    END IF;

    RETURN QUERY
    SELECT 
        o.id, 
        o.name, 
        o.slug, 
        o.created_at, 
        u.email as owner_email,
        p.full_name as owner_name
    FROM public.organizations o
    JOIN public.organization_members m ON m.organization_id = o.id AND m.role = 'owner'
    JOIN auth.users u ON u.id = m.user_id
    JOIN public.profiles p ON p.id = u.id
    WHERE o.status = 'pending'
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. APPROVE ORGANIZATION RPC
CREATE OR REPLACE FUNCTION public.approve_organization(target_org_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Security Check
    IF NOT public.is_global_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied. Global Admin only.';
    END IF;

    UPDATE public.organizations 
    SET status = 'active', updated_at = now()
    WHERE id = target_org_id;

    -- Log activity
    INSERT INTO public.activity_logs (organization_id, user_id, action, entity_type, entity_id)
    VALUES (target_org_id, auth.uid(), 'approved', 'organization', target_org_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
