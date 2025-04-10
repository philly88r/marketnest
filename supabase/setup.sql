-- Create tables for the client portal

-- Client users table
CREATE TABLE IF NOT EXISTS client_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  company TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Channels table
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES client_users(id) NOT NULL,
  channel TEXT NOT NULL,
  content TEXT,
  attachments TEXT[],
  sender_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default channels
INSERT INTO channels (name, description)
VALUES 
  ('general', 'General discussion and announcements'),
  ('project-updates', 'Updates on ongoing projects'),
  ('file-sharing', 'Share files and documents')
ON CONFLICT (name) DO NOTHING;

-- Create storage bucket for file attachments
-- Note: This needs to be done in the Supabase dashboard or using the API
