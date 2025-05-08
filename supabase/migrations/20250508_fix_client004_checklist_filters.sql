-- Script to fix the filtering functionality in the client_004_checklist
-- Date: 2025-05-08

-- First, make sure the 'complete' column exists and is properly defined as a boolean
DO $$
BEGIN
    -- Check if the complete column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'client_004_checklist' 
        AND column_name = 'complete'
    ) THEN
        -- Add the complete column if it doesn't exist
        ALTER TABLE public.client_004_checklist 
        ADD COLUMN complete BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Added missing complete column to client_004_checklist';
    ELSE
        -- Make sure the complete column is properly defined as boolean
        ALTER TABLE public.client_004_checklist 
        ALTER COLUMN complete TYPE BOOLEAN USING complete::boolean;
        
        -- Set default value for complete column
        ALTER TABLE public.client_004_checklist 
        ALTER COLUMN complete SET DEFAULT false;
        
        RAISE NOTICE 'Ensured complete column is properly defined as boolean';
    END IF;
    
    -- Make sure any NULL values in complete column are set to false
    UPDATE public.client_004_checklist
    SET complete = false
    WHERE complete IS NULL;
    
    RAISE NOTICE 'Fixed NULL values in complete column';
    
    -- Create an index on the complete column to improve filter performance
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'client_004_checklist'
        AND indexname = 'idx_client_004_checklist_complete'
    ) THEN
        CREATE INDEX idx_client_004_checklist_complete
        ON public.client_004_checklist (complete);
        
        RAISE NOTICE 'Created index on complete column for better filter performance';
    END IF;
END
$$;

-- Update the table comment to document the changes
COMMENT ON TABLE public.client_004_checklist IS 'Special checklist for Altare (client-004) with fixed filtering functionality as of May 8, 2025';
