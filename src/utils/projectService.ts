import { supabase } from './supabaseClient';

export interface Task {
  id: string;
  name: string;
  status: string;
  assignee: string;
  project_id?: string;
}

export interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  start_date?: string;
  due_date?: string;
  client_id: string;
  tasks?: Task[];
}

/**
 * Fetch all projects for a client
 */
export const getProjectsByClientId = async (clientId: string): Promise<Project[]> => {
  try {
    console.log(`Fetching projects for client ID: ${clientId}`);
    
    // First try with the provided client ID
    let { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', clientId);
    
    // If no projects found and the ID is Liberty Beans, try the alternative ID
    if ((!projects || projects.length === 0) && 
        (clientId === 'client-001' || clientId === 'client-liberty-beans')) {
      const alternativeId = clientId === 'client-001' ? 'client-liberty-beans' : 'client-001';
      console.log(`No projects found, trying alternative ID: ${alternativeId}`);
      
      const { data: alternativeProjects, error: alternativeError } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', alternativeId);
        
      if (alternativeError) {
        throw alternativeError;
      }
      
      projects = alternativeProjects;
    }
    
    if (error) {
      throw error;
    }
    
    if (!projects || projects.length === 0) {
      console.log(`No projects found for client ID: ${clientId}`);
      return [];
    }
    
    console.log(`Found ${projects.length} projects for client ID: ${clientId}`);
    
    // For each project, fetch its tasks
    const projectsWithTasks = await Promise.all(
      projects.map(async (project) => {
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', project.id);
          
        if (tasksError) {
          console.error(`Error fetching tasks for project ${project.id}:`, tasksError);
          return { ...project, tasks: [] };
        }
        
        return { 
          ...project, 
          tasks: tasks || [],
          // Convert string dates to Date objects if needed
          startDate: project.start_date ? new Date(project.start_date) : new Date(),
          dueDate: project.due_date ? new Date(project.due_date) : new Date()
        };
      })
    );
    
    return projectsWithTasks;
  } catch (error) {
    console.error('Error in getProjectsByClientId:', error);
    throw error;
  }
};

/**
 * Create a new project
 */
export const createProject = async (project: Omit<Project, 'id'>): Promise<Project> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createProject:', error);
    throw error;
  }
};

/**
 * Update an existing project
 */
export const updateProject = async (id: string, updates: Partial<Project>): Promise<Project> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateProject:', error);
    throw error;
  }
};

/**
 * Delete a project
 */
export const deleteProject = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteProject:', error);
    throw error;
  }
};
