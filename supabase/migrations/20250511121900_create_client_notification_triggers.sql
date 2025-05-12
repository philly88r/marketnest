-- File: supabase/migrations/20250511121900_create_client_notification_triggers.sql

-- Create triggers for client_projects table
drop trigger if exists on_client_project_update_email_trigger on public.client_projects;

create trigger on_client_project_update_email_trigger
after update on public.client_projects
for each row
execute function public.handle_client_data_changes();

comment on trigger on_client_project_update_email_trigger on public.client_projects is 'Sends an email notification via Edge Function when a client project is updated.';

-- Create triggers for client_project_tasks table
drop trigger if exists on_client_project_task_update_email_trigger on public.client_project_tasks;

create trigger on_client_project_task_update_email_trigger
after update on public.client_project_tasks
for each row
execute function public.handle_client_data_changes();

comment on trigger on_client_project_task_update_email_trigger on public.client_project_tasks is 'Sends an email notification via Edge Function when a client task is updated.';

-- Create triggers for client_checklist_items table
drop trigger if exists on_client_checklist_update_email_trigger on public.client_checklist_items;

create trigger on_client_checklist_update_email_trigger
after update on public.client_checklist_items
for each row
execute function public.handle_client_data_changes();

comment on trigger on_client_checklist_update_email_trigger on public.client_checklist_items is 'Sends an email notification via Edge Function when a client checklist item is updated.';

-- Create triggers for client_files table
drop trigger if exists on_client_file_update_email_trigger on public.client_files;

create trigger on_client_file_update_email_trigger
after update on public.client_files
for each row
execute function public.handle_client_data_changes();

comment on trigger on_client_file_update_email_trigger on public.client_files is 'Sends an email notification via Edge Function when a client file is updated.';
