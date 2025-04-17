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

// Client authentication (using direct table query instead of RPC)
export const clientLogin = async (username: string, password: string): Promise<ClientUser> => {
  try {
    // Use the direct query method from supabaseClient.ts
    const data = await supabaseClientLogin(username, password);
    
    if (!data || !data.client) {
      throw new Error('Invalid username or password');
    }
    
    // Store the token and client data
    localStorage.setItem('user-type', 'client');
    localStorage.setItem('client-token', data.access_token);
    
    const clientUser: ClientUser = {
      id: data.client.id,
      name: data.client.name,
      username: data.client.username,
      role: 'client'
    };
    
    localStorage.setItem('client-user', JSON.stringify(clientUser));
    
    return clientUser;
  } catch (error) {
    console.error('Client login error:', error);
    throw new Error('Invalid username or password');
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
