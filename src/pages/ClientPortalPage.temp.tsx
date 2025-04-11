import React from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ClientPortalPage = () => {
  return (
    <>
      <Header />
      <PortalContainer>
        <h1>Client Portal</h1>
        <p>We are currently updating the client portal. Please check back soon.</p>
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
