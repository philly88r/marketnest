import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutPageContainer = styled.div`
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

const TeamSection = styled(Section)`
  background: rgba(255, 255, 255, 0.02);
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  margin-top: 60px;
  
  @media (max-width: 1200px) {
    gap: 30px;
  }
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const TeamMember = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const TeamMemberImage = styled(motion.div)`
  width: 200px;
  height: 200px;
  border-radius: 20px;
  background: linear-gradient(45deg, rgba(31, 83, 255, 0.3), rgba(255, 67, 163, 0.3));
  margin-bottom: 24px;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, rgba(31, 83, 255, 0.1), rgba(255, 67, 163, 0.1));
    z-index: 1;
  }
  
  @media (max-width: 992px) {
    width: 180px;
    height: 180px;
  }
  
  @media (max-width: 768px) {
    width: 160px;
    height: 160px;
  }
`;

const TeamMemberName = styled.h4`
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const TeamMemberRole = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const TeamMemberBio = styled.p`
  color: rgba(255, 255, 255, 0.81);
  font-size: 16px;
  line-height: 24px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 22px;
  }
`;

const ValuesSection = styled(Section)``;

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  margin-top: 60px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const ValueCard = styled(motion.div)`
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

const ValueIcon = styled.div`
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

const ValueTitle = styled.h4`
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 12px;
  }
`;

const ValueDescription = styled.p`
  color: rgba(255, 255, 255, 0.81);
  font-size: 16px;
  line-height: 26px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 24px;
  }
`;

const TestimonialsSection = styled(Section)`
  background: rgba(255, 255, 255, 0.02);
`;

const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  margin-top: 60px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const TestimonialCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 40px;
  position: relative;
  
  &::before {
    content: '"';
    position: absolute;
    top: 20px;
    left: 20px;
    font-size: 120px;
    line-height: 0;
    color: rgba(255, 255, 255, 0.1);
    font-family: serif;
  }
  
  @media (max-width: 768px) {
    padding: 30px;
    
    &::before {
      font-size: 80px;
    }
  }
`;

const TestimonialText = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  line-height: 32px;
  font-style: italic;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 16px;
    line-height: 28px;
  }
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
`;

const TestimonialAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: linear-gradient(45deg, rgba(31, 83, 255, 0.3), rgba(255, 67, 163, 0.3));
  margin-right: 16px;
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }
`;

const TestimonialInfo = styled.div``;

const TestimonialName = styled.h5`
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const TestimonialCompany = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const ClientsSection = styled(Section)``;

const ClientsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  margin-top: 60px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const ClientLogo = styled(motion.div)`
  height: 100px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-5px);
  }
  
  @media (max-width: 768px) {
    height: 80px;
  }
`;

const LogoPlaceholder = styled.div`
  color: white;
  font-weight: 600;
  font-size: 18px;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 16px;
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

