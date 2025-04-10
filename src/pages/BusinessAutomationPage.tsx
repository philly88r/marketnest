import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
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

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  margin-top: 60px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 30px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(31, 83, 255, 0.1);
  }
`;

const FeatureTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 15px;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const FeatureContent = styled.p`
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 20px;
`;

const BenefitsSection = styled.section`
  padding: 100px 200px;
  background: linear-gradient(90deg, rgba(31, 83, 255, 0.05) 0%, rgba(255, 67, 163, 0.05) 100%);
  
  @media (max-width: 1200px) {
    padding: 80px 100px;
  }
  
  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

const BenefitsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin-top: 60px;
`;

const BenefitItem = styled(motion.div)`
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const BenefitIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1F53FF 0%, #FF43A3 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  font-size: 30px;
  color: white;
`;

const BenefitTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 15px;
`;

const BenefitDescription = styled.p`
  font-size: 16px;
  line-height: 1.5;
`;

const CaseStudySection = styled.section`
  padding: 100px 200px;
  
  @media (max-width: 1200px) {
    padding: 80px 100px;
  }
  
  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

const CaseStudyCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 40px;
  margin-top: 60px;
`;

const CaseStudyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const CaseStudyTitle = styled.h3`
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CaseStudyCompany = styled.div`
  font-size: 18px;
  font-weight: 500;
`;

const CaseStudyContent = styled.div`
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
`;

const CaseStudyResults = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
`;

const ResultItem = styled.div`
  flex: 1;
  min-width: 200px;
`;

const ResultValue = styled.div`
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 10px;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ResultLabel = styled.div`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
`;

const CTASection = styled.section`
  padding: 80px 200px;
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

const BusinessAutomationPage: React.FC = () => {
  return (
    <PageContainer>
      <Header />
      
      <HeroSection>
        <GradientTitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Business Process Automation
        </GradientTitle>
        <SubTitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Streamline operations, reduce costs, and improve efficiency with custom automation solutions tailored to your business needs
        </SubTitle>
      </HeroSection>
      
      <ContentSection>
        <SectionTitle
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Transform Your Business Operations
        </SectionTitle>
        <SectionContent
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Business Process Automation (BPA) is revolutionizing how organizations operate by streamlining workflows, reducing manual tasks, and improving overall efficiency. Our custom automation solutions are designed to address your specific operational challenges and help you achieve your business goals.
        </SectionContent>
        <SectionContent
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          From simple task automation to complex cross-departmental workflows, we develop scalable solutions that grow with your business and adapt to changing requirements, ensuring long-term value and continuous improvement.
        </SectionContent>
        
        <FeaturesGrid>
          <FeatureCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <FeatureTitle>Workflow Automation</FeatureTitle>
            <FeatureContent>
              Automate complex business workflows across departments, eliminating bottlenecks and ensuring consistent process execution. Our solutions handle approvals, notifications, and task assignments automatically.
            </FeatureContent>
          </FeatureCard>
          
          <FeatureCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FeatureTitle>Document Processing</FeatureTitle>
            <FeatureContent>
              Transform your document management with intelligent automation that extracts data from forms, invoices, and contracts, routes documents for approval, and archives them securely.
            </FeatureContent>
          </FeatureCard>
          
          <FeatureCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <FeatureTitle>Data Integration</FeatureTitle>
            <FeatureContent>
              Connect disparate systems and applications to create a unified data flow across your organization. Our integration solutions eliminate data silos and manual data entry, ensuring accuracy and consistency.
            </FeatureContent>
          </FeatureCard>
          
          <FeatureCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <FeatureTitle>Robotic Process Automation (RPA)</FeatureTitle>
            <FeatureContent>
              Deploy software robots to handle repetitive, rule-based tasks with precision and speed. Our RPA solutions work 24/7, reducing errors and freeing your team to focus on higher-value activities.
            </FeatureContent>
          </FeatureCard>
        </FeaturesGrid>
      </ContentSection>
      
      <BenefitsSection>
        <SectionTitle
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Benefits of Business Automation
        </SectionTitle>
        <SectionContent
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Implementing business automation delivers tangible benefits that impact your bottom line and competitive advantage. Our clients typically experience significant improvements across multiple areas of their operations.
        </SectionContent>
        
        <BenefitsContainer>
          <BenefitItem
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <BenefitIcon>↑</BenefitIcon>
            <BenefitTitle>Increased Productivity</BenefitTitle>
            <BenefitDescription>
              Automate repetitive tasks and streamline workflows to accomplish more with the same resources.
            </BenefitDescription>
          </BenefitItem>
          
          <BenefitItem
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <BenefitIcon>↓</BenefitIcon>
            <BenefitTitle>Reduced Costs</BenefitTitle>
            <BenefitDescription>
              Lower operational expenses through efficient resource utilization and reduced manual intervention.
            </BenefitDescription>
          </BenefitItem>
          
          <BenefitItem
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <BenefitIcon>✓</BenefitIcon>
            <BenefitTitle>Improved Accuracy</BenefitTitle>
            <BenefitDescription>
              Minimize human errors and ensure consistent execution of business processes.
            </BenefitDescription>
          </BenefitItem>
          
          <BenefitItem
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <BenefitIcon>⚡</BenefitIcon>
            <BenefitTitle>Faster Processing</BenefitTitle>
            <BenefitDescription>
              Accelerate turnaround times for critical business processes and customer interactions.
            </BenefitDescription>
          </BenefitItem>
        </BenefitsContainer>
      </BenefitsSection>
      
      <CaseStudySection>
        <SectionTitle
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Success Story
        </SectionTitle>
        <SectionContent
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          See how our automation solutions have transformed real businesses and delivered measurable results.
        </SectionContent>
        
        <CaseStudyCard
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <CaseStudyHeader>
            <CaseStudyTitle>Invoice Processing Automation</CaseStudyTitle>
            <CaseStudyCompany>National Distribution Company</CaseStudyCompany>
          </CaseStudyHeader>
          <CaseStudyContent>
            A leading distribution company was struggling with manual invoice processing, resulting in delays, errors, and high operational costs. We implemented an end-to-end automation solution that digitized incoming invoices, extracted key data using OCR technology, validated information against purchase orders, and routed invoices for approval through a digital workflow.
          </CaseStudyContent>
          <CaseStudyResults>
            <ResultItem>
              <ResultValue>85%</ResultValue>
              <ResultLabel>Reduction in processing time</ResultLabel>
            </ResultItem>
            <ResultItem>
              <ResultValue>92%</ResultValue>
              <ResultLabel>Decrease in processing errors</ResultLabel>
            </ResultItem>
            <ResultItem>
              <ResultValue>$320K</ResultValue>
              <ResultLabel>Annual cost savings</ResultLabel>
            </ResultItem>
            <ResultItem>
              <ResultValue>3x</ResultValue>
              <ResultLabel>Increase in invoice processing capacity</ResultLabel>
            </ResultItem>
          </CaseStudyResults>
        </CaseStudyCard>
      </CaseStudySection>
      
      <CTASection>
        <CTATitle
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Ready to Automate Your Business Processes?
        </CTATitle>
        <CTAContent
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Let's discuss how our business automation solutions can streamline your operations, reduce costs, and drive growth. Our team of experts will analyze your current processes and develop a customized automation strategy tailored to your specific needs.
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

export default BusinessAutomationPage;
