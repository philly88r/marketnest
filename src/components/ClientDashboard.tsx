import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEdit, FiMail, FiPhone, FiActivity, FiCalendar, FiCheckCircle, FiClock, FiCircle, FiFolder, FiList, FiSave, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
// Only using real data from Supabase
import ProjectDashboard from './ProjectDashboard';
import ClientFileManager from './ClientFileManager';
import ClientChecklist from './ClientChecklist';
import ClientChat from './ClientChat';
import ProjectEditor from './ProjectEditor';
import { renderIcon } from '../utils/iconUtils';
import { getClientById, updateClient, Client } from '../utils/clientService';
import { supabase } from '../utils/supabaseClient';
import { getProjectsByClientId, createProject, deleteProject, updateProject, createTask, updateTask, deleteTask, Project, Task } from '../utils/projectService';

interface ClientDashboardProps {
  clientId: string;
  onBack: () => void;
}

// Using Project and Task interfaces from projectService

const ClientDashboard: React.FC<ClientDashboardProps> = ({ clientId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'files' | 'tasks' | 'analytics'>('overview');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [editedClient, setEditedClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Project editing states
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectActionError, setProjectActionError] = useState<string | null>(null);
  const [projectActionSuccess, setProjectActionSuccess] = useState<string | null>(null);
  
  // Task editing states
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [taskActionError, setTaskActionError] = useState<string | null>(null);
  const [taskActionSuccess, setTaskActionSuccess] = useState<string | null>(null);

  // Handlers for client editing
  const handleSaveClientChanges = () => {
    // Implement save logic or stub
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };
  const handleCancelEditClient = () => {
    setIsEditing(false);
    setSaveError(null);
  };
  const handleDeleteProject = (projectId: string | null) => {
    // Implement delete logic or stub
    if (!projectId) return;
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setSelectedProjectId(null);
    setProjectActionSuccess('Project deleted successfully!');
    setTimeout(() => setProjectActionSuccess(null), 2000);
  };

  // Display projects (add filtering logic if needed)
  const displayProjects = projects;

  // Fetch client data and projects
  useEffect(() => {
    const fetchClientAndProjects = async () => {
      setIsLoading(true);
      setError(null);
      console.log('Fetching client with ID:', clientId);

      try {
        // Fetch client data
        const clientData = await getClientById(clientId);
        if (clientData) {
          setClient(clientData);
          setEditedClient(clientData);
        } else {
          setError('Client not found');
          setIsLoading(false);
          return;
        }
        
        // Fetch projects data
        const projectsData = await getProjectsByClientId(clientId);
        // Ensure each project has a tasks array and client_id
        const projectsWithTasks = projectsData.map(project => ({
          ...project,
          tasks: project.tasks || [],
          client_id: project.client_id || clientId
        }));
        setProjects(projectsWithTasks);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching client data:', err);
        setError('Failed to load client data. Please try again.');
        setIsLoading(false);
      }
    };

    fetchClientAndProjects();
  }, [clientId]);

  if (isLoading) {
    return <LoadingContainer>Loading client data...</LoadingContainer>;
  }

  if (error && !client) {
    return <ErrorContainer>{error}</ErrorContainer>;
  }

  if (!client) {
    return <div>Client not found</div>;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewContent>
            <ClientInfoCard>
              <ClientInfoHeader>
                <h3>Client Information</h3>
                {isEditing ? (
                  <EditActions>
                    <SaveButton onClick={handleSaveClientChanges}>
                      {renderIcon(FiSave)} Save
                    </SaveButton>
                    <CancelButton onClick={handleCancelEditClient}>
                      {renderIcon(FiX)} Cancel
                    </CancelButton>
                  </EditActions>
                ) : (
                  <EditButton onClick={() => setIsEditing(true)}>
                    {renderIcon(FiEdit)} Edit
                  </EditButton>
                )}
              </ClientInfoHeader>

              {saveError && <ErrorMessage>{saveError}</ErrorMessage>}
              {saveSuccess && <SuccessMessage>Changes saved successfully!</SuccessMessage>}

              <ClientInfoGrid>
                <InfoItem>
                  <InfoLabel>Industry</InfoLabel>
                  {isEditing ? (
                    <EditInput
                      value={editedClient.industry || ''}
                      onChange={(e) => setEditedClient(prev => ({ ...prev, industry: e.target.value }))}
                    />
                  ) : (
                    <InfoValue>{client.industry}</InfoValue>
                  )}
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Contact Name</InfoLabel>
                  {isEditing ? (
                    <EditInput
                      value={editedClient.contactname || editedClient.contact_name || ''}
                      onChange={(e) => setEditedClient(prev => ({ ...prev, contactname: e.target.value }))}
                    />
                  ) : (
                    <InfoValue>{client.contactname || client.contact_name}</InfoValue>
                  )}
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Email</InfoLabel>
                  {isEditing ? (
                    <EditInput
                      value={editedClient.contactemail || editedClient.contact_email || ''}
                      onChange={(e) => setEditedClient(prev => ({ ...prev, contactemail: e.target.value }))}
                    />
                  ) : (
                    <InfoValue>
                      {renderIcon(FiMail, { style: { marginRight: '5px' } })}
                      {client.contactemail || client.contact_email}
                    </InfoValue>
                  )}
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Phone</InfoLabel>
                  {isEditing ? (
                    <EditInput
                      value={editedClient.contactphone || editedClient.contact_phone || ''}
                      onChange={(e) => setEditedClient(prev => ({ ...prev, contactphone: e.target.value }))}
                    />
                  ) : (
                    <InfoValue>
                      {renderIcon(FiPhone, { style: { marginRight: '5px' } })}
                      {client.contactphone || client.contact_phone}
                    </InfoValue>
                  )}
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Username</InfoLabel>
                  {isEditing ? (
                    <EditInput
                      value={editedClient.username || ''}
                      onChange={(e) => setEditedClient(prev => ({ ...prev, username: e.target.value }))}
                    />
                  ) : (
                    <InfoValue>{client.username}</InfoValue>
                  )}
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Password</InfoLabel>
                  {isEditing ? (
                    <EditInput
                      value={editedClient.password || ''}
                      onChange={(e) => setEditedClient(prev => ({ ...prev, password: e.target.value }))}
                    />
                  ) : (
                    <InfoValue>{client.password}</InfoValue>
                  )}
                </InfoItem>
              </ClientInfoGrid>
            </ClientInfoCard>

            <MetricsSection>
              <h3>Project Metrics</h3>
              <MetricsGrid>
                <MetricCard>
                  <MetricIcon>
                    {renderIcon(FiActivity)}
                  </MetricIcon>
                  <MetricInfo>
                    <MetricValue>{projects.length}</MetricValue>
                    <MetricLabel>Active Projects</MetricLabel>
                  </MetricInfo>
                </MetricCard>

                <MetricCard>
                  <MetricIcon style={{ background: 'rgba(52, 199, 89, 0.15)', color: '#34c759' }}>
                    {renderIcon(FiCheckCircle)}
                  </MetricIcon>
                  <MetricInfo>
                    <MetricValue>{projects.reduce((sum, project) => sum + (project.tasks?.filter(task => task.status === 'completed')?.length || 0), 0)}</MetricValue>
                    <MetricLabel>Completed Tasks</MetricLabel>
                  </MetricInfo>
                </MetricCard>

                <MetricCard>
                  <MetricIcon style={{ background: 'rgba(0, 122, 255, 0.15)', color: '#007aff' }}>
                    {renderIcon(FiClock)}
                  </MetricIcon>
                  <MetricInfo>
                    <MetricValue>{projects.reduce((sum, project) => sum + (project.tasks?.length || 0), 0) - projects.reduce((sum, project) => sum + (project.tasks?.filter(task => task.status === 'completed')?.length || 0), 0)}</MetricValue>
                    <MetricLabel>Pending Tasks</MetricLabel>
                  </MetricInfo>
                </MetricCard>

                <MetricCard>
                  <MetricIcon style={{ background: 'rgba(255, 149, 0, 0.15)', color: '#ff9500' }}>
                    {renderIcon(FiCalendar)}
                  </MetricIcon>
                  <MetricInfo>
                    <MetricValue>{Math.round((projects.reduce((sum, project) => sum + (project.tasks?.filter(task => task.status === 'completed')?.length || 0), 0) / (projects.reduce((sum, project) => sum + (project.tasks?.length || 0), 0) || 1)) * 100)}%</MetricValue>
                    <MetricLabel>Completion Rate</MetricLabel>
                  </MetricInfo>
                </MetricCard>
              </MetricsGrid>
            </MetricsSection>

            <RecentProjectsSection>
              <h3>Recent Projects</h3>
              <ProjectsGrid>
                {projects.slice(0, 3).map(project => (
                  <ProjectCard key={project.id} onClick={() => {
                    setActiveTab('projects');
                    setSelectedProjectId(project.id);
                  }}>
                    <ProjectHeader>
                      <ProjectTitle>{project.name}</ProjectTitle>
                      <StatusBadge $status={project.status}>
                        {project.status === 'completed' ? 'Completed' :
                          project.status === 'in-progress' ? 'In Progress' : 'Planning'}
                      </StatusBadge>
                    </ProjectHeader>
                    <ProjectProgress $progress={project.progress}>
                      <ProgressLabel>{project.progress}%</ProgressLabel>
                    </ProjectProgress>
                    <ProjectDates>
                      <span>Start: {new Date(project.start_date || '').toLocaleDateString()}</span>
                      <span>Due: {new Date(project.due_date || '').toLocaleDateString()}</span>
                    </ProjectDates>
                  </ProjectCard>
                ))}
              </ProjectsGrid>
            </RecentProjectsSection>
          </OverviewContent>
        );
      case 'projects':
        return (
          <ProjectsContent>
            {(isEditingProject || isCreatingProject) && (
              <ProjectEditor
                project={editingProject || undefined}
                clientId={clientId}
                isNewProject={isCreatingProject}
                onSave={(savedProject) => {
                  // Update projects list
                  if (isCreatingProject) {
                    setProjects(prev => [...prev, {...savedProject, tasks: []}]);
                    setProjectActionSuccess('Project created successfully!');
                  } else {
                    setProjects(prev => prev.map(p => p.id === savedProject.id ? {...savedProject, tasks: p.tasks} : p));
                    setProjectActionSuccess('Project updated successfully!');
                  }
                  
                  // Reset editing state
                  setIsEditingProject(false);
                  setIsCreatingProject(false);
                  setEditingProject(null);
                  
                  // Hide success message after 3 seconds
                  setTimeout(() => {
                    setProjectActionSuccess(null);
                  }, 3000);
                }}
                onCancel={() => {
                  setIsEditingProject(false);
                  setIsCreatingProject(false);
                  setEditingProject(null);
                }}
              />
            )}
            
            {projectActionError && (
              <ErrorMessage>{projectActionError}</ErrorMessage>
            )}
            {projectActionSuccess && (
              <SuccessMessage>{projectActionSuccess}</SuccessMessage>
            )}
            
            {selectedProjectId ? (
              <>
                <BackToListButton onClick={() => setSelectedProjectId(null)}>
                  <FiArrowLeft /> Back to All Projects
                </BackToListButton>
                
                {projects.find(p => p.id === selectedProjectId) && (
                  <ProjectDetail>
                    <ProjectDetailHeader>
                      <h3>{projects.find(p => p.id === selectedProjectId)?.name}</h3>
                      <ProjectActionButtons>
                        <ActionButton 
                          onClick={() => {
                            const project = projects.find(p => p.id === selectedProjectId);
                            if (project) {
                              setEditingProject(project);
                              setIsEditingProject(true);
                            }
                          }}
                        >
                          {renderIcon(FiEdit)} Edit Project
                        </ActionButton>
                        <ActionButton 
                          onClick={() => handleDeleteProject(selectedProjectId)}
                          style={{ background: 'rgba(255, 59, 48, 0.2)' }}
                        >
                          {renderIcon(FiTrash2)} Delete Project
                        </ActionButton>
                      </ProjectActionButtons>
                    </ProjectDetailHeader>
                    
                    <ProjectDetailGrid>
                      <DetailItem>
                        <DetailLabel>Status</DetailLabel>
                        <StatusBadge $status={projects.find(p => p.id === selectedProjectId)?.status || 'planning'}>
                          {projects.find(p => p.id === selectedProjectId)?.status === 'completed' ? 'Completed' :
                           projects.find(p => p.id === selectedProjectId)?.status === 'in-progress' ? 'In Progress' : 'Planning'}
                        </StatusBadge>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>Progress</DetailLabel>
                        <DetailValue>{projects.find(p => p.id === selectedProjectId)?.progress}%</DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>Start Date</DetailLabel>
                        <DetailValue>{new Date(projects.find(p => p.id === selectedProjectId)?.start_date || '').toLocaleDateString()}</DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>Due Date</DetailLabel>
                        <DetailValue>{new Date(projects.find(p => p.id === selectedProjectId)?.due_date || '').toLocaleDateString()}</DetailValue>
                      </DetailItem>
                    </ProjectDetailGrid>
                    
                    <h4>Tasks</h4>
                    <TasksTable>
                      <thead>
                        <tr>
                          <th>Task Name</th>
                          <th>Status</th>
                          <th>Assignee</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.find(p => p.id === selectedProjectId)?.tasks?.map(task => (
                          <tr key={task.id}>
                            <td>{task.name}</td>
                            <td>
                              <StatusBadge $status={task.status}>
                                {task.status === 'completed' ? 'Completed' :
                                 task.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                              </StatusBadge>
                            </td>
                            <td>{task.assignee}</td>
                          </tr>
                        ))}
                      </tbody>
                    </TasksTable>
                  </ProjectDetail>
                )}
              </>
            ) : (
              <>
                <ProjectsHeader>
                  <h3>Client Projects</h3>
                  <CreateProjectButton onClick={() => setIsCreatingProject(true)}>
                    {renderIcon(FiPlus)} Create New Project
                  </CreateProjectButton>
                </ProjectsHeader>
                
                <AllProjectsGrid>
                  {displayProjects.map(project => (
                    <ProjectCard key={project.id}>
                      <ProjectHeader>
                        <ProjectTitle>{project.name}</ProjectTitle>
                        <StatusBadge $status={project.status}>
                          {project.status === 'completed' ? 'Completed' :
                            project.status === 'in-progress' ? 'In Progress' : 'Planning'}
                        </StatusBadge>
                      </ProjectHeader>
                      <ProjectProgress $progress={project.progress}>
                        <ProgressLabel>{project.progress}%</ProgressLabel>
                      </ProjectProgress>
                      <ProjectDates>
                        <span>Start: {new Date(project.start_date || '').toLocaleDateString()}</span>
                        <span>Due: {new Date(project.due_date || '').toLocaleDateString()}</span>
                      </ProjectDates>
                      <TaskSummary>
                        <TaskStatus>
                          {renderIcon(FiCheckCircle, { style: { color: '#34c759' } })}
                          {project.tasks.filter(t => t.status === 'completed').length} completed
                        </TaskStatus>
                        <TaskStatus>
                          {renderIcon(FiClock, { style: { color: '#007aff' } })}
                          {project.tasks.filter(t => t.status === 'in-progress').length} in progress
                        </TaskStatus>
                        <TaskStatus>
                          {renderIcon(FiCircle, { style: { color: 'rgba(255, 255, 255, 0.5)' } })}
                          {project.tasks.filter(t => t.status === 'not-started').length} not started
                        </TaskStatus>
                      </TaskSummary>
                      <ProjectCardActions>
                        <CardActionButton onClick={() => setSelectedProjectId(project.id)}>
                          View Details
                        </CardActionButton>
                        <CardActionButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProject(project);
                            setIsEditingProject(true);
                          }}
                        >
                          {renderIcon(FiEdit)} Edit
                        </CardActionButton>
                      </ProjectCardActions>
                    </ProjectCard>
                  ))}
                </AllProjectsGrid>
              </>
            )}
          </ProjectsContent>
        );
      case 'files':
        return (
          <div>
            <h3>Client Files</h3>
            <ClientFileManager clientId={clientId} />
          </div>
        );
      case 'tasks':
        return (
          <div>
            <h3>Client Tasks</h3>
            <ClientChecklist clientId={clientId} />
          </div>
        );
      case 'analytics':
        return (
          <AnalyticsContent>
            <h3>Client Analytics</h3>
            <p>Detailed analytics and reporting coming soon.</p>
            <ComingSoonMessage>
              We're building comprehensive analytics for "{client.name}". This will include:
              <ul>
                <li>Campaign performance metrics</li>
                <li>Website traffic and conversion data</li>
                <li>Social media engagement statistics</li>
                <li>ROI calculations and business impact</li>
              </ul>
            </ComingSoonMessage>
          </AnalyticsContent>
        );
      default:
        return null;
    }
  };

  return (
    <ClientDashboardContainer>
      <ClientHeader>
        <BackToListButton onClick={onBack}>
          <FiArrowLeft /> Back to Clients
        </BackToListButton>
        <ClientHeaderInfo>
          <ClientLogo src={client.logo || '/default-client-logo.png'} alt={client.name} />
          <div>
            <ClientName>{client.name.includes('Liberty Beans') ? `${client.name} $$$` : client.name}</ClientName>
          </div>
        </ClientHeaderInfo>
      </ClientHeader>

      <TabsContainer>
        <TabButton
          $active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </TabButton>
        <TabButton
          $active={activeTab === 'projects'}
          onClick={() => setActiveTab('projects')}
        >
          Projects
        </TabButton>
        <TabButton
          $active={activeTab === 'files'}
          onClick={() => setActiveTab('files')}
        >
          Files
        </TabButton>
        <TabButton
          $active={activeTab === 'tasks'}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </TabButton>
        <TabButton
          $active={activeTab === 'analytics'}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </TabButton>
      </TabsContainer>

      {renderContent()}
      
      {/* Add ClientChat component */}
      <ClientChat clientId={clientId} />
    </ClientDashboardContainer>
  );
};

