const { Client } = require('pg');
const fetch = require('node-fetch');
const fs = require('fs');

// Supabase Postgres connection string
const connectionString = 'postgresql://postgres:Yitbos88@db.dvuiiloynbrtdrabtzsg.supabase.co:5432/postgres';

// Supabase REST API details (replace with your anon key if needed)
const supabaseUrl = 'https://dvuiiloynbrtdrabtzsg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dWlpbG95bmJydGRyYWJ0enNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDM1MDksImV4cCI6MjA1OTg3OTUwOX0.aef4QCYboLzhyw8im1pGZe7v0tweAnQ3haN1T0mVLmE';

const pgClient = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function listClients() {
  await pgClient.connect();
  const res = await pgClient.query('SELECT id, name, contactemail FROM clients');
  await pgClient.end();
  return res.rows;
}

async function listAuthUsers() {
  const res = await fetch(`${supabaseUrl}/auth/v1/users`, {
    headers: {
      apiKey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch auth users');
  const data = await res.json();
  return data.users || data;
}

(async () => {
  try {
    const clients = await listClients();
    let output = 'Clients table:\n';
    clients.forEach(row => {
      output += JSON.stringify(row) + '\n';
      console.log(row);
    });

    const users = await listAuthUsers();
    output += '\nSupabase Auth users:\n';
    users.forEach(user => {
      const userInfo = {
        id: user.id,
        email: user.email,
        confirmed_at: user.confirmed_at,
      };
      output += JSON.stringify(userInfo) + '\n';
      console.log(userInfo);
    });

    fs.writeFileSync('../auth_and_clients_output.txt', output);
    console.log('\nFull output written to ../auth_and_clients_output.txt');
  } catch (err) {
    console.error('Error:', err);
  }
})();
