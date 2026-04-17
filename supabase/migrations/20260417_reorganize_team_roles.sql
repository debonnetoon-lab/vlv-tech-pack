-- Move Lennart and Bianca to Toon's main organization and set roles
DO $$
DECLARE
    toon_org_id UUID;
    lennart_uid UUID;
    bianca_uid UUID;
BEGIN
    -- 1. Get Toon's main organization ID
    SELECT id INTO toon_org_id FROM public.organizations WHERE name = 'Toon Vive Le Vélo Workspace' LIMIT 1;
    
    IF toon_org_id IS NULL THEN
        RAISE EXCEPTION 'Toon''s main workspace not found.';
    END IF;

    -- 2. Get Lennart's UID
    SELECT id INTO lennart_uid FROM auth.users WHERE email = 'lennart@vivelevelo.be';
    -- Get Bianca's UID (newly created)
    SELECT id INTO bianca_uid FROM auth.users WHERE email = 'bianca@vivelevelo.be';

    -- 3. Ensure Profiles exist
    INSERT INTO public.profiles (id, full_name) VALUES (bianca_uid, 'Bianca') ON CONFLICT (id) DO NOTHING;

    -- 4. Clean up Lennart's old organizations
    DELETE FROM public.organization_members WHERE user_id = lennart_uid AND organization_id != toon_org_id;
    DELETE FROM public.organizations WHERE id NOT IN (SELECT organization_id FROM public.organization_members) AND name LIKE '%Lennart%';

    -- 5. Add/Update Memberships in Toon's Org
    -- Lennart as Admin
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (toon_org_id, lennart_uid, 'admin')
    ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'admin';

    -- Bianca as Admin
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (toon_org_id, bianca_uid, 'admin')
    ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'admin';

    -- 6. Ensure Toon is the ONLY owner (Safety check)
    -- Demote anyone else in Toon's org who might be owner
    UPDATE public.organization_members 
    SET role = 'admin' 
    WHERE organization_id = toon_org_id 
    AND role = 'owner' 
    AND user_id != (SELECT id FROM auth.users WHERE email = 'toon@vivelevelo.be');

END $$;

-- Final verify
SELECT 
    p.full_name, 
    u.email, 
    o.name as organization, 
    m.role as role
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
JOIN public.organization_members m ON m.user_id = u.id
JOIN public.organizations o ON o.id = m.organization_id
WHERE u.email IN ('toon@vivelevelo.be', 'lennart@vivelevelo.be', 'bianca@vivelevelo.be');
