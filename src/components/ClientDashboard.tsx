import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FiArrowLeft, FiEdit, FiMail, FiPhone, FiActivity, FiCalendar, FiCheckCircle, FiClock, FiCircle, FiFolder, FiList, FiSave, FiX, FiPlus, FiTrash2, FiKey, FiSearch } from 'react-icons/fi';
// Only using real data from Supabase
import ProjectDashboard from './ProjectDashboard';
import ClientFileManager from './ClientFileManager';
import TasksPage from './TasksPage';
import ProjectEditor from './ProjectEditor';
import ClientChecklist from './ClientChecklist';
import Client004Checklist from './Client004Checklist';
import SEOAuditPage from './SEOAuditPage';
import FundraiserPage from './FundraiserPage';
import ClientDashboardAI from './ClientDashboardAI';
import KeywordsPage from './KeywordsPage';
import CompetitorAnalysisPage from './CompetitorAnalysisPage';
import { renderIcon } from '../utils/iconUtils';
import { getClientById, updateClient, Client } from '../utils/clientService';
import { supabase } from '../utils/supabaseClient';
import { getProjectsByClientId, createProject, deleteProject, updateProject, createTask, updateTask, deleteTask, Project, Task } from '../utils/projectService';

// --- Styled Components ---
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 18px;
  color: white;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 18px;
  color: #ff4d4d;
  background: rgba(255, 77, 77, 0.1);
  padding: 20px;
  border-radius: 8px;
`;

const ClientDashboardContainer = styled.div`
  padding: 40px 60px;
  background: #181d2f;
  min-height: 100vh;
`;

const ClientHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
`;

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
  margin-right: 20px;
  transition: all 0.2s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const ClientHeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ClientLogo = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin-right: 20px;
`;

const ClientName = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
`;

interface TabButtonProps {
  $active: boolean;
}

const TabButton = styled.button<TabButtonProps>`
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border: none;
  border-radius: 6px;
  padding: 10px 15px;
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.6)'};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$active ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
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
  position: relative;
  z-index: 10;
  h3 {
    margin: 0;
    font-size: 18px;
  }
`;

const EditActions = styled.div`
  display: flex;
  gap: 10px;
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
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 8px 10px;
  color: white;
  font-size: 15px;
  width: 100%;
  transition: all 0.2s ease;
  z-index: 200;
  &:focus {
    border-color: rgba(255, 255, 255, 0.5);
    outline: none;
    box-shadow: 0 0 0 2px rgba(31, 83, 255, 0.2);
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

interface StatusBadgeProps {
  $status: string;
}

const StatusBadge = styled.span<StatusBadgeProps>`
  font-size: 12px;
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

interface ProjectProgressProps {
  $progress: number;
}

