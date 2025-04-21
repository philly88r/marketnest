const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yitbos88@db.dvuiiloynbrtdrabtzsg.supabase.co:5432/postgres';

const pgClient = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function listClients() {
  try {
    await pgClient.connect();
    const res = await pgClient.query('SELECT id, name, contactemail FROM clients');
    console.log('Clients table:');
    res.rows.forEach(row => {
      console.log(row);
    });
  } catch (err) {
    console.error('Error querying clients table:', err);
  } finally {
    await pgClient.end();
  }
}

listClients();
