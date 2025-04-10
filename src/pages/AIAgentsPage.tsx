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

const ProcessSection = styled.section`
  padding: 100px 200px;
  background: linear-gradient(90deg, rgba(31, 83, 255, 0.05) 0%, rgba(255, 67, 163, 0.05) 100%);
  
  @media (max-width: 1200px) {
    padding: 80px 100px;
  }
  
  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

const ProcessSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  margin-top: 60px;
`;

const ProcessStep = styled(motion.div)`
  display: flex;
  gap: 30px;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const StepNumber = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: 700;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 15px;
`;

const StepDescription = styled.p`
  font-size: 16px;
  line-height: 1.5;
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

const AIAgentsPage: React.FC = () => {
  return (
    <PageContainer>
      <Header />
      
      <HeroSection>
        <GradientTitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          AI Agents & Automation
        </GradientTitle>
        <SubTitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Transform your business operations with intelligent AI agents that automate tasks, provide insights, and enhance decision-making
        </SubTitle>
      </HeroSection>
      
      <ContentSection>
        <SectionTitle
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          The Power of AI Agents
        </SectionTitle>
        <SectionContent
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Artificial Intelligence (AI) is revolutionizing how businesses operate by automating complex tasks, analyzing vast amounts of data, and providing actionable insights. Our AI agents are designed to seamlessly integrate with your existing systems and workflows, enhancing productivity and driving innovation.
        </SectionContent>
        <SectionContent
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Whether you're looking to automate customer service, optimize operations, or gain deeper insights from your data, our custom AI solutions can be tailored to meet your specific business needs and objectives.
        </SectionContent>
        
        <FeaturesGrid>
          <FeatureCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <FeatureTitle>Intelligent Virtual Assistants</FeatureTitle>
            <FeatureContent>
              Deploy AI-powered virtual assistants that can handle customer inquiries, schedule appointments, and provide information 24/7, freeing up your human resources for more complex tasks.
            </FeatureContent>
          </FeatureCard>
          
          <FeatureCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FeatureTitle>Predictive Analytics</FeatureTitle>
            <FeatureContent>
              Leverage machine learning algorithms to analyze historical data, identify patterns, and predict future trends, enabling proactive decision-making and strategic planning.
            </FeatureContent>
          </FeatureCard>
          
          <FeatureCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <FeatureTitle>Workflow Automation</FeatureTitle>
            <FeatureContent>
              Automate repetitive and time-consuming tasks across departments, from data entry and document processing to complex approval workflows and inventory management.
            </FeatureContent>
          </FeatureCard>
          
          <FeatureCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <FeatureTitle>Natural Language Processing</FeatureTitle>
            <FeatureContent>
              Implement NLP capabilities to analyze customer feedback, social media mentions, and support tickets, extracting valuable insights and sentiment analysis to improve your products and services.
            </FeatureContent>
          </FeatureCard>
        </FeaturesGrid>
      </ContentSection>
      
      <ProcessSection>
        <SectionTitle
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Our AI Implementation Process
        </SectionTitle>
        <SectionContent
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          We follow a structured approach to developing and implementing AI solutions that ensure alignment with your business goals and seamless integration with your existing systems.
        </SectionContent>
        
        <ProcessSteps>
          <ProcessStep
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StepNumber>1</StepNumber>
            <StepContent>
              <StepTitle>Discovery & Assessment</StepTitle>
              <StepDescription>
                We begin by understanding your business processes, challenges, and objectives. Our team conducts a thorough assessment to identify areas where AI can create the most significant impact.
              </StepDescription>
            </StepContent>
          </ProcessStep>
          
          <ProcessStep
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <StepNumber>2</StepNumber>
            <StepContent>
              <StepTitle>Solution Design</StepTitle>
              <StepDescription>
                Based on our assessment, we design a custom AI solution tailored to your specific needs. This includes selecting the appropriate AI technologies, defining the architecture, and creating a detailed implementation plan.
              </StepDescription>
            </StepContent>
          </ProcessStep>
          
          <ProcessStep
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <StepNumber>3</StepNumber>
            <StepContent>
              <StepTitle>Development & Training</StepTitle>
              <StepDescription>
                Our team develops the AI solution and trains the models using your data. We ensure the highest standards of data security and privacy throughout this process, with rigorous testing to validate performance.
              </StepDescription>
            </StepContent>
          </ProcessStep>
          
          <ProcessStep
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <StepNumber>4</StepNumber>
            <StepContent>
              <StepTitle>Integration & Deployment</StepTitle>
              <StepDescription>
                We seamlessly integrate the AI solution with your existing systems and workflows, ensuring minimal disruption to your operations. Our team provides comprehensive training to your staff to maximize adoption.
              </StepDescription>
            </StepContent>
          </ProcessStep>
          
          <ProcessStep
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <StepNumber>5</StepNumber>
            <StepContent>
              <StepTitle>Monitoring & Optimization</StepTitle>
              <StepDescription>
                Post-deployment, we continuously monitor the performance of your AI solution, making necessary adjustments and optimizations to ensure it delivers the expected results and adapts to changing business needs.
              </StepDescription>
            </StepContent>
          </ProcessStep>
        </ProcessSteps>
      </ProcessSection>
      
      <CTASection>
        <CTATitle
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Ready to Harness the Power of AI?
        </CTATitle>
        <CTAContent
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Let's discuss how our AI agents and automation solutions can transform your business operations, enhance productivity, and drive innovation. Our team of AI experts is ready to guide you through the process.
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

export default AIAgentsPage;
