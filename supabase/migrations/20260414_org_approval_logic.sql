-- Add status to organizations
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'org_status') THEN
        CREATE TYPE org_status AS ENUM ('pending', 'active', 'suspended');
    END IF;
END $$;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS status org_status DEFAULT 'pending';

-- Migratie: Zet bestaande organisaties op 'active' zodat niemand buitengesloten wordt
UPDATE public.organizations SET status = 'active' WHERE status = 'pending';

-- Helper functie om te checken of iemand Global Admin is (Toon)
CREATE OR REPLACE FUNCTION public.is_global_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = user_id;
    RETURN user_email = 'toon@vivelevelo.be';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
