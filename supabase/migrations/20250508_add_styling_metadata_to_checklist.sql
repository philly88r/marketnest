-- Script to add styling metadata to client_004_checklist
-- Date: 2025-05-08

-- Add styling preferences to the checklist table
ALTER TABLE public.client_004_checklist 
ADD COLUMN IF NOT EXISTS ui_settings JSONB DEFAULT '{
  "background": "blue",
  "buttons": "orangered",
  "text": "eggshell",
  "branded_red": "#FF4136",
  "branded_pink": "#FFDDEE",
  "title": "Planning Checklist",
  "vendor_directory": {
    "search_bar_color": "red",
    "photobox_size": "small"
  },
  "notifications": {
    "email_on_complete": true
  },
  "integrations": {
    "pinterest_api": true
  }
}'::jsonb;

-- Update the table comment to document the changes
COMMENT ON TABLE public.client_004_checklist IS 'Special checklist for Altare (client-004) with styling metadata added as of May 8, 2025';

-- Create a function to notify when a task is completed
CREATE OR REPLACE FUNCTION notify_task_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger when a task is marked as complete
    IF NEW.complete = TRUE AND (OLD.complete = FALSE OR OLD.complete IS NULL) THEN
        -- In a real implementation, this would send an email notification
        -- For now, we just log the event
        RAISE NOTICE 'Task completed: %', NEW.feature;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function when a task is completed
DROP TRIGGER IF EXISTS task_completion_trigger ON public.client_004_checklist;
CREATE TRIGGER task_completion_trigger
AFTER UPDATE ON public.client_004_checklist
FOR EACH ROW
EXECUTE FUNCTION notify_task_completion();
