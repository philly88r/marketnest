// Script to check database structure
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize the Supabase client with environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://dvuiiloynbrtdrabtzsg.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dWlpbG95bmJydGRyYWJ0enNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDM1MDksImV4cCI6MjA1OTg3OTUwOX0.aef4QCYboLzhyw8im1pGZe7v0tweAnQ3haN1T0mVLmE';

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabaseStructure() {
  console.log('Checking database structure...');
  console.log('Supabase URL:', supabaseUrl);
  
  try {
    // Check clients table
    console.log('\n--- Checking clients table ---');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*');
    
    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
    } else {
      console.log(`Found ${clients.length} clients`);
      
      // Check if Liberty Beans Coffee exists
      const libertyBeans = clients.find(client => 
        client.name.includes('Liberty Beans') || 
        client.id === 'client-liberty-beans' ||
        client.id === 'client-001'
      );
      
      if (libertyBeans) {
        console.log('Liberty Beans Coffee client found:');
        console.log(JSON.stringify(libertyBeans, null, 2));
      } else {
        console.log('Liberty Beans Coffee client NOT found!');
      }
      
      // Show all client IDs and names
      console.log('\nAll clients:');
      clients.forEach(client => {
        console.log(`- ${client.id}: ${client.name}`);
      });
    }
    
    // Check projects table
    console.log('\n--- Checking projects table ---');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*');
    
    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
    } else {
      console.log(`Found ${projects.length} projects`);
      
      // Check if Liberty Beans Coffee has projects
      const libertyBeansProjects = projects.filter(project => 
        project.client_id === 'client-liberty-beans' || 
        project.client_id === 'client-001'
      );
      
      if (libertyBeansProjects.length > 0) {
        console.log(`Found ${libertyBeansProjects.length} projects for Liberty Beans Coffee:`);
        libertyBeansProjects.forEach(project => {
          console.log(`- ${project.id}: ${project.name} (client_id: ${project.client_id})`);
        });
      } else {
        console.log('No projects found for Liberty Beans Coffee!');
      }
    }
    
    // Check tasks table
    console.log('\n--- Checking tasks table ---');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');
    
    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
    } else {
      console.log(`Found ${tasks ? tasks.length : 0} tasks`);
      
      // If there are Liberty Beans projects, check for tasks
      if (libertyBeansProjects && libertyBeansProjects.length > 0) {
        const projectIds = libertyBeansProjects.map(p => p.id);
        const libertyBeansTasks = tasks ? tasks.filter(task => 
          projectIds.includes(task.project_id)
        ) : [];
        
        if (libertyBeansTasks.length > 0) {
          console.log(`Found ${libertyBeansTasks.length} tasks for Liberty Beans Coffee projects`);
        } else {
          console.log('No tasks found for Liberty Beans Coffee projects!');
        }
      }
    }
    
  } catch (error) {
    console.error('Error checking database structure:', error);
  }
}

// Run the check
checkDatabaseStructure();
