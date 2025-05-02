import { supabase } from './supabaseClient';

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: string;
  assignee: string;
  project_id: string;
  due_date?: string;
  created_at?: string;
  created_by?: string;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  start_date?: string;
  due_date?: string;
  created_at?: string;
  created_by?: string;
  tasks?: Task[];
}

/**
 * Fetch all projects for a client
 */
export const getProjectsByClientId = async (clientId: string): Promise<Project[]> => {
  try {
    // Only fetch from Supabase, never use mock data
    let { data: projects, error } = await supabase
      .from('client_projects')
      .select('*')
      .eq('client_id', clientId);

    if (error) {
      throw error;
    }

    if (!projects || projects.length === 0) {
      // Return empty array if no projects found for this client
      return [];
    }

    // For each project, fetch its tasks ONLY from Supabase
    const projectsWithTasks = await Promise.all(
      projects.map(async (project) => {
        try {
          const { data: tasks, error: tasksError } = await supabase
            .from('client_project_tasks')
            .select('*')
            .eq('project_id', project.id);
          if (tasksError) {
            throw tasksError;
          }
          return {
            ...project,
            tasks: tasks || []
          };
        } catch (taskError) {
          // If error, just return project with empty tasks
          return { ...project, tasks: [] };
        }
      })
    );
    return projectsWithTasks;
  } catch (error) {
    // If any error, return empty array (do not use mock data)
    console.error('Error in getProjectsByClientId:', error);
    return [];
  }
};

// Function to get mock projects for a client
const getMockProjects = (clientId: string): Project[] => {
  throw new Error('Mock projects are no longer supported. Please connect to the database.');
};

// Function to get mock tasks for a project
const getMockTasks = (projectId: string): Task[] => {
  throw new Error('Mock tasks are no longer supported. Please connect to the database.');
};

/**
 * Create a new project
 */
export const createProject = async (project: Omit<Project, 'id' | 'created_at'>): Promise<Project> => {
  try {
    // Prepare project data with all required columns
    const projectData = {
      client_id: project.client_id,
      name: project.name,
      description: project.description,
      status: project.status || 'planning',
      progress: project.progress || 0,
      start_date: project.start_date,
      due_date: project.due_date,
      created_by: project.created_by || 'admin'
      // created_at is handled automatically by Supabase
    };

    console.log('Creating project with data:', projectData);
    
    // For other clients, try the database
    const { data, error } = await supabase
      .from('client_projects')
      .insert([projectData])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating project in database:', error);
      // Create a mock project as fallback
      const mockId = 'proj-' + Math.random().toString(36).substring(2, 10);
      const mockProject = {
        id: mockId,
        client_id: project.client_id,
        name: project.name,
        description: project.description,
        status: project.status || 'planning',
        progress: project.progress || 0,
        start_date: project.start_date,
        due_date: project.due_date,
        created_at: new Date().toISOString(),
        created_by: project.created_by || 'admin',
        tasks: []
      };
      
      // Save to mock projects array for later retrieval
      // mockProjects.push(mockProject);
      console.log('Created mock project as fallback:', mockProject);
      
      return mockProject;
    }
    
    console.log('Project created successfully in database:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error in createProject:', error);
    // Create a mock project as fallback
    const mockId = 'proj-' + Math.random().toString(36).substring(2, 10);
    const mockProject = {
      id: mockId,
      client_id: project.client_id,
      name: project.name,
      description: project.description,
      status: project.status || 'planning',
      progress: project.progress || 0,
      start_date: project.start_date,
      due_date: project.due_date,
      created_at: new Date().toISOString(),
      created_by: project.created_by || 'admin',
      tasks: []
    };
    
    // Save to mock projects array for later retrieval
    // mockProjects.push(mockProject);
    console.log('Created mock project as fallback after error:', mockProject);
    
    return mockProject;
  }
};

/**
 * Update an existing project
 */
export interface UpdateProjectResult {
  project: Project;
  error?: any;
}

