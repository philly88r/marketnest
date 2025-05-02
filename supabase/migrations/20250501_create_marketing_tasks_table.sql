-- Create marketing_tasks table
CREATE TABLE IF NOT EXISTS public.marketing_tasks (
    id SERIAL PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    kpi TEXT,
    status VARCHAR(50) DEFAULT 'Planned',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.marketing_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for marketing_tasks table
-- Allow authenticated users to view marketing tasks
CREATE POLICY marketing_tasks_select_policy ON public.marketing_tasks
FOR SELECT
USING (true);

-- Allow all authenticated users to insert marketing tasks for now
-- This can be restricted later when you implement a proper role system
CREATE POLICY marketing_tasks_insert_policy ON public.marketing_tasks
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Allow all authenticated users to update marketing tasks for now
-- This can be restricted later when you implement a proper role system
CREATE POLICY marketing_tasks_update_policy ON public.marketing_tasks
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Allow all authenticated users to delete marketing tasks for now
-- This can be restricted later when you implement a proper role system
CREATE POLICY marketing_tasks_delete_policy ON public.marketing_tasks
FOR DELETE
USING (auth.role() = 'authenticated');

-- Insert marketing tasks for May 2025

-- Pinterest Product Feed Update
INSERT INTO public.marketing_tasks (task_name, description, assigned_to, start_date, end_date, kpi, status)
VALUES (
    'Pinterest Product Feed Update',
    'Update and optimize Pinterest product feed to ensure all products are accurately represented and up-to-date.',
    'Market Nest',
    '2025-05-01',
    '2025-05-05',
    'Feed approved by Pinterest, 100% product sync, at least 10% increase in Pinterest referral traffic.',
    'Planned'
);

-- Market Nest Website Major SEO Overhaul
INSERT INTO public.marketing_tasks (task_name, description, assigned_to, start_date, end_date, kpi, status)
VALUES (
    'Major SEO Overhaul',
    'Comprehensive SEO audit and implementation: technical SEO fixes, metadata optimization, schema markup, and site speed improvements.',
    'Market Nest',
    '2025-05-01',
    '2025-05-15',
    'Site audit score >90 (Lighthouse), 20% increase in organic impressions, all critical SEO issues resolved.',
    'Planned'
);

-- Online PR Campaign
INSERT INTO public.marketing_tasks (task_name, description, assigned_to, start_date, end_date, kpi, status)
VALUES (
    'Online PR Campaign',
    'Develop and distribute press releases and outreach to online publications to improve brand visibility and earn backlinks.',
    'Market Nest',
    '2025-05-06',
    '2025-05-15',
    'At least 5 PR placements, 10 new backlinks, 15% increase in brand mentions.',
    'Planned'
);

-- Competitor Analysis
INSERT INTO public.marketing_tasks (task_name, description, assigned_to, start_date, end_date, kpi, status)
VALUES (
    'Competitor Analysis',
    'Research top 5 competitors: analyze SEO, content, and ad strategies. Deliver actionable insights.',
    'Market Nest',
    '2025-05-01',
    '2025-05-08',
    'Competitor report delivered, 3 actionable recommendations implemented.',
    'Planned'
);

-- Website Technical SEO
INSERT INTO public.marketing_tasks (task_name, description, assigned_to, start_date, end_date, kpi, status)
VALUES (
    'Website Technical SEO',
    'Fix crawl errors, improve site speed, enhance mobile usability, and implement structured data.',
    'Market Nest',
    '2025-05-09',
    '2025-05-15',
    'All technical errors resolved, mobile usability score >95, structured data validated.',
    'Planned'
);

-- Facebook Campaign
INSERT INTO public.marketing_tasks (task_name, description, assigned_to, start_date, end_date, kpi, status)
VALUES (
    'Facebook Campaign',
    'Launch Facebook ad campaign to drive targeted traffic to the new landing page.',
    'Market Nest',
    '2025-05-10',
    '2025-05-20',
    '100,000 impressions, 2% CTR, 500 landing page visits from Facebook.',
    'Planned'
);

-- Email Campaign (Client Confirmation Needed)
INSERT INTO public.marketing_tasks (task_name, description, assigned_to, start_date, end_date, kpi, status)
VALUES (
    'Email Campaign',
    'Design and send an email campaign to promote the new landing page. (Client to confirm execution)',
    'TBD (Client Confirmation Needed)',
    '2025-05-12',
    '2025-05-18',
    'Open rate >25%, click rate >5%, 300 visits to landing page from email.',
    'Pending Client Confirmation'
);

-- Backend API for Pinterest Product Feed
INSERT INTO public.marketing_tasks (task_name, description, assigned_to, start_date, end_date, kpi, status)
VALUES (
    'Backend API for Pinterest Product Feed',
    'Develop API endpoints to automatically sync product data with Pinterest. Implement scheduled jobs for daily feed updates.',
    'Market Nest',
    '2025-05-01',
    '2025-05-07',
    'API uptime >99.9%, successful daily sync, error rate <0.1%',
    'Planned'
);

-- Analytics Dashboard Enhancement
INSERT INTO public.marketing_tasks (task_name, description, assigned_to, start_date, end_date, kpi, status)
VALUES (
    'Analytics Dashboard Enhancement',
    'Extend the analytics dashboard to track and visualize Pinterest, Facebook, and email campaign performance metrics.',
    'Market Nest',
    '2025-05-03',
    '2025-05-10',
    'All campaign metrics visible in dashboard, real-time data refresh, custom report generation',
    'Planned'
);

-- SEO Monitoring Backend
INSERT INTO public.marketing_tasks (task_name, description, assigned_to, start_date, end_date, kpi, status)
VALUES (
    'SEO Monitoring Backend',
    'Implement backend services to track SEO metrics, crawl errors, and keyword rankings. Set up automated alerts for ranking changes.',
    'Market Nest',
    '2025-05-08',
    '2025-05-14',
    'Keyword tracking for 100+ terms, daily rank updates, alert system functioning',
    'Planned'
);

-- Competitor Analysis Database
INSERT INTO public.marketing_tasks (task_name, description, assigned_to, start_date, end_date, kpi, status)
VALUES (
    'Competitor Analysis Database',
    'Create database schema and API for storing and analyzing competitor data. Implement automated data collection from competitor sites.',
    'Market Nest',
    '2025-05-04',
    '2025-05-09',
    'Database schema implemented, API endpoints functional, automated data collection working',
    'Planned'
);

-- Campaign Performance API
INSERT INTO public.marketing_tasks (task_name, description, assigned_to, start_date, end_date, kpi, status)
VALUES (
    'Campaign Performance API',
    'Develop API endpoints to aggregate and report on all campaign performance metrics. Include data export functionality.',
    'Market Nest',
    '2025-05-15',
    '2025-05-22',
    'API response time <200ms, all campaign metrics accessible, data export working',
    'Planned'
);

-- Automated Reporting System
INSERT INTO public.marketing_tasks (task_name, description, assigned_to, start_date, end_date, kpi, status)
VALUES (
    'Automated Reporting System',
    'Build backend system for generating and distributing weekly and monthly performance reports via email.',
    'Market Nest',
    '2025-05-20',
    '2025-05-28',
    'Weekly reports generated automatically, email delivery successful, all KPIs included',
    'Planned'
);

-- Search Console Integration Enhancement
INSERT INTO public.marketing_tasks (task_name, description, assigned_to, start_date, end_date, kpi, status)
VALUES (
    'Search Console Integration Enhancement',
    'Improve the existing Search Console integration to capture more detailed SEO metrics and performance data.',
    'Market Nest',
    '2025-05-12',
    '2025-05-18',
    'Enhanced data capture, improved API reliability, expanded metrics dashboard',
    'Planned'
);

-- Create index for faster queries
CREATE INDEX idx_marketing_tasks_assigned_to ON public.marketing_tasks(assigned_to);
CREATE INDEX idx_marketing_tasks_status ON public.marketing_tasks(status);
CREATE INDEX idx_marketing_tasks_dates ON public.marketing_tasks(start_date, end_date);
