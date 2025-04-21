import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EmailMarketingPage from '../components/EmailMarketingPage';
import { getClientById } from '../utils/clientService';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Styled components
const PageContainer = styled.div`
  width: 100%;
  max-width: 100vw;
  position: relative;
  background: black;
  overflow: hidden;
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  position: relative;
  z-index: 1;
  max-width: 100%;
  padding-top: 120px; /* Increased padding to ensure content is well below the header */
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh;
  color: white;
  font-size: 18px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 70vh;
  color: white;
  text-align: center;
  padding: 0 20px;

  h2 {
    font-size: 28px;
    margin-bottom: 20px;
    background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    font-size: 18px;
    max-width: 600px;
    margin-bottom: 30px;
  }

  button {
    background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
    color: white;
    font-size: 16px;
    font-weight: 600;
    padding: 12px 24px;
    border: none;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(31, 83, 255, 0.3);
    }
  }
`;

const EmailMarketingHub: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clientId = searchParams.get('clientId');

  useEffect(() => {
    const loadClient = async () => {
      if (!clientId) {
        setError('No client ID provided');
        setLoading(false);
        return;
      }

      try {
        const clientData = await getClientById(clientId);
        if (!clientData) {
          setError('Client not found');
        } else {
          setClient(clientData);
        }
      } catch (err) {
        console.error('Error loading client:', err);
        setError('Failed to load client information');
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [clientId]);

  const handleGoBack = () => {
    navigate(`/client-portal/${clientId}`);
  };

  return (
    <PageContainer>
      <Header />
      <ContentContainer>
        {loading ? (
          <LoadingContainer>Loading...</LoadingContainer>
        ) : error ? (
          <ErrorContainer>
            <h2>Error Loading Marketing Hub</h2>
            <p>{error}</p>
            <button onClick={handleGoBack}>Return to Dashboard</button>
          </ErrorContainer>
        ) : (
          <EmailMarketingPage 
            clientId={clientId || ''} 
            clientName={client?.name || 'Your Business'} 
            clientIndustry={client?.industry || 'Marketing'} 
          />
        )}
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
};

export default EmailMarketingHub;
