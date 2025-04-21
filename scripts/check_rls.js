const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yitbos88@db.dvuiiloynbrtdrabtzsg.supabase.co:5432/postgres';

const pgClient = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function checkRLS() {
  try {
    await pgClient.connect();
    
    // Check if RLS is enabled for clients table
    const rlsRes = await pgClient.query(`
      SELECT relname, relrowsecurity 
      FROM pg_class 
      WHERE relname = 'clients'
    `);
    
    console.log('RLS status for clients table:');
    console.log(rlsRes.rows);
    
    // Check existing RLS policies
    const policiesRes = await pgClient.query(`
      SELECT * FROM pg_policies 
      WHERE tablename = 'clients'
    `);
    
    console.log('Existing RLS policies for clients table:');
    console.log(policiesRes.rows);
    
    // Test direct query to clients table
    const clientsRes = await pgClient.query(`
      SELECT id, name, user_id FROM clients
    `);
    
    console.log('Direct query to clients table:');
    console.log(clientsRes.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pgClient.end();
  }
}

checkRLS();
