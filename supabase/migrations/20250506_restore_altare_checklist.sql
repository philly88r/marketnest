-- Script to restore the special checklist for client-004 (Altare)
DO $$
BEGIN
    -- Make sure the client_004_checklist table exists and is accessible
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'client_004_checklist'
    ) THEN
        -- Ensure RLS is disabled for this table to allow full access
        ALTER TABLE public.client_004_checklist DISABLE ROW LEVEL SECURITY;
        
        -- Grant all privileges to all roles to ensure full access
        GRANT ALL ON public.client_004_checklist TO authenticated, anon, service_role;
        
        RAISE NOTICE 'Altare special checklist (client_004_checklist) is now fully accessible';
    ELSE
        RAISE EXCEPTION 'client_004_checklist table does not exist';
    END IF;
END
$$;
