// Script to list all tables in the Supabase database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize the Supabase client with environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://dvuiiloynbrtdrabtzsg.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dWlpbG95bmJydGRyYWJ0enNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDM1MDksImV4cCI6MjA1OTg3OTUwOX0.aef4QCYboLzhyw8im1pGZe7v0tweAnQ3haN1T0mVLmE';

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listAllTables() {
  console.log('Listing all tables in the Supabase database...');
  console.log('Supabase URL:', supabaseUrl);
  
  try {
    // Query to get all tables in the database
    const { data, error } = await supabase
      .rpc('list_tables');
    
    if (error) {
      console.error('Error listing tables:', error);
      
      // Try alternative method to list tables
      console.log('\nTrying alternative method to list tables...');
      const { data: tables, error: tablesError } = await supabase
        .from('pg_catalog.pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
      
      if (tablesError) {
        console.error('Error with alternative method:', tablesError);
        
        // Try another alternative
        console.log('\nTrying to query information_schema.tables...');
        const { data: schemaData, error: schemaError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
        
        if (schemaError) {
          console.error('Error querying information_schema:', schemaError);
        } else {
          console.log('Tables found in information_schema:');
          console.log(schemaData);
        }
      } else {
        console.log('Tables found:');
        console.log(tables);
      }
      
      // Try to query the clients table directly to see what's available
      console.log('\nChecking clients table directly...');
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .limit(1);
      
      if (clientsError) {
        console.error('Error querying clients table:', clientsError);
      } else {
        console.log('Clients table exists with structure:');
        if (clients && clients.length > 0) {
          console.log('Column names:', Object.keys(clients[0]));
        } else {
          console.log('Clients table exists but is empty');
        }
      }
      
    } else {
      console.log('Tables found:');
      console.log(data);
    }
    
  } catch (error) {
    console.error('Error listing tables:', error);
    
    // Try a direct query to the clients table as a fallback
    try {
      console.log('\nTrying direct query to clients table...');
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .limit(1);
      
      if (clientsError) {
        console.error('Error querying clients table:', clientsError);
      } else {
        console.log('Clients table exists with columns:');
        if (clients && clients.length > 0) {
          console.log(Object.keys(clients[0]));
        } else {
          console.log('Clients table exists but is empty');
        }
      }
    } catch (directError) {
      console.error('Error with direct query:', directError);
    }
  }
}

// Run the function
listAllTables();
