const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yitbos88@db.dvuiiloynbrtdrabtzsg.supabase.co:5432/postgres';

const pgClient = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function listClientUserIds() {
  try {
    await pgClient.connect();
    const res = await pgClient.query('SELECT id, name, user_id FROM clients');
    console.log('Clients table (id, name, user_id):');
    res.rows.forEach(row => {
      console.log(row);
    });
  } catch (err) {
    console.error('Error querying clients table:', err);
  } finally {
    await pgClient.end();
  }
}

listClientUserIds();
