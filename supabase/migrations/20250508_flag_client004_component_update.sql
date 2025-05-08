-- Script to flag that the Client004Checklist component needs to be updated
-- Date: 2025-05-08

-- Add a metadata entry to indicate the component needs updating
DO $$
BEGIN
    -- First check if the meta_settings table exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'meta_settings'
    ) THEN
        -- Create the meta_settings table if it doesn't exist
        CREATE TABLE public.meta_settings (
            id SERIAL PRIMARY KEY,
            key TEXT NOT NULL UNIQUE,
            value TEXT,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created meta_settings table';
    END IF;
    
    -- Insert or update the flag for Client004Checklist component update
    INSERT INTO public.meta_settings (key, value, description)
    VALUES (
        'client004_checklist_needs_update', 
        'true', 
        'Flag indicating that the Client004Checklist component needs to be updated to fix filter tabs and styling'
    )
    ON CONFLICT (key) 
    DO UPDATE SET 
        value = 'true',
        description = 'Flag indicating that the Client004Checklist component needs to be updated to fix filter tabs and styling';
    
    RAISE NOTICE 'Set flag for Client004Checklist component update';
    
    -- Also add a note to the client_004_checklist table comment
    COMMENT ON TABLE public.client_004_checklist IS 'Special checklist for Altare (client-004) - COMPONENT NEEDS UPDATE: Filter tabs not working';
    
    RAISE NOTICE 'Updated table comment to indicate component issue';
END
$$;
