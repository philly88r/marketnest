const { Client } = require('pg');

async function checkLibertyBeans() {
  // Connect to the database
  const client = new Client({
    connectionString: 'postgresql://postgres:Yitbos88@db.dvuiiloynbrtdrabtzsg.supabase.co:5432/postgres'
  });
  
  try {
    await client.connect();
    console.log('Connected to database');

    // Check for Liberty Beans Coffee client
    console.log('\n--- CHECKING FOR LIBERTY BEANS COFFEE CLIENT ---');
    try {
      const clientResult = await client.query(`
        SELECT * FROM clients 
        WHERE id = 'client-liberty-beans' OR id = 'client-001'
      `);
      
      if (clientResult.rows.length > 0) {
        console.log('Found Liberty Beans Coffee client:');
        console.log(JSON.stringify(clientResult.rows, null, 2));
      } else {
        console.log('Liberty Beans Coffee client not found in clients table');
      }
    } catch (err) {
      console.log('Error querying clients table:', err.message);
    }
    
    // Check for Liberty Beans projects
    console.log('\n--- CHECKING FOR LIBERTY BEANS PROJECTS ---');
    try {
      const projectsResult = await client.query(`
        SELECT * FROM client_projects 
        WHERE client_id = 'client-liberty-beans' OR client_id = 'client-001'
      `);
      
      if (projectsResult.rows.length > 0) {
        console.log(`Found ${projectsResult.rows.length} projects for Liberty Beans Coffee:`);
        console.log(JSON.stringify(projectsResult.rows, null, 2));
      } else {
        console.log('No projects found for Liberty Beans Coffee in client_projects table');
        
        // Try to create a test project
        console.log('\n--- ATTEMPTING TO CREATE A TEST PROJECT ---');
        try {
          const insertResult = await client.query(`
            INSERT INTO client_projects (client_id, name, description, status, progress, start_date, due_date)
            VALUES ('client-liberty-beans', 'Test Project', 'This is a test project', 'planning', 0, NOW(), NOW() + INTERVAL '30 days')
            RETURNING *
          `);
          
          console.log('Created test project:');
          console.log(JSON.stringify(insertResult.rows[0], null, 2));
        } catch (insertErr) {
          console.log('Error creating test project:', insertErr.message);
        }
      }
    } catch (err) {
      console.log('Error querying client_projects table:', err.message);
    }

  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await client.end();
    console.log('\nDisconnected from database');
  }
}

// Run the check
checkLibertyBeans().catch(err => {
  console.error('Script error:', err);
});
