const { Client } = require('pg');
const connectionString = 'postgresql://postgres:Yitbos88@db.dvuiiloynbrtdrabtzsg.supabase.co:5432/postgres';

const pgClient = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function checkClientByUserId() {
  try {
    await pgClient.connect();
    const uuid = '434dc5a8-b575-4d68-ad2e-f15946c92138'; // your Auth UUID
    const res = await pgClient.query('SELECT * FROM clients WHERE user_id = $1', [uuid]);
    console.log('Result:', res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pgClient.end();
  }
}

checkClientByUserId();
