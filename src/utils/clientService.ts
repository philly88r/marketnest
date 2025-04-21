import { supabase } from './supabaseClient';
import { getCurrentUser } from './authService';
import { getStorageBucket } from './fileSystemSetup';

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
  activeprojects?: number; // Number of active projects
  status?: string; // Client status (e.g., 'active')
  username: string;
  password: string;
  created_at?: string;
  user_id?: string; // Supabase Auth user id (for Auth integration)
}

export interface ClientFolder {
  id: string;
  name: string;
  client_id: string;
  parent_folder_id: string | null;
  created_at: string;
  created_by: string;
  path?: string; // Full path in storage
}

export interface ClientFile {
  id: string;
  name: string;
  client_id: string;
  folder_id: string | null;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  created_by: string;
  url?: string; // Temporary URL for download
}

export interface ChecklistItem {
  id: string; // uuid in the database
  content: string;
  is_completed: boolean;
  client_id: string;
  project_id: string | null; // uuid in the database
  created_at: string; // timestamp with time zone in the database
  due_date: string | null; // timestamp with time zone in the database
  assigned_to: string | null;
  created_by: string | null;
}

// Mock data arrays for local state management when database operations fail
// const mockFiles: ClientFile[] = [];
// const mockFolders: ClientFolder[] = [];

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

// Fetch client by user_id (for Supabase Auth integration)
export const getClientByUserId = async (userId: string): Promise<Client | null> => {
  console.log('[getClientByUserId] Fetching client with user_id:', userId);
  // Guard against undefined userId
  if (!userId) {
    console.error('[getClientByUserId] Error: userId is undefined or empty');
    return null;
  }
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) {
    console.error('[getClientByUserId] Error fetching client:', error);
    return null;
  }
  console.log('[getClientByUserId] Client data:', data);
  return data;
};

// Deprecated: Fetch client by id (no longer used for login)
export const getClientById = async (id: string): Promise<Client | null> => {
  console.log('[getClientById] Fetching client with id:', id);
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('[getClientById] Error fetching client:', error);
    return null;
  }
  let clientObj = data;
  if (Array.isArray(data)) {
    clientObj = data.length > 0 ? data[0] : null;
  }
  console.log('[getClientById] Client data:', clientObj);
  console.log('[getClientById] Client data details:', JSON.stringify(clientObj, null, 2));
  return clientObj;
};

export const updateClient = async (id: string, updates: Partial<Client>): Promise<Client | null> => {
  console.log('[updateClient] Updating client with ID:', id);
  console.log('[updateClient] Updates to apply:', updates);
  
  // Special handling for Liberty Beans Coffee and Altare (client-004)
  if (id === 'client-liberty-beans' || id === 'client-004') {
    const clientName = id === 'client-liberty-beans' ? 'Liberty Beans Coffee' : 'Altare';
    console.log(`[updateClient] Special handling for ${clientName} update`);
    try {
      // First check if the client exists
      const { data: existingClient, error: checkError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (checkError) {
        console.error(`[updateClient] Error checking ${clientName} client:`, checkError);
        throw checkError;
      }
      
      if (!existingClient) {
        console.error(`[updateClient] ${clientName} client not found in database`);
        throw new Error('Client not found');
      }
      
      // Client exists, proceed with update
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`[updateClient] Error updating ${clientName} client:`, error);
        throw new Error(`[updateClient] Update failed: ${error.message}`);
      }
      
      console.log(`[updateClient] ${clientName} client updated successfully:`, data);
      console.log(`[updateClient] ${clientName} client updated successfully details:`, JSON.stringify(data, null, 2));
      return data;
    } catch (err) {
      console.error(`[updateClient] Error in ${clientName} update process:`, err);
      throw err;
    }
  }
  
  // Normal handling for other clients
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('[updateClient] Error updating client:', error);
    console.log('[updateClient] Error details:', error);
    throw error;
  }
  console.log('[updateClient] Client updated successfully:', data);
  console.log('[updateClient] Client updated successfully details:', JSON.stringify(data, null, 2));
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
  try {
    console.log(`Fetching folders for client ${clientId} in parent folder ${parentFolderId || 'root'}`);
    
    // Get the bucket to use
    const bucketName = getStorageBucket();
    
    // Determine the path to list
    let path = `clients/${clientId}`;
    
    if (parentFolderId === null) {
      path += '/root';
    } else {
      // Get the parent folder to determine its path
      const { data: parentFolders } = await supabase
        .storage
        .from(bucketName)
        .list(path, {
          search: parentFolderId
        });
      
      if (parentFolders && parentFolders.length > 0) {
        const parentFolder = parentFolders.find(f => f.id === parentFolderId);
        if (parentFolder) {
          path += `/${parentFolder.name}`;
        }
      }
    }
    
    // List all items in the path
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .list(path, {
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) {
      console.warn('Error fetching folders from storage:', error);
      return [];
    }
    
    // Filter to only include folders
    const folders = data
      ?.filter(item => item.metadata?.mimetype === 'folder' || !item.metadata?.mimetype)
      .filter(item => item.name !== '.keep') // Filter out .keep files
      .map(item => ({
        id: item.id,
        name: item.name,
        client_id: clientId,
        parent_folder_id: parentFolderId,
        created_at: new Date(item.created_at || Date.now()).toISOString(),
        created_by: 'system',
        path: `${path}/${item.name}`
      })) || [];
    
    return folders;
  } catch (error) {
    console.error('Unexpected error in getFoldersByClientId:', error);
    return [];
  }
};

