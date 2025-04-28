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

async function checkClientStructure() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Get table structure
    console.log('Checking clients table structure:');
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'clients'
      ORDER BY ordinal_position;
    `);
    console.log(tableStructure.rows);

    // Query Altare client information
    console.log('\nChecking Altare client data:');
    const altareResult = await client.query("SELECT * FROM clients WHERE username = 'Altare'");
    
    if (altareResult.rows.length === 0) {
      console.log('No client found with username Altare');
    } else {
      console.log('Altare client details:');
      console.log(altareResult.rows[0]);
      
      // Check the ID specifically
      console.log('\nAltare client ID:');
      console.log('ID value:', altareResult.rows[0].id);
      console.log('ID type:', typeof altareResult.rows[0].id);
      console.log('ID JSON stringify:', JSON.stringify(altareResult.rows[0].id));
    }

    // Query Liberty Beans client information
    console.log('\nChecking Liberty Beans client data:');
    const libertyResult = await client.query("SELECT * FROM clients WHERE username = 'LibertyBeans'");
    
    if (libertyResult.rows.length === 0) {
      console.log('No client found with username LibertyBeans');
    } else {
      console.log('Liberty Beans client details:');
      console.log(libertyResult.rows[0]);
      
      // Check the ID specifically
      console.log('\nLiberty Beans client ID:');
      console.log('ID value:', libertyResult.rows[0].id);
      console.log('ID type:', typeof libertyResult.rows[0].id);
      console.log('ID JSON stringify:', JSON.stringify(libertyResult.rows[0].id));
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
checkClientStructure();
