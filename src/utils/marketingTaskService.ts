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
