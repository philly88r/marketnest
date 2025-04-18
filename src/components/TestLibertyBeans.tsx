import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../utils/supabaseClient';
import ClientDashboard from './ClientDashboard';

const TestLibertyBeans: React.FC = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [clientData, setClientData] = useState<any>(null);
  const [projectsData, setProjectsData] = useState<any[]>([]);

  // Fetch client data directly
  const fetchClientData = async () => {
    setIsLoading(true);
    setTestResult('Fetching Liberty Beans Coffee client data...');
    
    try {
      console.log('Fetching client with ID: client-liberty-beans');
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', 'client-liberty-beans');
      
      if (error) {
        console.error('Error fetching client:', error);
        setTestResult(`Error fetching client: ${error.message}`);
        return;
      }
      
      if (data && data.length > 0) {
        console.log('Client data found:', data[0]);
        setClientData(data[0]);
        setTestResult(`Success! Found Liberty Beans Coffee client: ${data[0].name}`);
      } else {
        console.log('No client found with ID: client-liberty-beans');
        setTestResult('No client found with ID: client-liberty-beans');
      }
    } catch (err: any) {
      console.error('Unexpected error fetching client:', err);
      setTestResult(`Unexpected error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test client projects
  const testClientProjects = async () => {
    setIsLoading(true);
    setTestResult('Testing connection to client_projects table...');
    
    try {
      console.log('Querying client_projects for client-liberty-beans');
      const { data, error } = await supabase
        .from('client_projects')
        .select('*')
        .eq('client_id', 'client-liberty-beans');
      
      if (error) {
        console.error('Error querying client_projects:', error);
        setTestResult(`Error querying client_projects: ${error.message}`);
        return;
      }
      
      if (data && data.length > 0) {
        console.log('Projects found:', data);
        setProjectsData(data);
        setTestResult(`Success! Found ${data.length} projects for Liberty Beans Coffee.`);
      } else {
        console.log('No projects found for Liberty Beans Coffee');
        setTestResult('No projects found for Liberty Beans Coffee. Creating a test project...');
        
        // Create a test project
        const newProject = {
          client_id: 'client-liberty-beans',
          name: 'Test Project',
          description: 'This is a test project for Liberty Beans Coffee',
          status: 'in-progress',
          progress: 50,
          start_date: new Date().toISOString(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        console.log('Creating test project:', newProject);
        const { data: createdProject, error: createError } = await supabase
          .from('client_projects')
          .insert([newProject])
          .select();
        
        if (createError) {
          console.error('Error creating test project:', createError);
          setTestResult(`Error creating test project: ${createError.message}`);
        } else if (createdProject && createdProject.length > 0) {
          console.log('Created project:', createdProject[0]);
          setProjectsData([createdProject[0]]);
          setTestResult(`Created test project with ID: ${createdProject[0].id}`);
        }
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setTestResult(`Unexpected error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <h2>Liberty Beans Coffee Test</h2>
      
      <ButtonsContainer>
        <TestButton onClick={fetchClientData} disabled={isLoading}>
          {isLoading ? 'Fetching...' : 'Fetch Client Data'}
        </TestButton>
        
        <TestButton onClick={testClientProjects} disabled={isLoading}>
          {isLoading ? 'Testing...' : 'Test Projects Connection'}
        </TestButton>
        
        <TestButton 
          onClick={() => setShowDashboard(!showDashboard)}
          style={{ 
            background: 'rgba(255, 0, 0, 0.25)', 
            padding: '15px 25px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {showDashboard ? 'HIDE DASHBOARD' : 'SHOW LIBERTY BEANS DASHBOARD'}
        </TestButton>
      </ButtonsContainer>
      
      {testResult && (
        <ResultBox>
          <h3>Test Result:</h3>
          <p>{testResult}</p>
        </ResultBox>
      )}
      
      {clientData && (
        <ResultBox>
          <h3>Client Data:</h3>
          <pre>{JSON.stringify(clientData, null, 2)}</pre>
        </ResultBox>
      )}
      
      {projectsData.length > 0 && (
        <ResultBox>
          <h3>Projects Data:</h3>
          <pre>{JSON.stringify(projectsData, null, 2)}</pre>
        </ResultBox>
      )}
      
      {showDashboard && (
        <DashboardContainer>
          <h3 style={{ color: 'white', marginBottom: '20px' }}>Liberty Beans Dashboard:</h3>
          <ClientDashboard 
            clientId="client-liberty-beans" 
            onBack={() => setShowDashboard(false)} 
          />
        </DashboardContainer>
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: 30px;
  color: white;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
`;

const TestButton = styled.button`
  padding: 12px 20px;
  background: rgba(31, 83, 255, 0.25);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 10px;
  margin-bottom: 10px;
  min-width: 180px;
  
  &:hover {
    background: rgba(31, 83, 255, 0.35);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultBox = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  
  h3 {
    margin-top: 0;
    margin-bottom: 10px;
  }
  
  p, pre {
    margin: 0;
    color: rgba(255, 255, 255, 0.8);
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
`;

const DashboardContainer = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 30px;
`;

export default TestLibertyBeans;
