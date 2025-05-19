import React from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #000;
  position: relative;
`;

const ContactPage: React.FC = () => {
  return (
    <PageContainer>
      <Header />
      <ContactSection />
      <Footer />
    </PageContainer>
  );
};

export default ContactPage;
