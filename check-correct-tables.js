// Script to check the correct database tables
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize the Supabase client with environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://dvuiiloynbrtdrabtzsg.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dWlpbG95bmJydGRyYWJ0enNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDM1MDksImV4cCI6MjA1OTg3OTUwOX0.aef4QCYboLzhyw8im1pGZe7v0tweAnQ3haN1T0mVLmE';

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCorrectTables() {
  console.log('Checking correct database tables...');
  console.log('Supabase URL:', supabaseUrl);
  
  try {
    // Check clients table
    console.log('\n--- Checking clients table ---');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', 'client-liberty-beans');
    
    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
    } else if (clients && clients.length > 0) {
      console.log('Liberty Beans Coffee client found:');
      console.log(JSON.stringify(clients[0], null, 2));
      
      // Check client_projects table for Liberty Beans Coffee
      console.log('\n--- Checking client_projects table ---');
      const { data: projects, error: projectsError } = await supabase
        .from('client_projects')
        .select('*')
        .eq('client_id', 'client-liberty-beans');
      
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
      } else {
        console.log(`Found ${projects ? projects.length : 0} projects for Liberty Beans Coffee`);
        
        if (projects && projects.length > 0) {
          // Show the first project
          console.log('First project:');
          console.log(JSON.stringify(projects[0], null, 2));
          
          // Check client_project_tasks table for the first project
          const firstProjectId = projects[0].id;
          console.log(`\n--- Checking client_project_tasks for project ${firstProjectId} ---`);
          
          const { data: tasks, error: tasksError } = await supabase
            .from('client_project_tasks')
            .select('*')
            .eq('project_id', firstProjectId);
          
          if (tasksError) {
            console.error('Error fetching tasks:', tasksError);
          } else {
            console.log(`Found ${tasks ? tasks.length : 0} tasks for the project`);
            
            if (tasks && tasks.length > 0) {
              console.log('First task:');
              console.log(JSON.stringify(tasks[0], null, 2));
            }
          }
        } else {
          console.log('No projects found for Liberty Beans Coffee');
          
          // Let's create a sample project for Liberty Beans Coffee
          console.log('\n--- Creating a sample project for Liberty Beans Coffee ---');
          
          const newProject = {
            client_id: 'client-liberty-beans',
            name: 'Website Redesign',
            description: 'Redesigning the Liberty Beans Coffee website',
            status: 'in-progress',
            progress: 65,
            start_date: new Date().toISOString(),
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          };
          
          const { data: createdProject, error: createError } = await supabase
            .from('client_projects')
            .insert([newProject])
            .select();
          
          if (createError) {
            console.error('Error creating project:', createError);
          } else if (createdProject && createdProject.length > 0) {
            console.log('Created sample project:');
            console.log(JSON.stringify(createdProject[0], null, 2));
            
            // Create a sample task for the project
            const newTask = {
              project_id: createdProject[0].id,
              name: 'Homepage Design',
              description: 'Design the homepage for Liberty Beans Coffee',
              status: 'in-progress',
              assignee: 'Alex',
              due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days from now
            };
            
            const { data: createdTask, error: createTaskError } = await supabase
              .from('client_project_tasks')
              .insert([newTask])
              .select();
            
            if (createTaskError) {
              console.error('Error creating task:', createTaskError);
            } else if (createdTask && createdTask.length > 0) {
              console.log('Created sample task:');
              console.log(JSON.stringify(createdTask[0], null, 2));
            }
          }
        }
      }
    } else {
      console.log('Liberty Beans Coffee client NOT found!');
    }
  } catch (error) {
    console.error('Error checking database structure:', error);
  }
}

// Run the check
checkCorrectTables();
