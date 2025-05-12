-- Create email templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'draft',
  tags TEXT[] DEFAULT '{}',
  metrics JSONB DEFAULT '{"opens": 0, "clicks": 0, "conversions": 0}'
);

-- Create index for faster client_id lookups
CREATE INDEX IF NOT EXISTS email_templates_client_id_idx ON public.email_templates (client_id);

-- Add RLS policies
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Policy for admins to see all templates
CREATE POLICY admin_all_access
  ON public.email_templates
  FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- Policy for clients to see only their own templates
CREATE POLICY client_own_access
  ON public.email_templates
  FOR ALL
  TO authenticated
  USING (
    client_id IN (
      SELECT id::text FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at on update
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.email_templates TO authenticated;
GRANT ALL ON public.email_templates TO service_role;
