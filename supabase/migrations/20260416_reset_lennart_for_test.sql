-- Reset Lennart for testing
DO $$
DECLARE
    l_uid UUID;
    l_org_id UUID;
BEGIN
    -- 1. Get Lennart's UID
    SELECT id INTO l_uid FROM auth.users WHERE email = 'lennart@vivelevelo.be';
    
    IF l_uid IS NULL THEN
        RAISE EXCEPTION 'Lennart not found. Please register him first or check email.';
    END IF;

    -- 2. Ensure Profile exists
    INSERT INTO public.profiles (id, full_name)
    VALUES (l_uid, 'Lennart Creël')
    ON CONFLICT (id) DO UPDATE SET full_name = 'Lennart Creël';

    -- 3. Create/Reset Organization
    -- First, check if he already has one
    SELECT organization_id INTO l_org_id FROM public.organization_members WHERE user_id = l_uid AND role = 'owner' LIMIT 1;

    IF l_org_id IS NULL THEN
        INSERT INTO public.organizations (name, slug, status)
        VALUES ('VLV Studio Lennart', 'vlv-studio-lennart', 'pending')
        RETURNING id INTO l_org_id;
        
        INSERT INTO public.organization_members (organization_id, user_id, role)
        VALUES (l_org_id, l_uid, 'owner');
    ELSE
        UPDATE public.organizations SET status = 'pending', name = 'VLV Studio Lennart (Test)' WHERE id = l_org_id;
    END IF;

END $$;
