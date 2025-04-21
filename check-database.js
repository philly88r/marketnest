const { Client } = require('pg');

// Connection configuration using the direct connection string
const client = new Client({
  connectionString: 'postgresql://postgres:Yitbos88@db.dvuiiloynbrtdrabtzsg.supabase.co:5432/postgres'
});

async function checkDatabase() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database');

    // Check tables in the database
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n=== DATABASE TABLES ===');
    tablesResult.rows.forEach(row => {
      console.log(row.table_name);
    });

    // Check if clients table exists before querying
    const clientsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clients'
      );
    `);
    
    if (clientsTableCheck.rows[0].exists) {
      // Check clients table
      console.log('\n=== CLIENTS TABLE ===');
      const clientsResult = await client.query('SELECT * FROM clients LIMIT 5;');
      console.log(`Found ${clientsResult.rows.length} clients`);
      clientsResult.rows.forEach(client => {
        console.log(`- ${client.id}: ${client.name || 'No name'} (${client.status || 'No status'})`);
      });
    } else {
      console.log('\n=== CLIENTS TABLE NOT FOUND ===');
    }

    // Check if client_projects table exists before querying
    const projectsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'client_projects'
      );
    `);
    
    if (projectsTableCheck.rows[0].exists) {
      // Check client_projects table
      console.log('\n=== CLIENT_PROJECTS TABLE ===');
      const projectsResult = await client.query('SELECT * FROM client_projects LIMIT 5;');
      console.log(`Found ${projectsResult.rows.length} projects`);
      projectsResult.rows.forEach(project => {
        console.log(`- ${project.id}: ${project.name || 'No name'} (Client: ${project.client_id || 'No client'}, Status: ${project.status || 'No status'})`);
      });
    } else {
      console.log('\n=== CLIENT_PROJECTS TABLE NOT FOUND ===');
    }

    // Check if client_project_tasks table exists before querying
    const tasksTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'client_project_tasks'
      );
    `);
    
    if (tasksTableCheck.rows[0].exists) {
      // Check client_project_tasks table
      console.log('\n=== CLIENT_PROJECT_TASKS TABLE ===');
      const tasksResult = await client.query('SELECT * FROM client_project_tasks LIMIT 5;');
      console.log(`Found ${tasksResult.rows.length} tasks`);
      tasksResult.rows.forEach(task => {
        console.log(`- ${task.id}: ${task.name || 'No name'} (Project: ${task.project_id || 'No project'}, Status: ${task.status || 'No status'})`);
      });
    } else {
      console.log('\n=== CLIENT_PROJECT_TASKS TABLE NOT FOUND ===');
    }

  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    // Close the connection
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the check
checkDatabase();
