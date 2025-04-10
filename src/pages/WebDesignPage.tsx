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

const PortfolioSection = styled(Section)`
  background: rgba(255, 255, 255, 0.02);
`;

const PortfolioGrid = styled.div`
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

const PortfolioItem = styled(motion.div)`
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  
  &:hover img {
    transform: scale(1.05);
  }
  
  &:hover .overlay {
    opacity: 1;
  }
`;

const PortfolioImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
`;

const PortfolioOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 20px;
  text-align: center;
`;

const PortfolioTitle = styled.h4`
  color: white;
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 10px;
`;

const PortfolioCategory = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-bottom: 15px;
`;

const ViewButton = styled.button`
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
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

const TechnologiesSection = styled(Section)`
  background: rgba(255, 255, 255, 0.02);
`;

const TechnologiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  margin-top: 60px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const TechnologyCard = styled(motion.div)`
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

const TechnologyIcon = styled.div`
  font-size: 36px;
  margin-bottom: 20px;
`;

const TechnologyName = styled.h4`
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
`;

const TechnologyDescription = styled.p`
  color: rgba(255, 255, 255, 0.81);
  font-size: 14px;
  line-height: 22px;
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

const WebDesignPage: React.FC = () => {
  const webServices = [
    {
      icon: "🎨",
      title: "UI/UX Design",
      description: "We create intuitive, engaging user experiences and visually stunning interfaces that captivate your audience and drive conversions."
    },
    {
      icon: "💻",
      title: "Website Development",
      description: "Our developers build responsive, high-performance websites that look great on all devices and provide seamless user experiences."
    },
    {
      icon: "🛒",
      title: "E-commerce Solutions",
      description: "We develop custom e-commerce platforms that drive sales, streamline operations, and deliver exceptional shopping experiences."
    },
    {
      icon: "📱",
      title: "Mobile-First Design",
      description: "We ensure your website performs flawlessly on mobile devices, providing an optimal experience for the growing mobile audience."
    },
    {
      icon: "⚡",
      title: "Performance Optimization",
      description: "We optimize your website for speed, ensuring fast load times that improve user experience and search engine rankings."
    },
    {
      icon: "🔒",
      title: "Security & Maintenance",
      description: "We implement robust security measures and provide ongoing maintenance to keep your website secure, updated, and performing at its best."
    }
  ];
  
  const portfolioItems = [
    {
      image: "https://via.placeholder.com/600x400/1a1a1a/808080?text=E-commerce+Website",
      title: "Luxury Fashion E-commerce",
      category: "E-commerce / Shopify",
      description: "A premium shopping experience for a high-end fashion brand."
    },
    {
      image: "https://via.placeholder.com/600x400/1a1a1a/808080?text=SaaS+Website",
      title: "SaaS Platform Dashboard",
      category: "Web Application / React",
      description: "An intuitive dashboard for a leading SaaS company."
    },
    {
      image: "https://via.placeholder.com/600x400/1a1a1a/808080?text=Corporate+Website",
      title: "Financial Services Website",
      category: "Corporate / WordPress",
      description: "A professional website for a financial advisory firm."
    },
    {
      image: "https://via.placeholder.com/600x400/1a1a1a/808080?text=Restaurant+Website",
      title: "Fine Dining Restaurant",
      category: "Hospitality / Custom",
      description: "An elegant website for a Michelin-star restaurant."
    },
    {
      image: "https://via.placeholder.com/600x400/1a1a1a/808080?text=Real+Estate+Website",
      title: "Luxury Real Estate Platform",
      category: "Real Estate / Custom CMS",
      description: "A property listing platform for high-end real estate."
    },
    {
      image: "https://via.placeholder.com/600x400/1a1a1a/808080?text=Nonprofit+Website",
      title: "Environmental Nonprofit",
      category: "Nonprofit / WordPress",
      description: "An impactful website for an environmental organization."
    }
  ];
  
  const designProcess = [
    {
      number: 1,
      title: "Discovery & Strategy",
      description: "We begin by understanding your business goals, target audience, and competitive landscape. We conduct thorough research and develop a strategic roadmap for your web project."
    },
    {
      number: 2,
      title: "Wireframing & Prototyping",
      description: "We create wireframes and interactive prototypes to visualize the user experience and information architecture. This allows us to refine the UX before moving to visual design."
    },
    {
      number: 3,
      title: "UI Design & Branding",
      description: "Our designers develop visually stunning interfaces that align with your brand identity. We focus on creating a cohesive visual language that enhances user engagement."
    },
    {
      number: 4,
      title: "Development & Integration",
      description: "Our developers bring the designs to life, building responsive, high-performance websites. We integrate necessary functionality, CMS systems, and third-party services."
    },
    {
      number: 5,
      title: "Testing & Quality Assurance",
      description: "We conduct rigorous testing across devices and browsers to ensure your website functions flawlessly. We optimize for performance, accessibility, and SEO."
    },
    {
      number: 6,
      title: "Launch & Ongoing Support",
      description: "After a successful launch, we provide ongoing maintenance and support to ensure your website continues to perform optimally and evolve with your business needs."
    }
  ];
  
  const technologies = [
    {
      icon: "⚛️",
      name: "React",
      description: "For building dynamic, high-performance user interfaces"
    },
    {
      icon: "🔷",
      name: "WordPress",
      description: "Powerful CMS for content-driven websites"
    },
    {
      icon: "🛒",
      name: "Shopify",
      description: "E-commerce platform for online stores"
    },
    {
      icon: "🌐",
      name: "Next.js",
      description: "React framework for production-grade applications"
    },
    {
      icon: "🎨",
      name: "Figma",
      description: "Collaborative design and prototyping tool"
    },
    {
      icon: "📱",
      name: "React Native",
      description: "For cross-platform mobile applications"
    },
    {
      icon: "🔍",
      name: "SEO Tools",
      description: "For search engine optimization"
    },
    {
      icon: "📊",
      name: "Analytics",
      description: "For data-driven insights and improvements"
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
            Web Design & Development
          </HeroTitle>
          <HeroSubtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Creating stunning, high-performance websites that drive results
          </HeroSubtitle>
        </HeroSection>
        
        <Section>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Websites That Work As Hard As You Do
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your website is often the first impression potential customers have of your business. We design and develop websites that not only look stunning but also drive meaningful business results through strategic design, seamless functionality, and optimal user experiences.
          </Paragraph>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            From custom website development and e-commerce solutions to UI/UX design and ongoing maintenance, our comprehensive web services ensure your digital presence effectively supports your business goals.
          </Paragraph>
          
          <ServicesGrid>
            {webServices.map((service, index) => (
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
        
        <PortfolioSection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Our Portfolio
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            We've designed and developed websites for clients across various industries, from e-commerce and SaaS to corporate and nonprofit organizations. Here's a selection of our recent work.
          </Paragraph>
          
          <PortfolioGrid>
            {portfolioItems.map((item, index) => (
              <PortfolioItem
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
              >
                <PortfolioImage src={item.image} alt={item.title} />
                <PortfolioOverlay className="overlay">
                  <PortfolioTitle>{item.title}</PortfolioTitle>
                  <PortfolioCategory>{item.category}</PortfolioCategory>
                  <ViewButton>View Project</ViewButton>
                </PortfolioOverlay>
              </PortfolioItem>
            ))}
          </PortfolioGrid>
        </PortfolioSection>
        
        <ProcessSection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Our Web Design Process
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            We follow a systematic approach to web design and development that ensures strategic alignment, creative excellence, and technical precision. Our process is designed to deliver websites that exceed expectations and drive business results.
          </Paragraph>
          
          <ProcessSteps>
            {designProcess.map((step, index) => (
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
        
        <TechnologiesSection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Technologies We Use
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            We leverage the latest technologies and platforms to build websites that are fast, secure, and scalable. Our technology stack is carefully selected to meet the specific needs of each project.
          </Paragraph>
          
          <TechnologiesGrid>
            {technologies.map((tech, index) => (
              <TechnologyCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <TechnologyIcon>{tech.icon}</TechnologyIcon>
                <TechnologyName>{tech.name}</TechnologyName>
                <TechnologyDescription>{tech.description}</TechnologyDescription>
              </TechnologyCard>
            ))}
          </TechnologiesGrid>
        </TechnologiesSection>
        
        <CTASection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Ready to Transform Your Digital Presence?
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Let's discuss how our web design and development services can help you create a stunning, high-performance website that drives business growth.
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
              Get a Free Website Audit
            </CTAButton>
          </Link>
        </CTASection>
        
        <Footer />
      </ContentContainer>
    </PageContainer>
  );
};

export default WebDesignPage;
