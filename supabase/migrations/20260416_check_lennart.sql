-- Check Lennart's status
SELECT 
    u.id, 
    u.email, 
    u.email_confirmed_at,
    p.full_name,
    o.name as org_name,
    o.status as org_status
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.organization_members m ON m.user_id = u.id
LEFT JOIN public.organizations o ON o.id = m.organization_id
WHERE u.email = 'lennart@vivelevelo.be';
