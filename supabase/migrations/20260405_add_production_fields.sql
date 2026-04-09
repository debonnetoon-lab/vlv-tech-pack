-- Phase 1 & 2: Addition of production-critical fields

-- Update ARTIKELEN table
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS customer_po TEXT,
ADD COLUMN IF NOT EXISTS disclaimer_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS disclaimer_text TEXT;

-- Update ARTWORK_PLACEMENTS table
ALTER TABLE public.artwork_placements
ADD COLUMN IF NOT EXISTS print_order_number INTEGER,
ADD COLUMN IF NOT EXISTS reference_point TEXT DEFAULT 'Halsnaad',
ADD COLUMN IF NOT EXISTS reference_distance NUMERIC(5,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tolerance_cm NUMERIC(4,2) DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS technique_subtype TEXT,
ADD COLUMN IF NOT EXISTS application_method TEXT DEFAULT 'Hittepers',
ADD COLUMN IF NOT EXISTS color_ids JSONB DEFAULT '[]';

-- Optional: Add comments for clarity in Supabase Dashboard
COMMENT ON COLUMN public.articles.customer_po IS 'External PO number for production tracking';
COMMENT ON COLUMN public.artwork_placements.print_order_number IS 'Manual override for print sequence';
COMMENT ON COLUMN public.artwork_placements.reference_point IS 'Point of measurement (e.g. Neck, Shoulder)';
