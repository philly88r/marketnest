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

async function compareClients() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Query Liberty Beans client information
    console.log('\n=== Liberty Beans Client Data ===');
    const libertyResult = await client.query("SELECT * FROM clients WHERE id = 'client-liberty-beans'");
    
    if (libertyResult.rows.length === 0) {
      console.log('No client found with ID client-liberty-beans');
    } else {
      console.log('Liberty Beans client details:');
      console.log(libertyResult.rows[0]);
      
      // Check if user_id exists and is valid
      const libertyUserId = libertyResult.rows[0].user_id;
      
      if (libertyUserId) {
        console.log('\nChecking auth.users for Liberty Beans user_id...');
        const libertyAuthResult = await client.query('SELECT id, email, created_at FROM auth.users WHERE id = $1', [libertyUserId]);
        
        if (libertyAuthResult.rows.length === 0) {
          console.log('No auth user found with ID', libertyUserId);
        } else {
          console.log('Auth user details:');
          console.log(libertyAuthResult.rows[0]);
        }
      } else {
        console.log('\nNo user_id associated with Liberty Beans client');
      }
    }

    // Query Altare client information
    console.log('\n=== Altare Client Data ===');
    const altareResult = await client.query("SELECT * FROM clients WHERE id = 'client-004'");
    
    if (altareResult.rows.length === 0) {
      console.log('No client found with ID client-004');
    } else {
      console.log('Altare client details:');
      console.log(altareResult.rows[0]);
      
      // Check if user_id exists and is valid
      const altareUserId = altareResult.rows[0].user_id;
      
      if (altareUserId) {
        console.log('\nChecking auth.users for Altare user_id...');
        const altareAuthResult = await client.query('SELECT id, email, created_at FROM auth.users WHERE id = $1', [altareUserId]);
        
        if (altareAuthResult.rows.length === 0) {
          console.log('No auth user found with ID', altareUserId);
        } else {
          console.log('Auth user details:');
          console.log(altareAuthResult.rows[0]);
        }
      } else {
        console.log('\nNo user_id associated with Altare client');
      }
    }

    // Check auth users by email
    console.log('\n=== Auth Users by Email ===');
    const emailsToCheck = ['liberty@beans.coffee', 'hello@joinaltare.com'];
    
    for (const email of emailsToCheck) {
      console.log(`\nChecking auth.users for email: ${email}`);
      const emailAuthResult = await client.query('SELECT id, email, created_at FROM auth.users WHERE email = $1', [email]);
      
      if (emailAuthResult.rows.length === 0) {
        console.log('No auth user found with email', email);
      } else {
        console.log('Auth user details:');
        console.log(emailAuthResult.rows[0]);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close the connection
    await client.end();
    console.log('\nConnection closed');
  }
}

// Run the function
compareClients();
