-- Script to make client_checklist_items fully editable by anyone
DO $$
BEGIN
    -- Drop the existing restrictive policy
    DROP POLICY IF EXISTS "client_checklist_policy" ON public.client_checklist_items;
    
    -- Disable Row Level Security completely
    ALTER TABLE public.client_checklist_items DISABLE ROW LEVEL SECURITY;
    
    -- Grant all privileges to all roles to ensure full access
    GRANT ALL ON public.client_checklist_items TO authenticated, anon, service_role;
    
    RAISE NOTICE 'Client checklist items table is now fully editable by anyone';
END
$$;
