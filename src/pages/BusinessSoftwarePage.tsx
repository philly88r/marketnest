import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #000;
  color: white;
`;

const HeroSection = styled.section`
  padding: 180px 200px 100px;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 1200px) {
    padding: 180px 100px 80px;
  }
  
  @media (max-width: 768px) {
    padding: 150px 20px 60px;
  }
`;

const GradientTitle = styled(motion.h1)`
  font-size: 60px;
  font-weight: 700;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    font-size: 40px;
  }
`;

const SubTitle = styled(motion.h2)`
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 40px;
  max-width: 800px;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const ContentSection = styled.section`
  padding: 100px 200px;
  
  @media (max-width: 1200px) {
    padding: 80px 100px;
  }
  
  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

const SectionTitle = styled(motion.h2)`
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const SectionContent = styled(motion.div)`
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 800px;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const SolutionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 60px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SolutionCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 30px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(31, 83, 255, 0.1);
  }
`;

const CardTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 15px;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CardContent = styled.p`
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 20px;
`;

const LearnMoreButton = styled(Link)`
  display: inline-block;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 0.9;
  }
`;

const CTASection = styled.section`
  padding: 80px 200px;
  background: linear-gradient(90deg, rgba(31, 83, 255, 0.1) 0%, rgba(255, 67, 163, 0.1) 100%);
  text-align: center;
  
  @media (max-width: 1200px) {
    padding: 80px 100px;
  }
  
  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

const CTATitle = styled(motion.h2)`
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const CTAContent = styled(motion.p)`
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const CTAButton = styled(motion.button)`
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 5px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 0.9;
  }
`;

const BusinessSoftwarePage: React.FC = () => {
  return (
    <PageContainer>
      <Header />
      
      <HeroSection>
        <GradientTitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Custom Business Software Solutions
        </GradientTitle>
        <SubTitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Transforming your business operations with tailored software solutions designed for your unique needs
        </SubTitle>
      </HeroSection>
      
      <ContentSection>
        <SectionTitle
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Why Custom Business Software?
        </SectionTitle>
        <SectionContent
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          In today's competitive business landscape, off-the-shelf software solutions often fall short of addressing the specific challenges and requirements unique to your business. Our custom business software development services are designed to create tailored solutions that align perfectly with your operational processes, enhance efficiency, and drive growth.
        </SectionContent>
        <SectionContent
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          We combine cutting-edge technologies with industry best practices to deliver robust, scalable, and secure software solutions that empower your business to thrive in the digital age.
        </SectionContent>
        
        <SolutionsGrid>
          <SolutionCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CardTitle>AI Agents & Automation</CardTitle>
            <CardContent>
              Leverage the power of artificial intelligence to automate repetitive tasks, gain valuable insights, and enhance decision-making processes.
            </CardContent>
            <LearnMoreButton to="/business-software/ai-agents">Learn More</LearnMoreButton>
          </SolutionCard>
          
          <SolutionCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CardTitle>Business Process Automation</CardTitle>
            <CardContent>
              Streamline your operations by automating complex business processes, reducing manual intervention, and improving overall efficiency.
            </CardContent>
            <LearnMoreButton to="/business-software/automation">Learn More</LearnMoreButton>
          </SolutionCard>
          
          <SolutionCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <CardTitle>CRM Solutions</CardTitle>
            <CardContent>
              Build stronger customer relationships with customized CRM solutions that help you manage interactions, track sales, and improve customer satisfaction.
            </CardContent>
            <LearnMoreButton to="/business-software/crm-solutions">Learn More</LearnMoreButton>
          </SolutionCard>
          
          <SolutionCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <CardTitle>ERP Solutions</CardTitle>
            <CardContent>
              Integrate your business processes with custom ERP solutions that provide real-time visibility into your operations and facilitate informed decision-making.
            </CardContent>
            <LearnMoreButton to="/business-software/erp-solutions">Learn More</LearnMoreButton>
          </SolutionCard>
          
          <SolutionCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <CardTitle>Database Management</CardTitle>
            <CardContent>
              Efficiently store, organize, and retrieve your business data with custom database solutions designed for optimal performance and security.
            </CardContent>
            <LearnMoreButton to="/business-software/database-management">Learn More</LearnMoreButton>
          </SolutionCard>
          
          <SolutionCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <CardTitle>Custom Web Applications</CardTitle>
            <CardContent>
              Create powerful web applications tailored to your business needs, accessible from anywhere and designed for seamless user experience.
            </CardContent>
            <LearnMoreButton to="/business-software/web-applications">Learn More</LearnMoreButton>
          </SolutionCard>
        </SolutionsGrid>
      </ContentSection>
      
      <CTASection>
        <CTATitle
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Ready to Transform Your Business?
        </CTATitle>
        <CTAContent
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Let's discuss how our custom business software solutions can address your unique challenges and help you achieve your business goals. Our team of experts is ready to guide you through the process and develop a solution that perfectly fits your needs.
        </CTAContent>
        <CTAButton
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Schedule a Consultation
        </CTAButton>
      </CTASection>
      
      <Footer />
    </PageContainer>
  );
};

export default BusinessSoftwarePage;
