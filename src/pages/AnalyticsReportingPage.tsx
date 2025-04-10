import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PageContainer = styled.div`
  width: 100%;
  max-width: 100vw;
  position: relative;
  background: black;
  overflow: hidden;
`;

const GradientCircle = styled(motion.div)<{ left: string; top: string }>`
  width: 718px;
  height: 718px;
  position: absolute;
  background: radial-gradient(ellipse 50% 50% at 50% 50%, rgba(31, 83, 255, 0.17) 0%, rgba(31, 83, 255, 0) 100%);
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

const ContentContainer = styled.div`
  position: relative;
  z-index: 1;
  max-width: 100%;
  padding-top: 120px; /* Space for fixed header */
`;

const Section = styled.section`
  padding: 100px 200px;
  position: relative;
  
  @media (max-width: 1200px) {
    padding: 80px 100px;
  }
  
  @media (max-width: 992px) {
    padding: 60px 60px;
  }
  
  @media (max-width: 768px) {
    padding: 50px 20px;
  }
`;

const SectionTitle = styled(motion.h2)`
  color: white;
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 24px;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 992px) {
    font-size: 40px;
    margin-bottom: 20px;
  }
  
  @media (max-width: 768px) {
    font-size: 32px;
    margin-bottom: 16px;
  }
`;

const Paragraph = styled(motion.p)`
  color: rgba(255, 255, 255, 0.81);
  font-size: 18px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  line-height: 32px;
  margin-bottom: 24px;
  max-width: 800px;
  
  @media (max-width: 992px) {
    font-size: 16px;
    line-height: 28px;
    margin-bottom: 20px;
  }
  
  @media (max-width: 768px) {
    font-size: 15px;
    line-height: 26px;
    margin-bottom: 16px;
  }
`;

const HeroSection = styled.section`
  padding: 100px 200px 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  
  @media (max-width: 1200px) {
    padding: 80px 100px 60px;
  }
  
  @media (max-width: 992px) {
    padding: 60px 60px 40px;
  }
  
  @media (max-width: 768px) {
    padding: 50px 20px 30px;
  }
`;

const HeroTitle = styled(motion.h1)`
  color: white;
  font-size: 64px;
  font-weight: 800;
  margin-bottom: 24px;
  max-width: 900px;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 992px) {
    font-size: 48px;
    margin-bottom: 20px;
  }
  
  @media (max-width: 768px) {
    font-size: 36px;
    margin-bottom: 16px;
  }
`;

const HeroSubtitle = styled(motion.p)`
  color: rgba(255, 255, 255, 0.9);
  font-size: 24px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  line-height: 36px;
  margin-bottom: 40px;
  max-width: 800px;
  
  @media (max-width: 992px) {
    font-size: 20px;
    line-height: 32px;
    margin-bottom: 30px;
  }
  
  @media (max-width: 768px) {
    font-size: 18px;
    line-height: 28px;
    margin-bottom: 24px;
  }
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  margin-top: 60px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const ServiceCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 40px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-5px);
  }
  
  @media (max-width: 768px) {
    padding: 30px;
  }
`;

const ServiceIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  font-size: 24px;
  color: white;
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
`;

const ServiceTitle = styled.h4`
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 12px;
  }
`;

const ServiceDescription = styled.p`
  color: rgba(255, 255, 255, 0.81);
  font-size: 16px;
  line-height: 26px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 24px;
  }
`;

const ToolsSection = styled(Section)`
  background: rgba(255, 255, 255, 0.02);
`;

const ToolsGrid = styled.div`
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

const ToolCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 30px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-5px);
  }
`;

const ToolIcon = styled.div`
  font-size: 36px;
  margin-bottom: 20px;
`;

const ToolTitle = styled.h4`
  color: white;
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const ToolDescription = styled.p`
  color: rgba(255, 255, 255, 0.81);
  font-size: 15px;
  line-height: 24px;
`;

const ProcessSection = styled(Section)``;

const ProcessSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  margin-top: 60px;
  
  @media (max-width: 992px) {
    gap: 30px;
  }
`;

const ProcessStep = styled(motion.div)`
  display: flex;
  gap: 30px;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const StepNumber = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h4`
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 12px;
  }
`;

const StepDescription = styled.p`
  color: rgba(255, 255, 255, 0.81);
  font-size: 16px;
  line-height: 26px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 24px;
  }
`;

const BenefitsSection = styled(Section)`
  background: rgba(255, 255, 255, 0.02);
`;

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 60px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const BenefitCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-5px);
  }
`;

const BenefitIcon = styled.div`
  font-size: 36px;
  margin-bottom: 20px;
`;

