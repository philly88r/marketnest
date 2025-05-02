-- First, check if the table exists to avoid errors
DO $$
BEGIN
    -- Drop existing policies on marketing_tasks table if they exist
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'marketing_tasks') THEN
        -- Drop all existing policies
        DROP POLICY IF EXISTS "marketing_tasks_select_policy" ON public.marketing_tasks;
        DROP POLICY IF EXISTS "marketing_tasks_insert_policy" ON public.marketing_tasks;
        DROP POLICY IF EXISTS "marketing_tasks_update_policy" ON public.marketing_tasks;
        DROP POLICY IF EXISTS "marketing_tasks_delete_policy" ON public.marketing_tasks;
        DROP POLICY IF EXISTS "Allow full access to marketing_tasks" ON public.marketing_tasks;
        DROP POLICY IF EXISTS "marketing_tasks_full_access_policy" ON public.marketing_tasks;
        
        -- Disable RLS temporarily to allow initial data loading
        ALTER TABLE public.marketing_tasks DISABLE ROW LEVEL SECURITY;
        
        -- Create a single policy for full access
        -- This is the most permissive setting that will allow editing in the Supabase dashboard
        CREATE POLICY "marketing_tasks_full_access_policy" 
        ON public.marketing_tasks
        FOR ALL
        USING (true)
        WITH CHECK (true);
        
        -- Grant all privileges to authenticated users and anon
        GRANT ALL ON public.marketing_tasks TO authenticated, anon, service_role;
        GRANT USAGE, SELECT ON SEQUENCE public.marketing_tasks_id_seq TO authenticated, anon, service_role;
        
        -- Re-enable RLS with the new permissive policy
        ALTER TABLE public.marketing_tasks ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Marketing tasks policies updated successfully';
    ELSE
        RAISE NOTICE 'Marketing tasks table does not exist, skipping policy updates';
    END IF;
END
$$;
