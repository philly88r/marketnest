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

async function fixAltareAuth() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Get the correct user_id for hello@joinaltare.com
    const authResult = await client.query(
      "SELECT id FROM auth.users WHERE email = 'hello@joinaltare.com'"
    );
    
    if (authResult.rows.length === 0) {
      console.log('No auth user found with email hello@joinaltare.com');
      return;
    }
    
    const correctUserId = authResult.rows[0].id;
    console.log('Found correct user_id for hello@joinaltare.com:', correctUserId);
    
    // Update the Altare client record with the correct user_id
    const updateResult = await client.query(
      "UPDATE clients SET user_id = $1 WHERE id = 'client-004'",
      [correctUserId]
    );
    
    console.log('Update result:', updateResult);
    console.log('Updated Altare client record with correct user_id');
    
    // Verify the update
    const verifyResult = await client.query("SELECT id, name, user_id FROM clients WHERE id = 'client-004'");
    console.log('Verified Altare client record:');
    console.log(verifyResult.rows[0]);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close the connection
    await client.end();
    console.log('Connection closed');
  }
}

// Run the function
fixAltareAuth();
