import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';

// Main container for the hero section
const HeroContainer = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 20px 40px;
  overflow: hidden;
  background-color: #080B16;
`;

// Background blob elements
const Blob = styled(motion.div)<{ $top: string; $left: string; $width: string; $height: string; $background: string }>`
  position: absolute;
  width: ${props => props.$width};
  height: ${props => props.$height};
  top: ${props => props.$top};
  left: ${props => props.$left};
  border-radius: 50%;
  background: ${props => props.$background};
  filter: blur(60px);
  opacity: 0.4;
  z-index: 1;
`;

// Lava layout grid
const LavaLayout = styled.div`
  position: relative;
  width: 100%;
  max-width: 1400px;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minmax(50px, auto);
  gap: 20px;
  z-index: 5;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(8, 1fr);
    gap: 15px;
  }
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
`;

// Heading section
const HeadingSection = styled(motion.div)`
  grid-column: 2 / 9;
  grid-row: 1 / 3;
  border-radius: 30px 80px 120px 20px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px;
  z-index: 5;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      rgba(31, 83, 255, 0.1) 0%,
      rgba(255, 67, 163, 0.05) 100%
    );
    z-index: -1;
  }
  
  @media (max-width: 1200px) {
    grid-column: 1 / 6;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    border-radius: 30px;
  }
`;

const HeadingAccent = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #1F53FF, #FF43A3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

// Image blob section
const ImageBlob = styled(motion.div)`
  grid-column: 8 / 13;
  grid-row: 1 / 4;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 4;
  
  @media (max-width: 1200px) {
    grid-column: 5 / 9;
  }
  
  @media (max-width: 768px) {
    order: -1;
    margin: 0 auto;
    max-width: 300px;
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BlobImage = styled(motion.img)`
  width: 90%;
  height: auto;
  object-fit: contain;
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

// Description section
const DescriptionSection = styled(motion.div)`
  grid-column: 2 / 8;
  grid-row: 3 / 5;
  border-radius: 80px 30px 60px 40px;
  background: rgba(31, 83, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px;
  z-index: 3;
  
  @media (max-width: 1200px) {
    grid-column: 1 / 5;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    border-radius: 30px;
  }
`;

const Description = styled.p`
  font-size: 1.2rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1.5rem;
`;

// CTA section
const CTASection = styled(motion.div)`
  grid-column: 8 / 12;
  grid-row: 4 / 6;
  border-radius: 60px 40px 30px 70px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 2;
  
  @media (max-width: 1200px) {
    grid-column: 5 / 9;
    grid-row: 4 / 6;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    border-radius: 30px;
  }
`;

const CTAHeading = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
`;

const CTAButton = styled(motion.a)`
  background: linear-gradient(90deg, #1F53FF, #FF43A3);
  border: none;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  padding: 15px 30px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  text-align: center;
  margin-top: 20px;
  box-shadow: 0 10px 20px rgba(31, 83, 255, 0.3);
  display: inline-block;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(31, 83, 255, 0.4);
  }
`;

// Stats section
const StatsSection = styled(motion.div)`
  grid-column: 2 / 7;
  grid-row: 5 / 7;
  border-radius: 40px 90px 60px 50px;
  background: rgba(255, 67, 163, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 2;
  
  @media (max-width: 1200px) {
    grid-column: 1 / 5;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    border-radius: 30px;
    flex-wrap: wrap;
  }
`;

const Stat = styled.div`
  text-align: center;
  padding: 0 15px;
  
  @media (max-width: 768px) {
    width: 50%;
    margin-bottom: 20px;
  }
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(90deg, #1F53FF, #FF43A3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
`;

const Hero: React.FC = () => {
  return (
    <HeroContainer id="home">
      {/* Background blobs */}
      <Blob 
        $top="-150px" 
        $left="-100px" 
        $width="500px" 
        $height="500px" 
        $background="linear-gradient(135deg, #FF43A3, #1F53FF)" 
        animate={{
          x: [0, 50, -30, 20],
          y: [0, 50, 20, -40],
          rotate: [0, 10, -5, 5],
          scale: [1, 1.1, 0.9, 1]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <Blob 
        $top="auto" 
        $left="auto" 
        $width="400px" 
        $height="400px" 
        $background="linear-gradient(135deg, #1F53FF, #FF43A3)" 
        style={{ bottom: "-100px", right: "-100px" }}
        animate={{
          x: [0, -50, 30, -20],
          y: [0, -50, -20, 40],
          rotate: [0, -10, 5, -5],
          scale: [1, 0.9, 1.1, 1]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <Blob 
        $top="40%" 
        $left="30%" 
        $width="300px" 
        $height="300px" 
        $background="linear-gradient(135deg, #1F53FF, #FF43A3)" 
        animate={{
          x: [0, 30, -50, 20],
          y: [0, -20, -50, 30],
          rotate: [0, 5, -10, 5],
          scale: [1, 1.1, 0.9, 1.05]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      <LavaLayout>
        {/* Heading Section */}
        <HeadingSection
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <HeadingAccent>Breaking the mold</HeadingAccent>
          <Title>Marketing That<br/>Flows Differently</Title>
        </HeadingSection>
        
        {/* Image Blob */}
        <ImageBlob
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <ImageContainer>
            <BlobImage 
              src="/marketing-visual.png" 
              alt="Marketing visualization" 
              animate={{
                borderRadius: [
                  "40% 60% 70% 30% / 40% 50% 60% 50%",
                  "60% 40% 30% 70% / 60% 30% 70% 40%",
                  "30% 60% 70% 40% / 50% 60% 30% 60%",
                  "60% 40% 50% 50% / 30% 60% 40% 70%",
                  "40% 60% 30% 70% / 50% 30% 70% 40%"
                ]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          </ImageContainer>
        </ImageBlob>
        
        {/* Description Section */}
        <DescriptionSection
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Description>We don't fit in rigid boxes because your brand doesn't either. Our organic approach adapts to your unique needs, flowing around obstacles and filling gaps other agencies miss.</Description>
          <Description>Like lava reshaping landscapes, we transform your market presence with strategies that mold perfectly to your vision.</Description>
        </DescriptionSection>
        
        {/* CTA Section */}
        <CTASection
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <CTAHeading>Ready to break free from cookie-cutter marketing?</CTAHeading>
          <CTAButton 
            href="#contact" 
            whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(31, 83, 255, 0.4)" }}
          >
            Let's Flow Together
          </CTAButton>
        </CTASection>
        
        {/* Stats Section */}
        <StatsSection
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Stat>
            <StatValue>87%</StatValue>
            <StatLabel>Higher Engagement</StatLabel>
          </Stat>
          <Stat>
            <StatValue>43%</StatValue>
            <StatLabel>More Conversions</StatLabel>
          </Stat>
          <Stat>
            <StatValue>3x</StatValue>
            <StatLabel>Better ROI</StatLabel>
          </Stat>
        </StatsSection>
      </LavaLayout>
    </HeroContainer>
  );
};

export default Hero;
