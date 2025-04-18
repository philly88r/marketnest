import React, { useState } from 'react';
import styled from 'styled-components';
import { testDatabaseConnection, testTableRead, testTableWrite } from '../utils/databaseTest';

const TestPanelContainer = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TestHeader = styled.h2`
  color: #333;
  margin-bottom: 20px;
`;

const TestButton = styled.button`
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  margin-right: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: #3a5ce5;
  }
  
  &:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
  }
`;

const ResultContainer = styled.div`
  margin-top: 20px;
  background-color: white;
  border-radius: 4px;
  padding: 15px;
  border: 1px solid #e0e0e0;
`;

const ResultTitle = styled.h3`
  margin-bottom: 10px;
  color: #333;
`;

const ResultStatus = styled.div<{ success: boolean }>`
  padding: 8px 12px;
  border-radius: 4px;
  background-color: ${props => props.success ? '#e7f7e7' : '#ffebee'};
  color: ${props => props.success ? '#2e7d32' : '#c62828'};
  font-weight: 500;
  margin-bottom: 10px;
  display: inline-block;
`;

const ResultDetails = styled.pre`
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
`;

interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  details?: any;
}

const DatabaseTestPanel: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const runConnectionTest = async () => {
    setIsLoading(true);
    const result = await testDatabaseConnection();
    setResults([{
      testName: 'Database Connection',
      ...result
    }, ...results]);
    setIsLoading(false);
  };
  
  const runTableReadTest = async (tableName: string) => {
    setIsLoading(true);
    const result = await testTableRead(tableName);
    setResults([{
      testName: `Read from ${tableName}`,
      ...result
    }, ...results]);
    setIsLoading(false);
  };
  
  const runTableWriteTest = async (tableName: string) => {
    setIsLoading(true);
    const result = await testTableWrite(tableName);
    setResults([{
      testName: `Write to ${tableName}`,
      ...result
    }, ...results]);
    setIsLoading(false);
  };
  
  const clearResults = () => {
    setResults([]);
  };
  
  return (
    <TestPanelContainer>
      <TestHeader>Database Connection Tests</TestHeader>
      
      <div>
        <TestButton onClick={runConnectionTest} disabled={isLoading}>
          Test Database Connection
        </TestButton>
        
        <TestButton onClick={() => runTableReadTest('clients')} disabled={isLoading}>
          Test Read Clients
        </TestButton>
        
        <TestButton onClick={() => runTableReadTest('client_projects')} disabled={isLoading}>
          Test Read Projects
        </TestButton>
        
        <TestButton onClick={() => runTableReadTest('client_project_tasks')} disabled={isLoading}>
          Test Read Tasks
        </TestButton>
        
        <TestButton onClick={() => runTableReadTest('client_checklist_items')} disabled={isLoading}>
          Test Read Checklists
        </TestButton>
        
        <TestButton onClick={() => runTableWriteTest('client_projects')} disabled={isLoading}>
          Test Write Projects
        </TestButton>
        
        <TestButton onClick={clearResults} disabled={isLoading}>
          Clear Results
        </TestButton>
      </div>
      
      {results.length > 0 && (
        <div>
          {results.map((result, index) => (
            <ResultContainer key={index}>
              <ResultTitle>{result.testName}</ResultTitle>
              <ResultStatus success={result.success}>
                {result.success ? 'SUCCESS' : 'FAILED'}
              </ResultStatus>
              <div>{result.message}</div>
              {result.details && (
                <ResultDetails>
                  {JSON.stringify(result.details, null, 2)}
                </ResultDetails>
              )}
            </ResultContainer>
          ))}
        </div>
      )}
    </TestPanelContainer>
  );
};

export default DatabaseTestPanel;
