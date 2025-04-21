import { createClient } from '@supabase/supabase-js';

// Use hardcoded values for Supabase configuration to ensure it works
const supabaseUrl = 'https://dvuiiloynbrtdrabtzsg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dWlpbG95bmJydGRyYWJ0enNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDM1MDksImV4cCI6MjA1OTg3OTUwOX0.aef4QCYboLzhyw8im1pGZe7v0tweAnQ3haN1T0mVLmE';

// Log Supabase connection details for debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key (first 10 chars):', supabaseAnonKey.substring(0, 10) + '...');

// Create custom fetch function that always includes the API key and proper Content-Type
const customFetch = (url: RequestInfo | URL, options: RequestInit = {}) => {
  // Ensure headers object exists
  options.headers = options.headers || {};
  
  // Add the API key and Content-Type to headers
  options.headers = {
    ...options.headers,
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  console.log('Making Supabase request with headers:', JSON.stringify(options.headers));
  return fetch(url, options);
};

// Create the Supabase client with proper configuration and custom fetch
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  global: {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    fetch: customFetch
  }
});

// Verify the client has been created with the API key
console.log('Supabase client created with custom fetch and API key in headers');

// Add direct client login method to avoid using RPC
export const clientLogin = async (username: string, password: string) => {
  try {
    // Authenticate with Supabase database
    console.log('Attempting login with:', { username, password });

    // First try exact match
    let { data, error } = await supabase
      .from('clients')
      .select('*')
      .ilike('username', username) 
      .eq('password', password)
      .single();

    if (error || !data) {
      console.log('Login failed: No matching client found.');
      throw new Error('Invalid username or password');
    }

    // Build clientData only if data exists
    const clientData = {
      id: data.id,
      name: data.name,
      logo: data.logo,
      industry: data.industry,
      contactname: data.contactname,
      contactemail: data.contactemail,
      contactphone: data.contactphone,
      activeprojects: data.activeprojects,
      status: data.status,
      username: data.username,
      password: data.password
    };

    return {
      client: clientData,
      access_token: 'client-token-' + data.id,
    };
  } catch (error) {
    console.error('Client login error:', error);
    throw new Error('Invalid username or password');
  }
};

// Types for database tables
export interface Message {
  id: string;
  created_at: string;
  user_id: string;
  content: string;
  read: boolean;
}

export interface Profile {
  id: string;
  created_at: string;
  username: string;
  full_name: string;
  avatar_url: string;
  website: string;
  company: string;
}

export { supabase };
