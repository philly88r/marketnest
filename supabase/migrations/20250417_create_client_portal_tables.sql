-- Create client_folders table first (since it's referenced by client_files)
CREATE TABLE IF NOT EXISTS public.client_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    parent_folder_id UUID REFERENCES public.client_folders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT
);

-- Create client_files table (after client_folders)
CREATE TABLE IF NOT EXISTS public.client_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES public.client_folders(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT
);

-- Create client_projects table (before client_project_tasks and client_checklist_items)
CREATE TABLE IF NOT EXISTS public.client_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planning',
    progress INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT
);

-- Create client_project_tasks table (after client_projects)
CREATE TABLE IF NOT EXISTS public.client_project_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'not-started',
    assignee TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT
);

-- Create client_checklist_items table (after client_projects)
CREATE TABLE IF NOT EXISTS public.client_checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.client_projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_folders_client_id ON public.client_folders(client_id);
CREATE INDEX IF NOT EXISTS idx_client_folders_parent_id ON public.client_folders(parent_folder_id);

CREATE INDEX IF NOT EXISTS idx_client_files_client_id ON public.client_files(client_id);
CREATE INDEX IF NOT EXISTS idx_client_files_folder_id ON public.client_files(folder_id);

CREATE INDEX IF NOT EXISTS idx_client_projects_client_id ON public.client_projects(client_id);

CREATE INDEX IF NOT EXISTS idx_client_project_tasks_project_id ON public.client_project_tasks(project_id);

CREATE INDEX IF NOT EXISTS idx_client_checklist_client_id ON public.client_checklist_items(client_id);
CREATE INDEX IF NOT EXISTS idx_client_checklist_project_id ON public.client_checklist_items(project_id);

-- Add RLS (Row Level Security) policies
-- Folders
ALTER TABLE public.client_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_folders_policy ON public.client_folders 
    FOR ALL 
    USING (client_id = auth.uid()::text OR auth.role() = 'authenticated');

-- Files
ALTER TABLE public.client_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_files_policy ON public.client_files 
    FOR ALL 
    USING (client_id = auth.uid()::text OR auth.role() = 'authenticated');

-- Projects
ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_projects_policy ON public.client_projects 
    FOR ALL 
    USING (client_id = auth.uid()::text OR auth.role() = 'authenticated');

-- Project Tasks
ALTER TABLE public.client_project_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_project_tasks_policy ON public.client_project_tasks 
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.client_projects p 
        WHERE p.id = client_project_tasks.project_id 
        AND (p.client_id = auth.uid()::text OR auth.role() = 'authenticated')
    ));

-- Checklist Items
ALTER TABLE public.client_checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_checklist_policy ON public.client_checklist_items 
    FOR ALL 
    USING (client_id = auth.uid()::text OR auth.role() = 'authenticated');

-- Enable realtime subscriptions for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_folders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_files;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_project_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_checklist_items;

-- Add storage bucket for client files if it doesn't exist
-- Note: This requires admin privileges and might need to be done in the Supabase dashboard
-- INSERT INTO storage.buckets (id, name, public) VALUES ('client-files', 'Client Files', false)
-- ON CONFLICT (id) DO NOTHING;

-- Add comments to tables
COMMENT ON TABLE public.client_folders IS 'Organizes client files into folders';
COMMENT ON TABLE public.client_files IS 'Stores files uploaded by clients';
COMMENT ON TABLE public.client_projects IS 'Manages client projects';
COMMENT ON TABLE public.client_project_tasks IS 'Tracks tasks within client projects';
COMMENT ON TABLE public.client_checklist_items IS 'Tracks tasks and to-do items for clients';
