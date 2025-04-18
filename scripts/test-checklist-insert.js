const { Client } = require('pg');

// Connection configuration
const client = new Client({
  connectionString: 'postgresql://postgres:Yitbos88@db.dvuiiloynbrtdrabtzsg.supabase.co:5432/postgres'
});

async function main() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database');

    // Insert a test checklist item
    const testItem = {
      client_id: 'client-liberty-beans', // Using Liberty Beans as a test client
      content: 'Test checklist item ' + new Date().toISOString(),
      is_completed: false,
      created_by: 'admin'
    };

    console.log('Inserting test checklist item:', testItem);

    const insertResult = await client.query(`
      INSERT INTO client_checklist_items (client_id, content, is_completed, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [testItem.client_id, testItem.content, testItem.is_completed, testItem.created_by]);

    console.log('Insert result:', insertResult.rows[0]);

    // Fetch all checklist items for the client
    const fetchResult = await client.query(`
      SELECT * FROM client_checklist_items
      WHERE client_id = $1
      ORDER BY created_at DESC
    `, [testItem.client_id]);

    console.log('\nAll checklist items for client:', testItem.client_id);
    fetchResult.rows.forEach(row => {
      console.log(row);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await client.end();
    console.log('\nConnection closed');
  }
}

main();
