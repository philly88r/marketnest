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

    console.log('\n=== ALL TABLES AND THEIR COLUMNS ===');
    
    // For each table, get its columns
    for (const tableRow of tablesResult.rows) {
      const tableName = tableRow.table_name;
      console.log(`\n--- Table: ${tableName} ---`);
      
      const columnsResult = await client.query(`
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
        ORDER BY ordinal_position;
      `);
      
      columnsResult.rows.forEach(row => {
        let columnInfo = `${row.column_name} (${row.data_type})`;
        if (row.character_maximum_length) {
          columnInfo += ` [max length: ${row.character_maximum_length}]`;
        }
        if (row.column_default) {
          columnInfo += ` [default: ${row.column_default}]`;
        }
        columnInfo += row.is_nullable === 'YES' ? ' [nullable]' : ' [not null]';
        console.log(columnInfo);
      });

      // Get primary key information
      const pkResult = await client.query(`
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = '${tableName}'::regclass
        AND i.indisprimary;
      `);
      
      if (pkResult.rows.length > 0) {
        const primaryKeys = pkResult.rows.map(row => row.attname).join(', ');
        console.log(`Primary Key: ${primaryKeys}`);
      }

      // Get foreign key information
      const fkResult = await client.query(`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = '${tableName}';
      `);
      
      if (fkResult.rows.length > 0) {
        console.log('Foreign Keys:');
        fkResult.rows.forEach(row => {
          console.log(`  ${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
        });
      }
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
