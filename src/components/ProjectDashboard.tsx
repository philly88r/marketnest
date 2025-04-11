import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiCircle } from 'react-icons/fi';

// Mock project data - in a real app, this would come from your backend
const mockProjects = [
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
      { id: 'task-006', name: 'On-page Optimization', status: 'in-progress', assignee: 'Jordan' },
      { id: 'task-007', name: 'Content Strategy', status: 'in-progress', assignee: 'Riley' },
      { id: 'task-008', name: 'Backlink Building', status: 'not-started', assignee: 'Alex' }
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
      { id: 'task-010', name: 'Content Calendar', status: 'not-started', assignee: 'Casey' },
      { id: 'task-011', name: 'Creative Assets', status: 'not-started', assignee: 'Jamie' },
      { id: 'task-012', name: 'Campaign Setup', status: 'not-started', assignee: 'Jordan' }
    ]
  }
];

interface ProjectDashboardProps {
  clientId?: string;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ clientId }) => {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'planning' | 'completed'>('all');
  
  // Filter projects based on status
  const filteredProjects = mockProjects.filter(project => 
    filter === 'all' || project.status === filter
  );
  
  // Get the currently selected project
  const selectedProject = mockProjects.find(p => p.id === activeProject);
  
  // Calculate overall progress across all projects
  const overallProgress = Math.round(
    mockProjects.reduce((sum, project) => sum + project.progress, 0) / mockProjects.length
  );
  
  return (
    <DashboardContainer>
      <DashboardHeader>
        <h2>Project Dashboard</h2>
        <FilterContainer>
          <FilterButton 
            $active={filter === 'all'} 
            onClick={() => setFilter('all')}
          >
            All
          </FilterButton>
          <FilterButton 
            $active={filter === 'in-progress'} 
            onClick={() => setFilter('in-progress')}
          >
            In Progress
          </FilterButton>
          <FilterButton 
            $active={filter === 'planning'} 
            onClick={() => setFilter('planning')}
          >
            Planning
          </FilterButton>
          <FilterButton 
            $active={filter === 'completed'} 
            onClick={() => setFilter('completed')}
          >
            Completed
          </FilterButton>
        </FilterContainer>
      </DashboardHeader>
      
      <OverviewSection>
        <MetricCard>
          <MetricTitle>Projects</MetricTitle>
          <MetricValue>{mockProjects.length}</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricTitle>Overall Progress</MetricTitle>
          <ProgressContainer>
            <ProgressBar $progress={overallProgress} />
            <ProgressLabel>{overallProgress}%</ProgressLabel>
          </ProgressContainer>
        </MetricCard>
        <MetricCard>
          <MetricTitle>Next Deadline</MetricTitle>
          <MetricValue>
            {new Date(Math.min(...mockProjects.map(p => p.dueDate.getTime())))
              .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </MetricValue>
        </MetricCard>
      </OverviewSection>
      
      <ProjectsSection>
        {filteredProjects.map(project => (
          <ProjectCard 
            key={project.id}
            as={motion.div}
            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
            onClick={() => setActiveProject(project.id === activeProject ? null : project.id)}
            $active={project.id === activeProject}
          >
            <ProjectHeader>
              <ProjectTitle>{project.name}</ProjectTitle>
              <StatusBadge $status={project.status}>
                {project.status === 'in-progress' ? 'In Progress' : 
                 project.status === 'planning' ? 'Planning' : 'Completed'}
              </StatusBadge>
            </ProjectHeader>
            
            <ProjectProgress $progress={project.progress}>
              <ProgressLabel>{project.progress}%</ProgressLabel>
            </ProjectProgress>
            
            <ProjectDates>
              <span>Start: {project.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span>Due: {project.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </ProjectDates>
            
            {project.id === activeProject && (
              <TasksList
                as={motion.div}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <TasksHeader>
                  <h4>Tasks</h4>
                </TasksHeader>
                {project.tasks.map(task => (
                  <TaskItem key={task.id}>
                    <TaskStatus $status={task.status}>
                      {task.status === 'completed' ? <span>{FiCheckCircle({ size: 16 })}</span> : 
                       task.status === 'in-progress' ? <span>{FiClock({ size: 16 })}</span> : <span>{FiCircle({ size: 16 })}</span>}
                    </TaskStatus>
                    <TaskName>{task.name}</TaskName>
                    <TaskAssignee>{task.assignee}</TaskAssignee>
                  </TaskItem>
                ))}
              </TasksList>
            )}
          </ProjectCard>
        ))}
      </ProjectsSection>
    </DashboardContainer>
  );
};

// Styled Components
const DashboardContainer = styled.div`
  background: #1a1a2e;
  border-radius: 12px;
  padding: 24px;
  color: #fff;
  margin-bottom: 24px;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h2 {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    background: linear-gradient(90deg, #0df9b6, #0db8f9);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    
    h2 {
      margin-bottom: 16px;
    }
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 768px) {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 8px;
  }
`;

const FilterButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? 'rgba(13, 249, 182, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: none;
  border-radius: 20px;
  color: ${props => props.$active ? '#0df9b6' : '#fff'};
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(13, 249, 182, 0.15);
  }
`;

const OverviewSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
`;

const MetricTitle = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 600;
`;

const ProgressContainer = styled.div`
  position: relative;
  height: 24px;
  margin-top: 8px;
`;

const ProgressBar = styled.div<{ $progress: number }>`
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.$progress}%;
    background: linear-gradient(90deg, #0df9b6, #0db8f9);
    border-radius: 4px;
  }
`;

const ProjectProgress = styled.div<{ $progress: number }>`
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  position: relative;
  overflow: hidden;
  margin: 8px 0;
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.$progress}%;
    background: linear-gradient(90deg, #0df9b6, #0db8f9);
    border-radius: 3px;
  }
`;

const ProgressLabel = styled.div`
  position: absolute;
  top: 12px;
  right: 0;
  font-size: 14px;
  font-weight: 500;
`;

const ProjectsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const ProjectCard = styled.div<{ $active: boolean }>`
  background: ${props => props.$active ? 'rgba(13, 249, 182, 0.05)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$active ? 'rgba(13, 249, 182, 0.2)' : 'transparent'};
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ProjectTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
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

const ProjectDates = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 16px;
`;

const TasksList = styled.div`
  margin-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
`;

const TasksHeader = styled.div`
  margin-bottom: 12px;
  
  h4 {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
  }
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
`;

const TaskStatus = styled.div<{ $status: string }>`
  color: ${props => {
    if (props.$status === 'completed') return '#34c759';
    if (props.$status === 'in-progress') return '#007aff';
    return 'rgba(255, 255, 255, 0.5)';
  }};
  margin-right: 12px;
`;

const TaskName = styled.div`
  flex: 1;
  font-size: 14px;
`;

const TaskAssignee = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
`;

export default ProjectDashboard;