const AboutPage: React.FC = () => {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      bio: "With over 15 years of experience in digital marketing, Sarah founded the agency with a vision to help businesses achieve measurable growth through data-driven strategies."
    },
    {
      name: "Michael Chen",
      role: "Creative Director",
      bio: "Michael brings his award-winning design expertise to lead our creative team, ensuring every project delivers both aesthetic excellence and strategic impact."
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Strategy",
      bio: "Emily's analytical approach to marketing challenges has helped our clients consistently outperform their industry benchmarks and achieve sustainable growth."
    },
    {
      name: "David Kim",
      role: "Technical Director",
      bio: "David oversees all technical implementations, ensuring our digital solutions are robust, scalable, and leverage the latest technologies for optimal performance."
    },
    {
      name: "Olivia Thompson",
      role: "Client Success Manager",
      bio: "Olivia works closely with our clients to understand their unique needs and ensure our strategies align perfectly with their business objectives."
    },
    {
      name: "James Wilson",
      role: "Analytics Lead",
      bio: "James transforms complex data into actionable insights, helping our clients make informed decisions that drive measurable results."
    }
  ];
  
  const values = [
    {
      icon: "🎯",
      title: "Results-Driven Approach",
      description: "We measure our success by the results we deliver for our clients. Every strategy and tactic is designed with clear objectives and measurable outcomes in mind."
    },
    {
      icon: "🔍",
      title: "Data-Informed Decisions",
      description: "We believe in the power of data to inform strategy. Our recommendations are always backed by thorough research and analysis, not just industry trends."
    },
    {
      icon: "🚀",
      title: "Continuous Innovation",
      description: "The digital landscape evolves rapidly, and so do we. We constantly explore new technologies and methodologies to keep our clients ahead of the curve."
    },
    {
      icon: "🤝",
      title: "Collaborative Partnership",
      description: "We see ourselves as an extension of your team. We work closely with you to understand your business and develop strategies that align with your goals."
    }
  ];
  
  const testimonials = [
    {
      text: "Working with this agency transformed our digital presence. Their strategic approach to our marketing challenges delivered measurable results that exceeded our expectations.",
      name: "Jennifer Lee",
      company: "CEO, TechSolutions Inc."
    },
    {
      text: "The team's deep understanding of our industry and target audience allowed them to create campaigns that truly resonated with our customers, resulting in a 215% increase in qualified leads.",
      name: "Robert Martinez",
      company: "Marketing Director, GrowthCorp"
    },
    {
      text: "Their data-driven approach to our e-commerce strategy helped us increase our conversion rate by 68% and reduce our customer acquisition costs significantly.",
      name: "Amanda Chen",
      company: "E-commerce Manager, StyleBoutique"
    },
    {
      text: "Not only did they deliver outstanding results, but they were also a pleasure to work with. Their transparent communication and proactive approach made the entire process seamless.",
      name: "Daniel Wilson",
      company: "COO, InnovateNow"
    }
  ];
  
  const clients = [
    "TechSolutions Inc.",
    "GrowthCorp",
    "StyleBoutique",
    "InnovateNow",
    "GlobalFinance",
    "HealthPlus",
    "EcoSmart",
    "TravelEase"
  ];
  
  return (
    <AboutPageContainer>
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
            We're a Team of Digital Marketing Experts
          </HeroTitle>
          <HeroSubtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Passionate about helping businesses grow through data-driven strategies and creative solutions
          </HeroSubtitle>
        </HeroSection>
        
        <Section>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Our Story
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Founded in 2015, our agency was born out of a simple observation: traditional marketing approaches were failing to keep pace with the rapidly evolving digital landscape. Our founder, Sarah Johnson, saw an opportunity to create an agency that would bridge this gap by combining data-driven insights with creative excellence.
          </Paragraph>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            What started as a small team of three passionate marketers has grown into a full-service digital marketing agency with a team of over 30 specialists across strategy, creative, development, and analytics. Throughout our growth, we've remained committed to our founding principle: delivering measurable results that drive real business growth.
          </Paragraph>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Today, we're proud to work with clients across diverse industries, from emerging startups to established enterprises. Our approach combines strategic thinking, creative innovation, and technical expertise to create digital experiences that engage audiences and drive conversions.
          </Paragraph>
        </Section>
        
        <ValuesSection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Our Core Values
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            These principles guide everything we do, from how we work with clients to how we develop our strategies and solutions.
          </Paragraph>
          
          <ValuesGrid>
            {values.map((value, index) => (
              <ValueCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <ValueIcon>{value.icon}</ValueIcon>
                <ValueTitle>{value.title}</ValueTitle>
                <ValueDescription>{value.description}</ValueDescription>
              </ValueCard>
            ))}
          </ValuesGrid>
        </ValuesSection>
        
        <TeamSection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Meet Our Team
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Our diverse team of experts brings together a wealth of experience across digital marketing, design, development, and analytics.
          </Paragraph>
          
          <TeamGrid>
            {teamMembers.map((member, index) => (
              <TeamMember
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
              >
                <TeamMemberImage 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
                <TeamMemberName>{member.name}</TeamMemberName>
                <TeamMemberRole>{member.role}</TeamMemberRole>
                <TeamMemberBio>{member.bio}</TeamMemberBio>
              </TeamMember>
            ))}
          </TeamGrid>
        </TeamSection>
        
        <TestimonialsSection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            What Our Clients Say
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Don't just take our word for it. Here's what our clients have to say about working with us.
          </Paragraph>
          
          <TestimonialsGrid>
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <TestimonialText>{testimonial.text}</TestimonialText>
                <TestimonialAuthor>
                  <TestimonialAvatar />
                  <TestimonialInfo>
                    <TestimonialName>{testimonial.name}</TestimonialName>
                    <TestimonialCompany>{testimonial.company}</TestimonialCompany>
                  </TestimonialInfo>
                </TestimonialAuthor>
              </TestimonialCard>
            ))}
          </TestimonialsGrid>
        </TestimonialsSection>
        
        <ClientsSection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Clients We've Worked With
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            We're proud to have partnered with these amazing companies to help them achieve their digital marketing goals.
          </Paragraph>
          
          <ClientsGrid>
            {clients.map((client, index) => (
              <ClientLogo
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <LogoPlaceholder>{client}</LogoPlaceholder>
              </ClientLogo>
            ))}
          </ClientsGrid>
        </ClientsSection>
        
        <CTASection>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Ready to Grow Your Business?
          </SectionTitle>
          <Paragraph
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Let's discuss how our data-driven strategies can help you achieve your business goals.
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
              Get in Touch
            </CTAButton>
          </Link>
        </CTASection>
        
        <Footer />
      </ContentContainer>
    </AboutPageContainer>
  );
};

export default AboutPage;