export const updateProject = async (id: string, updates: Partial<Project>): Promise<UpdateProjectResult> => {
  try {
    // Prepare update data with only valid columns
    const updateData: Record<string, any> = {};
    
    // Only include fields that are valid columns in the client_projects table
    if (updates.client_id !== undefined) updateData.client_id = updates.client_id;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.progress !== undefined) updateData.progress = updates.progress;
    if (updates.start_date !== undefined) updateData.start_date = updates.start_date;
    if (updates.due_date !== undefined) updateData.due_date = updates.due_date;
    if (updates.created_by !== undefined) updateData.created_by = updates.created_by;
    
    // Don't update created_at as it's managed by the database
    
    console.log('Updating project with ID:', id);
    console.log('Update data:', updateData);
    
    const { data, error } = await supabase
      .from('client_projects')
      .update(updateData)
      .eq('id', id)
      .select('id, client_id, name, description, status, progress, start_date, due_date, created_at, created_by');

    console.log('[updateProject] Supabase update response:', { data, error });

    // Accept both array and object responses
    let projectObj: any = data;
    if (Array.isArray(data)) {
      projectObj = data.length > 0 ? data[0] : null;
    }

    // If error is null and data is null, treat as success and return the patched updateData
    if (!error && !projectObj) {
      projectObj = { id, ...updateData };
      console.warn('[updateProject] No data returned, but update succeeded. Returning patched updateData:', projectObj);
      return { project: projectObj as Project };
    }

    if (error || !projectObj || !projectObj.id) {
      console.warn('Database update failed or returned invalid data, using mock data instead:', error, data);
      // If database update fails or returns invalid data, return a mock updated project
      // First, get the existing project from our mock data if available
      // const existingProject = mockProjects.find(p => p.id === id);

      // if (existingProject) {
      //   // Update the existing mock project
      //   const updatedProject = { ...existingProject, ...updates };
      //   // Update the mock data store
      //   const index = mockProjects.findIndex(p => p.id === id);
      //   if (index !== -1) {
      //     mockProjects[index] = updatedProject;
      //   }
      //   return { project: updatedProject, error: error || new Error('Database update failed or returned invalid data') };
      // } else {
      //   // Create a new mock project with the updates
      //   const mockProject: Project = {
      //     id,
      //     client_id: updates.client_id || 'client-liberty-beans',
      //     name: updates.name || 'Updated Project',
      //     description: updates.description || 'Updated project description',
      //     status: updates.status || 'planning',
      //     progress: updates.progress || 0,
      //     start_date: updates.start_date || new Date().toISOString(),
      //     due_date: updates.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      //     created_at: new Date().toISOString(),
      //     created_by: updates.created_by || 'admin',
      //     tasks: []
      //   };
      //   // mockProjects.push(mockProject);
      //   return { project: mockProject, error: error || new Error('Database update failed or returned invalid data') };
      // }
    }

    console.log('Project updated successfully:', projectObj);
    return { project: projectObj as Project };
  } catch (error) {
    console.error('Error in updateProject:', error);
    // Return a mock updated project as fallback
    // const existingProject = mockProjects.find(p => p.id === id);

    // if (existingProject) {
    //   // Update the existing mock project
    //   const updatedProject = { ...existingProject, ...updates };
    //   // Update the mock data store
    //   const index = mockProjects.findIndex(p => p.id === id);
    //   if (index !== -1) {
    //     mockProjects[index] = updatedProject;
    //   }
    //   return { project: updatedProject, error };
    // } else {
    //   // Create a new mock project with the updates
    //   const mockProject: Project = {
    //     id,
    //     client_id: updates.client_id || 'client-liberty-beans',
    //     name: updates.name || 'Updated Project',
    //     description: updates.description || 'Updated project description',
    //     status: updates.status || 'planning',
    //     progress: updates.progress || 0,
    //     start_date: updates.start_date || new Date().toISOString(),
    //     due_date: updates.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    //     created_at: new Date().toISOString(),
    //     created_by: updates.created_by || 'admin',
    //     tasks: []
    //   };
    //   // mockProjects.push(mockProject);
    //   return { project: mockProject, error };
    // }
  }
};

// Store mock tasks for local state management
// const mockTasks: Task[] = [];

/**
 * Delete a project
 */
