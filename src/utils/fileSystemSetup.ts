import { supabase } from './supabaseClient';

/**
 * Sets up the file system using existing storage buckets.
 * This function should be called when the application starts or when the file manager is accessed.
 */
export const setupFileSystem = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Check for existing buckets instead of trying to create one
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('Error listing storage buckets:', bucketsError);
      return {
        success: false,
        message: 'Could not access storage. Please contact your administrator.'
      };
    }
    
    // Look for any usable bucket - prefer 'client-files' if it exists
    const clientFilesBucket = buckets?.find(bucket => bucket.name === 'client-files');
    const anyBucket = buckets && buckets.length > 0 ? buckets[0] : null;
    
    if (!clientFilesBucket && !anyBucket) {
      return {
        success: false,
        message: 'No storage buckets found. Please ask your administrator to create a "client-files" bucket.'
      };
    }
    
    const bucketToUse = clientFilesBucket ? 'client-files' : anyBucket.name;
    console.log(`Using storage bucket: ${bucketToUse}`);
    
    // Create a folder for each client in the storage
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id');
    
    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      return {
        success: false,
        message: 'Failed to fetch clients. Please contact your administrator.'
      };
    }
    
    // For each client, ensure they have a root folder in storage
    for (const client of clients || []) {
      const clientPath = `clients/${client.id}/root`;
      
      // Check if folder exists by trying to list files
      const { data: folderCheck, error: folderCheckError } = await supabase
        .storage
        .from(bucketToUse)
        .list(clientPath);
      
      // If there's an error that's not just "folder doesn't exist", log it
      if (folderCheckError && folderCheckError.message !== 'The resource was not found') {
        console.error(`Error checking folder for client ${client.id}:`, folderCheckError);
      }
      
      // If folder doesn't exist (empty result or specific error), create it with an empty .keep file
      if (!folderCheck || folderCheck.length === 0 || 
          (folderCheckError && folderCheckError.message === 'The resource was not found')) {
        
        // Create an empty .keep file to establish the folder
        const emptyFile = new Blob([''], { type: 'text/plain' });
        const { error: uploadError } = await supabase
          .storage
          .from(bucketToUse)
          .upload(`${clientPath}/.keep`, emptyFile);
        
        if (uploadError && uploadError.message !== 'The resource already exists') {
          console.error(`Error creating folder for client ${client.id}:`, uploadError);
        }
      }
    }
    
    // Store the bucket name in localStorage for use in other components
    localStorage.setItem('fileStorageBucket', bucketToUse);
    
    return {
      success: true,
      message: `File system setup completed successfully using the "${bucketToUse}" bucket.`
    };
  } catch (error) {
    console.error('Error setting up file system:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while setting up the file system. Please contact your administrator.'
    };
  }
};

/**
 * Checks if the file system is properly set up.
 * @returns Promise<boolean> - True if the file system is set up, false otherwise.
 */
export const checkFileSystemTables = async (): Promise<boolean> => {
  try {
    // Check if any storage buckets exist
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('Error checking storage buckets:', bucketsError);
      return false;
    }
    
    // If there are any buckets, we can use them
    return buckets && buckets.length > 0;
  } catch (error) {
    console.error('Error checking file system setup:', error);
    return false;
  }
};

/**
 * Gets the name of the bucket to use for file storage.
 * @returns string - The name of the bucket to use.
 */
export const getStorageBucket = (): string => {
  // Check if we have a bucket name in localStorage
  const storedBucket = localStorage.getItem('fileStorageBucket');
  if (storedBucket) {
    return storedBucket;
  }
  
  // Default to 'client-files' if not found
  return 'client-files';
};