export const createFolder = async (
  clientId: string, 
  folderName: string, 
  parentFolderId: string | null = null
): Promise<ClientFolder | null> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');
    
    // Get the bucket to use
    const bucketName = getStorageBucket();
    
    // Determine the path for the new folder
    let path = `clients/${clientId}`;
    
    if (parentFolderId === null) {
      path += '/root';
    } else {
      // Get the parent folder to determine its path
      const folders = await getFoldersByClientId(clientId, null);
      const parentFolder = folders.find(f => f.id === parentFolderId);
      if (parentFolder && parentFolder.path) {
        path = parentFolder.path;
      }
    }
    
    // Create an empty .keep file to establish the folder
    const emptyFile = new Blob([''], { type: 'text/plain' });
    const folderPath = `${path}/${folderName}`;
    const { error: uploadError } = await supabase
      .storage
      .from(bucketName)
      .upload(`${folderPath}/.keep`, emptyFile);
    
    if (uploadError && uploadError.message !== 'The resource already exists') {
      console.error('Error creating folder:', uploadError);
      throw uploadError;
    }
    
    // Get the folder details
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .list(path);
    
    if (error) {
      console.error('Error fetching created folder:', error);
      throw error;
    }
    
    const createdFolder = data?.find(item => item.name === folderName);
    if (!createdFolder) {
      throw new Error('Folder created but not found in listing');
    }
    
    return {
      id: createdFolder.id,
      name: folderName,
      client_id: clientId,
      parent_folder_id: parentFolderId,
      created_at: new Date().toISOString(),
      created_by: currentUser.id,
      path: folderPath
    };
  } catch (error) {
    console.error('Unexpected error in createFolder:', error);
    throw error;
  }
};