const BenefitTitle = styled.h4`
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const BenefitDescription = styled.p`
  color: rgba(255, 255, 255, 0.81);
  font-size: 15px;
  line-height: 24px;
`;

const CTASection = styled(Section)`
  text-align: center;
  padding-bottom: 150px;
`;

const CTAButton = styled(motion.button)`
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  color: white;
  font-size: 18px;
  font-weight: 600;
  padding: 16px 40px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  margin-top: 40px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(31, 83, 255, 0.3);
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
    padding: 14px 30px;
  }
`;

const AnalyticsReportingPage: React.FC = () => {
  const analyticsServices = [
    {
      icon: "📊",
      title: "Data Collection & Integration",
      description: "We set up comprehensive data collection across all your digital channels and integrate disparate data sources for a unified view of your marketing performance."
    },
    {
      icon: "📈",
      title: "Custom Dashboard Development",
      description: "We create tailored dashboards that visualize your most important metrics and KPIs, providing actionable insights at a glance."
    },
    {
      icon: "🔍",
      title: "Performance Analysis",
      description: "Our analysts dive deep into your data to uncover trends, opportunities, and areas for improvement across all marketing channels."
    },
    {
      icon: "📱",
      title: "Attribution Modeling",
      description: "We implement advanced attribution models to accurately measure the impact of each marketing touchpoint on your conversion path."
    },
    {
      icon: "🎯",
      title: "Conversion Rate Optimization",
      description: "We identify conversion bottlenecks and implement data-driven strategies to improve your conversion rates and ROI."
    },
    {
      icon: "📝",
      title: "Regular Reporting & Insights",
      description: "We provide clear, actionable reports that translate complex data into strategic recommendations for your business."
    }
  ];
  
  const analyticsPlatforms = [
    {
      icon: "🔍",
      title: "Google Analytics 4",
      description: "Advanced analytics platform for measuring website and app performance with AI-powered insights."
    },
    {
      icon: "📊",
      title: "Google Data Studio",
      description: "Powerful data visualization tool for creating interactive dashboards and reports."
    },
    {
      icon: "🔄",
      title: "Google Tag Manager",
      description: "Tag management system for implementing tracking codes and pixels without modifying website code."
    },
    {
      icon: "🔎",
      title: "SEMrush",
      description: "Comprehensive SEO and competitive analysis platform for tracking organic and paid search performance."
    },
    {
      icon: "📱",
      title: "Hotjar",
      description: "Behavior analytics tool for understanding user behavior through heatmaps, session recordings, and surveys."
    },
    {
      icon: "📈",
      title: "Tableau",
      description: "Advanced data visualization software for creating interactive and shareable dashboards."
    },
    {
      icon: "📊",
      title: "Power BI",
      description: "Business analytics service for interactive visualizations and business intelligence capabilities."
    },
    {
      icon: "🔄",
      title: "Mixpanel",
      description: "Product analytics platform for tracking user interactions and understanding user behavior."
    },
    {
      icon: "📱",
      title: "AppsFlyer",
      description: "Mobile attribution and marketing analytics platform for app marketers."
    }
  ];
  
  const analyticsProcess = [
    {
      number: 1,
      title: "Discovery & Audit",
      description: "We begin by understanding your business goals, KPIs, and current analytics setup. We conduct a comprehensive audit of your existing tracking and reporting systems to identify gaps and opportunities."
    },
    {
      number: 2,
      title: "Strategy & Implementation Plan",
      description: "Based on our findings, we develop a tailored analytics strategy and implementation plan that aligns with your business objectives and addresses your specific measurement needs."
    },
    {
      number: 3,
      title: "Tracking Implementation",
      description: "We implement robust tracking across all your digital properties, ensuring accurate data collection and proper integration between different platforms and channels."
    },
    {
      number: 4,
      title: "Dashboard Development",
      description: "We create custom dashboards that visualize your most important metrics and KPIs, providing you with a clear, actionable view of your marketing performance."
    },
    {
      number: 5,
      title: "Analysis & Optimization",
      description: "Our analysts regularly review your data to identify trends, opportunities, and areas for improvement. We provide actionable recommendations to optimize your marketing efforts."
    },
    {
      number: 6,
      title: "Ongoing Reporting & Support",
      description: "We deliver regular reports that translate complex data into clear insights and strategic recommendations. Our team provides ongoing support to ensure your analytics setup continues to meet your evolving needs."
    }
  ];
  
  const analyticsBenefits = [
    {
      icon: "🎯",
      title: "Data-Driven Decision Making",
      description: "Make confident marketing decisions based on accurate data rather than assumptions or guesswork."
    },
    {
      icon: "💰",
      title: "Improved ROI",
      description: "Identify which marketing channels and campaigns deliver the best returns and optimize your budget allocation accordingly."
    },
    {
      icon: "🔍",
      title: "Enhanced Customer Insights",
      description: "Gain a deeper understanding of your audience's behavior, preferences, and journey to better meet their needs."
    },
    {
      icon: "📈",
      title: "Performance Transparency",
      description: "Maintain clear visibility into all marketing activities and their impact on your business objectives."
    },
    {
      icon: "⚡",
      title: "Faster Problem Detection",
      description: "Quickly identify and address issues in your marketing funnel or website performance before they impact your bottom line."
    },
    {
      icon: "🚀",
      title: "Competitive Advantage",
      description: "Stay ahead of competitors by leveraging data insights to identify market opportunities and optimize strategies faster."
    }
  ];
  
  return (
    <PageContainer>
      {/* Background gradient circles */}
      <GradientCircle left="-205px" top="196px" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
      <GradientCircle left="60%" top="439px" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} />
      <GradientCircle left="70%" top="1388px" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }} />
      <GradientCircle left="-106px" top="2601px" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }} />
      <GradientCircle left="60%" top="3039px" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} />
      
      <Header />
      
      <ContentContainer>
        <HeroSection>
          <HeroTitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Analytics & Reporting
          </HeroTitle>
          <HeroSubtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Transform data into actionable insights that drive business growth
          </HeroSubtitle>
        </HeroSection>
        
        <Section>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Data-Driven Marketing Excellence
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            In today's digital landscape, effective marketing requires more than just creative campaigns—it demands a deep understanding of performance data and the ability to extract actionable insights. Our Analytics & Reporting services help you harness the power of your marketing data to make informed decisions and drive measurable results.
          </Paragraph>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            From comprehensive data collection and integration to custom dashboard development and in-depth performance analysis, our analytics solutions provide the clarity and insights you need to optimize your marketing efforts and maximize ROI.
          </Paragraph>
          
          <ServicesGrid>
            {analyticsServices.map((service, index) => (
              <ServiceCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <ServiceIcon>{service.icon}</ServiceIcon>
                <ServiceTitle>{service.title}</ServiceTitle>
                <ServiceDescription>{service.description}</ServiceDescription>
              </ServiceCard>
            ))}
          </ServicesGrid>
        </Section>
        
        <ToolsSection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Analytics Platforms We Leverage
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            We utilize a wide range of industry-leading analytics platforms and tools to collect, analyze, and visualize your marketing data. Our expertise spans across these platforms, ensuring you get the most comprehensive and accurate insights possible.
          </Paragraph>
          
          <ToolsGrid>
            {analyticsPlatforms.map((platform, index) => (
              <ToolCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <ToolIcon>{platform.icon}</ToolIcon>
                <ToolTitle>{platform.title}</ToolTitle>
                <ToolDescription>{platform.description}</ToolDescription>
              </ToolCard>
            ))}
          </ToolsGrid>
        </ToolsSection>
        
        <ProcessSection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Our Analytics Process
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            We follow a systematic approach to analytics and reporting that ensures accurate data collection, meaningful insights, and actionable recommendations. Our process is designed to transform raw data into strategic marketing decisions.
          </Paragraph>
          
          <ProcessSteps>
            {analyticsProcess.map((step, index) => (
              <ProcessStep
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
              >
                <StepNumber>{step.number}</StepNumber>
                <StepContent>
                  <StepTitle>{step.title}</StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                </StepContent>
              </ProcessStep>
            ))}
          </ProcessSteps>
        </ProcessSection>
        
        <BenefitsSection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Benefits of Data-Driven Marketing
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Implementing robust analytics and reporting processes delivers numerous advantages that can transform your marketing effectiveness and business outcomes.
          </Paragraph>
          
          <BenefitsGrid>
            {analyticsBenefits.map((benefit, index) => (
              <BenefitCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <BenefitIcon>{benefit.icon}</BenefitIcon>
                <BenefitTitle>{benefit.title}</BenefitTitle>
                <BenefitDescription>{benefit.description}</BenefitDescription>
              </BenefitCard>
            ))}
          </BenefitsGrid>
        </BenefitsSection>
        
        <CTASection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Ready to Unlock the Power of Your Data?
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Let's discuss how our analytics and reporting services can help you make more informed marketing decisions and drive better business results.
          </Paragraph>
          <Link to="/contact">
            <CTAButton
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get a Free Analytics Audit
            </CTAButton>
          </Link>
        </CTASection>
        
        <Footer />
      </ContentContainer>
    </PageContainer>
  );
};

export default AnalyticsReportingPage;
