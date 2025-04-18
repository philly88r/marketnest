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

    // Query to get all tables in the public schema
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n--- Tables in the database ---');
    tablesResult.rows.forEach(row => {
      console.log(row.table_name);
    });

    // Check if checklist_items table exists
    const checklistTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%checklist%';
    `);

    console.log('\n--- Checklist-related tables ---');
    if (checklistTablesResult.rows.length === 0) {
      console.log('No checklist-related tables found');
    } else {
      checklistTablesResult.rows.forEach(row => {
        console.log(row.table_name);
      });
    }

    // For the first checklist table found, get its columns
    if (checklistTablesResult.rows.length > 0) {
      const checklistTable = checklistTablesResult.rows[0].table_name;
      console.log(`\n--- Columns in ${checklistTable} table ---`);
      
      const columnsResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = '${checklistTable}'
        ORDER BY ordinal_position;
      `);
      
      columnsResult.rows.forEach(row => {
        console.log(`${row.column_name} (${row.data_type})`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await client.end();
    console.log('\nConnection closed');
  }
}

main();
