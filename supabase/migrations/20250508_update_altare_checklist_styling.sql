-- Script to update the Altare checklist (client_004_checklist) styling and content
-- Date: 2025-05-08

DO $$
DECLARE
    style_record RECORD;
BEGIN
    -- Check if the client_004_checklist table exists
    SELECT 1 INTO style_record
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'client_004_checklist';
    
    IF FOUND THEN
        -- 1. Update the CSS variables in the Client004Checklist component
        -- This will be done through a separate update to the React component
        
        -- 2. Remove "wedding planner" from the beginning of feature text
        UPDATE public.client_004_checklist
        SET feature = regexp_replace(feature, '^wedding planner\s*[:,-]?\s*', '', 'i')
        WHERE feature ILIKE 'wedding planner%';
        
        -- 3. Update specific task names
        -- Change "Create your guest list and budget" to "Guest list, budget and planning timeline" for the 1st paid task
        UPDATE public.client_004_checklist
        SET feature = 'Guest list, budget and planning timeline'
        WHERE feature ILIKE '%guest list and budget%' 
        AND notes_from ILIKE '%1st paid%';
        
        -- 4. Update "Address book, budget, planning timeline, floorplan"
        UPDATE public.client_004_checklist
        SET feature = 'Address book, budget, planning timeline, floorplan'
        WHERE feature ILIKE '%address book%' OR feature ILIKE '%budget%planning%';
        
        -- 5. Add vendor directory for New York area
        INSERT INTO public.client_004_checklist (feature, to_adjust, notes_from, complete)
        VALUES ('Vendor directory - New York area', 'Add-on service', 'Special add-on service for New York area', false)
        ON CONFLICT (feature) DO NOTHING;
        
        -- 6. Add day of coordination
        INSERT INTO public.client_004_checklist (feature, to_adjust, notes_from, complete)
        VALUES ('Day of coordination', 'Add-on service', 'Special add-on service', false)
        ON CONFLICT (feature) DO NOTHING;
        
        -- 7. Update journal for "Your Why" and divide day
        UPDATE public.client_004_checklist
        SET feature = 'Journal for Your Why and divide day'
        WHERE feature ILIKE '%journal%';
        
        -- 8. Change "Wedding planning checklist" name
        -- This will be handled in the React component update
        
        -- 9. Remove "first, second, third" in checklist items
        UPDATE public.client_004_checklist
        SET feature = regexp_replace(feature, '(first|second|third)\s+', '', 'ig')
        WHERE feature ~* '(first|second|third)';
        
        -- 10. Add dates to the quarters
        -- First quarter
        UPDATE public.client_004_checklist
        SET feature = regexp_replace(feature, 'first quarter', 'Q1 (Jan-Mar)', 'ig')
        WHERE feature ~* 'first quarter';
        
        -- Second quarter
        UPDATE public.client_004_checklist
        SET feature = regexp_replace(feature, 'second quarter', 'Q2 (Apr-Jun)', 'ig')
        WHERE feature ~* 'second quarter';
        
        -- Third quarter
        UPDATE public.client_004_checklist
        SET feature = regexp_replace(feature, 'third quarter', 'Q3 (Jul-Sep)', 'ig')
        WHERE feature ~* 'third quarter';
        
        -- Fourth quarter
        UPDATE public.client_004_checklist
        SET feature = regexp_replace(feature, 'fourth quarter', 'Q4 (Oct-Dec)', 'ig')
        WHERE feature ~* 'fourth quarter';
        
        -- 11. Add search bar and category for vendor directory
        -- This will be handled in the React component update
        
        -- 12. Add notification email when task is completed
        -- This will be handled in the React component update
        
        RAISE NOTICE 'Altare checklist content has been updated successfully';
    ELSE
        RAISE EXCEPTION 'client_004_checklist table does not exist';
    END IF;
END
$$;

-- Add a comment to document the changes
COMMENT ON TABLE public.client_004_checklist IS 'Special checklist for Altare (client-004) with updated styling and content as of May 8, 2025';