export const deleteFolder = async (folderId: string, clientId: string): Promise<boolean> => {
  try {
    // Get the bucket to use
    const bucketName = getStorageBucket();
    
    // Get the folder to determine its path
    const folders = await getFoldersByClientId(clientId, null);
    const folder = folders.find(f => f.id === folderId);
    
    if (!folder || !folder.path) {
      throw new Error('Folder not found');
    }
    
    // List all files in the folder
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .list(folder.path);
    
    if (error) {
      console.error('Error listing folder contents:', error);
      throw error;
    }
    
    // Delete all files in the folder
    for (const item of data || []) {
      const { error: deleteError } = await supabase
        .storage
        .from(bucketName)
        .remove([`${folder.path}/${item.name}`]);
      
      if (deleteError) {
        console.error(`Error deleting item ${item.name}:`, deleteError);
      }
    }
    
    // Delete the folder itself (by removing the .keep file)
    const { error: deleteFolderError } = await supabase
      .storage
      .from(bucketName)
      .remove([`${folder.path}/.keep`]);
    
    if (deleteFolderError) {
      console.error('Error deleting folder:', deleteFolderError);
      throw deleteFolderError;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error in deleteFolder:', error);
    throw error;
  }
};

// File operations
export const getFilesByClientId = async (clientId: string, folderId: string | null = null): Promise<ClientFile[]> => {
  try {
    console.log(`Fetching files for client ${clientId} in folder ${folderId || 'root'}`);
    
    // Get the bucket to use
    const bucketName = getStorageBucket();
    
    // Determine the path to list
    let path = `clients/${clientId}`;
    
    if (folderId === null) {
      path += '/root';
    } else {
      // Get the folder to determine its path
      const folders = await getFoldersByClientId(clientId, null);
      const folder = folders.find(f => f.id === folderId);
      if (folder && folder.path) {
        path = folder.path;
      }
    }
    
    // List all items in the path
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .list(path);
    
    if (error) {
      console.warn('Error fetching files from storage:', error);
      return [];
    }
    
    // Filter to only include files (not folders and not .keep files)
    const files = data
      ?.filter(item => item.metadata?.mimetype && item.metadata.mimetype !== 'folder' && item.name !== '.keep')
      .map(async (item) => {
        // Get a temporary URL for the file
        const { data: urlData } = await supabase
          .storage
          .from(bucketName)
          .createSignedUrl(`${path}/${item.name}`, 3600); // 1 hour expiry
        
        return {
          id: item.id,
          name: item.name,
          client_id: clientId,
          folder_id: folderId,
          file_path: `${path}/${item.name}`,
          file_type: item.metadata?.mimetype || 'application/octet-stream',
          file_size: item.metadata?.size || 0,
          created_at: new Date(item.created_at || Date.now()).toISOString(),
          created_by: 'system',
          url: urlData?.signedUrl
        };
      }) || [];
    
    return await Promise.all(files);
  } catch (error) {
    console.error('Unexpected error in getFilesByClientId:', error);
    return [];
  }
};

export const uploadFile = async (
  clientId: string,
  file: File,
  folderId: string | null = null
): Promise<ClientFile | null> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');
    
    // Get the bucket to use
    const bucketName = getStorageBucket();
    
    // Determine the path for the file
    let path = `clients/${clientId}`;
    
    if (folderId === null) {
      path += '/root';
    } else {
      // Get the folder to determine its path
      const folders = await getFoldersByClientId(clientId, null);
      const folder = folders.find(f => f.id === folderId);
      if (folder && folder.path) {
        path = folder.path;
      }
    }
    
    // Generate a unique filename to avoid collisions
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}_${file.name}`;
    const filePath = `${path}/${uniqueFilename}`;
    
    // Upload the file
    const { error: uploadError } = await supabase
      .storage
      .from(bucketName)
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Error uploading file to storage:', uploadError);
      throw uploadError;
    }
    
    // Get the file details
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .list(path);
    
    if (error) {
      console.error('Error fetching uploaded file:', error);
      throw error;
    }
    
    const uploadedFile = data?.find(item => item.name === uniqueFilename);
    if (!uploadedFile) {
      throw new Error('File uploaded but not found in listing');
    }
    
    // Get a temporary URL for the file
    const { data: urlData } = await supabase
      .storage
      .from(bucketName)
      .createSignedUrl(filePath, 3600); // 1 hour expiry
    
    return {
      id: uploadedFile.id,
      name: file.name,
      client_id: clientId,
      folder_id: folderId,
      file_path: filePath,
      file_type: file.type || 'application/octet-stream',
      file_size: file.size,
      created_at: new Date().toISOString(),
      created_by: currentUser.id,
      url: urlData?.signedUrl
    };
  } catch (error) {
    console.error('Unexpected error in uploadFile:', error);
    throw error;
  }
};

export const deleteFile = async (fileId: string, clientId: string, filePath: string): Promise<boolean> => {
  try {
    // Get the bucket to use
    const bucketName = getStorageBucket();
    
    // Delete the file from storage
    const { error } = await supabase
      .storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error in deleteFile:', error);
    throw error;
  }
};

export const getFileUrl = async (filePath: string): Promise<string | null> => {
  try {
    // Get the bucket to use
    const bucketName = getStorageBucket();
    
    // Get a temporary URL for the file
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .createSignedUrl(filePath, 3600); // 1 hour expiry
    
    if (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }
    
    return data?.signedUrl || null;
  } catch (error) {
    console.error('Unexpected error in getFileUrl:', error);
    return null;
  }
};

// Checklist operations
export const getChecklistItemsByClientId = async (clientId: string, projectId: string | null = null): Promise<ChecklistItem[]> => {
  try {
    console.log(`Fetching checklist items for client ${clientId}${projectId ? ` and project ${projectId}` : ''}`);
    
    // First try to get items from the database
    try {
      let query = supabase
        .from('client_checklist_items') // Correct table name
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
        
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
        
      if (error) {
        console.warn(`Error fetching checklist items for client ${clientId}, trying mock data:`, error);
        throw error; // Let the catch block handle it
      }
      
      console.log('Successfully fetched checklist items from database:', data);
      
      // Combine database items with any mock items that haven't been saved to the database yet
      // This ensures we don't lose any items that were created while offline
      // const dbIds = new Set(data.map(item => item.id));
      // const localOnlyItems = mockChecklistItems.filter(item => 
      //   !dbIds.has(item.id) && 
      //   item.client_id === clientId && 
      //   (projectId ? item.project_id === projectId : true)
      // );
      
      // const combinedItems = [...data, ...localOnlyItems];
      // console.log('Combined items (DB + local):', combinedItems.length);
      return data;
    } catch (dbError) {
      // If database query fails, fall back to mock data
      console.warn(`Using mock data for checklist items:`, dbError);
      // const filteredMockItems = mockChecklistItems.filter(item => 
      //   item.client_id === clientId && 
      //   (projectId ? item.project_id === projectId : true)
      // );
      // console.log('Returning filtered mock items:', filteredMockItems);
      throw dbError;
    }
  } catch (error) {
    console.error(`Unexpected error in getChecklistItemsByClientId:`, error);
    // Return mock checklist items as fallback
    // const filteredMockItems = mockChecklistItems.filter(item => 
    //   item.client_id === clientId && 
    //   (projectId ? item.project_id === projectId : true)
    // );
    // console.log('Returning filtered mock items after error:', filteredMockItems);
    throw error;
  }
};

// Store mock checklist items for local state management
// let mockChecklistItems: ChecklistItem[] = [];

// Load mock checklist items from local storage
// try {
//   const storedItems = localStorage.getItem('mockChecklistItems');
//   if (storedItems) {
//     mockChecklistItems = JSON.parse(storedItems);
//     console.log('Loaded mock checklist items from local storage:', mockChecklistItems);
//   }
// } catch (error) {
//   console.error('Error loading mock checklist items from local storage:', error);
// }

// Function to save mock checklist items to local storage
// const saveMockChecklistItemsToLocalStorage = () => {
//   try {
//     localStorage.setItem('mockChecklistItems', JSON.stringify(mockChecklistItems));
//     console.log('Saved mock checklist items to local storage');
//   } catch (error) {
//     console.error('Error saving mock checklist items to local storage:', error);
//   }
// };

export const createChecklistItem = async (item: Omit<ChecklistItem, 'id' | 'created_at'>): Promise<ChecklistItem> => {
  try {
    // Prepare the item for insertion, ensuring it matches the database schema
    const insertItem = {
      content: item.content,
      is_completed: item.is_completed || false,
      client_id: item.client_id,
      project_id: item.project_id,
      due_date: item.due_date,
      assigned_to: item.assigned_to,
      created_by: item.created_by
    };

    console.log('Attempting to insert checklist item into database:', insertItem);

    // First try direct insert without RLS
    try {
      const { data, error } = await supabase
        .from('client_checklist_items') // Correct table name
        .insert([insertItem])
        .select()
        .single();
        
      if (error) {
        console.warn('Error creating checklist item with RLS, trying direct insert:', error);
        throw error; // Let the catch block handle it
      }
      
      console.log('Successfully created checklist item in database:', data);
      return data;
    } catch (dbError) {
      // If RLS fails, create a mock item but also try to save it to the database
      console.warn('Using mock data for checklist item:', dbError);
      
      // Create a mock checklist item as fallback
      // const mockId = 'checklist-' + Math.random().toString(36).substring(2, 10);
      // const mockItem: ChecklistItem = {
      //   id: mockId,
      //   content: item.content,
      //   is_completed: item.is_completed || false,
      //   client_id: item.client_id,
      //   project_id: item.project_id,
      //   created_at: new Date().toISOString(),
      //   due_date: item.due_date,
      //   assigned_to: item.assigned_to,
      //   created_by: item.created_by
      // };
      
      // // Add to mock checklist items array for local state management
      // mockChecklistItems.push(mockItem);
      // // Save to local storage
      // saveMockChecklistItemsToLocalStorage();
      // return mockItem;
      throw dbError;
    }
  } catch (error) {
    console.error('Unexpected error in createChecklistItem:', error);
    // Create a mock checklist item as fallback
    // const mockId = 'checklist-' + Math.random().toString(36).substring(2, 10);
    // const mockItem: ChecklistItem = {
    //   id: mockId,
    //   content: item.content,
    //   is_completed: item.is_completed || false,
    //   client_id: item.client_id,
    //   project_id: item.project_id,
    //   created_at: new Date().toISOString(),
    //   due_date: item.due_date,
    //   assigned_to: item.assigned_to,
    //   created_by: item.created_by
    // };
    
    // // Add to mock checklist items array for local state management
    // mockChecklistItems.push(mockItem);
    // // Save to local storage
    // saveMockChecklistItemsToLocalStorage();
    // return mockItem;
    throw error;
  }
};

export const updateChecklistItem = async (id: string, updates: Partial<ChecklistItem>): Promise<ChecklistItem> => {
  try {
    const { data, error } = await supabase
      .from('client_checklist_items') // Correct table name
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.warn(`Error updating checklist item with ID ${id}, using mock data:`, error);
      // Update mock checklist item as fallback
      // const existingItem = mockChecklistItems.find(item => item.id === id);
      
      // if (existingItem) {
      //   // Update the existing mock item
      //   const updatedItem = { ...existingItem, ...updates };
      //   // Update the mock data store
      //   const index = mockChecklistItems.findIndex(item => item.id === id);
      //   if (index !== -1) {
      //     mockChecklistItems[index] = updatedItem;
      //     // Save to local storage
      //     saveMockChecklistItemsToLocalStorage();
      //   }
      //   return updatedItem;
      // } else {
      //   // Create a new mock item with the updates if it doesn't exist
      //   const mockItem: ChecklistItem = {
      //     id: id,
      //     content: updates.content || 'Unknown Item',
      //     is_completed: updates.is_completed !== undefined ? updates.is_completed : false,
      //     client_id: updates.client_id || 'unknown-client',
      //     project_id: updates.project_id || null,
      //     created_at: new Date().toISOString(),
      //     due_date: updates.due_date || null,
      //     assigned_to: updates.assigned_to || null,
      //     created_by: updates.created_by || 'admin'
      //   };
      
      //   mockChecklistItems.push(mockItem);
      //   // Save to local storage
      //   saveMockChecklistItemsToLocalStorage();
      //   return mockItem;
      // }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Unexpected error in updateChecklistItem:`, error);
    // Update mock checklist item as fallback
    // const existingItem = mockChecklistItems.find(item => item.id === id);
    
    // if (existingItem) {
    //   // Update the existing mock item
    //   const updatedItem = { ...existingItem, ...updates };
    //   // Update the mock data store
    //   const index = mockChecklistItems.findIndex(item => item.id === id);
    //   if (index !== -1) {
    //     mockChecklistItems[index] = updatedItem;
    //     // Save to local storage
    //     saveMockChecklistItemsToLocalStorage();
    //   }
    //   return updatedItem;
    // } else {
    //   // Create a new mock item with the updates if it doesn't exist
    //   const mockItem: ChecklistItem = {
    //     id: id,
    //     content: updates.content || 'Unknown Item',
    //     is_completed: updates.is_completed !== undefined ? updates.is_completed : false,
    //     client_id: updates.client_id || 'unknown-client',
    //     project_id: updates.project_id || null,
    //     created_at: new Date().toISOString(),
    //     due_date: updates.due_date || null,
    //     assigned_to: updates.assigned_to || null,
    //     created_by: updates.created_by || 'admin'
    //   };
    
    //   mockChecklistItems.push(mockItem);
    //   // Save to local storage
    //   saveMockChecklistItemsToLocalStorage();
    //   return mockItem;
    // }
    throw error;
  }
};

export const deleteChecklistItem = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('client_checklist_items') // Correct table name
      .delete()
      .eq('id', id);
      
    if (error) {
      console.warn(`Error deleting checklist item with ID ${id}, using mock data:`, error);
      // Remove from mock checklist items array for local state management
      // const index = mockChecklistItems.findIndex(item => item.id === id);
      // if (index !== -1) {
      //   mockChecklistItems.splice(index, 1);
      //   // Save to local storage
      //   saveMockChecklistItemsToLocalStorage();
      // }
      throw error;
    }
  } catch (error) {
    console.error(`Unexpected error in deleteChecklistItem:`, error);
    // Remove from mock checklist items array for local state management
    // const index = mockChecklistItems.findIndex(item => item.id === id);
    // if (index !== -1) {
    //   mockChecklistItems.splice(index, 1);
    //   // Save to local storage
    //   saveMockChecklistItemsToLocalStorage();
    // }
    throw error;
  }
};
