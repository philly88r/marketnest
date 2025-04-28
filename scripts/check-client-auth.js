const { Client } = require('pg');

// Database connection configuration
const dbConfig = {
  connectionString: 'postgresql://postgres:Yitbos88@db.dvuiiloynbrtdrabtzsg.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false // Required for Supabase connection
  }
};

// Create a new client
const client = new Client(dbConfig);

async function checkClientAuth() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Query client-004 information
    const clientResult = await client.query('SELECT * FROM clients WHERE id = $1', ['client-004']);
    
    if (clientResult.rows.length === 0) {
      console.log('No client found with ID client-004');
    } else {
      console.log('Client-004 details:');
      console.log(clientResult.rows[0]);
      
      // Check if user_id exists and is valid
      const userId = clientResult.rows[0].user_id;
      
      if (userId) {
        console.log('\nChecking auth.users for this user_id...');
        const authResult = await client.query('SELECT id, email, created_at FROM auth.users WHERE id = $1', [userId]);
        
        if (authResult.rows.length === 0) {
          console.log('No auth user found with ID', userId);
        } else {
          console.log('Auth user details:');
          console.log(authResult.rows[0]);
        }
      } else {
        console.log('\nNo user_id associated with this client. Checking if email exists in auth.users...');
        
        // Try to find by email
        const email = clientResult.rows[0].contactemail;
        if (email) {
          const emailAuthResult = await client.query('SELECT id, email, created_at FROM auth.users WHERE email = $1', [email]);
          
          if (emailAuthResult.rows.length === 0) {
            console.log('No auth user found with email', email);
          } else {
            console.log('Auth user details for email', email);
            console.log(emailAuthResult.rows[0]);
          }
        } else {
          console.log('No contact email available for this client');
        }
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close the connection
    await client.end();
    console.log('Connection closed');
  }
}

// Run the function
checkClientAuth();