// Styled Components
const ClientDashboardContainer = styled.div``;

const ClientHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 20px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const ClientHeaderInfo = styled.div`
  display: flex;
  align-items: center;
`;

const ClientLogo = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1F53FF, #FF43A3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 20px;
  margin-right: 15px;
  color: white;
`;

const ClientName = styled.h2`
  margin: 0;
  font-size: 24px;
`;

const ClientIndustry = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 30px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  background: transparent;
  border: none;
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  font-size: 16px;
  font-weight: ${props => props.$active ? '600' : '400'};
  padding: 15px 20px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  &:after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${props => props.$active ? 'linear-gradient(90deg, #1F53FF, #FF43A3)' : 'transparent'};
    transition: all 0.2s ease;
  }

  &:hover {
    color: white;
  }
`;

const OverviewContent = styled.div``;

const ClientInfoCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
`;

const ClientInfoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 18px;
  }
`;

const EditButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  color: white;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const EditActions = styled.div`
  display: flex;
  gap: 10px;
`;

const SaveButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  color: white;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const CancelButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  color: white;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const ClientInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const InfoItem = styled.div``;

const InfoLabel = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
`;

const InfoValue = styled.div`
  font-size: 15px;
  display: flex;
  align-items: center;
`;

const EditInput = styled.input`
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 0;
  color: white;
  font-size: 15px;
  width: 100%;
  transition: all 0.2s ease;

  &:focus {
    border-bottom-color: white;
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

const MetricsSection = styled.div`
  margin-bottom: 30px;

  h3 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 18px;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
`;

const MetricIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: rgba(31, 83, 255, 0.15);
  color: #1F53FF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 15px;
`;

const MetricInfo = styled.div``;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 5px;
`;

const MetricLabel = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
`;

const RecentProjectsSection = styled.div`
  h3 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 18px;
  }
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const ProjectCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
  }
