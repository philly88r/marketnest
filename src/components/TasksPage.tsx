import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiUser, FiCheckCircle, FiClock, FiCircle } from 'react-icons/fi';
import { Task, getTasksByProjectId, createTask, updateTask, deleteTask } from '../utils/projectService';
import { getProjectsByClientId } from '../utils/projectService';
import { supabase } from '../utils/supabaseClient';

// Styled components
const TasksContainer = styled.div`
  color: white;
`;

const TasksHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const TasksTitle = styled.h3`
  margin: 0;
  font-size: 18px;
`;

const TasksTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
  
  th {
    text-align: left;
    padding: 12px 15px;
    background: rgba(255, 255, 255, 0.05);
    font-weight: 500;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }
  
  td {
    padding: 12px 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 14px;
  }
  
  tr:hover td {
    background: rgba(255, 255, 255, 0.02);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  margin: 20px 0;
  color: rgba(255, 255, 255, 0.6);
`;

const Button = styled.button`
  background: rgba(31, 83, 255, 0.25);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(31, 83, 255, 0.35);
  }
`;

const ActionButton = styled.button`
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: none;
  cursor: pointer;
  padding: 5px;
  margin: 0 3px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: white;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: rgba(31, 83, 255, 0.5);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: white;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: rgba(31, 83, 255, 0.5);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: white;
  font-size: 14px;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: rgba(31, 83, 255, 0.5);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #1E2235;
  border-radius: 8px;
  padding: 25px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    font-size: 18px;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;

  background: ${props => 
    props.$status === 'completed' ? 'rgba(52, 199, 89, 0.2)' : 
    props.$status === 'in-progress' ? 'rgba(0, 122, 255, 0.2)' : 
    'rgba(255, 149, 0, 0.2)'};
  color: ${props => 
    props.$status === 'completed' ? '#34c759' : 
    props.$status === 'in-progress' ? '#007aff' : 
    '#ff9500'};
`;

interface TasksPageProps {
  clientId: string;
}

const TasksPage: React.FC<TasksPageProps> = ({ clientId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<Partial<Task>>({
    name: '',
    description: '',
    status: 'not-started',
    assignee: '',
    project_id: '',
    due_date: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // First fetch all projects for this client
      const clientProjects = await getProjectsByClientId(clientId);
      setProjects(clientProjects);

      // Then fetch all tasks for all projects
      const allTasks: Task[] = [];
      for (const project of clientProjects) {
        const projectTasks = await getTasksByProjectId(project.id);
        allTasks.push(...projectTasks);
      }
      setTasks(allTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setFormData({
      name: '',
      description: '',
      status: 'not-started',
      assignee: '',
      project_id: projects.length > 0 ? projects[0].id : '',
      due_date: ''
    });
    setShowModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      description: task.description || '',
      status: task.status,
      assignee: task.assignee,
      project_id: task.project_id,
      due_date: task.due_date || ''
    });
    setShowModal(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.project_id) {
      alert('Task name and project are required');
      return;
    }
    
    try {
      if (editingTask) {
        // Update existing task
        const updatedTask = await updateTask(editingTask.id, formData);
        setTasks(tasks.map(task => task.id === editingTask.id ? updatedTask : task));
      } else {
        // Create new task
        const newTask = await createTask({
          name: formData.name!,
          description: formData.description,
          status: formData.status || 'not-started',
          assignee: formData.assignee || 'Unassigned',
          project_id: formData.project_id!,
          due_date: formData.due_date,
          created_by: 'admin'
        });
        setTasks([...tasks, newTask]);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving task:', err);
      alert('Failed to save task. Please try again.');
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  const renderStatusIcon = (status: string) => {
    if (status === 'completed') return <FiCheckCircle size={14} />;
    if (status === 'in-progress') return <FiClock size={14} />;
    return <FiCircle size={14} />;
  };

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <TasksContainer>
      <TasksHeader>
        <TasksTitle>Tasks</TasksTitle>
        <Button onClick={handleAddTask}>
          <FiPlus size={16} /> Add New Task
        </Button>
      </TasksHeader>

      {tasks.length === 0 ? (
        <EmptyState>
          <p>No tasks found for this client.</p>
          <Button onClick={handleAddTask} style={{ margin: '10px auto', display: 'flex' }}>
            <FiPlus size={16} /> Create Your First Task
          </Button>
        </EmptyState>
      ) : (
        <TasksTable>
          <thead>
            <tr>
              <th>Task Name</th>
              <th>Project</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td>{task.name}</td>
                <td>{getProjectName(task.project_id)}</td>
                <td>
                  <StatusBadge $status={task.status}>
                    {renderStatusIcon(task.status)} {task.status.replace('-', ' ')}
                  </StatusBadge>
                </td>
                <td>{task.assignee}</td>
                <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</td>
                <td>
                  <div style={{ display: 'flex' }}>
                    <ActionButton onClick={() => handleEditTask(task)} title="Edit Task">
                      <FiEdit2 size={16} />
                    </ActionButton>
                    <ActionButton onClick={() => handleDeleteTask(task.id)} title="Delete Task">
                      <FiTrash2 size={16} />
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TasksTable>
      )}

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h3>{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
              <ActionButton onClick={() => setShowModal(false)}>
                ✕
              </ActionButton>
            </ModalHeader>
            
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Task Name*</Label>
                <Input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="Enter task name"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Project*</Label>
                <Select 
                  name="project_id" 
                  value={formData.project_id} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label>Description</Label>
                <TextArea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  placeholder="Enter task description"
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Status</Label>
                <Select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleInputChange}
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label>Assignee</Label>
                <Input 
                  type="text" 
                  name="assignee" 
                  value={formData.assignee} 
                  onChange={handleInputChange} 
                  placeholder="Who is responsible for this task?"
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Due Date</Label>
                <Input 
                  type="date" 
                  name="due_date" 
                  value={formData.due_date} 
                  onChange={handleInputChange} 
                />
              </FormGroup>
              
              <ModalFooter>
                <Button type="button" onClick={() => setShowModal(false)} style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                  Cancel
                </Button>
                <Button type="submit" style={{ background: 'rgba(31, 83, 255, 0.4)' }}>
                  {editingTask ? 'Update Task' : 'Create Task'}
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      )}
    </TasksContainer>
  );
};

export default TasksPage;
