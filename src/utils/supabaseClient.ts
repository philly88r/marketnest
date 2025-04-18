import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with environment variables
// Make sure the URL is properly formatted with https:// prefix
let supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://dvuiiloynbrtdrabtzsg.supabase.co';

// Ensure the URL has the correct format
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = 'https://' + supabaseUrl;
}

const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dWlpbG95bmJydGRyYWJ0enNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDM1MDksImV4cCI6MjA1OTg3OTUwOX0.aef4QCYboLzhyw8im1pGZe7v0tweAnQ3haN1T0mVLmE';

// Log Supabase connection details for debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Using environment variables:', !!process.env.REACT_APP_SUPABASE_URL);

// Create and export the Supabase client
let supabase;

try {
  // Create the Supabase client
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('Supabase client created successfully');
} catch (error) {
  console.error('Error creating Supabase client:', error);
  // Fallback to a known working URL if there's an error
  const fallbackUrl = 'https://dvuiiloynbrtdrabtzsg.supabase.co';
  console.log('Falling back to hardcoded URL:', fallbackUrl);
  supabase = createClient(fallbackUrl, supabaseAnonKey);
}

// Add direct client login method to avoid using RPC
export const clientLogin = async (username: string, password: string) => {
  try {
    // Authenticate with Supabase database
    console.log('Attempting login with:', { username, password });
    
    // First try exact match
    let { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    // If exact match fails, try case-insensitive match
    if (error || !data) {
      console.log('Exact match failed, trying case-insensitive match');
      
      const { data: allClients, error: listError } = await supabase
        .from('clients')
        .select('*');
        
      if (listError) {
        console.error('Error fetching clients:', listError);
        throw new Error('Login failed. Database error.');
      }
      
      console.log('Found clients:', allClients?.length || 0);
      
      // Manually check for case-insensitive match
      if (allClients && allClients.length > 0) {
        const matchedClient = allClients.find(
          client => 
            client.username.toLowerCase() === username.toLowerCase() && 
            client.password === password
        );
        
        if (matchedClient) {
          console.log('Found client with case-insensitive match:', matchedClient.username);
          data = matchedClient;
          error = null;
        } else {
          console.log('No matching client found even with case-insensitive search');
          
          // Log all usernames for debugging
          console.log('Available usernames:', allClients.map(c => c.username));
        }
      }
    }

    if (error) {
      console.error('Database error:', error);
      throw new Error('Login failed. Please try again.');
    }
    
    if (!data) {
      console.error('No client found with these credentials');
      throw new Error('Invalid username or password');
    }

    console.log('Client data found:', data);
    
    // Map database column names to our expected format
    const clientData = {
      id: data.id,
      name: data.name,
      logo: data.logo,
      industry: data.industry,
      contact_name: data.contactname,
      contact_email: data.contactemail,
      contact_phone: data.contactphone,
      active_projects: data.activeprojects,
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