export const deleteProject = async (id: string): Promise<void> => {
  try {
    // First delete all tasks associated with this project
    const { error: taskDeleteError } = await supabase
      .from('client_project_tasks')
      .delete()
      .eq('project_id', id);
      
    if (taskDeleteError) {
      console.error('Error deleting project tasks:', taskDeleteError);
      throw taskDeleteError;
    }
    
    // Then delete the project
    const { error } = await supabase
      .from('client_projects')
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

/**
 * Get tasks for a project
 */
export const getTasksByProjectId = async (projectId: string): Promise<Task[]> => {
  try {
    console.log(`Fetching tasks for project ID: ${projectId}`);
    
    // For real UUIDs, query the database
    const { data, error } = await supabase
      .from('client_project_tasks')
      .select('*')
      .eq('project_id', projectId);
      
    if (error) {
      console.error('Error fetching tasks from database:', error);
      throw new Error(`Failed to fetch tasks: ${error.message || 'Unknown error'}`);
    }
    
    if (!data || data.length === 0) {
      console.log(`No tasks found for project ${projectId}, returning empty array`);
      return [];
    }
    
    console.log(`Found ${data.length} tasks for project ${projectId}`);
    return data;
  } catch (error) {
    console.error('Error in getTasksByProjectId:', error);
    throw new Error(`Failed to get tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Create a new task
 */
export const createTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
  try {
    console.log('Creating new task:', task);
    
    const { data, error } = await supabase
      .from('client_project_tasks')
      .insert([task])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating task in database:', error);
      throw new Error(`Failed to create task: ${error.message || 'Unknown error'}`);
    }
    
    console.log('Task created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createTask:', error);
    // Create a mock task as fallback
    const mockId = 'task-' + Math.random().toString(36).substring(2, 10);
    const mockTask: Task = {
      id: mockId,
      name: task.name,
      description: task.description,
      status: task.status,
      assignee: task.assignee,
      project_id: task.project_id,
      due_date: task.due_date,
      created_at: new Date().toISOString(),
      created_by: task.created_by || 'admin'
    };
    
    // Add to mock tasks array for local state management
    // mockTasks.push(mockTask);
    return mockTask;
  }
};

/**
 * Update an existing task
 */
export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
  try {
    console.log(`Updating task ${id} with:`, updates);
    
    const { data, error } = await supabase
      .from('client_project_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.warn('Error updating task in database, using mock data:', error);
      // Update mock task as fallback
      // const existingTask = mockTasks.find(task => task.id === id);
      
      // if (existingTask) {
      //   // Update the existing mock task
      //   const updatedTask = { ...existingTask, ...updates };
      //   // Update the mock data store
      //   const index = mockTasks.findIndex(task => task.id === id);
      //   if (index !== -1) {
      //     mockTasks[index] = updatedTask;
      //   }
      //   return updatedTask;
      // } else {
      //   // Create a new mock task with the updates if it doesn't exist
      //   const mockTask: Task = {
      //     id,
      //     name: updates.name || 'Unknown Task',
      //     status: updates.status || 'not-started',
      //     assignee: updates.assignee || 'Unassigned',
      //     project_id: updates.project_id || 'unknown-project',
      //     description: updates.description,
      //     due_date: updates.due_date,
      //     created_at: new Date().toISOString(),
      //     created_by: updates.created_by || 'admin'
      //   };
      //   // mockTasks.push(mockTask);
      //   return mockTask;
      // }
    }
    
    console.log('Task updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in updateTask:', error);
    // Update mock task as fallback
    // const existingTask = mockTasks.find(task => task.id === id);
    
    // if (existingTask) {
    //   // Update the existing mock task
    //   const updatedTask = { ...existingTask, ...updates };
    //   // Update the mock data store
    //   const index = mockTasks.findIndex(task => task.id === id);
    //   if (index !== -1) {
    //     mockTasks[index] = updatedTask;
    //   }
    //   return updatedTask;
    // } else {
    //   // Create a new mock task with the updates if it doesn't exist
    //   const mockTask: Task = {
    //     id,
    //     name: updates.name || 'Unknown Task',
    //     status: updates.status || 'not-started',
    //     assignee: updates.assignee || 'Unassigned',
    //     project_id: updates.project_id || 'unknown-project',
    //     description: updates.description,
    //     due_date: updates.due_date,
    //     created_at: new Date().toISOString(),
    //     created_by: updates.created_by || 'admin'
    //   };
    //   // mockTasks.push(mockTask);
    //   return mockTask;
    // }
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (id: string): Promise<void> => {
  try {
    console.log(`Deleting task ${id}`);
    
    const { error } = await supabase
      .from('client_project_tasks')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.warn('Error deleting task from database, using mock data:', error);
      // Remove from mock tasks array for local state management
      // const index = mockTasks.findIndex(task => task.id === id);
      // if (index !== -1) {
      //   mockTasks.splice(index, 1);
      // }
      return;
    }
    
    console.log(`Task ${id} deleted successfully`);
  } catch (error) {
    console.error('Error in deleteTask:', error);
    // Remove from mock tasks array for local state management
    // const index = mockTasks.findIndex(task => task.id === id);
    // if (index !== -1) {
    //   mockTasks.splice(index, 1);
    // }
  }
};

// Store mock projects for local state management when database operations fail
// const mockProjects: Project[] = [];
