-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  logo TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_folders table
CREATE TABLE IF NOT EXISTS client_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  parent_folder_id UUID REFERENCES client_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_files table
CREATE TABLE IF NOT EXISTS client_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  size INTEGER,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES client_folders(id) ON DELETE SET NULL,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create checklist_items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table (to store project data that's currently mocked)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'planning',
  progress INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'not-started',
  assignee TEXT,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_folders_client_id ON client_folders(client_id);
CREATE INDEX IF NOT EXISTS idx_client_folders_parent_id ON client_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_client_files_client_id ON client_files(client_id);
CREATE INDEX IF NOT EXISTS idx_client_files_folder_id ON client_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_client_id ON checklist_items(client_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_project_id ON checklist_items(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);

-- Create Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (authenticated users with admin role)
CREATE POLICY admin_clients_policy ON clients 
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_folders_policy ON client_folders 
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_files_policy ON client_files 
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_checklist_policy ON checklist_items 
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_projects_policy ON projects 
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_tasks_policy ON project_tasks 
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- Create policies for client access (clients can only access their own data)
CREATE POLICY client_own_data_policy ON clients 
  FOR SELECT USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'client_id' = id::text);

CREATE POLICY client_folders_policy ON client_folders 
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'client_id' = client_id::text);

CREATE POLICY client_files_policy ON client_files 
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'client_id' = client_id::text);

CREATE POLICY client_checklist_policy ON checklist_items 
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'client_id' = client_id::text);

CREATE POLICY client_projects_policy ON projects 
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'client_id' = client_id::text);

CREATE POLICY client_tasks_policy ON project_tasks 
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_id AND 
      auth.jwt() ->> 'client_id' = p.client_id::text
    )
  );

-- Insert sample data for testing
INSERT INTO clients (name, industry, contact_name, contact_email, contact_phone, username, password, logo, status)
VALUES
  ('Liberty Beans Coffee', 'Food & Beverage', 'Liberty Beans', 'info@libertybeans.com', '(919) 555-1234', 'libertybeans', 'coffee2025', '/client-logos/liberty-beans.png', 'active'),
  ('ProTech Carpet Care', 'Home Services', 'Pro Tech', 'info@protechcarpet.com', '(919) 555-5678', 'protech', 'carpet2025', '/client-logos/protech.png', 'active'),
  ('STFD Fence', 'Construction', 'STFD', 'info@stfdfence.com', '(919) 555-9012', 'stfdfence', 'fence2025', '/client-logos/stfd.png', 'active'),
  ('Altare', 'Technology', 'Altare', 'info@altare.com', '(919) 555-3456', 'altare', 'tech2025', '/client-logos/altare.png', 'active');
