const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yitbos88@db.dvuiiloynbrtdrabtzsg.supabase.co:5432/postgres';

const pgClient = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function disableRLS() {
  try {
    await pgClient.connect();
    
    // Disable RLS for clients table
    await pgClient.query(`
      ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
    `);
    
    console.log('RLS has been disabled for the clients table');
    
    // Verify RLS status
    const rlsRes = await pgClient.query(`
      SELECT relname, relrowsecurity 
      FROM pg_class 
      WHERE relname = 'clients'
    `);
    
    console.log('Updated RLS status:');
    console.log(rlsRes.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pgClient.end();
  }
}

disableRLS();
