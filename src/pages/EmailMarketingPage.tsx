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

const EmailTypesSection = styled(Section)`
  background: rgba(255, 255, 255, 0.02);
`;

const EmailTypesGrid = styled.div`
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

const EmailTypeCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 30px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-5px);
  }
`;

const EmailTypeIcon = styled.div`
  font-size: 36px;
  margin-bottom: 20px;
`;

const EmailTypeTitle = styled.h4`
  color: white;
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const EmailTypeDescription = styled.p`
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

const ResultsSection = styled(Section)`
  background: rgba(255, 255, 255, 0.02);
`;

const ResultsGrid = styled.div`
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

const ResultCard = styled(motion.div)`
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

const ResultNumber = styled.h3`
  color: white;
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const ResultText = styled.p`
  color: rgba(255, 255, 255, 0.81);
  font-size: 16px;
  line-height: 24px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 22px;
  }
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

const EmailMarketingPage: React.FC = () => {
  const emailServices = [
    {
      icon: "📊",
      title: "Email Strategy & Planning",
      description: "We develop comprehensive email marketing strategies aligned with your business goals, audience segments, and customer journey."
    },
    {
      icon: "✏️",
      title: "Email Design & Content",
      description: "Our team creates visually stunning, responsive email templates and compelling content that drives engagement and conversions."
    },
    {
      icon: "🔍",
      title: "List Management & Segmentation",
      description: "We help you build, clean, and segment your email lists for maximum deliverability and personalized messaging."
    },
    {
      icon: "📈",
      title: "Automation & Optimization",
      description: "We implement sophisticated email automation workflows and continuously optimize campaigns based on performance data."
    }
  ];
  
  const emailTypes = [
    {
      icon: "👋",
      title: "Welcome Series",
      description: "Automated email sequences that introduce new subscribers to your brand and set expectations."
    },
    {
      icon: "🛒",
      title: "Abandoned Cart Emails",
      description: "Targeted reminders that recover lost sales and increase conversion rates."
    },
    {
      icon: "🎁",
      title: "Promotional Campaigns",
      description: "Strategic campaigns that highlight your offers and drive immediate sales."
    },
    {
      icon: "📰",
      title: "Newsletters",
      description: "Regular updates that keep your audience informed and engaged with your brand."
    },
    {
      icon: "🎂",
      title: "Lifecycle Emails",
      description: "Personalized messages triggered by customer milestones and behaviors."
    },
    {
      icon: "🔄",
      title: "Re-engagement Campaigns",
      description: "Strategic sequences that win back inactive subscribers and customers."
    }
  ];
  
  const emailProcess = [
    {
      number: 1,
      title: "Strategy Development",
      description: "We begin by understanding your business goals, target audience, and current email performance. We then develop a comprehensive strategy that aligns with your objectives and customer journey."
    },
    {
      number: 2,
      title: "List Building & Segmentation",
      description: "We help you build quality email lists through effective lead generation tactics and implement strategic segmentation to ensure relevant messaging for different audience groups."
    },
    {
      number: 3,
      title: "Content & Design Creation",
      description: "Our team develops compelling email content and designs responsive templates that reflect your brand identity and drive engagement across all devices and email clients."
    },
    {
      number: 4,
      title: "Automation Setup",
      description: "We implement sophisticated email automation workflows that deliver the right message to the right person at the right time, increasing efficiency and effectiveness."
    },
    {
      number: 5,
      title: "Testing & Optimization",
      description: "We conduct A/B testing on subject lines, content, design, and send times to continuously improve performance and maximize results."
    },
    {
      number: 6,
      title: "Analysis & Reporting",
      description: "We provide detailed performance reports and actionable insights to help you understand what's working and where there's room for improvement."
    }
  ];
  
  const emailResults = [
    {
      number: "42x",
      text: "Average ROI for our email marketing clients"
    },
    {
      number: "28%",
      text: "Average open rate (industry average: 18%)"
    },
    {
      number: "4.2%",
      text: "Average click-through rate (industry average: 2.6%)"
    },
    {
      number: "19%",
      text: "Average conversion rate from email campaigns"
    },
    {
      number: "32%",
      text: "Average revenue increase from automated email sequences"
    },
    {
      number: "67%",
      text: "Average cart recovery rate from abandoned cart emails"
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
            Email Marketing Services
          </HeroTitle>
          <HeroSubtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Connect directly with your audience and drive conversions with strategic email campaigns
          </HeroSubtitle>
        </HeroSection>
        
        <Section>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Email Marketing That Delivers Results
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Email marketing remains one of the most effective digital marketing channels, delivering an average ROI of 42:1. Our email marketing services help you leverage this powerful channel to build relationships, drive conversions, and increase customer lifetime value.
          </Paragraph>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            From strategy development and list management to content creation and campaign optimization, our comprehensive approach ensures your email marketing efforts drive measurable business results.
          </Paragraph>
          
          <ServicesGrid>
            {emailServices.map((service, index) => (
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
        
        <EmailTypesSection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Email Campaigns We Create
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            We develop a wide range of email campaigns tailored to your specific business goals, audience segments, and customer journey stages. Our strategic approach ensures you're sending the right message to the right person at the right time.
          </Paragraph>
          
          <EmailTypesGrid>
            {emailTypes.map((type, index) => (
              <EmailTypeCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <EmailTypeIcon>{type.icon}</EmailTypeIcon>
                <EmailTypeTitle>{type.title}</EmailTypeTitle>
                <EmailTypeDescription>{type.description}</EmailTypeDescription>
              </EmailTypeCard>
            ))}
          </EmailTypesGrid>
        </EmailTypesSection>
        
        <ProcessSection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Our Email Marketing Process
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            We follow a systematic approach to email marketing that ensures strategic alignment, consistent quality, and measurable results. Our process is designed to maximize the impact of your email marketing investment.
          </Paragraph>
          
          <ProcessSteps>
            {emailProcess.map((step, index) => (
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
        
        <ResultsSection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Results That Drive Business Growth
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Our email marketing strategies consistently deliver exceptional results for businesses across various industries. Here's what our clients have achieved through our strategic approach to email.
          </Paragraph>
          
          <ResultsGrid>
            {emailResults.map((result, index) => (
              <ResultCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <ResultNumber>{result.number}</ResultNumber>
                <ResultText>{result.text}</ResultText>
              </ResultCard>
            ))}
          </ResultsGrid>
        </ResultsSection>
        
        <CTASection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Ready to Transform Your Email Marketing?
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Let's discuss how our email marketing services can help you connect with your audience, drive conversions, and grow your business.
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
              Get a Free Email Audit
            </CTAButton>
          </Link>
        </CTASection>
        
        <Footer />
      </ContentContainer>
    </PageContainer>
  );
};

export default EmailMarketingPage;