const ProjectProgress = styled.div<ProjectProgressProps>`
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin: 8px 0 15px;
  position: relative;
  overflow: hidden;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => `${props.$progress}%`};
    background: #1F53FF;
    border-radius: 3px;
  }
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
// --- End Styled Components ---

interface ClientDashboardProps {
  clientId: string;
  onBack: () => void;
}

// Using Project and Task interfaces from projectService

const ClientDashboard: React.FC<ClientDashboardProps> = ({ clientId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'files' | 'tasks' | 'checklist' | 'analytics' | 'fundraiser' | 'email' | 'seo' | 'keywords' | 'competitor-analysis' | 'landing-pages' | 'ai-tools'>('overview');
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedClient, setEditedClient] = useState<Client | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);
  const isEditingRef = useRef<boolean>(false);
  const navigate = useNavigate();

  // Handle navigation to Email Marketing Hub when the email tab is selected
  useEffect(() => {
    if (activeTab === 'email') {
      navigate(`/email-marketing?clientId=${clientId}`);
    }
  }, [activeTab, clientId, navigate]);

  // Function to fetch projects
  const fetchProjects = async () => {
    try {
      const projectsData = await getProjectsByClientId(clientId);
      console.log("Fetched projects:", projectsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Handle saving client changes
  const handleSaveClientChanges = async () => {
    if (!editedClient) return;
    
    try {
      setSaveError(null);
      setSaveSuccess(false);
      
      // Call the update function from clientService
      await updateClient(editedClient.id, editedClient);
      
      // Update the local state
      setClient(editedClient);
      setIsEditing(false);
      isEditingRef.current = false;
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving client changes:', error);
      setSaveError('Failed to save changes. Please try again.');
    }
  };

  // Handle canceling edit mode
  const handleCancelEditClient = () => {
    setIsEditing(false);
    isEditingRef.current = false;
    setSaveError(null);
    // Reset edited client to original client data
    setEditedClient(client);
  };

  // Handle deleting a project
  const handleDeleteProject = async (projectId: string | null) => {
    if (!projectId) return;
    
    try {
      await deleteProject(projectId);
      
      // Update the projects list
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
      
      // If we're viewing the deleted project, go back to the projects list
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      // Show error message to user
    }
  };

  // Function to handle creating a new project
  const handleCreateProject = () => {
    console.log("Creating new project for client:", clientId);
    setSelectedProject(null);
    setIsCreatingProject(true);
  };

  // Fetch client and projects data
  useEffect(() => {
    const fetchClientAndProjects = async () => {
      // Defensive: Don't fetch if clientId is missing
      if (!clientId) {
        setError('Client ID is missing.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        // --- CHANGE: Use getClientById instead of getClientByUserId ---
        const clientData = await getClientById(clientId);

        if (!clientData) {
          throw new Error('Client not found');
        }

        setClient(clientData);
        setEditedClient(JSON.parse(JSON.stringify(clientData))); // Deep copy for editing

        // Fetch projects for this client
        fetchProjects();
      } catch (error) {
        console.error('Error fetching client data:', error);
        setError('Failed to load client data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientAndProjects();
  }, [clientId]);

  // Handle clicks outside of edit mode
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only process if we're in edit mode
      if (!isEditingRef.current) return;
      
      // Check if the click was outside the client info card
      const clientInfoCard = document.querySelector('.client-info-card');
      if (clientInfoCard && !clientInfoCard.contains(event.target as Node)) {
        // Save changes automatically when clicking outside
        handleSaveClientChanges();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editedClient]);

  // Import AnalyticsDashboard at the top of the file
  const AnalyticsDashboard = React.lazy(() => import('./AnalyticsDashboard'));

  // Render the content based on active tab
  const renderContent = () => {
    if (loading) {
      return <LoadingContainer>Loading client data...</LoadingContainer>;
    }
    
    if (error) {
      return <ErrorContainer>{error}</ErrorContainer>;
    }
    
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewContent>
            <ClientInfoCard className="client-info-card">
              <ClientInfoHeader>
                <h3>Client Information</h3>
                {isEditing ? (
                  <EditActions>
                    <button 
                      type="button" 
                      style={{ 
                        zIndex: 1000, 
                        background: 'rgba(31, 83, 255, 0.3)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        color: 'white',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontWeight: 'bold'
                      }} 
                      onClick={handleSaveClientChanges}>
                      {renderIcon(FiSave)} Save
                    </button>
                    <button type="button" 
                      style={{ 
                        zIndex: 1000, 
                        background: 'rgba(255, 59, 48, 0.3)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        color: 'white',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontWeight: 'bold'
                      }} 
                      onClick={handleCancelEditClient}>
                      {renderIcon(FiX)} Cancel
                    </button>
                  </EditActions>
                ) : (
                  <button 
                    type="button"
                    style={{ 
                      cursor: 'pointer', 
                      position: 'relative', 
                      zIndex: 1000,
                      background: 'rgba(31, 83, 255, 0.3)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: 'white',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontWeight: 'bold'
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('[ClientDashboard] Starting to edit client info - DIRECT METHOD');
                      if (client) {
                        // Ensure we have a fresh copy of the client data
                        setEditedClient(JSON.parse(JSON.stringify(client)));
                      }
                      // Update both the state and the ref
                      isEditingRef.current = true;
                      setIsEditing(true);
                      console.log('[ClientDashboard] Set isEditing to true - DIRECT METHOD');
                      // Force focus on the first input after a short delay
                      setTimeout(() => {
                        const firstInput = document.querySelector('input') as HTMLInputElement;
                        if (firstInput) {
                          firstInput.focus();
                        }
                      }, 100);
                    }}
                  >
                    {renderIcon(FiEdit)} Edit
                  </button>
                )}
              </ClientInfoHeader>

              {saveError && <ErrorMessage>{saveError}</ErrorMessage>}
              {saveSuccess && <SuccessMessage>Changes saved successfully!</SuccessMessage>}

              <ClientInfoGrid>
                {/* Name field - first in the list */}
                <InfoItem>
                  <InfoLabel>Company Name</InfoLabel>
                  {isEditing ? (
                    <EditInput 
                      type="text" 
                      value={editedClient?.name || ''} 
                      onChange={(e) => {
                        if (editedClient) {
                          setEditedClient({...editedClient, name: e.target.value});
                        }
                      }}
                    />
                  ) : (
                    <InfoValue>{client?.name || 'N/A'}</InfoValue>
                  )}
                </InfoItem>

                {/* Industry field */}
                <InfoItem>
                  <InfoLabel>Industry</InfoLabel>
                  {isEditing ? (
                    <EditInput 
                      type="text" 
                      value={editedClient?.industry || ''} 
                      onChange={(e) => {
                        if (editedClient) {
                          setEditedClient({...editedClient, industry: e.target.value});
                        }
                      }}
                    />
                  ) : (
                    <InfoValue>{client?.industry || 'N/A'}</InfoValue>
                  )}
                </InfoItem>

                {/* Contact Name field */}
                <InfoItem>
                  <InfoLabel>Contact Name</InfoLabel>
                  {isEditing ? (
                    <EditInput 
                      type="text" 
                      value={editedClient?.contactname || ''} 
                      onChange={(e) => {
                        if (editedClient) {
                          setEditedClient({...editedClient, contactname: e.target.value});
                        }
                      }}
                    />
                  ) : (
                    <InfoValue>{client?.contactname || 'N/A'}</InfoValue>
                  )}
                </InfoItem>

                {/* Contact Email field */}
                <InfoItem>
                  <InfoLabel>Contact Email</InfoLabel>
                  {isEditing ? (
                    <EditInput 
                      type="email" 
                      value={editedClient?.contactemail || ''} 
                      onChange={(e) => {
                        if (editedClient) {
                          setEditedClient({...editedClient, contactemail: e.target.value});
                        }
                      }}
                    />
                  ) : (
                    <InfoValue>
                      {renderIcon(FiMail)}
                      <span style={{ marginLeft: '5px' }}>{client?.contactemail || 'N/A'}</span>
                    </InfoValue>
                  )}
                </InfoItem>

                {/* Contact Phone field */}
                <InfoItem>
                  <InfoLabel>Contact Phone</InfoLabel>
                  {isEditing ? (
                    <EditInput 
                      type="tel" 
                      value={editedClient?.contactphone || ''} 
                      onChange={(e) => {
                        if (editedClient) {
                          setEditedClient({...editedClient, contactphone: e.target.value});
                        }
                      }}
                    />
                  ) : (
                    <InfoValue>
                      {renderIcon(FiPhone)}
                      <span style={{ marginLeft: '5px' }}>{client?.contactphone || 'N/A'}</span>
                    </InfoValue>
                  )}
                </InfoItem>

                {/* Status field */}
                <InfoItem>
                  <InfoLabel>Status</InfoLabel>
                  {isEditing ? (
                    <EditInput 
                      type="text" 
                      value={editedClient?.status || ''} 
                      onChange={(e) => {
                        if (editedClient) {
                          setEditedClient({...editedClient, status: e.target.value});
                        }
                      }}
                    />
                  ) : (
                    <InfoValue>
                      <StatusBadge $status={client?.status || 'active'}>
                        {client?.status || 'Active'}
                      </StatusBadge>
                    </InfoValue>
                  )}
                </InfoItem>
              </ClientInfoGrid>
            </ClientInfoCard>

            <MetricsSection>
              <h3>Client Metrics</h3>
              <MetricsGrid>
                <MetricCard>
                  <MetricIcon>{renderIcon(FiActivity)}</MetricIcon>
                  <MetricInfo>
                    <MetricValue>{client?.activeprojects || 0}</MetricValue>
                    <MetricLabel>Active Projects</MetricLabel>
                  </MetricInfo>
                </MetricCard>
                
                <MetricCard>
                  <MetricIcon>{renderIcon(FiCalendar)}</MetricIcon>
                  <MetricInfo>
                    <MetricValue>
                      {projects.filter(p => p.status === 'completed').length}
                    </MetricValue>
                    <MetricLabel>Completed Projects</MetricLabel>
                  </MetricInfo>
                </MetricCard>
                
                <MetricCard>
                  <MetricIcon>{renderIcon(FiCheckCircle)}</MetricIcon>
                  <MetricInfo>
                    <MetricValue>
                      {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / (projects.length || 1))}%
                    </MetricValue>
                    <MetricLabel>Average Progress</MetricLabel>
                  </MetricInfo>
                </MetricCard>
              </MetricsGrid>
            </MetricsSection>

            <h3>Recent Projects</h3>
            <AllProjectsGrid>
              {projects.slice(0, 3).map(project => (
                <ProjectCard key={project.id} onClick={() => setSelectedProject(project)}>
                  <ProjectHeader>
                    <ProjectTitle>{project.name}</ProjectTitle>
                    <StatusBadge $status={project.status}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </StatusBadge>
                  </ProjectHeader>
                  
                  <ProjectProgress $progress={project.progress} />
                  
                  <ProjectDates>
                    <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                    <span>Due: {new Date(project.due_date).toLocaleDateString()}</span>
                  </ProjectDates>
                  
                  <ProjectCardActions>
                    <CardActionButton onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(project);
                      setActiveTab('projects');
                    }}>
                      {renderIcon(FiFolder)} View Details
                    </CardActionButton>
                    
                    <CardActionButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      style={{ background: 'rgba(255, 59, 48, 0.2)' }}
                    >
                      {renderIcon(FiTrash2)} Delete
                    </CardActionButton>
                  </ProjectCardActions>
                </ProjectCard>
              ))}
            </AllProjectsGrid>
          </OverviewContent>
        );
        
      case 'projects':
        return (
          <ProjectsContent>
            {selectedProject ? (
              <div>
                <ProjectDetailHeader>
                  <h3>{selectedProject.name}</h3>
                  <ProjectActionButtons>
                    <ActionButton onClick={() => setSelectedProject(null)}>
                      {renderIcon(FiArrowLeft)} Back to Projects
                    </ActionButton>
                  </ProjectActionButtons>
                </ProjectDetailHeader>
                
                <ProjectDetail>
                  <ProjectDetailGrid>
                    <DetailItem>
                      <DetailLabel>Status</DetailLabel>
                      <DetailValue>
                        <StatusBadge $status={selectedProject.status}>
                          {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
                        </StatusBadge>
                      </DetailValue>
                    </DetailItem>
                    
                    <DetailItem>
                      <DetailLabel>Progress</DetailLabel>
                      <DetailValue>{selectedProject.progress}%</DetailValue>
                    </DetailItem>
                    
                    <DetailItem>
                      <DetailLabel>Start Date</DetailLabel>
                      <DetailValue>
                        {new Date(selectedProject.start_date).toLocaleDateString()}
                      </DetailValue>
                    </DetailItem>
                    
                    <DetailItem>
                      <DetailLabel>Due Date</DetailLabel>
                      <DetailValue>
                        {new Date(selectedProject.due_date).toLocaleDateString()}
                      </DetailValue>
                    </DetailItem>
                  </ProjectDetailGrid>
                  
                  <h4>Description</h4>
                  <p>{selectedProject.description}</p>
                  
                  <h4>Tasks</h4>
                  <TasksTable>
                    <thead>
                      <tr>
                        <th>Task Name</th>
                        <th>Status</th>
                        <th>Assignee</th>
                        <th>Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* This would be populated with actual tasks */}
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center' }}>
                          No tasks found for this project.
                        </td>
                      </tr>
                    </tbody>
                  </TasksTable>
                </ProjectDetail>
              </div>
            ) : isCreatingProject ? (
              <ProjectEditor 
                clientId={clientId}
                project={selectedProject}
                onSave={(newProject) => {
                  console.log("Project saved:", newProject);
                  // Simply add the new project to the list
                  setProjects(prev => {
                    if (selectedProject) {
                      return prev.map(p => p.id === newProject.id ? newProject : p);
                    }
                    return [...prev, newProject];
                  });
                  setIsCreatingProject(false);
                  setSelectedProject(null);
                }}
                onCancel={() => {
                  setIsCreatingProject(false);
                  setSelectedProject(null);
                }}
                isNewProject={!selectedProject}
              />
            ) : (
              <>
                <ProjectsHeader>
                  <h3>All Projects</h3>
                  <CreateProjectButton 
                    onClick={handleCreateProject}
                  >
                    {renderIcon(FiPlus)} Create Project
                  </CreateProjectButton>
                </ProjectsHeader>
                
                <AllProjectsGrid>
                  {projects.length > 0 ? (
                    projects.map(project => (
                      <ProjectCard key={project.id} onClick={() => setSelectedProject(project)}>
                        <ProjectHeader>
                          <ProjectTitle>{project.name}</ProjectTitle>
                          <StatusBadge $status={project.status}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </StatusBadge>
                        </ProjectHeader>
                        
                        <ProjectProgress $progress={project.progress} />
                        
                        <ProjectDates>
                          <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                          <span>Due: {new Date(project.due_date).toLocaleDateString()}</span>
                        </ProjectDates>
                        
                        <ProjectCardActions>
                          <CardActionButton onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(project);
                          }}>
                            {renderIcon(FiFolder)} View Details
                          </CardActionButton>
                          
                          <CardActionButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Set up project for editing
                              setSelectedProject(project);
                              setIsCreatingProject(true);
                            }}
                            style={{ background: 'rgba(31, 83, 255, 0.2)' }}
                          >
                            {renderIcon(FiEdit)} Edit
                          </CardActionButton>
                          
                          <CardActionButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            style={{ background: 'rgba(255, 59, 48, 0.2)' }}
                          >
                            {renderIcon(FiTrash2)} Delete
                          </CardActionButton>
                        </ProjectCardActions>
                      </ProjectCard>
                    ))
                  ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
                      <p>No projects found for this client.</p>
                      <button 
                        style={{ 
                          marginTop: '20px',
                          padding: '10px 15px',
                          background: 'rgba(31, 83, 255, 0.25)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontWeight: '600'
                        }}
                        onClick={handleCreateProject}
                      >
                        {renderIcon(FiPlus)} Create First Project
                      </button>
                    </div>
                  )}
                </AllProjectsGrid>
              </>
            )}
          </ProjectsContent>
        );
        
      case 'files':
        return <ClientFileManager clientId={clientId} />;
        
      case 'tasks':
        return <TasksPage clientId={clientId} />;
        
      case 'checklist':
        // Show special checklist for Altare (client-004)
        if (clientId === 'client-004') {
          return <Client004Checklist />;
        }
        return <ClientChecklist clientId={clientId} />;
        
      case 'analytics':
        return (
          <AnalyticsContent>
            <h3>Client Analytics</h3>
            <React.Suspense fallback={<div>Loading analytics dashboard...</div>}>
              <AnalyticsDashboard clientId={clientId} dateRange="month" />
            </React.Suspense>
            
            <ComingSoonMessage>
              <h4>Coming Soon</h4>
              <p>We're working on advanced analytics features including:</p>
              <ul>
                <li>Project timeline visualization</li>
                <li>Budget tracking and financial reports</li>
                <li>Resource allocation insights</li>
                <li>Performance metrics and KPIs</li>
                <li>Custom reporting options</li>
              </ul>
            </ComingSoonMessage>
          </AnalyticsContent>
        );
        
      case 'email':
        // Available to all clients
        return (
          <div style={{ padding: '20px' }}>
            <h3>Email & Landing Page Marketing</h3>
            <p>Create and manage email campaigns and landing pages for {client?.name || 'your business'}.</p>
            <div style={{ marginTop: '20px' }}>
              <button 
                onClick={() => navigate(`/email-marketing?clientId=${clientId}`)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'rgba(31, 83, 255, 0.25)',
                  color: 'white',
                  borderRadius: '5px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <FiMail size={18} />
                Open Marketing Hub
              </button>
            </div>
          </div>
        );
        
      case 'fundraiser':
        // Only show for Liberty Beans
        if (client?.id !== "client-liberty-beans") return null;
        return <FundraiserPage clientId={client.id} isAdmin={false} />;
        
      case 'seo':
        return <SEOAuditPage clientId={clientId} />;
        
      case 'keywords':
        return <KeywordsPage clientId={clientId} />;
      
      case 'competitor-analysis':
        return <CompetitorAnalysisPage clientId={clientId} />;
        
      case 'landing-pages':
        return (
          <div style={{ padding: '20px' }}>
            <h3>Landing Page Generator</h3>
            <p>Create and manage landing pages for {client?.name || 'your business'}.</p>
            <div style={{ marginTop: '20px' }}>
              <button 
                onClick={() => navigate(`/landing-page-generator?clientId=${clientId}`)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'rgba(31, 83, 255, 0.25)',
                  color: 'white',
                  borderRadius: '5px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <FiPlus size={18} />
                Create Landing Page
              </button>
            </div>
          </div>
        );
        
      case 'ai-tools':
        return <ClientDashboardAI />;
        
      case 'email':
        // Navigate to Email Marketing Hub with the client ID
        // We need to handle this outside the switch statement
        // This case just returns a loading placeholder
        return (
          <div style={{ padding: '20px' }}>
            <h3>Email Marketing Hub</h3>
            <p>Loading email marketing tools...</p>
          </div>
        );
        
      default:
        return null;
    }
  };

  const LIBERTY_BEANS_CLIENT_ID = "client-liberty-beans";

  return (
    <ClientDashboardContainer>
      <ClientHeader>
        <BackToListButton onClick={onBack}>
          {renderIcon(FiArrowLeft)} Back to Clients
        </BackToListButton>
        
        <ClientHeaderInfo>
          <ClientName>
            {client?.name || 'Client'}
          </ClientName>
        </ClientHeaderInfo>
      </ClientHeader>

      <TabsContainer>
        <TabButton $active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</TabButton>
        <TabButton $active={activeTab === 'projects'} onClick={() => setActiveTab('projects')}>Projects</TabButton>
        <TabButton $active={activeTab === 'files'} onClick={() => setActiveTab('files')}>Files</TabButton>
        <TabButton $active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')}>Tasks</TabButton>
        <TabButton $active={activeTab === 'checklist'} onClick={() => setActiveTab('checklist')}>
          Checklist
        </TabButton>
        <TabButton $active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>Analytics</TabButton>
        <TabButton $active={activeTab === 'email'} onClick={() => setActiveTab('email')}>
          Email Marketing
        </TabButton>
        <TabButton $active={activeTab === 'seo'} onClick={() => setActiveTab('seo')}>SEO Audit</TabButton>
        <TabButton $active={activeTab === 'keywords'} onClick={() => setActiveTab('keywords')}>
          <FiKey style={{ marginRight: '5px' }} /> Keywords
        </TabButton>
        <TabButton $active={activeTab === 'competitor-analysis'} onClick={() => setActiveTab('competitor-analysis')}>
          <FiSearch style={{ marginRight: '5px' }} /> Competitor Analysis
        </TabButton>
        <TabButton $active={activeTab === 'landing-pages'} onClick={() => setActiveTab('landing-pages')}>
          Landing Pages
        </TabButton>
        <TabButton $active={activeTab === 'ai-tools'} onClick={() => setActiveTab('ai-tools')}>
          AI Tools
        </TabButton>
        {/* Only show Liberty Beans specific tabs */}
        {client?.id === LIBERTY_BEANS_CLIENT_ID && (
          <>
            <TabButton $active={activeTab === 'fundraiser'} onClick={() => setActiveTab('fundraiser')}>
              Fundraiser
            </TabButton>
          </>
        )}
      </TabsContainer>

      {renderContent()}
    </ClientDashboardContainer>
  );
};

export default ClientDashboard;