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

const ProcessSection = styled(Section)`
  background: rgba(255, 255, 255, 0.02);
`;

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

const ResultsSection = styled(Section)``;

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

const FAQSection = styled(Section)`
  background: rgba(255, 255, 255, 0.02);
`;

const FAQContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 60px;
  
  @media (max-width: 992px) {
    gap: 16px;
  }
`;

const FAQItem = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  overflow: hidden;
`;

const FAQQuestion = styled.div<{ $isOpen: boolean }>`
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  
  h4 {
    color: white;
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    
    @media (max-width: 768px) {
      font-size: 18px;
    }
  }
  
  span {
    color: white;
    font-size: 24px;
    transform: ${props => props.$isOpen ? 'rotate(45deg)' : 'rotate(0)'};
    transition: transform 0.3s ease;
  }
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const FAQAnswer = styled(motion.div)`
  padding: 0 24px 24px;
  color: rgba(255, 255, 255, 0.81);
  font-size: 16px;
  line-height: 26px;
  
  @media (max-width: 768px) {
    padding: 0 20px 20px;
    font-size: 14px;
    line-height: 24px;
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

const PPCAdvertisingPage: React.FC = () => {
  const [openFAQ, setOpenFAQ] = React.useState<number | null>(null);
  
  const toggleFAQ = (index: number) => {
    if (openFAQ === index) {
      setOpenFAQ(null);
    } else {
      setOpenFAQ(index);
    }
  };
  
  const ppcServices = [
    {
      icon: "🎯",
      title: "Google Ads Management",
      description: "Strategic campaign setup, optimization, and management across Search, Display, Shopping, and Video networks to maximize ROI."
    },
    {
      icon: "📱",
      title: "Social Media Advertising",
      description: "Targeted advertising campaigns on platforms like Facebook, Instagram, LinkedIn, and Twitter to reach your ideal audience."
    },
    {
      icon: "🔄",
      title: "Retargeting Campaigns",
      description: "Re-engage visitors who have shown interest in your products or services with strategic retargeting ads across multiple platforms."
    },
    {
      icon: "📊",
      title: "PPC Analytics & Reporting",
      description: "Comprehensive tracking, analysis, and reporting to measure campaign performance and continuously improve results."
    }
  ];
  
  const ppcProcess = [
    {
      number: 1,
      title: "Discovery & Goal Setting",
      description: "We begin by understanding your business objectives, target audience, and competitive landscape. We establish clear KPIs and goals for your PPC campaigns."
    },
    {
      number: 2,
      title: "Account & Campaign Structure",
      description: "We create a strategic account structure with properly organized campaigns, ad groups, and keywords to maximize quality scores and campaign effectiveness."
    },
    {
      number: 3,
      title: "Keyword Research & Selection",
      description: "We identify high-intent keywords with optimal search volume and competition levels, including negative keywords to filter out irrelevant traffic."
    },
    {
      number: 4,
      title: "Ad Creation & Landing Page Optimization",
      description: "We craft compelling ad copy and design high-converting landing pages that align with your campaign goals and maximize conversion rates."
    },
    {
      number: 5,
      title: "Bid Management & Budget Allocation",
      description: "We implement strategic bidding strategies and allocate budget across campaigns to maximize ROI and achieve your business objectives."
    },
    {
      number: 6,
      title: "Continuous Optimization & Reporting",
      description: "We monitor performance metrics, conduct A/B tests, and make data-driven optimizations to improve campaign performance over time."
    }
  ];
  
  const ppcResults = [
    {
      number: "325%",
      text: "Average increase in conversion rates for our PPC clients"
    },
    {
      number: "42%",
      text: "Average reduction in cost per acquisition (CPA)"
    },
    {
      number: "189%",
      text: "Average increase in click-through rates (CTR)"
    },
    {
      number: "4.5x",
      text: "Average return on ad spend (ROAS)"
    },
    {
      number: "68%",
      text: "Improvement in quality scores across client accounts"
    },
    {
      number: "96%",
      text: "Client retention rate due to consistent results"
    }
  ];
  
  const faqItems = [
    {
      question: "How quickly can I expect results from PPC advertising?",
      answer: "Unlike SEO, PPC can deliver immediate results once your campaigns are live. You can start seeing traffic and conversions within hours of launching your campaigns. However, optimal performance typically requires 2-4 weeks of data collection and optimization to refine targeting, bidding strategies, and ad creative based on actual performance."
    },
    {
      question: "What budget do I need for effective PPC campaigns?",
      answer: "Effective PPC budgets vary widely depending on your industry, competition, geographic targeting, and business goals. We recommend starting with a budget that allows for sufficient data collection (typically $1,000-$3,000 per month for small to medium businesses) and scaling up as we identify high-performing campaigns. We'll work with you to develop a budget strategy that aligns with your business objectives and maximizes ROI."
    },
    {
      question: "How do you measure the success of PPC campaigns?",
      answer: "We track multiple KPIs including click-through rate (CTR), conversion rate, cost per click (CPC), cost per acquisition (CPA), quality score, and most importantly, return on ad spend (ROAS). We establish clear goals at the beginning of our engagement and provide transparent reporting on these metrics. Our focus is always on driving meaningful business outcomes, not just traffic or clicks."
    },
    {
      question: "Do you create landing pages for PPC campaigns?",
      answer: "Yes, we offer landing page design and optimization services as part of our PPC management. High-performing landing pages are crucial for converting PPC traffic into leads or customers. We create dedicated landing pages that align with your ad messaging, include clear calls-to-action, and are optimized for conversion. We also continuously test and refine these pages to improve performance over time."
    },
    {
      question: "How often will I receive reports on my PPC campaigns?",
      answer: "We provide comprehensive monthly reports detailing campaign performance, insights, and recommendations. These reports include key metrics, trend analysis, and strategic recommendations. For clients who prefer more frequent updates, we can provide weekly performance snapshots. Additionally, we schedule regular strategy calls to discuss performance, answer questions, and align on next steps."
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
            PPC Advertising Services
          </HeroTitle>
          <HeroSubtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Drive immediate traffic, leads, and sales with our strategic paid advertising campaigns
          </HeroSubtitle>
        </HeroSection>
        
        <Section>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Accelerate Your Growth with PPC
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Pay-Per-Click (PPC) advertising offers immediate visibility and precise targeting to reach your ideal customers at the moment they're searching for your products or services. Our data-driven PPC services help you maximize ROI while minimizing wasted ad spend.
          </Paragraph>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            From campaign strategy and setup to ongoing optimization and reporting, our PPC experts manage every aspect of your paid advertising to deliver measurable results. We leverage advanced targeting, compelling ad creative, and continuous testing to ensure your campaigns consistently outperform the competition.
          </Paragraph>
          
          <ServicesGrid>
            {ppcServices.map((service, index) => (
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
        
        <ProcessSection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Our PPC Management Process
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            We follow a proven methodology to create, manage, and optimize PPC campaigns that deliver consistent results. Our systematic approach ensures that every dollar of your advertising budget works as hard as possible to achieve your business goals.
          </Paragraph>
          
          <ProcessSteps>
            {ppcProcess.map((step, index) => (
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
            Our PPC campaigns consistently deliver exceptional results for businesses across various industries. Here's what our clients have achieved through our strategic approach to paid advertising.
          </Paragraph>
          
          <ResultsGrid>
            {ppcResults.map((result, index) => (
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
        
        <FAQSection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Frequently Asked Questions
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Get answers to common questions about our PPC advertising services.
          </Paragraph>
          
          <FAQContainer>
            {faqItems.map((item, index) => (
              <FAQItem
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
              >
                <FAQQuestion 
                  $isOpen={openFAQ === index}
                  onClick={() => toggleFAQ(index)}
                >
                  <h4>{item.question}</h4>
                  <span>{openFAQ === index ? "×" : "+"}</span>
                </FAQQuestion>
                {openFAQ === index && (
                  <FAQAnswer
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.answer}
                  </FAQAnswer>
                )}
              </FAQItem>
            ))}
          </FAQContainer>
        </FAQSection>
        
        <CTASection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Ready to Maximize Your Ad Performance?
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Let's discuss how our PPC advertising services can drive more qualified traffic and conversions for your business.
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
              Get a Free PPC Audit
            </CTAButton>
          </Link>
        </CTASection>
        
        <Footer />
      </ContentContainer>
    </PageContainer>
  );
};

export default PPCAdvertisingPage;
