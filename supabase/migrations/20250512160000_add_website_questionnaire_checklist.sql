-- Script to add website questionnaire checklist items for client_004
-- Date: 2025-05-12

-- First, let's add a new category field if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'client_004_checklist' 
        AND column_name = 'category'
    ) THEN
        -- Add the category column if it doesn't exist
        ALTER TABLE public.client_004_checklist 
        ADD COLUMN category VARCHAR(50) DEFAULT 'general';
        
        RAISE NOTICE 'Added missing category column to client_004_checklist';
    END IF;
END
$$;

-- Update existing items to have the 'general' category
UPDATE public.client_004_checklist
SET category = 'general'
WHERE category IS NULL;

-- Add website questionnaire checklist items
INSERT INTO public.client_004_checklist (feature, to_adjust, notes_from, complete, category)
VALUES 
    ('Website color scheme preferences', 'Website Design', 'Client should specify preferred colors', false, 'website'),
    ('Logo requirements', 'Website Design', 'Upload logo files or specify design needs', false, 'website'),
    ('Website structure and pages', 'Website Architecture', 'Outline of main pages and navigation structure', false, 'website'),
    ('Content requirements', 'Website Content', 'Text content for main pages, product descriptions, etc.', false, 'website'),
    ('Image and media assets', 'Website Media', 'Photos, videos, and other media elements', false, 'website'),
    ('Functionality requirements', 'Website Features', 'E-commerce, contact forms, booking systems, etc.', false, 'website'),
    ('SEO requirements', 'Website SEO', 'Keywords, meta descriptions, and SEO goals', false, 'website'),
    ('Social media integration', 'Website Integration', 'Which platforms to connect and how', false, 'website'),
    ('Analytics preferences', 'Website Analytics', 'Google Analytics, Facebook Pixel, etc.', false, 'website'),
    ('Mobile responsiveness priorities', 'Website Responsiveness', 'Specific mobile design requirements', false, 'website'),
    ('Competitor websites for reference', 'Website Inspiration', 'Links to competitors or inspirational sites', false, 'website'),
    ('Domain and hosting information', 'Website Technical', 'Domain name, hosting preferences, existing accounts', false, 'website'),
    ('Target audience details', 'Website Strategy', 'Who the website is primarily targeting', false, 'website'),
    ('Call-to-action preferences', 'Website Conversion', 'Primary actions you want visitors to take', false, 'website'),
    ('Timeline expectations', 'Website Project', 'Expected launch date and milestone deadlines', false, 'website');

-- Create an index on the category column to improve filter performance
IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE tablename = 'client_004_checklist'
    AND indexname = 'idx_client_004_checklist_category'
) THEN
    CREATE INDEX idx_client_004_checklist_category
    ON public.client_004_checklist (category);
    
    RAISE NOTICE 'Created index on category column for better filter performance';
END IF;

-- Update the UI settings to include the website questionnaire tab
UPDATE public.client_004_checklist
SET ui_settings = jsonb_set(
    COALESCE(ui_settings, '{}'::jsonb),
    '{tabs}',
    COALESCE(
        (ui_settings->'tabs'),
        '[]'::jsonb
    ) || jsonb_build_array(
        jsonb_build_object(
            'id', 'website',
            'label', 'Website Questionnaire',
            'icon', 'web',
            'color', '#4285F4'
        )
    )
)
WHERE ui_settings->'tabs' IS NULL OR NOT ui_settings->'tabs' @> '[{"id":"website"}]'::jsonb
LIMIT 1;

-- Update the table comment to document the changes
COMMENT ON TABLE public.client_004_checklist IS 'Special checklist for Altare (client-004) with website questionnaire items added as of May 12, 2025';
