-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    admin_id UUID,
    content TEXT NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'admin')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_client_id ON public.chat_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_admin_id ON public.chat_messages(admin_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_type ON public.chat_messages(sender_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_read ON public.chat_messages(read);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy for clients to view and insert their own messages
CREATE POLICY client_chat_policy ON public.chat_messages 
    FOR ALL 
    USING (client_id::text = auth.uid() OR sender_type = 'admin');

-- Policy for admins to view and manage all messages
CREATE POLICY admin_chat_policy ON public.chat_messages 
    FOR ALL 
    USING (auth.role() = 'admin');

-- Enable realtime subscriptions for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Add comment to table
COMMENT ON TABLE public.chat_messages IS 'Stores chat messages between clients and admins';
