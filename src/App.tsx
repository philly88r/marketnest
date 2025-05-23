import React from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import theme from './theme/theme';
import GlobalStyles from './theme/GlobalStyles';
import Header from './components/Header';
import Hero from './components/Hero';
import StatsSection from './components/StatsSection';
import DecisionAgency from './components/DecisionAgency';
import Clients from './components/Clients';
import AnalyticsSection from './components/AnalyticsSection';
// Pricing section removed
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import AboutPage from './pages/AboutPage';
import SEOServicesPage from './pages/SEOServicesPage';
import PPCAdvertisingPage from './pages/PPCAdvertisingPage';
import SocialMediaMarketingPage from './pages/SocialMediaMarketingPage';
import ContentMarketingPage from './pages/ContentMarketingPage';
import EmailMarketingPage from './pages/EmailMarketingPage';
import EmailMarketingHub from './pages/EmailMarketingHub';
import WebDesignPage from './pages/WebDesignPage';
import AnalyticsReportingPage from './pages/AnalyticsReportingPage';
import CROPage from './pages/CROPage';
import CaseStudiesPage from './pages/CaseStudiesPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import ProjectQuestionnairePage from './pages/ProjectQuestionnairePage';
import BusinessSoftwarePage from './pages/BusinessSoftwarePage';
import AIAgentsPage from './pages/AIAgentsPage';
import ClientPortalPage from './pages/ClientPortalPage';
import ClientLoginPage from './pages/ClientLoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPortalPage from './pages/AdminPortalPage';
import DirectAdminPage from './pages/DirectAdminPage';
import LibertyBeansEmailPage from './pages/LibertyBeansEmailPage';
import LandingPageGeneratorPage from './pages/LandingPageGeneratorPage';
import ContentWritingPage from './pages/ContentWritingPage';
import ImageGenerationPage from './pages/ImageGenerationPage';
import ContactPage from './pages/ContactPage';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;900&family=Plus+Jakarta+Sans:wght@400;500&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html, body {
    width: 100%;
    overflow-x: hidden;
  }
  
  body {
    font-family: 'DM Sans', sans-serif;
    background-color: #000;
    color: white;
    overflow-x: hidden;
    max-width: 100vw;
    margin: 0;
    padding: 0;
  }

  img {
    max-width: 100%;
    height: auto;
  }
`;

const GradientCircle = styled(motion.div)<{ left: string; top: string; variant?: 'primary' | 'secondary' | 'tertiary' }>`
  width: 718px;
  height: 718px;
  position: absolute;
  background: ${props => 
    props.variant === 'secondary' ? 
      'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255, 67, 163, 0.17) 0%, rgba(255, 67, 163, 0) 100%)' :
    props.variant === 'tertiary' ? 
      'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(222, 104, 29, 0.17) 0%, rgba(222, 104, 29, 0) 100%)' :
      'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(31, 83, 255, 0.17) 0%, rgba(31, 83, 255, 0) 100%)'};
  border-radius: 9999px;
  left: ${props => props.left};
  top: ${props => props.top};
  z-index: 0;
  
  @media (max-width: 1200px) {
    width: 500px;
    height: 500px;
  }
  
  @media (max-width: 768px) {
    width: 300px;
    height: 300px;
  }
`;

const AppContainer = styled.div`
  width: 100vw;
  max-width: 100vw;
  position: relative;
  background: black;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
`;

const ContentContainer = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
`;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppContainer>
          <GlobalStyle />
          <GlobalStyles />
        
        {/* Background gradient circles */}
        <GradientCircle left="-205px" top="196px" variant="primary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
        <GradientCircle left="60%" top="439px" variant="secondary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} />
        <GradientCircle left="70%" top="1388px" variant="tertiary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }} />
        <GradientCircle left="60%" top="2064px" variant="primary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }} />
        <GradientCircle left="-106px" top="2601px" variant="secondary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} />
        <GradientCircle left="60%" top="3039px" variant="tertiary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }} />
        
        <Routes>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services/seo" element={<SEOServicesPage />} />
          <Route path="/services/ppc" element={<PPCAdvertisingPage />} />
          <Route path="/services/social-media" element={<SocialMediaMarketingPage />} />
          <Route path="/services/content-marketing" element={<ContentMarketingPage />} />
          <Route path="/services/email-marketing" element={<EmailMarketingPage />} />
          <Route path="/services/web-design" element={<WebDesignPage />} />
          <Route path="/services/analytics-reporting" element={<AnalyticsReportingPage />} />
          <Route path="/services/conversion-optimization" element={<CROPage />} />
          <Route path="/business-software" element={<BusinessSoftwarePage />} />
          <Route path="/business-software/ai-agents" element={<AIAgentsPage />} />
          <Route path="/case-studies" element={<CaseStudiesPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/client-login" element={<ClientLoginPage />} />
          <Route path="/client-portal/:clientId" element={<ClientPortalPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/admin-portal" element={<AdminPortalPage />} />
          <Route path="/admin" element={<DirectAdminPage />} />
          <Route path="/clients/liberty-beans/email" element={<LibertyBeansEmailPage />} />
          <Route path="/email-marketing" element={<EmailMarketingHub />} />
          <Route path="/services/content-writing" element={<ContentWritingPage />} />
          <Route path="/image-generation" element={<ImageGenerationPage />} />
          <Route path="/project-questionnaire" element={<ProjectQuestionnairePage />} />
          {/* Restrict landing page generator to admin access only */}
          <Route path="/landing-page-generator" element={<Navigate to="/admin-portal" replace />} />
          <Route path="/admin/landing-page-generator" element={<LandingPageGeneratorPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/" element={
            <ContentContainer>
              <div id="home">
                <Header />
                <Hero />
              </div>
              <div id="about">
                <StatsSection />
              </div>
              <div id="services">
                <DecisionAgency />
              </div>
              <div id="features">
                <Clients />
              </div>
              <div id="analytics">
                <AnalyticsSection />
              </div>
              {/* Pricing section removed */}
              <div id="contact">
                <ContactSection />
              </div>
              <Footer />
            </ContentContainer>
          } />
        </Routes>
      </AppContainer>
    </Router>
    </ThemeProvider>
  );
}

export default App;
