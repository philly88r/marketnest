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

const StatsSection = styled(Section)`
  background: rgba(255, 255, 255, 0.02);
`;

const StatsGrid = styled.div`
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

const StatCard = styled(motion.div)`
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

const StatNumber = styled.h3`
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

const StatTitle = styled.h4`
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const StatDescription = styled.p`
  color: rgba(255, 255, 255, 0.81);
  font-size: 15px;
  line-height: 24px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 22px;
  }
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

const TestimonialSection = styled(Section)`
  background: rgba(255, 255, 255, 0.02);
`;

const TestimonialCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 40px;
  margin-top: 60px;
  position: relative;
  
  &:before {
    content: '"';
    position: absolute;
    top: 20px;
    left: 20px;
    font-size: 120px;
    line-height: 1;
    font-family: serif;
    color: rgba(255, 255, 255, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 30px;
    
    &:before {
      font-size: 80px;
    }
  }
`;

const TestimonialText = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 20px;
  line-height: 34px;
  font-style: italic;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 18px;
    line-height: 30px;
  }
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
`;

const AuthorAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: #333;
  margin-right: 20px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AuthorInfo = styled.div``;

const AuthorName = styled.h5`
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
`;

const AuthorPosition = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
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

const CROPage: React.FC = () => {
  const croServices = [
    {
      icon: "🔍",
      title: "Conversion Audit",
      description: "We conduct a comprehensive audit of your website or landing pages to identify conversion barriers and opportunities for improvement."
    },
    {
      icon: "📊",
      title: "User Behavior Analysis",
      description: "We analyze user behavior through heatmaps, session recordings, and analytics to understand how visitors interact with your site."
    },
    {
      icon: "🧪",
      title: "A/B Testing",
      description: "We design and implement controlled experiments to test different versions of your pages and determine which performs better."
    },
    {
      icon: "📱",
      title: "Mobile Optimization",
      description: "We optimize the mobile experience to ensure seamless conversions across all devices and screen sizes."
    },
    {
      icon: "⚡",
      title: "Page Speed Optimization",
      description: "We improve loading times and performance to reduce bounce rates and increase the likelihood of conversion."
    },
    {
      icon: "📝",
      title: "Copy & Messaging Refinement",
      description: "We optimize your value proposition, headlines, and call-to-action text to better resonate with your target audience."
    }
  ];
  
  const croStats = [
    {
      number: "223%",
      title: "Average ROI",
      description: "Our CRO strategies deliver an average return on investment of 223% for our clients."
    },
    {
      number: "89%",
      title: "Client Retention",
      description: "89% of our CRO clients continue working with us after the initial engagement."
    },
    {
      number: "37%",
      title: "Conversion Lift",
      description: "Our clients see an average 37% increase in conversion rates within 90 days."
    },
    {
      number: "18%",
      title: "Revenue Increase",
      description: "On average, our CRO services help clients achieve an 18% increase in revenue."
    },
    {
      number: "42%",
      title: "Bounce Rate Reduction",
      description: "Our optimization strategies typically reduce bounce rates by up to 42%."
    },
    {
      number: "67%",
      title: "Form Completion Increase",
      description: "Our form optimization techniques increase completion rates by an average of 67%."
    }
  ];
  
  const croProcess = [
    {
      number: 1,
      title: "Research & Discovery",
      description: "We begin by understanding your business goals, target audience, and current conversion metrics. We analyze your analytics data, conduct user research, and identify key conversion barriers."
    },
    {
      number: 2,
      title: "Hypothesis Development",
      description: "Based on our research findings, we develop data-driven hypotheses about what changes could improve your conversion rates. Each hypothesis addresses specific user behaviors or pain points."
    },
    {
      number: 3,
      title: "Test Design & Implementation",
      description: "We design controlled experiments (A/B or multivariate tests) to validate our hypotheses. Our team implements these tests using industry-leading tools and ensures proper tracking."
    },
    {
      number: 4,
      title: "Data Collection & Analysis",
      description: "We collect data over a statistically significant period and analyze the results to determine which variations perform better. We look beyond just conversion rates to understand the full impact."
    },
    {
      number: 5,
      title: "Implementation & Iteration",
      description: "We implement winning variations and document learnings from all tests. These insights inform our next round of hypotheses as we continuously refine and optimize your conversion funnel."
    },
    {
      number: 6,
      title: "Reporting & Strategy Refinement",
      description: "We provide detailed reports on test results and their impact on your business metrics. We refine our CRO strategy based on accumulated learnings to drive continuous improvement."
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
            Conversion Rate Optimization
          </HeroTitle>
          <HeroSubtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Turn more visitors into customers with data-driven optimization
          </HeroSubtitle>
        </HeroSection>
        
        <Section>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Maximize Your Website's Potential
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your website is your most valuable digital asset, but are you getting the most out of it? Conversion Rate Optimization (CRO) is the systematic process of increasing the percentage of visitors who take a desired action on your website—whether that's making a purchase, filling out a form, or engaging with your content.
          </Paragraph>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Our data-driven CRO approach combines user behavior analysis, A/B testing, and continuous optimization to help you convert more of your existing traffic into customers—without spending more on advertising. The result? Higher ROI, lower acquisition costs, and improved user experience.
          </Paragraph>
          
          <ServicesGrid>
            {croServices.map((service, index) => (
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
        
        <StatsSection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            CRO By The Numbers
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Our conversion rate optimization services deliver measurable results for businesses across various industries. Here's what our clients have achieved through our data-driven approach.
          </Paragraph>
          
          <StatsGrid>
            {croStats.map((stat, index) => (
              <StatCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <StatNumber>{stat.number}</StatNumber>
                <StatTitle>{stat.title}</StatTitle>
                <StatDescription>{stat.description}</StatDescription>
              </StatCard>
            ))}
          </StatsGrid>
        </StatsSection>
        
        <ProcessSection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Our CRO Process
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            We follow a systematic, data-driven approach to conversion rate optimization that has been refined through hundreds of successful client engagements. Our process ensures that every change we make is based on evidence, not assumptions.
          </Paragraph>
          
          <ProcessSteps>
            {croProcess.map((step, index) => (
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
        
        <TestimonialSection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Client Success Story
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Don't just take our word for it. Here's what one of our clients had to say about our CRO services.
          </Paragraph>
          
          <TestimonialCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <TestimonialText>
              "Working with this agency on our conversion rate optimization has been transformative for our business. Within just three months, we saw a 52% increase in our lead form submissions and a 27% increase in sales. Their methodical approach to testing and optimization uncovered insights about our customers that we had never considered. The ROI has been exceptional, and we're continuing to see improvements with each optimization cycle."
            </TestimonialText>
            <TestimonialAuthor>
              <AuthorAvatar>
                <img src="https://via.placeholder.com/60x60" alt="Client" />
              </AuthorAvatar>
              <AuthorInfo>
                <AuthorName>Sarah Johnson</AuthorName>
                <AuthorPosition>Marketing Director, TechSolutions Inc.</AuthorPosition>
              </AuthorInfo>
            </TestimonialAuthor>
          </TestimonialCard>
        </TestimonialSection>
        
        <CTASection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Ready to Boost Your Conversion Rates?
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Let's discuss how our conversion rate optimization services can help you convert more of your existing traffic into customers and maximize your marketing ROI.
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
              Get a Free Conversion Audit
            </CTAButton>
          </Link>
        </CTASection>
        
        <Footer />
      </ContentContainer>
    </PageContainer>
  );
};

export default CROPage;
