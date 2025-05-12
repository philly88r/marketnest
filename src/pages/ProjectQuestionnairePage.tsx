import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProjectQuestionnaire from '../components/ProjectQuestionnaire';

const PageContainer = styled.div`
  background-color: #000;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 120px 20px 80px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 100px 20px 60px;
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

const ProjectQuestionnairePage: React.FC = () => {
  return (
    <PageContainer>
      <Header />
      
      {/* Background gradient circles */}
      <GradientCircle 
        left="-205px" 
        top="196px" 
        variant="primary" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1 }} 
      />
      <GradientCircle 
        left="60%" 
        top="439px" 
        variant="secondary" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1, delay: 0.2 }} 
      />
      <GradientCircle 
        left="70%" 
        top="1388px" 
        variant="tertiary" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1, delay: 0.4 }} 
      />
      
      <ContentContainer>
        <ProjectQuestionnaire />
      </ContentContainer>
      
      <Footer />
    </PageContainer>
  );
};

export default ProjectQuestionnairePage;
