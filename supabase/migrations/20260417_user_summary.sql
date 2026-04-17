-- Get summary of all users, roles and organizations
SELECT 
    p.full_name,
    u.email,
    o.name as organization,
    m.role as user_role,
    o.status as org_status,
    CASE WHEN ga.user_id IS NOT NULL THEN 'YES' ELSE 'NO' END as is_global_admin,
    u.created_at as joined_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.organization_members m ON m.user_id = u.id
LEFT JOIN public.organizations o ON o.id = m.organization_id
LEFT JOIN public.global_admins ga ON ga.user_id = u.id
ORDER BY u.created_at DESC;
