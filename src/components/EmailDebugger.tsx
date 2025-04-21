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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check auth status
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setAuthStatus(`Authenticated as ${session.user.email || 'unknown'}`);
        } else {
          setAuthStatus('Not authenticated');
        }

        // Try to get templates through the service
        const templates = await getEmailTemplatesByClientId(clientId);
        setTemplateCount(templates.length);

        // Try direct query to compare
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .eq('client_id', clientId);
        
        if (error) {
          throw error;
        }
        
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
      <p><strong>Auth Status:</strong> {authStatus}</p>
      <p><strong>Templates via Service:</strong> {templateCount !== null ? templateCount : 'Loading...'}</p>
      <p><strong>Templates via Direct Query:</strong> {directQueryCount !== null ? directQueryCount : 'Loading...'}</p>
      {error && <ErrorMessage>Error: {error}</ErrorMessage>}
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
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 10px;
  white-space: pre-wrap;
  word-break: break-word;
`;

export default EmailDebugger;