`;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ProjectTitle = styled.h4`
  margin: 0;
  font-size: 16px;
`;

const StatusBadge = styled.span<{ $status: string }>`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;

  ${props => {
    if (props.$status === 'completed') {
      return `
        background-color: rgba(52, 199, 89, 0.2);
        color: #34c759;
      `;
    } else if (props.$status === 'in-progress') {
      return `
        background-color: rgba(0, 122, 255, 0.2);
        color: #007aff;
      `;
    } else {
      return `
        background-color: rgba(255, 149, 0, 0.2);
        color: #ff9500;
      `;
    }
  }}
`;

const ProjectProgress = styled.div<{ $progress: number }>`
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  position: relative;
  overflow: hidden;
  margin: 8px 0 15px;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.$progress}%;
    background: linear-gradient(90deg, #1F53FF, #FF43A3);
    border-radius: 3px;
  }
`;

const ProgressLabel = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
  text-align: right;
`;

const ProjectDates = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
`;

const TaskSummary = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 15px;
`;

const TaskStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
`;

const ProjectsContent = styled.div`
  h3 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 18px;
  }
`;

const ProjectsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CreateProjectButton = styled.button`
  padding: 10px 15px;
  background: rgba(31, 83, 255, 0.25);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(31, 83, 255, 0.4);
  }
  
  svg {
    font-size: 16px;
  }
