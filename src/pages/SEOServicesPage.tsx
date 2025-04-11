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
  background: radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255, 66.94, 163.42, 0.17) 0%, rgba(255, 66.94, 163.42, 0) 100%);
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
  padding-top: 80px; /* Adjusted space for fixed header */
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

// Commented out as currently unused
// const SectionSubtitle = styled(motion.h3)`
//   color: white;
//   font-size: 32px;
//   font-weight: 600;
//   margin-bottom: 16px;
//   
//   @media (max-width: 992px) {
//     font-size: 28px;
//     margin-bottom: 14px;
//   }
//   
//   @media (max-width: 768px) {
//     font-size: 24px;
//     margin-bottom: 12px;
//   }
// `;

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

const SEOServicesPage: React.FC = () => {
  const [openFAQ, setOpenFAQ] = React.useState<number | null>(null);
  
  const toggleFAQ = (index: number) => {
    if (openFAQ === index) {
      setOpenFAQ(null);
    } else {
      setOpenFAQ(index);
    }
  };
  
  const seoServices = [
    {
      icon: "🔍",
      title: "Keyword Research & Strategy",
      description: "We identify the most valuable keywords for your business, analyzing search volume, competition, and user intent to create a comprehensive SEO strategy."
    },
    {
      icon: "📊",
      title: "On-Page SEO Optimization",
      description: "We optimize your website's content, meta tags, headings, and internal linking structure to improve relevance and visibility for target keywords."
    },
    {
      icon: "🔗",
      title: "Link Building",
      description: "We develop high-quality backlinks from authoritative websites in your industry to boost your domain authority and search engine rankings."
    },
    {
      icon: "📱",
      title: "Local SEO",
      description: "We optimize your online presence for local searches, including Google My Business optimization, local citations, and location-specific content."
    }
  ];
  
  const seoProcess = [
    {
      number: 1,
      title: "Comprehensive SEO Audit",
      description: "We start by analyzing your current website performance, identifying technical issues, content gaps, and opportunities for improvement. Our audit covers everything from site structure and speed to content quality and backlink profile."
    },
    {
      number: 2,
      title: "Keyword Research & Competitive Analysis",
      description: "We identify the most valuable keywords for your business based on search volume, competition, and user intent. We also analyze your competitors' strategies to find opportunities to outrank them."
    },
    {
      number: 3,
      title: "On-Page & Technical SEO Implementation",
      description: "We optimize your website's content, meta tags, headings, and internal linking structure. We also address technical issues like site speed, mobile-friendliness, and crawlability to ensure search engines can properly index your site."
    },
    {
      number: 4,
      title: "Content Strategy & Creation",
      description: "We develop a content strategy aligned with your target keywords and user intent. Our team creates high-quality, optimized content that engages your audience and signals relevance to search engines."
    },
    {
      number: 5,
      title: "Link Building & Off-Page SEO",
      description: "We build high-quality backlinks from authoritative websites in your industry through outreach, content promotion, and digital PR strategies."
    },
    {
      number: 6,
      title: "Monitoring & Continuous Optimization",
      description: "We track your rankings, traffic, and conversions, making data-driven adjustments to your SEO strategy. We provide regular reports on your progress and continuously optimize for better results."
    }
  ];
  
  const seoResults = [
    {
      number: "89%",
      text: "Average increase in organic traffic for our clients within 6 months"
    },
    {
      number: "65%",
      text: "Average improvement in conversion rates from organic search"
    },
    {
      number: "40+",
      text: "First page rankings achieved for our clients in competitive industries"
    },
    {
      number: "3.2x",
      text: "Average return on investment from our SEO services"
    },
    {
      number: "74%",
      text: "Reduction in cost per acquisition compared to paid search"
    },
    {
      number: "94%",
      text: "Client retention rate, reflecting our consistent results"
    }
  ];
  
  const faqItems = [
    {
      question: "How long does it take to see results from SEO?",
      answer: "SEO is a long-term strategy that typically takes 3-6 months to show significant results. However, the timeline can vary based on your website's current state, competition in your industry, and the aggressiveness of your SEO strategy. We focus on delivering sustainable, long-term results rather than quick fixes that might harm your site in the long run."
    },
    {
      question: "How do you measure the success of your SEO services?",
      answer: "We track multiple metrics to measure SEO success, including organic traffic growth, keyword rankings, conversion rates, bounce rates, and return on investment. We provide comprehensive monthly reports that show your progress across these key performance indicators and explain what the numbers mean for your business."
    },
    {
      question: "Do you guarantee first-page rankings?",
      answer: "No reputable SEO agency can guarantee specific rankings, as search algorithms consider hundreds of factors and are constantly evolving. However, we have a proven track record of achieving first-page rankings for our clients through ethical, white-hat SEO practices. We focus on sustainable strategies that build long-term value rather than shortcuts that risk penalties."
    },
    {
      question: "What makes your SEO services different from other agencies?",
      answer: "Our approach combines technical expertise with creative content strategies and data-driven decision-making. We don't use one-size-fits-all solutions; instead, we develop customized strategies based on your specific business goals, industry, and target audience. We also prioritize transparency, providing detailed reports and clear explanations of our strategies and results."
    },
    {
      question: "Do you handle local SEO for businesses with physical locations?",
      answer: "Yes, we offer specialized local SEO services for businesses targeting specific geographic areas. This includes optimizing your Google My Business profile, building local citations, creating location-specific content, and implementing local schema markup. Our local SEO strategies help you attract more customers from your service areas."
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
            Search Engine Optimization Services
          </HeroTitle>
          <HeroSubtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Drive more qualified traffic and increase conversions with our data-driven SEO strategies
          </HeroSubtitle>
        </HeroSection>
        
        <Section>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Boost Your Online Visibility
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            In today's digital landscape, ranking high in search engine results is essential for business growth. Our comprehensive SEO services are designed to increase your website's visibility, drive targeted traffic, and generate more leads and sales.
          </Paragraph>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            We combine technical expertise, content strategy, and data analysis to create customized SEO solutions that deliver measurable results. Our team stays up-to-date with the latest algorithm changes and industry trends to ensure your website maintains and improves its rankings over time.
          </Paragraph>
          
          <ServicesGrid>
            {seoServices.map((service, index) => (
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
            Our SEO Process
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            We follow a systematic approach to SEO that has been refined through years of experience and hundreds of successful client projects. Our process is transparent, data-driven, and focused on delivering measurable results.
          </Paragraph>
          
          <ProcessSteps>
            {seoProcess.map((step, index) => (
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
            Results That Speak for Themselves
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Our SEO strategies have helped businesses of all sizes achieve significant improvements in their online visibility, traffic, and conversions. Here are some of the results we've delivered for our clients.
          </Paragraph>
          
          <ResultsGrid>
            {seoResults.map((result, index) => (
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
            Get answers to common questions about our SEO services and approach.
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
            Ready to Improve Your Search Rankings?
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Let's discuss how our SEO services can help you achieve your business goals.
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
              Get a Free SEO Audit
            </CTAButton>
          </Link>
        </CTASection>
        
        <Footer />
      </ContentContainer>
    </PageContainer>
  );
};

export default SEOServicesPage;
