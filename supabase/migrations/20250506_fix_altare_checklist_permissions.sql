-- Script to fix permissions for the Altare checklist (client_004_checklist)
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
        
        -- Drop any existing policies that might be causing issues
        DROP POLICY IF EXISTS "Allow full access to client_004_checklist" ON public.client_004_checklist;
        
        -- Grant all privileges to all roles to ensure full access
        GRANT ALL ON public.client_004_checklist TO authenticated, anon, service_role;
        
        -- Create a policy to allow all operations for all users
        CREATE POLICY "Allow full access to client_004_checklist"
        ON public.client_004_checklist
        FOR ALL
        TO authenticated, anon, service_role
        USING (true)
        WITH CHECK (true);
        
        RAISE NOTICE 'Altare special checklist (client_004_checklist) permissions fixed';
    ELSE
        RAISE EXCEPTION 'client_004_checklist table does not exist';
    END IF;
END
$$;
