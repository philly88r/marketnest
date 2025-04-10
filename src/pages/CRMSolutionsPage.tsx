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
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 60px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
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

const ModulesSection = styled.section`
  padding: 100px 200px;
  background: linear-gradient(90deg, rgba(31, 83, 255, 0.05) 0%, rgba(255, 67, 163, 0.05) 100%);
  
  @media (max-width: 1200px) {
    padding: 80px 100px;
  }
  
  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

const ModulesTabs = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 60px;
  margin-bottom: 40px;
`;

const ModuleTab = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 'linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%)' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => !props.active && 'rgba(255, 255, 255, 0.2)'};
  }
`;

const ModuleContent = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 40px;
`;

const ModuleTitle = styled.h3`
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 20px;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ModuleDescription = styled.p`
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
`;

const ModuleFeatures = styled.ul`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ModuleFeatureItem = styled.li`
  font-size: 16px;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
  
  &:before {
    content: '✓';
    color: #FF43A3;
    margin-right: 10px;
    font-weight: bold;
  }
`;

const ProcessSection = styled.section`
  padding: 100px 200px;
  
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

const CRMSolutionsPage: React.FC = () => {
  const [activeModule, setActiveModule] = React.useState<string>('sales');
  
  return (
    <PageContainer>
      <Header />
      
      <HeroSection>
        <GradientTitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Custom CRM Solutions
        </GradientTitle>
        <SubTitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Build stronger customer relationships with tailored CRM systems designed specifically for your business needs
        </SubTitle>
      </HeroSection>
      
      <ContentSection>
        <SectionTitle
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Transform Your Customer Relationships
        </SectionTitle>
        <SectionContent
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          In today's competitive business landscape, managing customer relationships effectively is crucial for sustainable growth. Our custom Customer Relationship Management (CRM) solutions go beyond off-the-shelf software to address your unique business challenges and objectives.
        </SectionContent>
        <SectionContent
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          We develop tailored CRM systems that streamline your sales processes, enhance customer service, and provide valuable insights into customer behavior and preferences, enabling you to make data-driven decisions and deliver exceptional customer experiences.
        </SectionContent>
        
        <FeaturesGrid>
          <FeatureCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <FeatureTitle>Tailored to Your Workflow</FeatureTitle>
            <FeatureContent>
              Unlike generic CRM platforms, our solutions are designed to match your exact business processes and requirements, ensuring seamless adoption and maximum efficiency.
            </FeatureContent>
          </FeatureCard>
          
          <FeatureCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FeatureTitle>360° Customer View</FeatureTitle>
            <FeatureContent>
              Gain a complete understanding of your customers through comprehensive profiles that consolidate all interactions, purchases, preferences, and support history in one place.
            </FeatureContent>
          </FeatureCard>
          
          <FeatureCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <FeatureTitle>Seamless Integrations</FeatureTitle>
            <FeatureContent>
              Connect your CRM with existing business systems including ERP, marketing automation, e-commerce platforms, and communication tools for a unified business ecosystem.
            </FeatureContent>
          </FeatureCard>
          
          <FeatureCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <FeatureTitle>Advanced Analytics</FeatureTitle>
            <FeatureContent>
              Leverage powerful reporting and analytics capabilities to uncover trends, track performance metrics, and identify opportunities for growth and improvement.
            </FeatureContent>
          </FeatureCard>
          
          <FeatureCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <FeatureTitle>Mobile Accessibility</FeatureTitle>
            <FeatureContent>
              Access your CRM anytime, anywhere with responsive mobile applications that keep your team connected and productive while on the go.
            </FeatureContent>
          </FeatureCard>
          
          <FeatureCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <FeatureTitle>Scalable Architecture</FeatureTitle>
            <FeatureContent>
              Our CRM solutions grow with your business, easily accommodating increasing users, data volumes, and evolving business requirements without performance degradation.
            </FeatureContent>
          </FeatureCard>
        </FeaturesGrid>
      </ContentSection>
      
      <ModulesSection>
        <SectionTitle
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Comprehensive CRM Modules
        </SectionTitle>
        <SectionContent
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Our custom CRM solutions can include various modules tailored to your specific business needs. Each module is designed to optimize different aspects of customer relationship management.
        </SectionContent>
        
        <ModulesTabs>
          <ModuleTab 
            active={activeModule === 'sales'} 
            onClick={() => setActiveModule('sales')}
          >
            Sales Management
          </ModuleTab>
          <ModuleTab 
            active={activeModule === 'marketing'} 
            onClick={() => setActiveModule('marketing')}
          >
            Marketing Automation
          </ModuleTab>
          <ModuleTab 
            active={activeModule === 'service'} 
            onClick={() => setActiveModule('service')}
          >
            Customer Service
          </ModuleTab>
          <ModuleTab 
            active={activeModule === 'analytics'} 
            onClick={() => setActiveModule('analytics')}
          >
            Analytics & Reporting
          </ModuleTab>
        </ModulesTabs>
        
        {activeModule === 'sales' && (
          <ModuleContent
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <ModuleTitle>Sales Management</ModuleTitle>
            <ModuleDescription>
              Streamline your sales processes from lead generation to closing deals with our comprehensive sales management module. Track opportunities, manage pipelines, and forecast revenue with precision.
            </ModuleDescription>
            <ModuleFeatures>
              <ModuleFeatureItem>Lead capture and qualification</ModuleFeatureItem>
              <ModuleFeatureItem>Opportunity tracking and management</ModuleFeatureItem>
              <ModuleFeatureItem>Sales pipeline visualization</ModuleFeatureItem>
              <ModuleFeatureItem>Quote and proposal generation</ModuleFeatureItem>
              <ModuleFeatureItem>Sales forecasting and analytics</ModuleFeatureItem>
              <ModuleFeatureItem>Territory management</ModuleFeatureItem>
              <ModuleFeatureItem>Commission calculation</ModuleFeatureItem>
              <ModuleFeatureItem>Sales activity tracking</ModuleFeatureItem>
            </ModuleFeatures>
          </ModuleContent>
        )}
        
        {activeModule === 'marketing' && (
          <ModuleContent
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <ModuleTitle>Marketing Automation</ModuleTitle>
            <ModuleDescription>
              Create, execute, and measure marketing campaigns that drive engagement and conversions. Our marketing automation module helps you nurture leads, segment audiences, and deliver personalized content at scale.
            </ModuleDescription>
            <ModuleFeatures>
              <ModuleFeatureItem>Campaign management</ModuleFeatureItem>
              <ModuleFeatureItem>Email marketing automation</ModuleFeatureItem>
              <ModuleFeatureItem>Lead scoring and nurturing</ModuleFeatureItem>
              <ModuleFeatureItem>Customer segmentation</ModuleFeatureItem>
              <ModuleFeatureItem>Social media integration</ModuleFeatureItem>
              <ModuleFeatureItem>Landing page creation</ModuleFeatureItem>
              <ModuleFeatureItem>Marketing ROI analysis</ModuleFeatureItem>
              <ModuleFeatureItem>A/B testing capabilities</ModuleFeatureItem>
            </ModuleFeatures>
          </ModuleContent>
        )}
        
        {activeModule === 'service' && (
          <ModuleContent
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <ModuleTitle>Customer Service</ModuleTitle>
            <ModuleDescription>
              Deliver exceptional customer support with tools that help you manage cases, track service levels, and resolve issues efficiently. Our customer service module ensures consistent, high-quality support across all channels.
            </ModuleDescription>
            <ModuleFeatures>
              <ModuleFeatureItem>Case management</ModuleFeatureItem>
              <ModuleFeatureItem>Ticketing system</ModuleFeatureItem>
              <ModuleFeatureItem>Knowledge base integration</ModuleFeatureItem>
              <ModuleFeatureItem>Service level agreement (SLA) tracking</ModuleFeatureItem>
              <ModuleFeatureItem>Customer portal</ModuleFeatureItem>
              <ModuleFeatureItem>Live chat integration</ModuleFeatureItem>
              <ModuleFeatureItem>Customer satisfaction surveys</ModuleFeatureItem>
              <ModuleFeatureItem>Automated case routing</ModuleFeatureItem>
            </ModuleFeatures>
          </ModuleContent>
        )}
        
        {activeModule === 'analytics' && (
          <ModuleContent
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <ModuleTitle>Analytics & Reporting</ModuleTitle>
            <ModuleDescription>
              Gain actionable insights from your customer data with powerful analytics and customizable reports. Our analytics module helps you measure performance, identify trends, and make data-driven decisions.
            </ModuleDescription>
            <ModuleFeatures>
              <ModuleFeatureItem>Customizable dashboards</ModuleFeatureItem>
              <ModuleFeatureItem>Real-time reporting</ModuleFeatureItem>
              <ModuleFeatureItem>Sales performance analytics</ModuleFeatureItem>
              <ModuleFeatureItem>Customer behavior analysis</ModuleFeatureItem>
              <ModuleFeatureItem>Predictive analytics</ModuleFeatureItem>
              <ModuleFeatureItem>Conversion funnel visualization</ModuleFeatureItem>
              <ModuleFeatureItem>Custom report generation</ModuleFeatureItem>
              <ModuleFeatureItem>Data export capabilities</ModuleFeatureItem>
            </ModuleFeatures>
          </ModuleContent>
        )}
      </ModulesSection>
      
      <ProcessSection>
        <SectionTitle
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Our CRM Development Process
        </SectionTitle>
        <SectionContent
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          We follow a structured approach to developing custom CRM solutions that ensures alignment with your business goals and seamless integration with your existing systems.
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
              <StepTitle>Discovery & Analysis</StepTitle>
              <StepDescription>
                We begin by understanding your business processes, challenges, and objectives. Our team conducts a thorough analysis of your current customer relationship management practices and identifies areas for improvement.
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
                Based on our analysis, we design a custom CRM solution tailored to your specific needs. This includes defining the architecture, selecting appropriate technologies, and creating detailed wireframes and specifications.
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
              <StepTitle>Development & Integration</StepTitle>
              <StepDescription>
                Our experienced developers build your custom CRM solution using modern technologies and best practices. We ensure seamless integration with your existing systems and data sources for a unified business ecosystem.
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
              <StepTitle>Testing & Quality Assurance</StepTitle>
              <StepDescription>
                We conduct rigorous testing to ensure your CRM solution functions flawlessly across all devices and scenarios. Our QA process includes functional testing, performance testing, security testing, and user acceptance testing.
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
              <StepTitle>Deployment & Training</StepTitle>
              <StepDescription>
                We deploy your CRM solution and provide comprehensive training to ensure smooth adoption. Our team works closely with your staff to ensure they understand how to use the system effectively and maximize its benefits.
              </StepDescription>
            </StepContent>
          </ProcessStep>
          
          <ProcessStep
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <StepNumber>6</StepNumber>
            <StepContent>
              <StepTitle>Ongoing Support & Evolution</StepTitle>
              <StepDescription>
                Our relationship doesn't end with deployment. We provide ongoing support and maintenance to ensure your CRM continues to perform optimally. We also help you evolve your system as your business grows and requirements change.
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
          Ready to Transform Your Customer Relationships?
        </CTATitle>
        <CTAContent
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Let's discuss how our custom CRM solutions can help you build stronger customer relationships, streamline your sales processes, and drive business growth. Our team of experts is ready to guide you through the process.
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

export default CRMSolutionsPage;
