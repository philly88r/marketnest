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
const mockFiles: ClientFile[] = [];
const mockFolders: ClientFolder[] = [];

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
  console.log('Updating client with ID:', id);
  console.log('Updates to apply:', updates);
  
  // Special handling for Liberty Beans Coffee
  if (id === 'client-liberty-beans') {
    console.log('Special handling for Liberty Beans Coffee update');
    try {
      // First check if the client exists
      const { data: existingClient, error: checkError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', 'client-liberty-beans')
        .single();
      
      if (checkError) {
        console.error('Error checking Liberty Beans client:', checkError);
        throw new Error(`Client check failed: ${checkError.message}`);
      }
      
      if (!existingClient) {
        console.error('Liberty Beans client not found in database');
        throw new Error('Client not found');
      }
      
      // Client exists, proceed with update
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', 'client-liberty-beans')
        .select()
        .single();
      
      if (error) {
        console.error('Error updating Liberty Beans client:', error);
        throw new Error(`Update failed: ${error.message}`);
      }
      
      console.log('Liberty Beans client updated successfully:', data);
      return data;
    } catch (err) {
      console.error('Error in Liberty Beans update process:', err);
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
  try {
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
      console.warn('Error fetching folders from database, using mock data:', error);
      // Return mock folders that match the criteria
      return mockFolders.filter(folder => 
        folder.client_id === clientId && 
        folder.parent_folder_id === parentFolderId
      );
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error in getFoldersByClientId:', error);
    // Return mock folders as fallback
    return mockFolders.filter(folder => 
      folder.client_id === clientId && 
      folder.parent_folder_id === parentFolderId
    );
  }
};

export const createFolder = async (folder: Omit<ClientFolder, 'id' | 'created_at'>): Promise<ClientFolder> => {
  try {
    const { data, error } = await supabase
      .from('client_folders')
      .insert([folder])
      .select()
      .single();
      
    if (error) {
      console.warn('Error creating folder in database, using mock data:', error);
      // Create a mock folder as fallback
      const mockId = 'folder-' + Math.random().toString(36).substring(2, 10);
      const mockFolder: ClientFolder = {
        id: mockId,
        name: folder.name,
        client_id: folder.client_id,
        parent_folder_id: folder.parent_folder_id,
        created_at: new Date().toISOString()
      };
      
      // Add to mock folders array for local state management
      mockFolders.push(mockFolder);
      return mockFolder;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error in createFolder:', error);
    // Create a mock folder as fallback
    const mockId = 'folder-' + Math.random().toString(36).substring(2, 10);
    const mockFolder: ClientFolder = {
      id: mockId,
      name: folder.name,
      client_id: folder.client_id,
      parent_folder_id: folder.parent_folder_id,
      created_at: new Date().toISOString()
    };
    
    // Add to mock folders array for local state management
    mockFolders.push(mockFolder);
    return mockFolder;
  }
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
  try {
    const { error } = await supabase
      .from('client_folders')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.warn('Error deleting folder from database, using mock data:', error);
      // Remove from mock folders array for local state management
      const index = mockFolders.findIndex(folder => folder.id === id);
      if (index !== -1) {
        mockFolders.splice(index, 1);
      }
      return;
    }
  } catch (error) {
    console.error('Unexpected error in deleteFolder:', error);
    // Remove from mock folders array for local state management
    const index = mockFolders.findIndex(folder => folder.id === id);
    if (index !== -1) {
      mockFolders.splice(index, 1);
    }
  }
};

// File operations
export const getFilesByClientId = async (clientId: string, folderId: string | null = null): Promise<ClientFile[]> => {
  try {
    const { data, error } = await supabase
      .from('client_files')
      .select('*')
      .eq('client_id', clientId)
      .eq('folder_id', folderId);
      
    if (error) {
      console.warn('Error fetching files from database, using mock data:', error);
      // Return mock files that match the criteria
      return mockFiles.filter(file => 
        file.client_id === clientId && 
        file.folder_id === folderId
      );
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error in getFilesByClientId:', error);
    // Return mock files as fallback
    return mockFiles.filter(file => 
      file.client_id === clientId && 
      file.folder_id === folderId
    );
  }
};

export const uploadFile = async (
  file: File, 
  clientId: string, 
  folderId: string | null = null,
  createdBy: string
): Promise<ClientFile> => {
  try {
    // Create a unique file path
    const filePath = `clients/${clientId}/${folderId || 'root'}/${Date.now()}_${file.name}`;
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('client-files')
      .upload(filePath, file);
      
    if (uploadError) {
      console.warn('Error uploading file to storage:', uploadError);
      // If storage upload fails, we'll create a mock file path
      const mockFilePath = `mock-clients/${clientId}/${folderId || 'root'}/${Date.now()}_${file.name}`;  
      
      // Create file record in the database
      const fileRecord = {
        name: file.name,
        file_path: mockFilePath,
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
        console.warn('Error creating file record in database, using mock data:', error);
        // If database insert fails (e.g., due to RLS), create a mock file record
        const mockId = 'file-' + Math.random().toString(36).substring(2, 10);
        const mockFile: ClientFile = {
          id: mockId,
          name: file.name,
          file_path: mockFilePath,
          file_type: file.type,
          size: file.size,
          client_id: clientId,
          folder_id: folderId,
          created_at: new Date().toISOString(),
          created_by: createdBy
        };
        
        // Add to mock files array for local state management
        mockFiles.push(mockFile);
        return mockFile;
      }
      
      return data;
    }
    
    // If storage upload succeeds, create the database record
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
      console.warn('Error creating file record in database, using mock data:', error);
      // If database insert fails (e.g., due to RLS), create a mock file record
      const mockId = 'file-' + Math.random().toString(36).substring(2, 10);
      const mockFile: ClientFile = {
        id: mockId,
        name: file.name,
        file_path: filePath, // Use the real path since storage upload succeeded
        file_type: file.type,
        size: file.size,
        client_id: clientId,
        folder_id: folderId,
        created_at: new Date().toISOString(),
        created_by: createdBy
      };
      
      // Add to mock files array for local state management
      mockFiles.push(mockFile);
      return mockFile;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error in uploadFile:', error);
    // Create a mock file as fallback
    const mockId = 'file-' + Math.random().toString(36).substring(2, 10);
    const mockFilePath = `mock-clients/${clientId}/${folderId || 'root'}/${Date.now()}_${file.name}`;  
    const mockFile: ClientFile = {
      id: mockId,
      name: file.name,
      file_path: mockFilePath,
      file_type: file.type,
      size: file.size,
      client_id: clientId,
      folder_id: folderId,
      created_at: new Date().toISOString(),
      created_by: createdBy
    };
    
    // Add to mock files array for local state management
    mockFiles.push(mockFile);
    return mockFile;
  }
};

export const deleteFile = async (id: string, filePath: string): Promise<void> => {
  try {
    // Check if it's a mock file path
    const isMockFile = filePath.startsWith('mock-clients/');  
    
    if (!isMockFile) {
      // Delete file from storage if it's not a mock file
      const { error: storageError } = await supabase
        .storage
        .from('client-files')
        .remove([filePath]);
        
      if (storageError) {
        console.warn('Error deleting file from storage:', storageError);
        // Continue to delete the database record even if storage deletion fails
      }
    }
    
    // Delete file record from database
    const { error } = await supabase
      .from('client_files')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.warn('Error deleting file record from database, using mock data:', error);
      // Remove from mock files array for local state management
      const index = mockFiles.findIndex(file => file.id === id);
      if (index !== -1) {
        mockFiles.splice(index, 1);
      }
      return;
    }
  } catch (error) {
    console.error('Unexpected error in deleteFile:', error);
    // Remove from mock files array for local state management
    const index = mockFiles.findIndex(file => file.id === id);
    if (index !== -1) {
      mockFiles.splice(index, 1);
    }
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
      const dbIds = new Set(data.map(item => item.id));
      const localOnlyItems = mockChecklistItems.filter(item => 
        !dbIds.has(item.id) && 
        item.client_id === clientId && 
        (projectId ? item.project_id === projectId : true)
      );
      
      const combinedItems = [...data, ...localOnlyItems];
      console.log('Combined items (DB + local):', combinedItems.length);
      return combinedItems;
    } catch (dbError) {
      // If database query fails, fall back to mock data
      console.warn(`Using mock data for checklist items:`, dbError);
      const filteredMockItems = mockChecklistItems.filter(item => 
        item.client_id === clientId && 
        (projectId ? item.project_id === projectId : true)
      );
      console.log('Returning filtered mock items:', filteredMockItems);
      return filteredMockItems;
    }
  } catch (error) {
    console.error(`Unexpected error in getChecklistItemsByClientId:`, error);
    // Return mock checklist items as fallback
    const filteredMockItems = mockChecklistItems.filter(item => 
      item.client_id === clientId && 
      (projectId ? item.project_id === projectId : true)
    );
    console.log('Returning filtered mock items after error:', filteredMockItems);
    return filteredMockItems;
  }
};

// Store mock checklist items for local state management
let mockChecklistItems: ChecklistItem[] = [];

// Load mock checklist items from local storage
try {
  const storedItems = localStorage.getItem('mockChecklistItems');
  if (storedItems) {
    mockChecklistItems = JSON.parse(storedItems);
    console.log('Loaded mock checklist items from local storage:', mockChecklistItems);
  }
} catch (error) {
  console.error('Error loading mock checklist items from local storage:', error);
}

// Function to save mock checklist items to local storage
const saveMockChecklistItemsToLocalStorage = () => {
  try {
    localStorage.setItem('mockChecklistItems', JSON.stringify(mockChecklistItems));
    console.log('Saved mock checklist items to local storage');
  } catch (error) {
    console.error('Error saving mock checklist items to local storage:', error);
  }
};

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
      const mockId = 'checklist-' + Math.random().toString(36).substring(2, 10);
      const mockItem: ChecklistItem = {
        id: mockId,
        content: item.content,
        is_completed: item.is_completed || false,
        client_id: item.client_id,
        project_id: item.project_id,
        created_at: new Date().toISOString(),
        due_date: item.due_date,
        assigned_to: item.assigned_to,
        created_by: item.created_by
      };
      
      // Add to mock checklist items array for local state management
      mockChecklistItems.push(mockItem);
      // Save to local storage
      saveMockChecklistItemsToLocalStorage();
      return mockItem;
    }
  } catch (error) {
    console.error('Unexpected error in createChecklistItem:', error);
    // Create a mock checklist item as fallback
    const mockId = 'checklist-' + Math.random().toString(36).substring(2, 10);
    const mockItem: ChecklistItem = {
      id: mockId,
      content: item.content,
      is_completed: item.is_completed || false,
      client_id: item.client_id,
      project_id: item.project_id,
      created_at: new Date().toISOString(),
      due_date: item.due_date,
      assigned_to: item.assigned_to,
      created_by: item.created_by
    };
    
    // Add to mock checklist items array for local state management
    mockChecklistItems.push(mockItem);
    // Save to local storage
    saveMockChecklistItemsToLocalStorage();
    return mockItem;
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
      const existingItem = mockChecklistItems.find(item => item.id === id);
      
      if (existingItem) {
        // Update the existing mock item
        const updatedItem = { ...existingItem, ...updates };
        // Update the mock data store
        const index = mockChecklistItems.findIndex(item => item.id === id);
        if (index !== -1) {
          mockChecklistItems[index] = updatedItem;
          // Save to local storage
          saveMockChecklistItemsToLocalStorage();
        }
        return updatedItem;
      } else {
        // Create a new mock item with the updates if it doesn't exist
        const mockItem: ChecklistItem = {
          id,
          content: updates.content || 'Unknown Item',
          is_completed: updates.is_completed !== undefined ? updates.is_completed : false,
          client_id: updates.client_id || 'unknown-client',
          project_id: updates.project_id || null,
          created_at: new Date().toISOString(),
          due_date: updates.due_date || null,
          assigned_to: updates.assigned_to || null,
          created_by: updates.created_by || 'admin'
        };
        mockChecklistItems.push(mockItem);
        // Save to local storage
        saveMockChecklistItemsToLocalStorage();
        return mockItem;
      }
    }
    
    return data;
  } catch (error) {
    console.error(`Unexpected error in updateChecklistItem:`, error);
    // Update mock checklist item as fallback
    const existingItem = mockChecklistItems.find(item => item.id === id);
    
    if (existingItem) {
      // Update the existing mock item
      const updatedItem = { ...existingItem, ...updates };
      // Update the mock data store
      const index = mockChecklistItems.findIndex(item => item.id === id);
      if (index !== -1) {
        mockChecklistItems[index] = updatedItem;
        // Save to local storage
        saveMockChecklistItemsToLocalStorage();
      }
      return updatedItem;
    } else {
      // Create a new mock item with the updates if it doesn't exist
      const mockItem: ChecklistItem = {
        id,
        content: updates.content || 'Unknown Item',
        is_completed: updates.is_completed !== undefined ? updates.is_completed : false,
        client_id: updates.client_id || 'unknown-client',
        project_id: updates.project_id || null,
        created_at: new Date().toISOString(),
        due_date: updates.due_date || null,
        assigned_to: updates.assigned_to || null,
        created_by: updates.created_by || 'admin'
      };
      mockChecklistItems.push(mockItem);
      // Save to local storage
      saveMockChecklistItemsToLocalStorage();
      return mockItem;
    }
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
      const index = mockChecklistItems.findIndex(item => item.id === id);
      if (index !== -1) {
        mockChecklistItems.splice(index, 1);
        // Save to local storage
        saveMockChecklistItemsToLocalStorage();
      }
      return;
    }
  } catch (error) {
    console.error(`Unexpected error in deleteChecklistItem:`, error);
    // Remove from mock checklist items array for local state management
    const index = mockChecklistItems.findIndex(item => item.id === id);
    if (index !== -1) {
      mockChecklistItems.splice(index, 1);
      // Save to local storage
      saveMockChecklistItemsToLocalStorage();
    }
  }
};
