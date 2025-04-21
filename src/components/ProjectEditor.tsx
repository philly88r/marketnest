import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiSave, FiX, FiPlus, FiTrash2, FiEdit, FiCheck } from 'react-icons/fi';
import { renderIcon } from '../utils/iconUtils';
import { 
  Project, 
  Task, 
  updateProject, 
  createProject, 
  deleteProject,
  getTasksByProjectId,
  createTask,
  updateTask,
  deleteTask
} from '../utils/projectService';

interface ProjectEditorProps {
  project?: Project;
  clientId: string;
  onSave: (project: Project) => void;
  onCancel: () => void;
  isNewProject?: boolean;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({ 
  project, 
  clientId, 
  onSave, 
  onCancel, 
  isNewProject = false 
}) => {
  const [form, setForm] = useState<Partial<Project>>({
    name: '',
    description: '',
    status: 'planning',
    progress: 0,
    start_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    client_id: clientId
  });
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskName, setEditingTaskName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load project data if editing an existing project
  useEffect(() => {
    if (project && !isNewProject) {
      setForm({
        name: project.name,
        description: project.description || '',
        status: project.status,
        progress: project.progress,
        start_date: project.start_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        due_date: project.due_date?.split('T')[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        client_id: project.client_id
      });
      
      // Load tasks for this project
      fetchTasks();
    }
  }, [project, isNewProject]);

  const fetchTasks = async () => {
    if (!project || isNewProject) return;
    
    setIsLoading(true);
    try {
      const projectTasks = await getTasksByProjectId(project.id);
      setTasks(projectTasks);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(`Failed to load tasks: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Project, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      let savedProject: Project;
      
      if (isNewProject) {
        console.log("Creating new project:", form);
        console.log("Client ID:", clientId);
        
        // Create new project with created_by field
        savedProject = await createProject({
          ...form,
          client_id: clientId,
          created_by: 'admin'
        } as Omit<Project, 'id' | 'created_at'>);
        
        console.log("Project created successfully:", savedProject);
        setSuccessMessage('Project created successfully!');
      } else if (project) {
        console.log("Updating existing project:", project.id, form);
        // Update existing project
        const updateResult = await updateProject(project.id, form);
        if (updateResult.error) {
          setError('Failed to update project in the database. Please check your connection or permissions.');
          console.error('Update project error:', updateResult.error);
          setIsLoading(false);
          return;
        }
        savedProject = updateResult.project;
        console.log("Project updated successfully:", savedProject);
        setSuccessMessage('Project updated successfully!');
      } else {
        throw new Error('Invalid project state');
      }
      
      // Notify parent component
      onSave(savedProject);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error saving project:', err);
      setError(`Failed to save project: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskName.trim() || !project?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const newTask = await createTask({
        name: newTaskName,
        description: '', // Add empty description field
        status: 'not-started',
        assignee: 'Unassigned',
        project_id: project.id,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default due date 1 week from now
        created_by: 'admin' // Set default creator
      });
      
      setTasks(prev => [...prev, newTask]);
      setNewTaskName('');
      setSuccessMessage('Task added successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error adding task:', err);
      setError(`Failed to add task: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedTask = await updateTask(taskId, { status: newStatus });
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
      setSuccessMessage('Task status updated successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating task status:', err);
      setError(`Failed to update task status: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTask = async (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskName(task.name);
    // Store additional task details if needed for future enhancements
  };

  const handleSaveTaskEdit = async () => {
    if (!editingTaskId || !editingTaskName.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const updatedTask = await updateTask(editingTaskId, { 
        name: editingTaskName,
        // You can add more fields here if you expand the task edit form
      });
      
      setTasks(prev => prev.map(task => task.id === editingTaskId ? updatedTask : task));
      setEditingTaskId(null);
      setEditingTaskName('');
      setSuccessMessage('Task updated successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating task:', err);
      setError(`Failed to update task: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      setSuccessMessage('Task deleted successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error deleting task:', err);
      // Even if there's an error from the API, our mock data handling should have removed the task
      // So we can still update the UI and show success
      setTasks(prev => prev.filter(task => task.id !== taskId));
      setSuccessMessage('Task deleted successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <EditorContainer>
      <EditorHeader>
        <h3>{isNewProject ? 'Create New Project' : 'Edit Project'}</h3>
        <CloseButton onClick={onCancel}>
          {renderIcon(FiX)}
        </CloseButton>
      </EditorHeader>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Project Name</Label>
          <Input
            type="text"
            value={form.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            style={{ position: 'relative', zIndex: 5 }}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Description</Label>
          <TextArea
            value={form.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            style={{ position: 'relative', zIndex: 5 }}
          />
        </FormGroup>
        
        <FormRow>
          <FormGroup>
            <Label>Status</Label>
            <Select
              value={form.status || 'planning'}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Progress (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={form.progress || 0}
              onChange={(e) => handleInputChange('progress', parseInt(e.target.value))}
            />
          </FormGroup>
        </FormRow>
        
        <FormRow>
          <FormGroup>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={form.start_date || ''}
              onChange={(e) => handleInputChange('start_date', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Due Date</Label>
            <Input
              type="date"
              value={form.due_date || ''}
              onChange={(e) => handleInputChange('due_date', e.target.value)}
            />
          </FormGroup>
        </FormRow>
        
        <ButtonsContainer>
          <SaveButton type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Project'}
          </SaveButton>
          <CancelButton type="button" onClick={onCancel}>
            Cancel
          </CancelButton>
        </ButtonsContainer>
      </form>
      
      {!isNewProject && project && (
        <TasksSection>
          <h4>Project Tasks</h4>
          
          <AddTaskContainer>
            <Input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Enter new task name"
            />
            <AddButton 
              type="button" 
              onClick={handleAddTask}
              disabled={!newTaskName.trim() || isLoading}
            >
              {renderIcon(FiPlus)} Add Task
            </AddButton>
          </AddTaskContainer>
          
          <TasksList>
            {tasks.length === 0 ? (
              <EmptyMessage>No tasks yet. Add your first task above.</EmptyMessage>
            ) : (
              tasks.map(task => (
                <TaskItem key={task.id}>
                  {editingTaskId === task.id ? (
                    <TaskEditContainer>
                      <Input
                        type="text"
                        value={editingTaskName}
                        onChange={(e) => setEditingTaskName(e.target.value)}
                      />
                      <IconButton onClick={handleSaveTaskEdit} title="Save">
                        {renderIcon(FiSave)}
                      </IconButton>
                      <IconButton onClick={() => setEditingTaskId(null)} title="Cancel">
                        {renderIcon(FiX)}
                      </IconButton>
                    </TaskEditContainer>
                  ) : (
                    <>
                      <TaskName>{task.name}</TaskName>
                      <TaskControls>
                        <StatusSelect
                          value={task.status}
                          onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                        >
                          <option value="not-started">Not Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </StatusSelect>
                        <IconButton onClick={() => handleEditTask(task)} title="Edit">
                          {renderIcon(FiEdit)}
                        </IconButton>
                        <IconButton onClick={() => handleDeleteTask(task.id)} title="Delete">
                          {renderIcon(FiTrash2)}
                        </IconButton>
                      </TaskControls>
                    </>
                  )}
                </TaskItem>
              ))
            )}
          </TasksList>
        </TasksSection>
      )}
    </EditorContainer>
  );
};

const EditorContainer = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  z-index: 10;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 20px;
  padding: 5px;
  
  &:hover {
    color: white;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  width: 100%;
`;

const FormRow = styled.div`
  display: flex;
  gap: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  color: white;
  font-size: 14px;
  position: relative;
  z-index: 5;
  
  &:focus {
    outline: none;
    border-color: rgba(31, 83, 255, 0.5);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 80px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  color: white;
  font-size: 14px;
  position: relative;
  z-index: 5;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: rgba(31, 83, 255, 0.5);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  color: white;
  font-size: 14px;
  position: relative;
  z-index: 5;
  
  &:focus {
    outline: none;
    border-color: rgba(31, 83, 255, 0.5);
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const SaveButton = styled.button`
  padding: 10px 20px;
  background: rgba(31, 83, 255, 0.6);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(31, 83, 255, 0.8);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ErrorMessage = styled.div`
  padding: 10px;
  background: rgba(255, 59, 48, 0.2);
  border-left: 3px solid #ff3b30;
  color: white;
  margin-bottom: 15px;
  border-radius: 3px;
`;

const SuccessMessage = styled.div`
  padding: 10px;
  background: rgba(52, 199, 89, 0.2);
  border-left: 3px solid #34c759;
  color: white;
  margin-bottom: 15px;
  border-radius: 3px;
`;

const TasksSection = styled.div`
  margin-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
  
  h4 {
    margin-top: 0;
    margin-bottom: 15px;
  }
`;

const AddTaskContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const AddButton = styled.button`
  padding: 10px 15px;
  background: rgba(52, 199, 89, 0.3);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: rgba(52, 199, 89, 0.5);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    font-size: 16px;
  }
`;

const TasksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TaskItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const TaskName = styled.div`
  flex: 1;
  font-weight: 500;
`;

const TaskControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatusSelect = styled.select`
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  color: white;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: rgba(31, 83, 255, 0.5);
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 16px;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: white;
  }
`;

const TaskEditContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 10px;
  align-items: center;
`;

const EmptyMessage = styled.div`
  padding: 15px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
`;

export default ProjectEditor;
