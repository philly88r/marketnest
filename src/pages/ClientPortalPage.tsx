import React from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ClientDashboard from '../components/ClientDashboard';

const ClientPortalPage = () => {
  // TODO: Replace with real client ID from auth/session or route params
  const clientId = 'client-001';
  return (
    <>
      <Header />
      <PortalContainer>
        <h1>Client Portal</h1>
        <ClientDashboard clientId={clientId} onBack={() => {}} />
      </PortalContainer>
      <Footer />
    </>
  );
};

const PortalContainer = styled.div`
  max-width: 1200px;
  margin: 80px auto;
  padding: 0 20px;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default ClientPortalPage;
