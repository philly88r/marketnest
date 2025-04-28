const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// Database connection configuration
const dbConfig = {
  connectionString: 'postgresql://postgres:Yitbos88@db.dvuiiloynbrtdrabtzsg.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false // Required for Supabase connection
  }
};

// Supabase configuration
const supabaseUrl = 'https://dvuiiloynbrtdrabtzsg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dWlpbG95bmJydGRyYWJ0enNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDM1MDksImV4cCI6MjA1OTg3OTUwOX0.aef4QCYboLzhyw8im1pGZe7v0tweAnQ3haN1T0mVLmE';
const supabase = createClient(supabaseUrl, supabaseKey);

// Create a new PostgreSQL client
const pgClient = new Client(dbConfig);

async function fixClientAuth() {
  try {
    // Connect to the database
    await pgClient.connect();
    console.log('Connected to the database');

    // Get client-004 information
    const clientResult = await pgClient.query('SELECT * FROM clients WHERE id = $1', ['client-004']);
    
    if (clientResult.rows.length === 0) {
      console.log('No client found with ID client-004');
      return;
    }
    
    const client = clientResult.rows[0];
    console.log('Client-004 details:');
    console.log(client);
    
    // Create a new auth user for the client with the correct email
    const email = 'contact@altare.tech'; // Use the client's actual email
    const password = 'tech2025'; // Use the client's password from the database
    
    console.log(`Creating new auth user with email: ${email}`);
    
    // Check if user already exists with this email
    const { data: existingUser, error: existingUserError } = await supabase.auth.admin.listUsers();
    
    if (existingUserError) {
      console.error('Error checking existing users:', existingUserError);
      return;
    }
    
    const userExists = existingUser.users.some(user => user.email === email);
    
    if (userExists) {
      console.log('User already exists with this email. Fetching user details...');
      
      // Get the user ID
      const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(email);
      
      if (userError) {
        console.error('Error getting user by email:', userError);
        return;
      }
      
      const userId = userData.user.id;
      console.log(`Found user with ID: ${userId}`);
      
      // Update the client record with the correct user_id
      await pgClient.query('UPDATE clients SET user_id = $1 WHERE id = $2', [userId, 'client-004']);
      console.log('Updated client record with correct user_id');
    } else {
      console.log('Creating new user...');
      
      // Create a new user
      const { data: newUser, error: newUserError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      
      if (newUserError) {
        console.error('Error creating new user:', newUserError);
        return;
      }
      
      const userId = newUser.user.id;
      console.log(`Created new user with ID: ${userId}`);
      
      // Update the client record with the new user_id
      await pgClient.query('UPDATE clients SET user_id = $1 WHERE id = $2', [userId, 'client-004']);
      console.log('Updated client record with new user_id');
    }
    
    // Verify the update
    const updatedClientResult = await pgClient.query('SELECT * FROM clients WHERE id = $1', ['client-004']);
    console.log('Updated client-004 details:');
    console.log(updatedClientResult.rows[0]);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close the connection
    await pgClient.end();
    console.log('Connection closed');
  }
}

// Run the function
fixClientAuth();
