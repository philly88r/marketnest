import { supabase } from './supabaseClient';

// Types for our client data
export interface Client {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  contactname?: string;
  contactemail?: string;
  contactphone?: string;
  contact_name?: string; // For compatibility with our code
  contact_email?: string; // For compatibility with our code
  contact_phone?: string; // For compatibility with our code
  username: string;
  password: string;
  created_at?: string;
}

export interface ClientFolder {
  id: string;
  name: string;
  client_id: string;
  parent_folder_id: string | null;
  created_at: string;
}

export interface ClientFile {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  size: number;
  client_id: string;
  folder_id: string | null;
  created_at: string;
  created_by: string;
}

export interface ChecklistItem {
  id: string;
  content: string;
  is_completed: boolean;
  client_id: string;
  project_id: string | null;
  created_at: string;
  due_date: string | null;
  assigned_to: string | null;
  created_by?: string;
}

// Client CRUD operations
export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
  
  if (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
  
  return data || [];
};

export const getClientById = async (id: string): Promise<Client | null> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching client:', error);
    return null;
  }
  
  return data;
};

export const updateClient = async (id: string, updates: Partial<Client>): Promise<Client | null> => {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating client:', error);
    throw error;
  }
  
  return data;
};

export const createClient = async (client: Omit<Client, 'id' | 'created_at'>): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating client:', error);
    throw error;
  }
  
  return data;
};

export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error(`Error deleting client with ID ${id}:`, error);
    throw error;
  }
};

// Folder operations
export const getFoldersByClientId = async (clientId: string, parentFolderId: string | null = null): Promise<ClientFolder[]> => {
  let query = supabase
    .from('client_folders')
    .select('*')
    .eq('client_id', clientId)
    .order('name');
    
  if (parentFolderId) {
    query = query.eq('parent_folder_id', parentFolderId);
  } else {
    query = query.is('parent_folder_id', null);
  }
  
  const { data, error } = await query;
    
  if (error) {
    console.error(`Error fetching folders for client ${clientId}:`, error);
    throw error;
  }
  
  return data || [];
};

export const createFolder = async (folder: Omit<ClientFolder, 'id' | 'created_at'>): Promise<ClientFolder> => {
  const { data, error } = await supabase
    .from('client_folders')
    .insert([folder])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
  
  return data;
};

export const updateFolder = async (id: string, updates: Partial<ClientFolder>): Promise<ClientFolder> => {
  const { data, error } = await supabase
    .from('client_folders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error(`Error updating folder with ID ${id}:`, error);
    throw error;
  }
  
  return data;
};

export const deleteFolder = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('client_folders')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error(`Error deleting folder with ID ${id}:`, error);
    throw error;
  }
};

// File operations
export const getFilesByClientId = async (clientId: string, folderId: string | null = null): Promise<ClientFile[]> => {
  let query = supabase
    .from('client_files')
    .select('*')
    .eq('client_id', clientId)
    .order('name');
    
  if (folderId) {
    query = query.eq('folder_id', folderId);
  } else {
    query = query.is('folder_id', null);
  }
  
  const { data, error } = await query;
    
  if (error) {
    console.error(`Error fetching files for client ${clientId}:`, error);
    throw error;
  }
  
  return data || [];
};

export const uploadFile = async (
  file: File, 
  clientId: string, 
  folderId: string | null = null,
  createdBy: string
): Promise<ClientFile> => {
  // Create a unique file path
  const filePath = `clients/${clientId}/${folderId || 'root'}/${Date.now()}_${file.name}`;
  
  // Upload file to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('client-files')
    .upload(filePath, file);
    
  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    throw uploadError;
  }
  
  // Create file record in the database
  const fileRecord = {
    name: file.name,
    file_path: filePath,
    file_type: file.type,
    size: file.size,
    client_id: clientId,
    folder_id: folderId,
    created_by: createdBy
  };
  
  const { data, error } = await supabase
    .from('client_files')
    .insert([fileRecord])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating file record:', error);
    throw error;
  }
  
  return data;
};

export const deleteFile = async (id: string, filePath: string): Promise<void> => {
  // Delete file from storage
  const { error: storageError } = await supabase
    .storage
    .from('client-files')
    .remove([filePath]);
    
  if (storageError) {
    console.error(`Error deleting file from storage: ${filePath}`, storageError);
    throw storageError;
  }
  
  // Delete file record from database
  const { error } = await supabase
    .from('client_files')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error(`Error deleting file record with ID ${id}:`, error);
    throw error;
  }
};

export const getFileUrl = async (filePath: string): Promise<string> => {
  const { data, error } = await supabase
    .storage
    .from('client-files')
    .createSignedUrl(filePath, 60 * 60); // 1 hour expiry
    
  if (error) {
    console.error(`Error getting signed URL for file: ${filePath}`, error);
    throw error;
  }
  
  return data.signedUrl;
};

// Checklist operations
export const getChecklistItemsByClientId = async (clientId: string, projectId: string | null = null): Promise<ChecklistItem[]> => {
  let query = supabase
    .from('checklist_items')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
    
  if (projectId) {
    query = query.eq('project_id', projectId);
  }
  
  const { data, error } = await query;
    
  if (error) {
    console.error(`Error fetching checklist items for client ${clientId}:`, error);
    throw error;
  }
  
  return data || [];
};

export const createChecklistItem = async (item: Omit<ChecklistItem, 'id' | 'created_at'>): Promise<ChecklistItem> => {
  const { data, error } = await supabase
    .from('checklist_items')
    .insert([item])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating checklist item:', error);
    throw error;
  }
  
  return data;
};

export const updateChecklistItem = async (id: string, updates: Partial<ChecklistItem>): Promise<ChecklistItem> => {
  const { data, error } = await supabase
    .from('checklist_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error(`Error updating checklist item with ID ${id}:`, error);
    throw error;
  }
  
  return data;
};

export const deleteChecklistItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('checklist_items')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error(`Error deleting checklist item with ID ${id}:`, error);
    throw error;
  }
};
