-- Script to completely open access to the Altare checklist (client_004_checklist)
-- This makes the table fully accessible with no restrictions

-- First, disable RLS completely on the table
ALTER TABLE public.client_004_checklist DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be restricting access
DROP POLICY IF EXISTS "Allow full access to client_004_checklist" ON public.client_004_checklist;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.client_004_checklist;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.client_004_checklist;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.client_004_checklist;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.client_004_checklist;

-- Grant ALL privileges to ALL roles
GRANT ALL ON public.client_004_checklist TO authenticated, anon, service_role;
GRANT USAGE ON SEQUENCE public.client_004_checklist_id_seq TO authenticated, anon, service_role;

-- Create a completely open policy for all operations
CREATE POLICY "Completely open access to client_004_checklist"
ON public.client_004_checklist
FOR ALL
TO authenticated, anon, service_role
USING (true)
WITH CHECK (true);

-- Ensure the table is publicly accessible
ALTER TABLE public.client_004_checklist OWNER TO postgres;

-- Set all columns to be accessible
ALTER TABLE public.client_004_checklist ALTER COLUMN id SET NOT NULL;
ALTER TABLE public.client_004_checklist ALTER COLUMN feature SET NOT NULL;

-- Make sure the table is included in public schema
COMMENT ON TABLE public.client_004_checklist IS 'Special checklist for Altare (client-004) with completely open access';
