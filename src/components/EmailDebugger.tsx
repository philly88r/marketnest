import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../utils/supabaseClient';
import { getEmailTemplatesByClientId } from '../utils/emailService';

interface EmailDebuggerProps {
  clientId: string;
}

const EmailDebugger: React.FC<EmailDebuggerProps> = ({ clientId }) => {
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const [templateCount, setTemplateCount] = useState<number | null>(null);
  const [directQueryCount, setDirectQueryCount] = useState<number | null>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [databaseStatus, setDatabaseStatus] = useState<string>('Checking...');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check database connection
        try {
          const { data, error } = await supabase.from('clients').select('count').limit(1);
          if (error) {
            setDatabaseStatus(`Database error: ${error.message}`);
          } else {
            setDatabaseStatus('Database connection OK');
          }
        } catch (dbErr) {
          setDatabaseStatus(`Database connection failed: ${String(dbErr)}`);
        }

        // Check auth status
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setAuthStatus(`Authenticated as ${session.user.email || 'unknown'} (${session.user.id})`);
        } else {
          setAuthStatus('Not authenticated - this will prevent email templates from loading');
        }

        // Get client info
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();
        
        if (clientError) {
          console.error('Error fetching client:', clientError);
          setClientInfo(`Error: ${clientError.message}`);
        } else {
          setClientInfo(client);
        }

        // Try to get templates through the service
        console.log('Fetching templates via service for client:', clientId);
        const templates = await getEmailTemplatesByClientId(clientId);
        console.log('Templates fetched via service:', templates);
        setTemplateCount(templates.length);

        // Try direct query to compare
        console.log('Performing direct query for templates with client_id:', clientId);
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .eq('client_id', clientId);
        
        if (error) {
          console.error('Direct query error:', error);
          throw error;
        }
        
        console.log('Templates fetched via direct query:', data);
        setDirectQueryCount(data?.length || 0);
      } catch (err) {
        console.error('Debug error:', err);
        setError(String(err));
      }
    };

    checkAuth();
  }, [clientId]);

  return (
    <DebugContainer>
      <h3>Email Template Debugger</h3>
      <p><strong>Client ID:</strong> {clientId}</p>
      <p><strong>Database Status:</strong> {databaseStatus}</p>
      <p><strong>Auth Status:</strong> {authStatus}</p>
      <p><strong>Templates via Service:</strong> {templateCount !== null ? templateCount : 'Loading...'}</p>
      <p><strong>Templates via Direct Query:</strong> {directQueryCount !== null ? directQueryCount : 'Loading...'}</p>
      
      {clientInfo && (
        <div>
          <h4>Client Info:</h4>
          <pre>{JSON.stringify(clientInfo, null, 2)}</pre>
        </div>
      )}
      
      {error && <ErrorMessage>Error: {error}</ErrorMessage>}
      
      <h4>Troubleshooting Steps:</h4>
      <ol>
        <li>If "Not authenticated" appears above, you need to log in first</li>
        <li>If direct query shows templates but service doesn't, check the client_id being passed</li>
        <li>If no templates appear in either query, check if templates exist in the database</li>
        <li>If client info is missing, verify the client exists in the database</li>
      </ol>
    </DebugContainer>
  );
};

const DebugContainer = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 15px;
  margin: 15px 0;
  font-family: monospace;
  max-height: 500px;
  overflow-y: auto;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 10px;
  white-space: pre-wrap;
  word-break: break-word;
`;

export default EmailDebugger;
