const { Client } = require('pg');

// Connect to the database
const client = new Client({
  connectionString: 'postgresql://postgres:Yitbos88@db.dvuiiloynbrtdrabtzsg.supabase.co:5432/postgres'
});

async function analyzeDatabase() {
  try {
    await client.connect();
    console.log('Connected to database');

    // List all tables
    console.log('\n=== ALL TABLES ===');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    tablesResult.rows.forEach(row => {
      console.log(row.table_name);
    });

    // For each table, list its columns and sample data
    for (const tableRow of tablesResult.rows) {
      const tableName = tableRow.table_name;
      console.log(`\n=== TABLE: ${tableName} ===`);
      
      // Get columns
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      
      console.log('COLUMNS:');
      columnsResult.rows.forEach(row => {
        console.log(`  ${row.column_name} (${row.data_type}, ${row.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
      });
      
      // Get sample data (first 5 rows)
      try {
        const dataResult = await client.query(`
          SELECT * FROM "${tableName}" LIMIT 5
        `);
        
        console.log('SAMPLE DATA:');
        if (dataResult.rows.length > 0) {
          console.log(JSON.stringify(dataResult.rows, null, 2));
        } else {
          console.log('  No data found');
        }
      } catch (err) {
        console.log(`  Error fetching sample data: ${err.message}`);
      }
    }

    // Check for foreign key relationships
    console.log('\n=== FOREIGN KEY RELATIONSHIPS ===');
    const foreignKeysResult = await client.query(`
      SELECT
        tc.table_schema, 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name
    `);
    
    if (foreignKeysResult.rows.length > 0) {
      foreignKeysResult.rows.forEach(row => {
        console.log(`${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
      });
    } else {
      console.log('No foreign key relationships found');
    }

    // Specifically check Liberty Beans Coffee client and related data
    console.log('\n=== LIBERTY BEANS COFFEE CLIENT DATA ===');
    
    // Check client record
    const clientResult = await client.query(`
      SELECT * FROM clients WHERE name LIKE '%Liberty Beans%'
    `);
    
    if (clientResult.rows.length > 0) {
      console.log('CLIENT RECORD:');
      console.log(JSON.stringify(clientResult.rows[0], null, 2));
      
      const clientId = clientResult.rows[0].id;
      
      // Check projects
      const projectsResult = await client.query(`
        SELECT * FROM client_projects WHERE client_id = $1
      `, [clientId]);
      
      console.log('\nPROJECTS:');
      if (projectsResult.rows.length > 0) {
        console.log(JSON.stringify(projectsResult.rows, null, 2));
        
        // Check tasks for each project
        console.log('\nTASKS:');
        for (const project of projectsResult.rows) {
          const tasksResult = await client.query(`
            SELECT * FROM client_project_tasks WHERE project_id = $1
          `, [project.id]);
          
          console.log(`\nTasks for project ${project.name}:`);
          if (tasksResult.rows.length > 0) {
            console.log(JSON.stringify(tasksResult.rows, null, 2));
          } else {
            console.log('No tasks found');
          }
        }
      } else {
        console.log('No projects found');
      }
      
      // Check files
      const filesResult = await client.query(`
        SELECT * FROM client_files WHERE client_id = $1
      `, [clientId]);
      
      console.log('\nFILES:');
      if (filesResult.rows.length > 0) {
        console.log(JSON.stringify(filesResult.rows, null, 2));
      } else {
        console.log('No files found');
      }
      
      // Check checklist items
      const checklistResult = await client.query(`
        SELECT * FROM client_checklist_items WHERE client_id = $1
      `, [clientId]);
      
      console.log('\nCHECKLIST ITEMS:');
      if (checklistResult.rows.length > 0) {
        console.log(JSON.stringify(checklistResult.rows, null, 2));
      } else {
        console.log('No checklist items found');
      }
    } else {
      console.log('Liberty Beans Coffee client not found');
    }

  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await client.end();
    console.log('\nDisconnected from database');
  }
}

analyzeDatabase();
