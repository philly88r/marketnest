-- Create the seo_audits table if it doesn't exist
CREATE TABLE IF NOT EXISTS seo_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id TEXT NOT NULL REFERENCES clients(id),
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed', 'failed')),
  score INTEGER DEFAULT 0,
  report JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Create index for faster client-based queries
CREATE INDEX IF NOT EXISTS idx_seo_audits_client_id ON seo_audits(client_id);

-- Create index for status-based queries
CREATE INDEX IF NOT EXISTS idx_seo_audits_status ON seo_audits(status);

-- Enable Row Level Security
ALTER TABLE seo_audits ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to select their own audits
CREATE POLICY "Users can view their own SEO audits"
  ON seo_audits
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to insert their own audits
CREATE POLICY "Users can create SEO audits"
  ON seo_audits
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to update their own audits
CREATE POLICY "Users can update their own SEO audits"
  ON seo_audits
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy to allow authenticated users to delete their own audits
CREATE POLICY "Users can delete their own SEO audits"
  ON seo_audits
  FOR DELETE
  TO authenticated
  USING (true);
