import React from 'react';
import styled from 'styled-components';
import { FiCoffee, FiMail } from 'react-icons/fi';
import EmailMarketingPage from '../components/EmailMarketingPage';

const LibertyBeansEmailPage: React.FC = () => {
  return (
    <Container>
      <Header>
        <LogoContainer>
          <FiCoffee size={32} />
          <ClientName>Liberty Beans Coffee</ClientName>
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
        clientId="client-liberty-beans"
        clientName="Liberty Beans Coffee"
        clientIndustry="specialty coffee roaster"
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
