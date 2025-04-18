// Type declarations for projectService.ts
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

export function getProjectsByClientId(clientId: string): Promise<Project[]>;
export function createProject(project: Omit<Project, 'id'>): Promise<Project>;
export function updateProject(id: string, updates: Partial<Project>): Promise<Project>;
export function deleteProject(id: string): Promise<void>;
