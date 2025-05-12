-- File: supabase/migrations/20250508104941_create_altare_completion_email_trigger.sql

-- 1. Define the PostgreSQL function that will be called by the trigger
create or replace function public.handle_altare_task_completed_email_notification()
returns trigger
language plpgsql
security definer -- Important for calling Edge Functions securely from triggers
as $$
declare
  project_url text := 'https://dvuiiloynbrtdrabtzsg.supabase.co'; -- Supabase Project URL from memory
  service_role_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dWlpbG95bmJydGRyYWJ0enNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDMwMzUwOSwiZXhwIjoyMDU5ODc5NTA5fQ.Yk9LHQoLUmJC_-4gYPCXXkh4aPvzOLTcjKQZn-Jzbr8'; -- Service role key
  edge_function_name text := 'notify-client-changes'; -- Name of your Edge Function
  client_email text;
  client_name text;
  action_type text := 'task_completion';
  client_id text := 'client-004'; -- Altare client ID
begin
  -- Get client email from the clients table
  select contactemail, name into client_email, client_name 
  from public.clients 
  where id = client_id;

  -- Check if any completion status column was changed to TRUE
  -- Try different possible column names for completion status
  if (column_exists('client_004_checklist', 'is_completed') and NEW.is_completed = true and OLD.is_completed = false) or
     (column_exists('client_004_checklist', 'completed') and NEW.completed = true and OLD.completed = false) or
     (column_exists('client_004_checklist', 'status') and NEW.status = 'completed' and OLD.status != 'completed') then
    -- Invoke the Supabase Edge Function
    perform net.http_post(
      url:= project_url || '/functions/v1/' || edge_function_name,
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body:=jsonb_build_object(
        'record', row_to_json(NEW),
        'client_id', client_id,
        'client_email', client_email,
        'client_name', client_name,
        'action_type', action_type,
        'task_name', NEW.content,
        'admin_user', current_user,
        'timestamp', now()
      )
    );
  end if;
  return NEW;
end;
$$;

-- 2. Create the trigger on the client_004_checklist table
-- Drop trigger first if it exists to make the script idempotent.
-- Helper function to check if a column exists in a table
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text) RETURNS boolean AS $$
DECLARE
  exists boolean;
BEGIN
  SELECT COUNT(*) > 0 INTO exists
  FROM information_schema.columns
  WHERE table_name = $1
  AND column_name = $2;
  RETURN exists;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
drop trigger if exists on_altare_task_completed_email_trigger on public.client_004_checklist;

-- Create trigger without specifying column (will fire on any update)
create trigger on_altare_task_completed_email_trigger
after update on public.client_004_checklist
for each row
execute function public.handle_altare_task_completed_email_notification();

comment on trigger on_altare_task_completed_email_trigger on public.client_004_checklist is 'Sends an email notification via Edge Function when an Altare checklist item is completed to specific addresses.';

-- 3. Create a more general function for handling admin changes to client data
create or replace function public.handle_client_data_changes()
returns trigger
language plpgsql
security definer
as $$
declare
  project_url text := 'https://dvuiiloynbrtdrabtzsg.supabase.co';
  service_role_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dWlpbG95bmJydGRyYWJ0enNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDMwMzUwOSwiZXhwIjoyMDU5ODc5NTA5fQ.Yk9LHQoLUmJC_-4gYPCXXkh4aPvzOLTcjKQZn-Jzbr8';
  edge_function_name text := 'notify-client-changes';
  client_email text;
  client_name text;
  action_type text;
  table_name text := TG_TABLE_NAME;
  client_id text;
  change_description text;
begin
  -- Determine the client ID based on the table structure
  if table_name = 'client_projects' then
    client_id := NEW.client_id;
    action_type := 'project_update';
    change_description := 'Project ' || NEW.name || ' was updated';
  elsif table_name = 'client_project_tasks' then
    -- Get client_id from the related project
    select client_id into client_id from public.client_projects where id = NEW.project_id;
    action_type := 'task_update';
    change_description := 'Task ' || NEW.name || ' was updated';
  elsif table_name = 'client_checklist_items' then
    client_id := NEW.client_id;
    action_type := 'checklist_update';
    change_description := 'Checklist item ' || NEW.content || ' was updated';
  elsif table_name = 'client_files' then
    client_id := NEW.client_id;
    action_type := 'file_update';
    change_description := 'File ' || NEW.name || ' was updated';
  else
    -- Default case for other tables
    client_id := NEW.client_id;
    action_type := 'data_update';
    change_description := 'Your data was updated';
  end if;

  -- Get client email from the clients table
  select contactemail, name into client_email, client_name 
  from public.clients 
  where id = client_id;

  -- Invoke the Supabase Edge Function
  perform net.http_post(
    url:= project_url || '/functions/v1/' || edge_function_name,
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body:=jsonb_build_object(
      'record', row_to_json(NEW),
      'client_id', client_id,
      'client_email', client_email,
      'client_name', client_name,
      'action_type', action_type,
      'change_description', change_description,
      'table_name', table_name,
      'admin_user', current_user,
      'timestamp', now()
    )
  );
  
  return NEW;
end;
$$;
