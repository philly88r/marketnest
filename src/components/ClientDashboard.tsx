import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEdit, FiMail, FiPhone, FiActivity, FiCalendar, FiCheckCircle, FiClock, FiCircle, FiFolder, FiList } from 'react-icons/fi';
import { mockClients } from './ClientList';
import ProjectDashboard from './ProjectDashboard';
import ClientFileManager from './ClientFileManager';
import ClientChecklist from './ClientChecklist';
import { renderIcon } from '../utils/iconUtils';

interface ClientDashboardProps {
  clientId: string;
  onBack: () => void;
}

// Mock project data for each client
const clientProjects = {
  'client-001': [
    {
      id: 'proj-001',
      name: 'Website Redesign',
      status: 'in-progress',
      progress: 65,
      startDate: new Date('2025-03-15'),
      dueDate: new Date('2025-05-01'),
      tasks: [
        { id: 'task-001', name: 'Wireframes', status: 'completed', assignee: 'Alex' },
        { id: 'task-002', name: 'Design System', status: 'completed', assignee: 'Morgan' },
        { id: 'task-003', name: 'Homepage Development', status: 'in-progress', assignee: 'Jamie' },
        { id: 'task-004', name: 'Content Migration', status: 'not-started', assignee: 'Casey' }
      ]
    },
    {
      id: 'proj-002',
      name: 'SEO Campaign',
      status: 'in-progress',
      progress: 40,
      startDate: new Date('2025-04-01'),
      dueDate: new Date('2025-06-15'),
      tasks: [
        { id: 'task-005', name: 'Keyword Research', status: 'completed', assignee: 'Taylor' },
        { id: 'task-006', name: 'On-page Optimization', status: 'in-progress', assignee: 'Jordan' }
      ]
    },
    {
      id: 'proj-003',
      name: 'Social Media Strategy',
      status: 'planning',
      progress: 15,
      startDate: new Date('2025-04-20'),
      dueDate: new Date('2025-07-01'),
      tasks: [
        { id: 'task-009', name: 'Audience Analysis', status: 'in-progress', assignee: 'Morgan' },
        { id: 'task-010', name: 'Content Calendar', status: 'not-started', assignee: 'Casey' }
      ]
    }
  ],
  'client-002': [
    {
      id: 'proj-004',
      name: 'Local SEO Campaign',
      status: 'in-progress',
      progress: 75,
      startDate: new Date('2025-02-10'),
      dueDate: new Date('2025-05-15'),
      tasks: [
        { id: 'task-013', name: 'Google Business Profile', status: 'completed', assignee: 'Taylor' },
        { id: 'task-014', name: 'Local Citations', status: 'completed', assignee: 'Jordan' },
        { id: 'task-015', name: 'Review Management', status: 'in-progress', assignee: 'Alex' }
      ]
    },
    {
      id: 'proj-005',
      name: 'PPC Advertising',
      status: 'in-progress',
      progress: 50,
      startDate: new Date('2025-03-01'),
      dueDate: new Date('2025-06-01'),
      tasks: [
        { id: 'task-016', name: 'Keyword Research', status: 'completed', assignee: 'Morgan' },
        { id: 'task-017', name: 'Ad Creation', status: 'in-progress', assignee: 'Jamie' },
        { id: 'task-018', name: 'Campaign Optimization', status: 'not-started', assignee: 'Casey' }
      ]
    }
  ],
  'client-003': [
    {
      id: 'proj-006',
      name: 'Website Development',
      status: 'in-progress',
      progress: 60,
      startDate: new Date('2025-01-15'),
      dueDate: new Date('2025-04-30'),
      tasks: [
        { id: 'task-019', name: 'Wireframes', status: 'completed', assignee: 'Morgan' },
        { id: 'task-020', name: 'Design', status: 'completed', assignee: 'Jamie' },
        { id: 'task-021', name: 'Development', status: 'in-progress', assignee: 'Casey' },
        { id: 'task-022', name: 'Content Creation', status: 'in-progress', assignee: 'Taylor' }
      ]
    },
    {
      id: 'proj-007',
      name: 'Content Marketing',
      status: 'planning',
      progress: 25,
      startDate: new Date('2025-03-10'),
      dueDate: new Date('2025-06-15'),
      tasks: [
        { id: 'task-023', name: 'Content Strategy', status: 'completed', assignee: 'Jordan' },
        { id: 'task-024', name: 'Blog Posts', status: 'in-progress', assignee: 'Alex' },
        { id: 'task-025', name: 'Case Studies', status: 'not-started', assignee: 'Morgan' }
      ]
    },
    {
      id: 'proj-008',
      name: 'Social Media Management',
      status: 'in-progress',
      progress: 45,
      startDate: new Date('2025-02-01'),
      dueDate: new Date('2025-05-01'),
      tasks: [
        { id: 'task-026', name: 'Platform Setup', status: 'completed', assignee: 'Jamie' },
        { id: 'task-027', name: 'Content Calendar', status: 'in-progress', assignee: 'Casey' },
        { id: 'task-028', name: 'Engagement Strategy', status: 'not-started', assignee: 'Taylor' }
      ]
    },
    {
      id: 'proj-009',
      name: 'Email Marketing',
      status: 'planning',
      progress: 10,
      startDate: new Date('2025-04-15'),
      dueDate: new Date('2025-07-15'),
      tasks: [
        { id: 'task-029', name: 'List Building', status: 'in-progress', assignee: 'Jordan' },
        { id: 'task-030', name: 'Email Templates', status: 'not-started', assignee: 'Alex' }
      ]
    }
  ],
  'client-004': [
    {
      id: 'proj-010',
      name: 'Website Optimization',
      status: 'in-progress',
      progress: 70,
      startDate: new Date('2025-02-15'),
      dueDate: new Date('2025-04-30'),
      tasks: [
        { id: 'task-031', name: 'Performance Audit', status: 'completed', assignee: 'Casey' },
        { id: 'task-032', name: 'Speed Optimization', status: 'completed', assignee: 'Taylor' },
        { id: 'task-033', name: 'UX Improvements', status: 'in-progress', assignee: 'Jordan' }
      ]
    },
    {
      id: 'proj-011',
      name: 'SEO Strategy',
      status: 'in-progress',
      progress: 55,
      startDate: new Date('2025-03-01'),
      dueDate: new Date('2025-06-01'),
      tasks: [
        { id: 'task-034', name: 'Technical SEO', status: 'completed', assignee: 'Alex' },
        { id: 'task-035', name: 'Content Optimization', status: 'in-progress', assignee: 'Morgan' },
        { id: 'task-036', name: 'Link Building', status: 'not-started', assignee: 'Jamie' }
      ]
    },
    {
      id: 'proj-012',
      name: 'Analytics Implementation',
      status: 'planning',
      progress: 30,
      startDate: new Date('2025-04-01'),
      dueDate: new Date('2025-05-15'),
      tasks: [
        { id: 'task-037', name: 'Requirements Gathering', status: 'completed', assignee: 'Casey' },
        { id: 'task-038', name: 'Tag Setup', status: 'in-progress', assignee: 'Taylor' },
        { id: 'task-039', name: 'Dashboard Creation', status: 'not-started', assignee: 'Jordan' }
      ]
    }
  ]
};

