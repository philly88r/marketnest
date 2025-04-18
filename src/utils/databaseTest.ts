import { supabase } from './supabaseClient';

/**
 * Test function to verify database connection
 * This function attempts to query a simple count from the database
 * to confirm connectivity without requiring specific permissions
 */
export const testDatabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    console.log('Testing database connection...');
    
    // Try to get the current timestamp from the database
    // This is a simple query that should work even with limited permissions
    const { data, error } = await supabase.rpc('get_timestamp');
    
    if (error) {
      console.error('Database connection test failed:', error);
      
      // Try a simpler test - just check if we can connect at all
      const { data: versionData, error: versionError } = await supabase.from('_version').select('*').limit(1);
      
      if (versionError) {
        console.error('Secondary database test failed:', versionError);
        return {
          success: false,
          message: 'Failed to connect to database',
          details: { primaryError: error, secondaryError: versionError }
        };
      }
      
      return {
        success: true,
        message: 'Limited connection to database established (version check only)',
        details: { versionData }
      };
    }
    
    console.log('Database connection test succeeded:', data);
    return {
      success: true,
      message: 'Successfully connected to database',
      details: { timestamp: data }
    };
  } catch (error) {
    console.error('Unexpected error during database connection test:', error);
    return {
      success: false,
      message: 'Unexpected error during database connection test',
      details: error
    };
  }
};

/**
 * Test function to verify if we can read from a specific table
 */
export const testTableRead = async (tableName: string): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    console.log(`Testing read access to table: ${tableName}`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`Failed to read from table ${tableName}:`, error);
      return {
        success: false,
        message: `Failed to read from table ${tableName}`,
        details: error
      };
    }
    
    console.log(`Successfully read from table ${tableName}:`, data);
    return {
      success: true,
      message: `Successfully read from table ${tableName}`,
      details: { data }
    };
  } catch (error) {
    console.error(`Unexpected error reading from table ${tableName}:`, error);
    return {
      success: false,
      message: `Unexpected error reading from table ${tableName}`,
      details: error
    };
  }
};

/**
 * Test function to verify if we can write to a specific table
 */
export const testTableWrite = async (tableName: string): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    console.log(`Testing write access to table: ${tableName}`);
    
    // Create a test record with a timestamp to make it unique
    const testRecord = {
      test_id: `test-${Date.now()}`,
      test_data: 'This is a test record',
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from(tableName)
      .insert([testRecord])
      .select();
    
    if (error) {
      console.error(`Failed to write to table ${tableName}:`, error);
      return {
        success: false,
        message: `Failed to write to table ${tableName}`,
        details: error
      };
    }
    
    console.log(`Successfully wrote to table ${tableName}:`, data);
    return {
      success: true,
      message: `Successfully wrote to table ${tableName}`,
      details: { data }
    };
  } catch (error) {
    console.error(`Unexpected error writing to table ${tableName}:`, error);
    return {
      success: false,
      message: `Unexpected error writing to table ${tableName}`,
      details: error
    };
  }
};
