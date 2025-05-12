-- Script to add new items to the Altare checklist (client_004_checklist)
-- Date: 2025-05-08

-- Define the UI settings JSON that will be used for all items
DO $$
DECLARE
    ui_settings_json JSONB := '{
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
    
    -- Get the maximum ID to ensure we add items with new IDs
    max_id INTEGER;
BEGIN
    -- Get the current maximum ID
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM public.client_004_checklist;
    
    -- Add the new checklist items
    
    -- Guest list and budget items
    INSERT INTO public.client_004_checklist (id, feature, to_adjust, complete_by, notes_from, assigned_to, complete, ui_settings)
    VALUES 
    (max_id + 1, 'Guest list, budget and planning timeline', '1st paid task on dashboard', NULL, 'Important planning tools', NULL, false, ui_settings_json);
    
    -- Address book item
    INSERT INTO public.client_004_checklist (id, feature, to_adjust, complete_by, notes_from, assigned_to, complete, ui_settings)
    VALUES 
    (max_id + 2, 'Address book, budget, planning timeline, floorplan', 'Combined planning tools', NULL, 'Essential planning resources', NULL, false, ui_settings_json);
    
    -- Vendor directory add-on
    INSERT INTO public.client_004_checklist (id, feature, to_adjust, complete_by, notes_from, assigned_to, complete, ui_settings)
    VALUES 
    (max_id + 3, 'Vendor directory - New York area', 'Add-on service', NULL, 'Special add-on service for New York area', NULL, false, ui_settings_json);
    
    -- Day of coordination add-on
    INSERT INTO public.client_004_checklist (id, feature, to_adjust, complete_by, notes_from, assigned_to, complete, ui_settings)
    VALUES 
    (max_id + 4, 'Day of coordination', 'Add-on service', NULL, 'Special add-on service', NULL, false, ui_settings_json);
    
    -- Journal update
    INSERT INTO public.client_004_checklist (id, feature, to_adjust, complete_by, notes_from, assigned_to, complete, ui_settings)
    VALUES 
    (max_id + 5, 'Journal for Your Why and divide day', 'Update journal functionality', NULL, 'Personalize planning experience', NULL, false, ui_settings_json);
    
    -- Pinterest API integration
    INSERT INTO public.client_004_checklist (id, feature, to_adjust, complete_by, notes_from, assigned_to, complete, ui_settings)
    VALUES 
    (max_id + 6, 'Pinterest API integration', 'Mood generator enhancement', NULL, 'Add Pinterest API to the mood generator', NULL, false, ui_settings_json);
    
    -- Email notifications
    INSERT INTO public.client_004_checklist (id, feature, to_adjust, complete_by, notes_from, assigned_to, complete, ui_settings)
    VALUES 
    (max_id + 7, 'Task completion notifications', 'Email feature', NULL, 'Send notification email when task is completed', NULL, false, ui_settings_json);
    
    -- Vendor directory search
    INSERT INTO public.client_004_checklist (id, feature, to_adjust, complete_by, notes_from, assigned_to, complete, ui_settings)
    VALUES 
    (max_id + 8, 'Vendor directory search categories', 'Add search bar and category filters', NULL, 'Place at top of vendor directory in red', NULL, false, ui_settings_json);
    
    -- Vendor directory photobox
    INSERT INTO public.client_004_checklist (id, feature, to_adjust, complete_by, notes_from, assigned_to, complete, ui_settings)
    VALUES 
    (max_id + 9, 'Reduce photobox size in vendor directory', 'UI adjustment', NULL, 'Make photobox smaller for better layout', NULL, false, ui_settings_json);
    
    RAISE NOTICE 'Added % new items to the Altare checklist', 9;
END
$$;
