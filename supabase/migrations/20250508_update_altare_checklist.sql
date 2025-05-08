-- Script to update the Altare checklist (client_004_checklist) content
-- Date: 2025-05-08

-- Remove "wedding planner" from the beginning of feature text
UPDATE public.client_004_checklist
SET feature = regexp_replace(feature, '^wedding planner\s*[:,-]?\s*', '', 'i')
WHERE feature ILIKE 'wedding planner%';

-- Change "Create your guest list and budget" to "Guest list, budget and planning timeline" for the 1st paid task
UPDATE public.client_004_checklist
SET feature = 'Guest list, budget and planning timeline'
WHERE feature ILIKE '%guest list and budget%' 
AND notes_from ILIKE '%1st paid%';

-- Update "Address book, budget, planning timeline, floorplan"
UPDATE public.client_004_checklist
SET feature = 'Address book, budget, planning timeline, floorplan'
WHERE feature ILIKE '%address book%' OR feature ILIKE '%budget%planning%';

-- Add vendor directory for New York area
INSERT INTO public.client_004_checklist (feature, to_adjust, notes_from, complete)
VALUES ('Vendor directory - New York area', 'Add-on service', 'Special add-on service for New York area', false);

-- Add day of coordination
INSERT INTO public.client_004_checklist (feature, to_adjust, notes_from, complete)
VALUES ('Day of coordination', 'Add-on service', 'Special add-on service', false);

-- Update journal for "Your Why" and divide day
UPDATE public.client_004_checklist
SET feature = 'Journal for Your Why and divide day'
WHERE feature ILIKE '%journal%';

-- Remove "first, second, third" in checklist items
UPDATE public.client_004_checklist
SET feature = regexp_replace(feature, '(first|second|third)\s+', '', 'ig')
WHERE feature ~* '(first|second|third)';

-- Add dates to the quarters
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

-- Add search bar category metadata for vendor directory
INSERT INTO public.client_004_checklist (feature, to_adjust, notes_from, complete)
VALUES ('Vendor directory search categories', 'Configuration', 'Search bar and category filters at top of vendor directory in red', false);

-- Add Pinterest API integration for mood generator
INSERT INTO public.client_004_checklist (feature, to_adjust, notes_from, complete)
VALUES ('Pinterest API integration', 'Mood generator enhancement', 'Add Pinterest API integration to the mood generator', false);

-- Add notification email feature
INSERT INTO public.client_004_checklist (feature, to_adjust, notes_from, complete)
VALUES ('Task completion notifications', 'Email feature', 'Send notification email when task is completed', false);

-- Update the table comment to document the changes
COMMENT ON TABLE public.client_004_checklist IS 'Special checklist for Altare (client-004) with updated content as of May 8, 2025';
