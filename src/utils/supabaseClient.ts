import { createClient } from '@supabase/supabase-js';

// Get environment variables with validation
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check if the URL is valid before creating the client
let supabase;

try {
  if (!supabaseUrl) {
    console.error('Supabase URL is missing. Please check your environment variables.');
  } else if (!supabaseAnonKey) {
    console.error('Supabase Anon Key is missing. Please check your environment variables.');
  } else {
    // Validate URL format
    new URL(supabaseUrl); // This will throw if URL is invalid
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  // Create a mock client or fallback for development
  supabase = {
    from: () => ({
      select: () => ({ data: null, error: new Error('Supabase client not initialized properly') }),
      insert: () => ({ data: null, error: new Error('Supabase client not initialized properly') }),
      update: () => ({ data: null, error: new Error('Supabase client not initialized properly') }),
      delete: () => ({ data: null, error: new Error('Supabase client not initialized properly') }),
    }),
    auth: {
      signIn: () => Promise.reject(new Error('Supabase client not initialized properly')),
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

export { supabase };

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
