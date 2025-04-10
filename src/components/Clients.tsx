import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const ClientsContainer = styled.section`
  padding: 100px 200px;
  position: relative;
  overflow: hidden;
  
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
  text-align: center;
  margin-bottom: 60px;
  
  @media (max-width: 992px) {
    font-size: 40px;
    margin-bottom: 40px;
  }
  
  @media (max-width: 768px) {
    font-size: 32px;
    margin-bottom: 30px;
  }
`;

const TestimonialsContainer = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 80px;
  
  @media (max-width: 992px) {
    margin-bottom: 60px;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 50px;
  }
`;

const TestimonialWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 250px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 300px;
  }
`;

const TestimonialCard = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const TestimonialControls = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
`;

const TestimonialDot = styled.button<{ active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.active 
    ? 'linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%)' 
    : 'rgba(255, 255, 255, 0.3)'};
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.2);
  }
`;

const ClientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const ClientAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }
`;

const ClientDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const ClientName = styled.h3`
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const ClientPosition = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const TestimonialText = styled.p`
  color: rgba(255, 255, 255, 0.81);
  font-size: 16px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  line-height: 26px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 24px;
  }
`;

const BrandsSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BrandsTitle = styled(motion.h3)`
  color: white;
  font-size: 32px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 40px;
  
  @media (max-width: 992px) {
    font-size: 28px;
    margin-bottom: 30px;
  }
  
  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 20px;
  }
`;

const BrandsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 40px;
  width: 100%;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
`;

const BrandLogo = styled(motion.div)`
  height: 80px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #FF43A3;
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(255, 67, 163, 0.2);
  }
  
  @media (max-width: 768px) {
    height: 60px;
  }
`;

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    position: "Marketing Director, TechCorp",
    text: "Their data-driven approach transformed our digital marketing strategy. We've seen a 40% increase in qualified leads and a significant boost in conversion rates since working with them."
  },
  {
    id: 2,
    name: "Michael Chen",
    position: "CEO, Innovate Solutions",
    text: "The analytics insights provided by their team helped us understand our audience better than ever before. Our ROI on digital campaigns has more than doubled in just six months."
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    position: "CMO, Global Retail",
    text: "Their team's creativity combined with analytical precision has been a game-changer for our brand. The personalized strategies they developed have significantly improved our market position."
  },
  {
    id: 4,
    name: "David Wilson",
    position: "Founder, StartUp Ventures",
    text: "Working with this agency has been the best marketing decision we've made. Their strategic approach and attention to detail have helped us scale our business beyond expectations."
  }
];

const brands = [
  "TechGiant", "InnovateCorp", "GlobalBrand", "FutureTech", 
  "MediaMax", "DigitalSolutions", "CreativeStudio", "DataDrive", 
  "MarketLeaders", "TopIndustry"
];

const Clients: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <ClientsContainer>
      <SectionTitle
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        What Our Clients Say
      </SectionTitle>
      
      <TestimonialsContainer>
        <TestimonialWrapper>
          <AnimatePresence mode="wait">
            <TestimonialCard
              key={testimonials[currentTestimonial].id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <ClientInfo>
                <ClientAvatar />
                <ClientDetails>
                  <ClientName>{testimonials[currentTestimonial].name}</ClientName>
                  <ClientPosition>{testimonials[currentTestimonial].position}</ClientPosition>
                </ClientDetails>
              </ClientInfo>
              <TestimonialText>
                "{testimonials[currentTestimonial].text}"
              </TestimonialText>
            </TestimonialCard>
          </AnimatePresence>
        </TestimonialWrapper>
        
        <TestimonialControls>
          {testimonials.map((_, index) => (
            <TestimonialDot 
              key={index}
              active={currentTestimonial === index}
              onClick={() => setCurrentTestimonial(index)}
            />
          ))}
        </TestimonialControls>
      </TestimonialsContainer>
      
      <BrandsSection>
        <BrandsTitle
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Trusted by Leading Brands
        </BrandsTitle>
        
        <BrandsGrid>
          {brands.map((brand, index) => (
            <BrandLogo
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(255, 67, 163, 0.2)" }}
            >
              {brand}
            </BrandLogo>
          ))}
        </BrandsGrid>
      </BrandsSection>
    </ClientsContainer>
  );
};

export default Clients;
