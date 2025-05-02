-- Disable Row Level Security completely for the marketing_tasks table
-- This is the most direct way to make it editable in the Supabase dashboard
ALTER TABLE public.marketing_tasks DISABLE ROW LEVEL SECURITY;

-- Grant all privileges to all roles to ensure full access
GRANT ALL ON public.marketing_tasks TO authenticated, anon, service_role;
GRANT USAGE, SELECT ON SEQUENCE public.marketing_tasks_id_seq TO authenticated, anon, service_role;

-- Drop any existing policies that might be causing conflicts
DROP POLICY IF EXISTS "marketing_tasks_select_policy" ON public.marketing_tasks;
DROP POLICY IF EXISTS "marketing_tasks_insert_policy" ON public.marketing_tasks;
DROP POLICY IF EXISTS "marketing_tasks_update_policy" ON public.marketing_tasks;
DROP POLICY IF EXISTS "marketing_tasks_delete_policy" ON public.marketing_tasks;
DROP POLICY IF EXISTS "Allow full access to marketing_tasks" ON public.marketing_tasks;
DROP POLICY IF EXISTS "marketing_tasks_full_access_policy" ON public.marketing_tasks;
