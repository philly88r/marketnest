import { supabase, clientLogin as supabaseClientLogin } from './supabaseClient';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}

export interface ClientUser {
  id: string;
  name: string;
  username: string;
  logo?: string;
  industry?: string;
  contactname?: string;
  contactemail?: string;
  contactphone?: string;
  activeprojects?: number;
  status?: string;
  role: 'client';
}

export type User = AdminUser | ClientUser;

// Admin authentication (using Supabase Auth)
export const adminLogin = async (email: string, password: string): Promise<AdminUser> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }
  
  if (!data.user || !data.session) {
    throw new Error('Authentication failed');
  }
  
  // Check if user has admin role in metadata
  const metadata = data.user.user_metadata;
  if (!metadata || metadata.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
  
  const adminUser: AdminUser = {
    id: data.user.id,
    email: data.user.email || '',
    role: 'admin'
  };
  
  // Store admin user data
  localStorage.setItem('user-type', 'admin');
  localStorage.setItem('admin-user', JSON.stringify(adminUser));
  
  return adminUser;
};

// Client login using Supabase Auth and fetch client by user_id
export const clientLogin = async (username: string, password: string): Promise<ClientUser> => {
  // Use the provided email directly with Supabase Auth
  const email = username; // The form field is labeled "Username" but contains email
  
  console.log('Attempting login with email:', email);
  
  try {
    // Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error('Supabase Auth error:', error);
      throw error;
    }
    
    if (!data.user || !data.session) {
      console.error('Authentication failed: No user or session data');
      throw new Error('Authentication failed');
    }

    // Fetch client by user_id (Supabase Auth UUID)
    const userId = data.user.id;
    console.log('Successfully authenticated with Supabase Auth. User ID:', userId);
    console.log('Looking up client with user_id:', userId);

    // First, let's check what's in the clients table
    const { data: allClients, error: allClientsError } = await supabase
      .from('clients')
      .select('id, name, user_id');
    
    console.log('All clients with their user_id values:', allClients);
    console.log('Any error fetching clients:', allClientsError);

    // Try to find the client by user_id
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .single();

    console.log('Client lookup result:', clientData, clientError);

    // Check if clientData is an array (Supabase sometimes returns arrays even with single())
    let client = clientData;
    if (Array.isArray(clientData) && clientData.length > 0) {
      client = clientData[0];
      console.log('Extracted client from array:', client);
    }

    // If no client found by user_id, try by email/username as fallback
    if (clientError || !client) {
      console.log('No client found by user_id, trying by username/email:', email);
      
      const { data: emailClientData, error: emailClientError } = await supabase
        .from('clients')
        .select('*')
        .or(`username.eq.${email},contactemail.eq.${email}`)
        .single();
        
      console.log('Client lookup by email result:', emailClientData, emailClientError);
      
      if (emailClientError || !emailClientData) {
        console.error('No client record found for this user by either user_id or email');
        throw new Error('No client record found for this user');
      }
      
      client = emailClientData;
      
      // Update the client record with the user_id for future logins
      const { error: updateError } = await supabase
        .from('clients')
        .update({ user_id: userId })
        .eq('id', client.id);
        
      if (updateError) {
        console.error('Error updating client with user_id:', updateError);
      } else {
        console.log('Updated client record with user_id:', userId);
      }
    }

    // Map to ClientUser (add all fields you need)
    const clientUser: ClientUser = {
      id: client.id,
      name: client.name,
      logo: client.logo,
      industry: client.industry,
      contactname: client.contactname,
      contactemail: client.contactemail,
      contactphone: client.contactphone,
      activeprojects: client.activeprojects,
      status: client.status,
      username: client.username,
      role: 'client',
    };

    localStorage.setItem('user-type', 'client');
    localStorage.setItem('client-user', JSON.stringify(clientUser));
    
    console.log('Successfully logged in as client:', clientUser.id);

    return clientUser;
  } catch (error) {
    console.error('Client login error:', error);
    throw error;
  }
};

// Get current user (admin or client)
export const getCurrentUser = (): User | null => {
  const userType = localStorage.getItem('user-type');
  
  if (userType === 'admin') {
    const adminData = localStorage.getItem('admin-user');
    return adminData ? JSON.parse(adminData) : null;
  } else if (userType === 'client') {
    const clientData = localStorage.getItem('client-user');
    return clientData ? JSON.parse(clientData) : null;
  }
  
  return null;
};

// Check if user is logged in
export const isLoggedIn = (): boolean => {
  return localStorage.getItem('user-type') !== null;
};

// Check if user is admin
export const isAdmin = (): boolean => {
  return localStorage.getItem('user-type') === 'admin';
};

// Check if user is client
export const isClient = (): boolean => {
  return localStorage.getItem('user-type') === 'client';
};

// Logout (admin or client)
export const logout = async (): Promise<void> => {
  const userType = localStorage.getItem('user-type');
  
  // Clear all auth-related localStorage items
  localStorage.removeItem('user-type');
  localStorage.removeItem('admin-user');
  localStorage.removeItem('client-user');
  localStorage.removeItem('client-token');
  
  // If admin, also sign out from Supabase Auth
  if (userType === 'admin') {
    await supabase.auth.signOut();
  }
};

// Set auth header for client requests
export const setClientAuthHeader = () => {
  const clientToken = localStorage.getItem('client-token');
  
  if (clientToken) {
    // Set the Authorization header for all Supabase requests
    supabase.realtime.setAuth(clientToken);
  }
};

// Initialize auth - call this when your app starts
export const initAuth = () => {
  const userType = localStorage.getItem('user-type');
  
  if (userType === 'client') {
    setClientAuthHeader();
  }
};
