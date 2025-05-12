import { supabase } from './supabaseClient';

export interface MarketingTask {
  id: number;
  task_name: string;
  description: string;
  assigned_to: string;
  start_date: string;
  end_date: string;
  kpi: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateMarketingTaskResult {
  task: MarketingTask;
  error?: any;
}

/**
 * Fetch all marketing tasks
 */
export const getMarketingTasks = async (): Promise<MarketingTask[]> => {
  try {
    const { data, error } = await supabase
      .from('marketing_tasks')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching marketing tasks:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMarketingTasks:', error);
    return [];
  }
};

/**
 * Fetch marketing tasks for a specific client
 * This filters tasks by assigned_to field containing the client name
 */
export const getMarketingTasksForClient = async (clientName: string): Promise<MarketingTask[]> => {
  try {
    // First get all marketing tasks
    const allTasks = await getMarketingTasks();
    
    // For Liberty Beans, we'll show all Market Nest tasks
    if (clientName.toLowerCase().includes('liberty') || clientName.toLowerCase().includes('beans')) {
      return allTasks.filter(task => 
        task.assigned_to.toLowerCase().includes('market nest') || 
        task.assigned_to.toLowerCase().includes('marketnest')
      );
    }
    
    // For other clients, filter by client name in the assigned_to field
    return allTasks.filter(task => 
      task.assigned_to.toLowerCase().includes(clientName.toLowerCase())
    );
  } catch (error) {
    console.error(`Error in getMarketingTasksForClient for ${clientName}:`, error);
    return [];
  }
};

/**
 * Create a new marketing task
 */
export const createMarketingTask = async (task: Omit<MarketingTask, 'id' | 'created_at' | 'updated_at'>): Promise<MarketingTask> => {
  try {
    const { data, error } = await supabase
      .from('marketing_tasks')
      .insert({
        task_name: task.task_name,
        description: task.description || '',
        assigned_to: task.assigned_to,
        start_date: task.start_date,
        end_date: task.end_date,
        kpi: task.kpi || '',
        status: task.status || 'Planned'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating marketing task:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createMarketingTask:', error);
    throw error;
  }
};

/**
 * Update an existing marketing task
 */
export const updateMarketingTask = async (taskId: number, updates: Partial<MarketingTask>): Promise<UpdateMarketingTaskResult> => {
  try {
    // Add updated_at timestamp
    const updatedFields = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('marketing_tasks')
      .update(updatedFields)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating marketing task:', error);
      return { task: {} as MarketingTask, error };
    }

    return { task: data };
  } catch (error) {
    console.error(`Error in updateMarketingTask for task ${taskId}:`, error);
    return { task: {} as MarketingTask, error };
  }
};

/**
 * Update a marketing task status
 */
export const updateMarketingTaskStatus = async (taskId: number, newStatus: string): Promise<MarketingTask | null> => {
  try {
    const { data, error } = await supabase
      .from('marketing_tasks')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating marketing task status:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error in updateMarketingTaskStatus for task ${taskId}:`, error);
    return null;
  }
};

/**
 * Delete a marketing task
 */
export const deleteMarketingTask = async (taskId: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('marketing_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting marketing task:', error);
      throw error;
    }
  } catch (error) {
    console.error(`Error in deleteMarketingTask for task ${taskId}:`, error);
    throw error;
  }
};
