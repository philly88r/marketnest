import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiCircle } from 'react-icons/fi';
import { getProjectsByClientId, Project as SupabaseProject } from '../utils/projectService';

interface ProjectDashboardProps {
  clientId?: string;
  projectId?: string;
}

// Define local type to extend SupabaseProject with startDate/dueDate for UI
type ProjectWithDates = SupabaseProject & {
  startDate: Date | null;
  dueDate: Date | null;
};

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ clientId, projectId }) => {
  const [projects, setProjects] = useState<ProjectWithDates[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<string | null>(projectId || null);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'planning' | 'completed'>('all');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const allProjects = await getProjectsByClientId(clientId);
        // Convert string dates to Date objects for UI
        const projectsWithDates: ProjectWithDates[] = allProjects.map(p => ({
          ...p,
          startDate: p.start_date ? new Date(p.start_date) : null,
          dueDate: p.due_date ? new Date(p.due_date) : null,
        }));
        if (projectId) {
          const filtered = projectsWithDates.filter(p => p.id === projectId);
          setProjects(filtered);
        } else {
          setProjects(projectsWithDates);
        }
      } catch (err: any) {
        setError('Failed to load projects from Supabase.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [clientId, projectId]);

  const filteredProjects = projects.filter(project =>
    filter === 'all' || project.status === filter
  );

  const selectedProject = activeProject
    ? projects.find(p => p.id === activeProject)
    : null;

  const overallProgress = projects.length > 0
    ? Math.round(projects.reduce((sum, project) => sum + (project.progress || 0), 0) / projects.length)
    : 0;

  // Safely compute next deadline
  const nextDeadline = (() => {
    const dueDates = projects.map(project => project.dueDate).filter(Boolean) as Date[];
    if (dueDates.length === 0) return null;
    return new Date(Math.min(...dueDates.map(d => d.getTime())));
  })();

  return (
    <DashboardContainer>
      <DashboardHeader>
        <h2>Project Dashboard</h2>
        <FilterContainer>
          <FilterButton $active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterButton>
          <FilterButton $active={filter === 'in-progress'} onClick={() => setFilter('in-progress')}>In Progress</FilterButton>
          <FilterButton $active={filter === 'planning'} onClick={() => setFilter('planning')}>Planning</FilterButton>
          <FilterButton $active={filter === 'completed'} onClick={() => setFilter('completed')}>Completed</FilterButton>
        </FilterContainer>
      </DashboardHeader>
      <OverviewSection>
        <MetricCard>
          <MetricTitle>Projects</MetricTitle>
          <MetricValue>{projects.length}</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricTitle>Overall Progress</MetricTitle>
          <MetricValue>{overallProgress}%</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricTitle>Next Deadline</MetricTitle>
          <MetricValue>
            {nextDeadline ? nextDeadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
          </MetricValue>
        </MetricCard>
      </OverviewSection>
      <ProjectsSection>
        {filteredProjects.map(project => (
          <ProjectCard
            key={project.id}
            as={motion.div}
            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
            onClick={() => setActiveProject(project.id)}
            $active={project.id === activeProject}
          >
            <ProjectHeader>
              <ProjectTitle>{project.name}</ProjectTitle>
              <StatusBadge $status={project.status}>
                {project.status === 'in-progress' ? 'In Progress' :
                  project.status === 'planning' ? 'Planning' : 'Completed'}
              </StatusBadge>
            </ProjectHeader>
            <ProjectProgress $progress={project.progress || 0} />
            <ProjectDates>
              <span>Start: {project.startDate ? project.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
              <span>Due: {project.dueDate ? project.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
            </ProjectDates>
            {project.id === activeProject && (
              <TasksList as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <TasksHeader>
                  <h4>Tasks</h4>
                </TasksHeader>
                {project.tasks && project.tasks.length > 0 ? project.tasks.map(task => (
                  <TaskItem key={task.id}>
                    <TaskStatus $status={task.status}>
                      {task.status === 'completed' ? <span>{FiCheckCircle({ size: 16 })}</span> :
                        task.status === 'in-progress' ? <span>{FiClock({ size: 16 })}</span> : <span>{FiCircle({ size: 16 })}</span>}
                    </TaskStatus>
                    <TaskName>{task.name}</TaskName>
                    <TaskAssignee>{task.assignee}</TaskAssignee>
                  </TaskItem>
                )) : <TaskItem>No tasks for this project.</TaskItem>}
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
  background: ${props => props.$active ? 'rgba(13, 249, 182, 0.1)' : 'transparent'};
  border: none;
  padding: 8px 12px;
  color: ${props => props.$active ? '#0df9b6' : 'rgba(255, 255, 255, 0.7)'};
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
