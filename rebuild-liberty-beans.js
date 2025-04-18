const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Connect to the database
const client = new Client({
  connectionString: 'postgresql://postgres:Yitbos88@db.dvuiiloynbrtdrabtzsg.supabase.co:5432/postgres'
});

async function rebuildLibertyBeansClient() {
  try {
    await client.connect();
    console.log('Connected to database');

    // STEP 1: Delete all existing Liberty Beans data
    console.log('Removing existing Liberty Beans data...');
    
    // Delete chat messages
    await client.query(`
      DELETE FROM chat_messages WHERE client_id = 'client-001'
    `);
    console.log('- Deleted chat messages');
    
    // Get project IDs for Liberty Beans
    const projectsResult = await client.query(`
      SELECT id FROM client_projects WHERE client_id = 'client-001'
    `);
    
    // Delete tasks for each project
    for (const project of projectsResult.rows) {
      await client.query(`
        DELETE FROM client_project_tasks WHERE project_id = $1
      `, [project.id]);
    }
    console.log('- Deleted project tasks');
    
    // Delete projects
    await client.query(`
      DELETE FROM client_projects WHERE client_id = 'client-001'
    `);
    console.log('- Deleted projects');
    
    // Delete checklist items
    await client.query(`
      DELETE FROM client_checklist_items WHERE client_id = 'client-001'
    `);
    console.log('- Deleted checklist items');
    
    // Delete files
    await client.query(`
      DELETE FROM client_files WHERE client_id = 'client-001'
    `);
    console.log('- Deleted files');
    
    // Delete folders
    await client.query(`
      DELETE FROM client_folders WHERE client_id = 'client-001'
    `);
    console.log('- Deleted folders');
    
    // Delete client
    await client.query(`
      DELETE FROM clients WHERE id = 'client-001'
    `);
    console.log('- Deleted client record');
    
    // STEP 2: Create new Liberty Beans client with a new ID
    const newClientId = 'client-liberty-beans';
    
    console.log('Creating new Liberty Beans client record...');
    await client.query(`
      INSERT INTO clients (
        id, name, logo, industry, contactname, contactemail, 
        contactphone, activeprojects, status, username, password
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
    `, [
      newClientId,
      'Liberty Beans Coffee',
      '/client-logos/liberty-beans.png',
      'Food & Beverage',
      'Liberty Beans',
      'jim@libertybeans.com',
      '(609) 707-6779',
      3,
      'active',
      'libertybeans',
      'coffee2025'
    ]);
    console.log(`- Created client with new ID: ${newClientId}`);
    
    // STEP 3: Create projects for Liberty Beans
    console.log('Creating projects for Liberty Beans...');
    
    const projects = [
      {
        id: uuidv4(),
        name: 'Website Redesign',
        description: 'Complete redesign of the Liberty Beans Coffee website with e-commerce functionality',
        status: 'in-progress',
        progress: 65
      },
      {
        id: uuidv4(),
        name: 'Social Media Campaign',
        description: 'Seasonal promotion campaign across Instagram, Facebook, and TikTok',
        status: 'in-progress',
        progress: 40
      },
      {
        id: uuidv4(),
        name: 'SEO Optimization',
        description: 'Improve search engine rankings for key coffee-related keywords',
        status: 'planning',
        progress: 20
      }
    ];
    
    for (const project of projects) {
      await client.query(`
        INSERT INTO client_projects (
          id, client_id, name, description, status, progress, 
          start_date, due_date, created_at, created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
      `, [
        project.id,
        newClientId,
        project.name,
        project.description,
        project.status,
        project.progress,
        new Date('2025-01-15'),
        new Date('2025-05-30'),
        new Date(),
        'admin'
      ]);
      console.log(`- Created project: ${project.name}`);
      
      // Add sample tasks for each project
      const taskNames = ['Research', 'Planning', 'Implementation', 'Testing', 'Launch'];
      
      for (let i = 0; i < taskNames.length; i++) {
        const taskId = uuidv4();
        const taskName = taskNames[i];
        const status = i < 2 ? 'completed' : i < 3 ? 'in-progress' : 'not-started';
        
        await client.query(`
          INSERT INTO client_project_tasks (
            id, project_id, name, status, assignee, 
            due_date, created_at, created_by
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          )
        `, [
          taskId,
          project.id,
          taskName,
          status,
          ['Alex', 'Morgan', 'Jamie', 'Casey', 'Taylor'][i % 5],
          new Date(Date.now() + (i * 7 * 24 * 60 * 60 * 1000)), // Due date every week
          new Date(),
          'admin'
        ]);
        console.log(`  - Created task: ${taskName}`);
      }
    }
    
    // STEP 4: Verify the new client data
    console.log('\nVerifying Liberty Beans client data...');
    
    const verifyClientResult = await client.query(`
      SELECT * FROM clients WHERE id = $1
    `, [newClientId]);
    
    console.log('CLIENT RECORD:');
    console.log(JSON.stringify(verifyClientResult.rows[0], null, 2));
    
    const verifyProjectsResult = await client.query(`
      SELECT * FROM client_projects WHERE client_id = $1
    `, [newClientId]);
    
    console.log('\nPROJECTS:');
    console.log(JSON.stringify(verifyProjectsResult.rows, null, 2));
    
    // Get tasks for first project
    if (verifyProjectsResult.rows.length > 0) {
      const firstProjectId = verifyProjectsResult.rows[0].id;
      
      const verifyTasksResult = await client.query(`
        SELECT * FROM client_project_tasks WHERE project_id = $1
      `, [firstProjectId]);
      
      console.log('\nTASKS FOR FIRST PROJECT:');
      console.log(JSON.stringify(verifyTasksResult.rows, null, 2));
    }
    
    console.log('\nLiberty Beans client has been completely rebuilt with new ID:', newClientId);
    console.log('Please update your code to use this new client ID if needed.');

  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await client.end();
    console.log('\nDisconnected from database');
  }
}

rebuildLibertyBeansClient();
