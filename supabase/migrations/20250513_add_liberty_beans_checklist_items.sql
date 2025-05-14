-- Add new checklist items for Liberty Beans Coffee
-- Run this script in the Supabase SQL Editor

-- Check if items already exist to prevent duplicates
DO $$
BEGIN

  -- Video on YouTube & TikTok
  IF NOT EXISTS (SELECT 1 FROM client_checklist_items WHERE client_id = 'client-liberty-beans' AND content = 'Video on YouTube & TikTok (already put together)') THEN
    INSERT INTO client_checklist_items (client_id, content, is_completed, due_date, created_by)
    VALUES ('client-liberty-beans', 'Video on YouTube & TikTok (already put together)', false, '2025-05-20 00:00:00+00', 'client-liberty-beans');
  END IF;

  -- Optimize Google Business Page
  IF NOT EXISTS (SELECT 1 FROM client_checklist_items WHERE client_id = 'client-liberty-beans' AND content = 'Optimize the Google Business Page (new tool to optimize perfectly)') THEN
    INSERT INTO client_checklist_items (client_id, content, is_completed, due_date, created_by)
    VALUES ('client-liberty-beans', 'Optimize the Google Business Page (new tool to optimize perfectly)', false, '2025-05-17 00:00:00+00', 'client-liberty-beans');
  END IF;

  -- Write Charleston coffee piece
  IF NOT EXISTS (SELECT 1 FROM client_checklist_items WHERE client_id = 'client-liberty-beans' AND content = 'Write a local Charleston coffee piece for website, Medium and Local News App') THEN
    INSERT INTO client_checklist_items (client_id, content, is_completed, due_date, created_by)
    VALUES ('client-liberty-beans', 'Write a local Charleston coffee piece for website, Medium and Local News App', false, '2025-05-22 00:00:00+00', 'client-liberty-beans');
  END IF;

  -- Send email newsletter
  IF NOT EXISTS (SELECT 1 FROM client_checklist_items WHERE client_id = 'client-liberty-beans' AND content = 'Send email newsletter') THEN
    INSERT INTO client_checklist_items (client_id, content, is_completed, due_date, created_by)
    VALUES ('client-liberty-beans', 'Send email newsletter', false, '2025-05-14 00:00:00+00', 'client-liberty-beans');
  END IF;

END;
$$;
