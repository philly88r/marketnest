const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Connect to the database
const client = new Client({
  connectionString: 'postgresql://postgres:Yitbos88@db.dvuiiloynbrtdrabtzsg.supabase.co:5432/postgres'
});

async function addLibertyBeansProjects() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check if Liberty Beans client exists
    const checkResult = await client.query(`
      SELECT * FROM clients WHERE id = 'client-001'
    `);
    
    if (checkResult.rows.length === 0) {
      console.log('Liberty Beans client not found, cannot add projects');
      return;
    }
    
    // Check if projects already exist
    const projectsResult = await client.query(`
      SELECT * FROM client_projects WHERE client_id = 'client-001'
    `);
    
    if (projectsResult.rows.length > 0) {
      console.log('Liberty Beans already has projects:');
      console.log(JSON.stringify(projectsResult.rows, null, 2));
      return;
    }
    
    // Add projects for Liberty Beans Coffee
    const projects = [
      {
        id: uuidv4(),
        client_id: 'client-001',
        name: 'Website Redesign',
        description: 'Complete redesign of the Liberty Beans Coffee website with e-commerce functionality',
        status: 'in-progress',
        progress: 65,
        start_date: new Date('2025-01-15'),
        due_date: new Date('2025-05-30'),
        created_at: new Date(),
        created_by: 'admin'
      },
      {
        id: uuidv4(),
        client_id: 'client-001',
        name: 'Social Media Campaign',
        description: 'Seasonal promotion campaign across Instagram, Facebook, and TikTok',
        status: 'in-progress',
        progress: 40,
        start_date: new Date('2025-02-01'),
        due_date: new Date('2025-06-15'),
        created_at: new Date(),
        created_by: 'admin'
      },
      {
        id: uuidv4(),
        client_id: 'client-001',
        name: 'SEO Optimization',
        description: 'Improve search engine rankings for key coffee-related keywords',
        status: 'planning',
        progress: 20,
        start_date: new Date('2025-03-10'),
        due_date: new Date('2025-07-10'),
        created_at: new Date(),
        created_by: 'admin'
      }
    ];
    
    // Insert projects
    for (const project of projects) {
      const insertResult = await client.query(`
        INSERT INTO client_projects (
          id, client_id, name, description, status, progress, 
          start_date, due_date, created_at, created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
        RETURNING *
      `, [
        project.id, 
        project.client_id, 
        project.name, 
        project.description, 
        project.status, 
        project.progress, 
        project.start_date, 
        project.due_date, 
        project.created_at, 
        project.created_by
      ]);
      
      console.log(`Added project: ${project.name}`);
      
      // Add tasks for each project
      const tasks = [];
      
      if (project.name === 'Website Redesign') {
        tasks.push(
          {
            id: uuidv4(),
            project_id: project.id,
            name: 'Wireframes',
            description: 'Create wireframes for all key pages',
            status: 'completed',
            assignee: 'Morgan',
            due_date: new Date('2025-02-15'),
            created_at: new Date(),
            created_by: 'admin'
          },
          {
            id: uuidv4(),
            project_id: project.id,
            name: 'Design',
            description: 'Create visual designs based on approved wireframes',
            status: 'completed',
            assignee: 'Jamie',
            due_date: new Date('2025-03-15'),
            created_at: new Date(),
            created_by: 'admin'
          },
          {
            id: uuidv4(),
            project_id: project.id,
            name: 'Development',
            description: 'Build responsive website based on approved designs',
            status: 'in-progress',
            assignee: 'Casey',
            due_date: new Date('2025-04-30'),
            created_at: new Date(),
            created_by: 'admin'
          },
          {
            id: uuidv4(),
            project_id: project.id,
            name: 'E-commerce Integration',
            description: 'Set up online ordering system for coffee products',
            status: 'not-started',
            assignee: 'Taylor',
            due_date: new Date('2025-05-15'),
            created_at: new Date(),
            created_by: 'admin'
          }
        );
      } else if (project.name === 'Social Media Campaign') {
        tasks.push(
          {
            id: uuidv4(),
            project_id: project.id,
            name: 'Content Strategy',
            description: 'Develop content themes and posting schedule',
            status: 'completed',
            assignee: 'Jordan',
            due_date: new Date('2025-02-15'),
            created_at: new Date(),
            created_by: 'admin'
          },
          {
            id: uuidv4(),
            project_id: project.id,
            name: 'Content Creation',
            description: 'Create images, videos, and copy for campaign',
            status: 'in-progress',
            assignee: 'Alex',
            due_date: new Date('2025-04-15'),
            created_at: new Date(),
            created_by: 'admin'
          },
          {
            id: uuidv4(),
            project_id: project.id,
            name: 'Paid Promotion',
            description: 'Set up and manage paid social media ads',
            status: 'not-started',
            assignee: 'Morgan',
            due_date: new Date('2025-05-01'),
            created_at: new Date(),
            created_by: 'admin'
          }
        );
      } else if (project.name === 'SEO Optimization') {
        tasks.push(
          {
            id: uuidv4(),
            project_id: project.id,
            name: 'Keyword Research',
            description: 'Identify target keywords for optimization',
            status: 'completed',
            assignee: 'Casey',
            due_date: new Date('2025-03-20'),
            created_at: new Date(),
            created_by: 'admin'
          },
          {
            id: uuidv4(),
            project_id: project.id,
            name: 'On-Page Optimization',
            description: 'Update page titles, meta descriptions, and content',
            status: 'in-progress',
            assignee: 'Taylor',
            due_date: new Date('2025-05-15'),
            created_at: new Date(),
            created_by: 'admin'
          },
          {
            id: uuidv4(),
            project_id: project.id,
            name: 'Link Building',
            description: 'Develop and implement link building strategy',
            status: 'not-started',
            assignee: 'Jordan',
            due_date: new Date('2025-06-30'),
            created_at: new Date(),
            created_by: 'admin'
          }
        );
      }
      
      // Insert tasks
      for (const task of tasks) {
        const taskResult = await client.query(`
          INSERT INTO client_project_tasks (
            id, project_id, name, description, status, 
            assignee, due_date, created_at, created_by
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
          )
          RETURNING *
        `, [
          task.id, 
          task.project_id, 
          task.name, 
          task.description, 
          task.status, 
          task.assignee, 
          task.due_date, 
          task.created_at, 
          task.created_by
        ]);
        
        console.log(`  Added task: ${task.name}`);
      }
    }
    
    // Verify projects were added
    const verifyResult = await client.query(`
      SELECT * FROM client_projects WHERE client_id = 'client-001'
    `);
    
    console.log('\nVerification - Liberty Beans projects in database:');
    console.log(JSON.stringify(verifyResult.rows, null, 2));

  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await client.end();
    console.log('\nDisconnected from database');
  }
}

addLibertyBeansProjects();
