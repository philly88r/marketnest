import React from 'react';
import styled from 'styled-components';
import { FiCoffee, FiMail } from 'react-icons/fi';
import EmailMarketingPage from '../components/EmailMarketingPage';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClientById } from '../utils/clientService';

const LibertyBeansEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [clientName, setClientName] = useState('Liberty Beans Coffee');
  const [clientIndustry, setClientIndustry] = useState('specialty coffee roaster');
  
  // Get the clientId from URL query parameters
  const clientId = searchParams.get('clientId') || 'client-liberty-beans';
  
  useEffect(() => {
    // Validate that this is Liberty Beans or redirect
    if (clientId !== 'client-liberty-beans') {
      // For now, we only support Liberty Beans for email marketing
      // You can expand this later to support other clients
      navigate('/client-portal/' + clientId);
      return;
    }
    
    // Fetch client details if needed
    const loadClientDetails = async () => {
      try {
        const client = await getClientById(clientId);
        if (client) {
          setClientName(client.name);
          setClientIndustry(client.industry || 'specialty coffee roaster');
        }
      } catch (error) {
        console.error('Error loading client details:', error);
      }
    };
    
    loadClientDetails();
  }, [clientId, navigate]);

  return (
    <Container>
      <Header>
        <LogoContainer>
          <FiCoffee size={32} />
          <ClientName>{clientName}</ClientName>
        </LogoContainer>
        <HeaderInfo>
          <HeaderTitle>
            <FiMail size={18} style={{ marginRight: '8px' }} />
            Email Marketing Hub
          </HeaderTitle>
          <HeaderSubtitle>Create engaging weekly newsletters with AI</HeaderSubtitle>
        </HeaderInfo>
      </Header>

      <EmailMarketingPage 
        clientId={clientId}
        clientName={clientName}
        clientIndustry={clientIndustry}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #0f0f0f;
  border-bottom: 1px solid #333;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #0df9b6;
`;

const ClientName = styled.h1`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const HeaderSubtitle = styled.div`
  font-size: 14px;
  color: #999;
`;

export default LibertyBeansEmailPage;
