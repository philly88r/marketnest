const { Client } = require('pg');

async function checkDatabase() {
  // Connect to the database
  const client = new Client({
    connectionString: 'postgresql://postgres:Yitbos88@db.dvuiiloynbrtdrabtzsg.supabase.co:5432/postgres'
  });
  
  try {
    await client.connect();
    console.log('Connected to database');

    // List all tables
    console.log('\n--- TABLES ---');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    tablesResult.rows.forEach(row => {
      console.log(row.table_name);
    });

    // For each table, list its columns
    for (const tableRow of tablesResult.rows) {
      const tableName = tableRow.table_name;
      console.log(`\n--- COLUMNS IN ${tableName} ---`);
      
      const columnsResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
      `, [tableName]);
      
      columnsResult.rows.forEach(row => {
        console.log(`${row.column_name} (${row.data_type})`);
      });
    }

    // Check for Liberty Beans Coffee client
    console.log('\n--- CHECKING FOR LIBERTY BEANS COFFEE ---');
    const clientsTable = tablesResult.rows.find(row => 
      row.table_name === 'clients' || 
      row.table_name === 'client' || 
      row.table_name === 'customer' || 
      row.table_name === 'customers'
    );
    
    // Also check for client_projects table
    const projectsTable = tablesResult.rows.find(row => 
      row.table_name === 'client_projects' || 
      row.table_name === 'projects'
    );

    if (clientsTable) {
      const clientTableName = clientsTable.table_name;
      console.log(`Found clients table: ${clientTableName}`);
      
      // Check for Liberty Beans Coffee client
      const clientResult = await client.query(`
        SELECT * FROM ${clientTableName} 
        WHERE id = 'client-liberty-beans' OR id = 'client-001'
      `);
      
      if (clientResult.rows.length > 0) {
        console.log('Found Liberty Beans Coffee client:');
        console.log(JSON.stringify(clientResult.rows, null, 2));
      } else {
        console.log('Liberty Beans Coffee client not found');
      }
    } else {
      console.log('No clients table found');
    }
    
    // Check for projects
    if (projectsTable) {
      const projectTableName = projectsTable.table_name;
      console.log(`\n--- CHECKING FOR LIBERTY BEANS PROJECTS IN ${projectTableName} ---`);
      
      const projectsResult = await client.query(`
        SELECT * FROM ${projectTableName} 
        WHERE client_id = 'client-liberty-beans' OR client_id = 'client-001'
      `);
      
      if (projectsResult.rows.length > 0) {
        console.log(`Found ${projectsResult.rows.length} projects for Liberty Beans Coffee:`);
        console.log(JSON.stringify(projectsResult.rows, null, 2));
      } else {
        console.log('No projects found for Liberty Beans Coffee');
        
        // Try to create a test project
        console.log('\n--- ATTEMPTING TO CREATE A TEST PROJECT ---');
        try {
          const insertResult = await client.query(`
            INSERT INTO ${projectTableName} (client_id, name, description, status, progress, start_date, due_date)
            VALUES ('client-liberty-beans', 'Test Project', 'This is a test project', 'planning', 0, NOW(), NOW() + INTERVAL '30 days')
            RETURNING *
          `);
          
          console.log('Created test project:');
          console.log(JSON.stringify(insertResult.rows[0], null, 2));
        } catch (err) {
          console.log('Error creating test project:', err.message);
        }
      }
      const clientsResult = await client.query(`
        SELECT * FROM ${clientTableName} 
        WHERE name LIKE '%Liberty Beans%' OR name LIKE '%liberty%'
      `);
      
      if (clientsResult.rows.length > 0) {
        console.log('Found Liberty Beans client:');
        console.log(JSON.stringify(clientsResult.rows, null, 2));
      } else {
        console.log('Liberty Beans client not found in database');
      }
    } else {
      console.log('No clients/customers table found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

checkDatabase();
