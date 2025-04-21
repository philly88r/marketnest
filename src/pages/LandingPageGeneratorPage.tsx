import React from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LandingPageGenerator from '../components/LandingPageGenerator';

const LandingPageGeneratorPage: React.FC = () => {
  return (
    <PageContainer>
      <Header />
      <PageContent>
        <PageHeader>
          <PageTitle>AI Landing Page Generator</PageTitle>
          <PageDescription>
            Create high-converting landing pages in minutes using our AI-powered landing page generator.
            Perfect for marketing campaigns, product launches, and lead generation.
          </PageDescription>
        </PageHeader>
        <LandingPageGenerator />
      </PageContent>
      <Footer />
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const PageContent = styled.main`
  flex: 1;
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const PageHeader = styled.div`
  margin-bottom: 40px;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  color: ${props => props.theme.colors.primary};
`;

const PageDescription = styled.p`
  font-size: 18px;
  color: #666;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
`;

export default LandingPageGeneratorPage;
