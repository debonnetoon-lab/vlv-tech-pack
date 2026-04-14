-- 1. Helper Updates
-- Update is_member_of to include Status check for non-admins
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

-- Update has_role_in_org to handle Global Admin and Status
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

-- 2. Deletion Safeguards (Triggers)
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

    -- 1. Prevent self-deletion (unless it is a "Leave Workspace" feature, but user asked to block it)
    IF OLD.user_id = deleter_id THEN
        RAISE EXCEPTION 'Je kunt jezelf niet verwijderen. Neem contact op met een andere beheerder of support.';
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

-- 3. Profiles Sync & Global Admin Check refinement
-- Ensure profile role exists (some parts of the app use public.profiles.role)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'input';
    END IF;
END $$;