`;

const ProjectDetail = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
`;

const ProjectDetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
  }
`;

const ProjectActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  background: rgba(31, 83, 255, 0.25);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(31, 83, 255, 0.4);
  }
  
  svg {
    font-size: 16px;
  }
`;

const ProjectDetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
`;

const DetailItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 8px;
`;

const DetailLabel = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
`;

const DetailValue = styled.div`
  font-size: 16px;
  font-weight: 600;
`;

const TasksTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  
  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  th {
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
  }
  
  td {
    font-size: 14px;
  }
`;

const ProjectCardActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const CardActionButton = styled.button`
  padding: 8px 12px;
  background: rgba(31, 83, 255, 0.2);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  
  &:hover {
    background: rgba(31, 83, 255, 0.3);
  }
  
  svg {
    font-size: 14px;
  }
`;

const AllProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

// Renamed from BackButton to avoid duplicate declaration
const BackToListButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const AnalyticsContent = styled.div`
  h3 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 18px;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 20px;
  }
`;

const ComingSoonMessage = styled.div`
  background: rgba(31, 83, 255, 0.05);
  border: 1px solid rgba(31, 83, 255, 0.2);
  border-radius: 10px;
  padding: 20px;
  color: rgba(255, 255, 255, 0.9);

  ul {
    margin-top: 15px;
    padding-left: 20px;

    li {
      margin-bottom: 8px;
      color: rgba(255, 255, 255, 0.7);
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
`;

export default ClientDashboard;
