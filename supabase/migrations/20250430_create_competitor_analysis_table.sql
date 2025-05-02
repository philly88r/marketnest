-- Create competitor_analysis table
CREATE TABLE IF NOT EXISTS public.competitor_analysis (
  id UUID PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES public.clients(id),
  user_id UUID NOT NULL,
  keyword TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in-progress', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  competitors JSONB DEFAULT '[]'::jsonb,
  recommendations TEXT[] DEFAULT '{}'::TEXT[]
);

-- Enable Row Level Security
ALTER TABLE public.competitor_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for competitor_analysis table
-- Allow authenticated users to view their own competitor analyses
CREATE POLICY competitor_analysis_select_policy ON public.competitor_analysis
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = competitor_analysis.client_id
    AND c.user_id = auth.uid()::uuid
  )
);

-- Allow authenticated users to insert competitor analyses for their clients
CREATE POLICY competitor_analysis_insert_policy ON public.competitor_analysis
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = competitor_analysis.client_id
    AND c.user_id = auth.uid()::uuid
  )
);

-- Allow authenticated users to update their own competitor analyses
CREATE POLICY competitor_analysis_update_policy ON public.competitor_analysis
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = competitor_analysis.client_id
    AND c.user_id = auth.uid()::uuid
  )
);

-- Allow authenticated users to delete their own competitor analyses
CREATE POLICY competitor_analysis_delete_policy ON public.competitor_analysis
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = competitor_analysis.client_id
    AND c.user_id = auth.uid()::uuid
  )
);

-- Create a temporary policy for development that allows all operations for anon users
-- IMPORTANT: Remove this policy before deploying to production
CREATE POLICY competitor_analysis_anon_policy ON public.competitor_analysis
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS competitor_analysis_client_id_idx ON public.competitor_analysis(client_id);
CREATE INDEX IF NOT EXISTS competitor_analysis_user_id_idx ON public.competitor_analysis(user_id);
CREATE INDEX IF NOT EXISTS competitor_analysis_status_idx ON public.competitor_analysis(status);
