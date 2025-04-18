import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEdit, FiMail, FiPhone, FiActivity, FiCalendar, FiCheckCircle, FiClock, FiCircle, FiFolder, FiList, FiSave, FiX } from 'react-icons/fi';
// Only using real data from Supabase
import ProjectDashboard from './ProjectDashboard';
import ClientFileManager from './ClientFileManager';
import ClientChecklist from './ClientChecklist';
import ClientChat from './ClientChat';
import { renderIcon } from '../utils/iconUtils';
import { getClientById, updateClient, Client } from '../utils/clientService';
import { supabase } from '../utils/supabaseClient';
import { getProjectsByClientId, Project, Task } from '../utils/projectService';

interface ClientDashboardProps {
  clientId: string;
  onBack: () => void;
}

// Using Project and Task interfaces from projectService

const ClientDashboard: React.FC<ClientDashboardProps> = ({ clientId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'files' | 'tasks' | 'analytics'>('overview');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Client>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch client data and projects
  useEffect(() => {
    const fetchClientAndProjects = async () => {
      setIsLoading(true);
      setIsLoadingProjects(true);
      setError(null);
      console.log('Fetching client with ID:', clientId);

      try {
        // Special handling for Liberty Beans Coffee
        if (clientId === 'client-001' || clientId === 'client-liberty-beans') {
          console.log('Liberty Beans client detected, checking both IDs');
          
          // Try the new ID first
          let clientData = await getClientById('client-liberty-beans');
          
          // If not found, try the old ID
          if (!clientData) {
            clientData = await getClientById('client-001');
          }
          
          if (clientData) {
            console.log('Found Liberty Beans client:', clientData);
            setClient(clientData);
            setEditForm(clientData);
            
            // Fetch projects for Liberty Beans
            try {
              const clientProjects = await getProjectsByClientId(clientData.id);
              console.log('Fetched projects for Liberty Beans:', clientProjects);
              setProjects(clientProjects);
            } catch (projectErr) {
              console.error('Error fetching projects for Liberty Beans:', projectErr);
              setProjects([]);
            } finally {
              setIsLoadingProjects(false);
            }
          } else {
            // Show error instead of using mock data
            console.log('Liberty Beans not found in database');
            setError('Liberty Beans Coffee client not found in the database. Please check your connection and try again.');
            setClient(null);
            setProjects([]);
            setIsLoadingProjects(false);
          }
        } else {
          // Normal handling for other clients
          const clientData = await getClientById(clientId);
          if (clientData) {
            setClient(clientData);
            setEditForm(clientData);
            
            // Fetch projects for this client
            try {
              const clientProjects = await getProjectsByClientId(clientData.id);
              console.log(`Fetched ${clientProjects.length} projects for client:`, clientData.id);
              setProjects(clientProjects);
            } catch (projectErr) {
              console.error(`Error fetching projects for client ${clientData.id}:`, projectErr);
              setProjects([]);
            } finally {
              setIsLoadingProjects(false);
            }
          } else {
            // Show error instead of using mock data
            setError('Client not found in the database. Please check your connection and try again.');
            setClient(null);
            setProjects([]);
            setIsLoadingProjects(false);
          }
        }
      } catch (err) {
        console.error('Error fetching client:', err);
        setError('Failed to load client data. Please check your connection and try again.');
        setClient(null);
        setEditForm({});
        setProjects([]);
        setIsLoadingProjects(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientAndProjects();
  }, [clientId]);

  // Projects are now fetched from the database via the useEffect

  if (isLoading || isLoadingProjects) {
    return <LoadingContainer>Loading client data...</LoadingContainer>;
  }

  if (error && !client) {
    return <ErrorContainer>{error}</ErrorContainer>;
  }

  if (!client) {
    return <div>Client not found</div>;
  }

  // Calculate metrics
  const completedTasks = projects.reduce((sum, project) => {
    return sum + project.tasks.filter(task => task.status === 'completed').length;
  }, 0);

  const totalTasks = projects.reduce((sum, project) => {
    return sum + project.tasks.length;
  }, 0);

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Handle input changes in the edit form
  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      if (!client) return;

      setSaveError(null);
      setSaveSuccess(false);

      // Update client in database
      const updatedClient = await updateClient(client.id, editForm);

      if (updatedClient) {
        setClient(updatedClient);
        setIsEditing(false);
        setSaveSuccess(true);

        // Hide success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Error saving client changes:', err);
      setSaveError('Failed to save changes. Please try again.');
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditForm(client || {});
    setIsEditing(false);
    setSaveError(null);
  };

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
                    <SaveButton onClick={handleSaveChanges}>
                      {renderIcon(FiSave)} Save
                    </SaveButton>
                    <CancelButton onClick={handleCancelEdit}>
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
                      value={editForm.industry || ''}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                    />
                  ) : (
                    <InfoValue>{client.industry}</InfoValue>
                  )}
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Contact Name</InfoLabel>
                  {isEditing ? (
                    <EditInput
                      value={editForm.contactname || editForm.contact_name || ''}
                      onChange={(e) => handleInputChange('contactname', e.target.value)}
                    />
                  ) : (
                    <InfoValue>{client.contactname || client.contact_name}</InfoValue>
                  )}
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Email</InfoLabel>
                  {isEditing ? (
                    <EditInput
                      value={editForm.contactemail || editForm.contact_email || ''}
                      onChange={(e) => handleInputChange('contactemail', e.target.value)}
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
                      value={editForm.contactphone || editForm.contact_phone || ''}
                      onChange={(e) => handleInputChange('contactphone', e.target.value)}
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
                      value={editForm.username || ''}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                    />
                  ) : (
                    <InfoValue>{client.username}</InfoValue>
                  )}
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Password</InfoLabel>
                  {isEditing ? (
                    <EditInput
                      value={editForm.password || ''}
                      onChange={(e) => handleInputChange('password', e.target.value)}
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
                    <MetricValue>{completedTasks}</MetricValue>
                    <MetricLabel>Completed Tasks</MetricLabel>
                  </MetricInfo>
                </MetricCard>

                <MetricCard>
                  <MetricIcon style={{ background: 'rgba(0, 122, 255, 0.15)', color: '#007aff' }}>
                    {renderIcon(FiClock)}
                  </MetricIcon>
                  <MetricInfo>
                    <MetricValue>{totalTasks - completedTasks}</MetricValue>
                    <MetricLabel>Pending Tasks</MetricLabel>
                  </MetricInfo>
                </MetricCard>

                <MetricCard>
                  <MetricIcon style={{ background: 'rgba(255, 149, 0, 0.15)', color: '#ff9500' }}>
                    {renderIcon(FiCalendar)}
                  </MetricIcon>
                  <MetricInfo>
                    <MetricValue>{completionRate}%</MetricValue>
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
                      <span>Start: {project.startDate ? project.startDate.toLocaleDateString() : new Date(project.start_date || '').toLocaleDateString()}</span>
                      <span>Due: {project.dueDate ? project.dueDate.toLocaleDateString() : new Date(project.due_date || '').toLocaleDateString()}</span>
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
            {selectedProjectId ? (
              <div>
                <BackToProjectsButton onClick={() => setSelectedProjectId(null)}>
                  {renderIcon(FiArrowLeft)} Back to Projects
                </BackToProjectsButton>
                <ProjectDashboard projectId={selectedProjectId} />
              </div>
            ) : (
              <>
                <h3>All Projects</h3>
                <AllProjectsGrid>
                  {projects.map(project => (
                    <ProjectCard
                      key={project.id}
                      onClick={() => setSelectedProjectId(project.id)}
                    >
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
                        <span>Start: {project.startDate ? project.startDate.toLocaleDateString() : new Date(project.start_date || '').toLocaleDateString()}</span>
                        <span>Due: {project.dueDate ? project.dueDate.toLocaleDateString() : new Date(project.due_date || '').toLocaleDateString()}</span>
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
        <BackButton onClick={onBack}>
          {renderIcon(FiArrowLeft)} Back to Clients
        </BackButton>
        <ClientHeaderInfo>
          <ClientLogo src={client.logo || '/default-client-logo.png'} alt={client.name} />
          <div>
            <ClientName>{client.name}</ClientName>
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
  color: #ff0000;
  font-size: 14px;
  margin-bottom: 10px;
`;

const SuccessMessage = styled.div`
  color: #34c759;
  font-size: 14px;
  margin-bottom: 10px;
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

const AllProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const BackToProjectsButton = styled.button`
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
