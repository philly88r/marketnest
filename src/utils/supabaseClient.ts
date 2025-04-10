import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export type Message = {
  id: string;
  created_at: string;
  user_id: string;
  channel: string;
  content: string;
  attachments: string[];
  sender_name: string;
};

export type Channel = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

export type ClientUser = {
  id: string;
  email: string;
  full_name: string;
  company: string;
  avatar_url?: string;
};
