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

const ContentTypesSection = styled(Section)`
  background: rgba(255, 255, 255, 0.02);
`;

const ContentTypesGrid = styled.div`
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

const ContentTypeCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 30px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-5px);
  }
`;

const ContentTypeIcon = styled.div`
  font-size: 36px;
  margin-bottom: 20px;
`;

const ContentTypeTitle = styled.h4`
  color: white;
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const ContentTypeDescription = styled.p`
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

const ContentMarketingPage: React.FC = () => {
  const contentServices = [
    {
      icon: "📝",
      title: "Content Strategy Development",
      description: "We create comprehensive content strategies aligned with your business goals, target audience, and industry to drive engagement and conversions."
    },
    {
      icon: "✍️",
      title: "Content Creation & Production",
      description: "Our team of expert writers, designers, and producers creates high-quality content that resonates with your audience and drives meaningful results."
    },
    {
      icon: "📊",
      title: "Content Distribution & Promotion",
      description: "We ensure your content reaches the right audience through strategic distribution across owned, earned, and paid channels."
    },
    {
      icon: "📈",
      title: "Content Performance Analysis",
      description: "We track and analyze content performance to continuously optimize your strategy and maximize ROI."
    }
  ];
  
  const contentTypes = [
    {
      icon: "📄",
      title: "Blog Posts & Articles",
      description: "Informative, engaging content that establishes thought leadership and drives organic traffic."
    },
    {
      icon: "📚",
      title: "Whitepapers & eBooks",
      description: "In-depth resources that generate leads and showcase your expertise."
    },
    {
      icon: "📊",
      title: "Infographics & Visual Content",
      description: "Eye-catching visuals that simplify complex information and increase shareability."
    },
    {
      icon: "🎥",
      title: "Videos & Animations",
      description: "Engaging video content that increases time on site and improves conversion rates."
    },
    {
      icon: "🎙️",
      title: "Podcasts & Audio Content",
      description: "Audio content that reaches audiences on the go and builds loyal communities."
    },
    {
      icon: "📱",
      title: "Social Media Content",
      description: "Platform-specific content that drives engagement and builds brand awareness."
    },
    {
      icon: "📧",
      title: "Email Newsletters",
      description: "Targeted email content that nurtures leads and drives conversions."
    },
    {
      icon: "🔍",
      title: "Case Studies & Success Stories",
      description: "Compelling stories that showcase your results and build trust with prospects."
    },
    {
      icon: "🎓",
      title: "Webinars & Educational Content",
      description: "Interactive learning experiences that generate leads and establish authority."
    }
  ];
  
  const contentProcess = [
    {
      number: 1,
      title: "Discovery & Strategy Development",
      description: "We begin by understanding your business goals, target audience, and competitive landscape. We conduct comprehensive content audits and develop a strategic roadmap aligned with your objectives."
    },
    {
      number: 2,
      title: "Content Planning & Calendar Creation",
      description: "We create a detailed content calendar that outlines topics, formats, channels, and timelines. Our planning ensures consistent publishing and strategic alignment with your marketing initiatives."
    },
    {
      number: 3,
      title: "Content Creation & Production",
      description: "Our team of specialized content creators develops high-quality content across various formats. We maintain consistent brand voice and ensure all content is optimized for both users and search engines."
    },
    {
      number: 4,
      title: "Content Distribution & Promotion",
      description: "We implement strategic distribution across owned, earned, and paid channels to maximize reach and engagement. Our promotion strategies ensure your content reaches the right audience at the right time."
    },
    {
      number: 5,
      title: "Performance Tracking & Analysis",
      description: "We continuously monitor content performance against KPIs and provide detailed reporting on engagement, conversions, and ROI. Our analysis informs ongoing optimization."
    },
    {
      number: 6,
      title: "Optimization & Refinement",
      description: "Based on performance data, we refine our approach to continuously improve results. We identify successful content types and themes to inform future content development."
    }
  ];
  
  const contentResults = [
    {
      number: "237%",
      text: "Average increase in organic traffic for our content marketing clients"
    },
    {
      number: "183%",
      text: "Average increase in lead generation from content assets"
    },
    {
      number: "4.2x",
      text: "Average return on investment from content marketing efforts"
    },
    {
      number: "68%",
      text: "Reduction in cost per lead compared to traditional advertising"
    },
    {
      number: "89%",
      text: "Increase in brand awareness metrics for consistent content publishers"
    },
    {
      number: "92%",
      text: "Client retention rate due to measurable content marketing results"
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
            Content Marketing Services
          </HeroTitle>
          <HeroSubtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Engage your audience and drive conversions with strategic, high-quality content
          </HeroSubtitle>
        </HeroSection>
        
        <Section>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Content That Connects & Converts
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            In today's digital landscape, content is the foundation of effective marketing. Our content marketing services help you create and distribute valuable, relevant content that attracts, engages, and converts your target audience.
          </Paragraph>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            From strategy development and content creation to distribution and performance analysis, our comprehensive approach ensures your content marketing efforts drive measurable business results.
          </Paragraph>
          
          <ServicesGrid>
            {contentServices.map((service, index) => (
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
        
        <ContentTypesSection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Content Types We Create
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            We create a wide range of content formats tailored to your specific business goals, audience preferences, and distribution channels. Our versatile content creation capabilities ensure you have the right content for every stage of the customer journey.
          </Paragraph>
          
          <ContentTypesGrid>
            {contentTypes.map((type, index) => (
              <ContentTypeCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <ContentTypeIcon>{type.icon}</ContentTypeIcon>
                <ContentTypeTitle>{type.title}</ContentTypeTitle>
                <ContentTypeDescription>{type.description}</ContentTypeDescription>
              </ContentTypeCard>
            ))}
          </ContentTypesGrid>
        </ContentTypesSection>
        
        <ProcessSection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Our Content Marketing Process
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            We follow a systematic approach to content marketing that ensures strategic alignment, consistent quality, and measurable results. Our process is designed to maximize the impact of your content marketing investment.
          </Paragraph>
          
          <ProcessSteps>
            {contentProcess.map((step, index) => (
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
            Our content marketing strategies consistently deliver exceptional results for businesses across various industries. Here's what our clients have achieved through our strategic approach to content.
          </Paragraph>
          
          <ResultsGrid>
            {contentResults.map((result, index) => (
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
            Ready to Transform Your Content Marketing?
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Let's discuss how our content marketing services can help you engage your audience, build brand authority, and drive business growth.
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
              Get a Free Content Audit
            </CTAButton>
          </Link>
        </CTASection>
        
        <Footer />
      </ContentContainer>
    </PageContainer>
  );
};

export default ContentMarketingPage;
