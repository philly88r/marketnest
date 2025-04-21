import React from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ClientDashboard from '../components/ClientDashboard';
import { useParams, Navigate } from 'react-router-dom';

const ClientPortalPage = () => {
  // Remove type argument to fix lint: Untyped function calls may not accept type arguments.
  const { clientId } = useParams();
  if (!clientId) {
    // If no clientId is present, redirect to client login
    return <Navigate to="/client-login" replace />;
  }
  return (
    <>
      <Header />
      <PortalContainer>
        <h1>Client Portal</h1>
        {/* Checklist for client-004 removed from here to avoid duplicate rendering */}
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
