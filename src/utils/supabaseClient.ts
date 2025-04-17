import { createClient } from '@supabase/supabase-js';

// Get environment variables with validation
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
let supabase;

if (!supabaseUrl) {
  console.error('Supabase URL is missing. Please check your environment variables.');
} else if (!supabaseAnonKey) {
  console.error('Supabase Anon Key is missing. Please check your environment variables.');
} else {
  try {
    // Validate URL format
    new URL(supabaseUrl); // This will throw if URL is invalid
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
  }
}

// If supabase client wasn't initialized, create a minimal mock for development
// This should never be used in production
if (!supabase) {
  console.warn('Using mock Supabase client. This should only happen in development.');
  supabase = {
    from: () => ({
      select: () => ({ data: null, error: new Error('Supabase client not initialized properly') }),
      insert: () => ({ data: null, error: new Error('Supabase client not initialized properly') }),
      update: () => ({ data: null, error: new Error('Supabase client not initialized properly') }),
      delete: () => ({ data: null, error: new Error('Supabase client not initialized properly') }),
      eq: () => ({ data: null, error: new Error('Supabase client not initialized properly') }),
      single: () => ({ data: null, error: new Error('Supabase client not initialized properly') }),
    }),
    auth: {
      signInWithPassword: () => Promise.reject(new Error('Supabase client not initialized properly')),
      signOut: () => Promise.reject(new Error('Supabase client not initialized properly')),
      onAuthStateChange: () => ({ data: null, error: null, unsubscribe: () => {} }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.reject(new Error('Supabase client not initialized properly')),
        getPublicUrl: () => ({ data: null }),
        remove: () => Promise.reject(new Error('Supabase client not initialized properly')),
      }),
    },
  };
}

// Add direct client login method to avoid using RPC
export const clientLogin = async (username: string, password: string) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Invalid username or password');

    return {
      client: data,
      access_token: 'client-token-' + data.id, // Simple token for demo
    };
  } catch (error) {
    console.error('Client login error:', error);
    throw new Error('Invalid username or password');
  }
};

export { supabase };

// Types for database tables
export interface Message {
  id: string;
  created_at: string;
  user_id: string;
  channel: string;
  content: string;
  attachments: string[];
  sender_name: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface ClientUser {
  id: string;
  email: string;
  full_name: string;
  company: string;
  avatar_url?: string;
}
