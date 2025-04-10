import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const HeroContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 280px 200px 100px;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 1200px) {
    padding: 260px 100px 80px;
  }
  
  @media (max-width: 992px) {
    padding: 240px 60px 60px;
  }
  
  @media (max-width: 768px) {
    padding: 220px 20px 60px;
  }
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 24px;
  max-width: 100%;
`;

const Title = styled(motion.h1)`
  color: white;
  text-align: center;
  font-size: 80px;
  font-weight: 700;
  line-height: 96px;
  max-width: 100%;
  
  @media (max-width: 1200px) {
    font-size: 64px;
    line-height: 78px;
  }
  
  @media (max-width: 992px) {
    font-size: 48px;
    line-height: 58px;
  }
  
  @media (max-width: 768px) {
    font-size: 36px;
    line-height: 44px;
  }
`;

const Highlight = styled.span`
  background: linear-gradient(90deg, #0df9b6 0%, #de681d 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Description = styled(motion.p)`
  color: rgba(255, 255, 255, 0.81);
  text-align: center;
  font-size: 20px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  line-height: 32px;
  max-width: 800px;
  
  @media (max-width: 992px) {
    font-size: 18px;
    line-height: 28px;
    max-width: 600px;
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
    line-height: 26px;
    max-width: 100%;
    padding: 0 10px;
  }
`;

const ButtonContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-top: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }
`;

const PrimaryButton = styled.button`
  display: flex;
  padding: 16px 32px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  color: white;
  font-size: 18px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    font-size: 16px;
    padding: 14px 20px;
  }
`;

const SecondaryButton = styled.button`
  display: flex;
  padding: 16px 32px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #FF43A3;
    color: #FF43A3;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    font-size: 16px;
    padding: 14px 20px;
  }
`;

const Hero: React.FC = () => {
  return (
    <HeroContainer>
      <HeroContent>
        <Title 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Elevate Your Brand with <Highlight>Data-Driven</Highlight> Marketing
        </Title>
        
        <Description
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          We combine creative strategies with analytical precision to deliver exceptional results for your business. Our digital marketing solutions are tailored to your unique goals and audience.
        </Description>
        
        <ButtonContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <PrimaryButton>Get Started</PrimaryButton>
          <SecondaryButton>Learn More</SecondaryButton>
        </ButtonContainer>
      </HeroContent>
    </HeroContainer>
  );
};

export default Hero;
