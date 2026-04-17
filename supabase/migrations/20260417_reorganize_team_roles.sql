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
