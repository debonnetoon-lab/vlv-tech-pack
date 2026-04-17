SELECT
    conname as constraint_name,
    conkey as column_indexes,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE n.nspname = 'public' AND contypid = 'public.organization_members'::regclass;