const ClientDashboard: React.FC<ClientDashboardProps> = ({ clientId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'files' | 'tasks' | 'analytics'>('overview');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  const client = mockClients.find(c => c.id === clientId);
  const projects = clientProjects[clientId as keyof typeof clientProjects] || [];
  
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
  
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewContent>
            <ClientInfoCard>
              <ClientInfoHeader>
                <h3>Client Information</h3>
                <EditButton>
                  {renderIcon(FiEdit)} Edit
                </EditButton>
              </ClientInfoHeader>
              
              <ClientInfoGrid>
                <InfoItem>
                  <InfoLabel>Industry</InfoLabel>
                  <InfoValue>{client.industry}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Contact Name</InfoLabel>
                  <InfoValue>{client.contactName}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue>
                    {renderIcon(FiMail, { style: { marginRight: '5px' } })}
                    {client.contactEmail}
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Phone</InfoLabel>
                  <InfoValue>
                    {renderIcon(FiPhone, { style: { marginRight: '5px' } })}
                    {client.contactPhone}
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Username</InfoLabel>
                  <InfoValue>{client.username}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Password</InfoLabel>
                  <InfoValue>{client.password}</InfoValue>
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
                      <span>Start: {project.startDate.toLocaleDateString()}</span>
                      <span>Due: {project.dueDate.toLocaleDateString()}</span>
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
                        <span>Start: {project.startDate.toLocaleDateString()}</span>
                        <span>Due: {project.dueDate.toLocaleDateString()}</span>
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
          <ClientLogo>
            {client.name.charAt(0)}
          </ClientLogo>
          <div>
            <ClientName>{client.name}</ClientName>
            <ClientIndustry>{client.industry}</ClientIndustry>
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

export default ClientDashboard;
