import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const DecisionAgencyContainer = styled.section`
  padding: 100px 200px;
  display: flex;
  flex-direction: column;
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
  margin-bottom: 24px;
  max-width: 800px;
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

const SectionDescription = styled(motion.p)`
  color: rgba(255, 255, 255, 0.81);
  font-size: 20px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  line-height: 32px;
  margin-bottom: 60px;
  max-width: 800px;
  
  @media (max-width: 992px) {
    font-size: 18px;
    line-height: 28px;
    margin-bottom: 40px;
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
    line-height: 26px;
    margin-bottom: 30px;
  }
`;

const FeaturesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  margin-bottom: 60px;
  
  @media (max-width: 768px) {
    gap: 30px;
    margin-bottom: 40px;
  }
`;

const FeatureItem = styled(motion.div)`
  width: calc(50% - 20px);
  display: flex;
  gap: 24px;
  padding: 24px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 992px) {
    width: 100%;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }
`;

const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(
      transparent, 
      rgba(255, 255, 255, 0.1), 
      transparent 30%
    );
    animation: rotate 4s linear infinite;
  }
  
  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

const IconCircle = styled(motion.div)`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
  }
`;

const FeatureIcon = styled.div`
  color: white;
  font-size: 24px;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const FeatureContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FeatureTitle = styled.h3`
  color: white;
  font-size: 24px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const FeatureDescription = styled.p`
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

const CaseStudySection = styled(motion.div)`
  margin-top: 40px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

const CaseStudyTitle = styled.h3`
  color: white;
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const CaseStudyContent = styled.div`
  display: flex;
  gap: 40px;
  
  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

const CaseStudyText = styled.div`
  flex: 1;
`;

const CaseStudyDescription = styled.p`
  color: rgba(255, 255, 255, 0.81);
  font-size: 18px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  line-height: 28px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    font-size: 16px;
    line-height: 26px;
  }
`;

const CaseStudyStats = styled.div`
  display: flex;
  gap: 30px;
  margin-top: 30px;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 20px;
  }
`;

const StatBox = styled(motion.div)`
  padding: 20px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  min-width: 120px;
  
  @media (max-width: 768px) {
    min-width: calc(50% - 10px);
  }
`;

const StatValue = styled.div`
  color: white;
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 400;
`;

const CaseStudyImage = styled(motion.div)`
  flex: 1;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  
  @media (max-width: 992px) {
    height: 250px;
  }
  
  @media (max-width: 768px) {
    height: 200px;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    overflow-x: auto;
    padding-bottom: 10px;
    margin-bottom: 20px;
    
    &::-webkit-scrollbar {
      height: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }
  }
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  background: ${props => props.active ? 'linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%)' : 'rgba(255, 255, 255, 0.05)'};
  border: none;
  border-radius: 20px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%)' : 'rgba(255, 255, 255, 0.1)'};
  }
  
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 14px;
  }
`;

const AnimatedGraphic = styled(motion.div)`
  margin-top: 60px;
  width: 100%;
  height: 300px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 200px;
  }
`;

const GraphicBar = styled(motion.div)<{ height: string; color: string }>`
  position: absolute;
  bottom: 0;
  width: 20px;
  height: ${props => props.height};
  background: ${props => props.color};
  border-radius: 4px 4px 0 0;
`;

const GraphicCircle = styled(motion.div)<{ size: string; color: string } & React.ComponentProps<typeof motion.div>>`
  position: absolute;
  width: ${props => props.size};
  height: ${props => props.size};
  border-radius: 50%;
  background: ${props => props.color};
`;

const GraphicLine = styled(motion.div)<{ width: string; color: string }>`
  position: absolute;
  height: 2px;
  width: ${props => props.width};
  background: ${props => props.color};
`;

const DataLabel = styled(motion.div)`
  position: absolute;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: 500;
`;

const DecisionAgency: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('ecommerce');
  
  const caseStudies = {
    ecommerce: {
      title: "E-commerce Revenue Growth",
      description: "We helped an online retailer increase their conversion rate and average order value through targeted marketing campaigns and website optimization.",
      stats: [
        { value: "147%", label: "Revenue Increase" },
        { value: "89%", label: "Traffic Growth" },
        { value: "3.2x", label: "ROI" }
      ],
      image: "ecommerce-case-study.jpg"
    },
    b2b: {
      title: "B2B Lead Generation",
      description: "Our data-driven approach helped a B2B software company generate high-quality leads and improve their sales pipeline efficiency.",
      stats: [
        { value: "215%", label: "Lead Increase" },
        { value: "42%", label: "Cost Reduction" },
        { value: "4.5x", label: "Conversion Rate" }
      ],
      image: "b2b-case-study.jpg"
    },
    saas: {
      title: "SaaS Customer Acquisition",
      description: "We implemented a multi-channel strategy for a SaaS company to reduce customer acquisition costs and increase lifetime value.",
      stats: [
        { value: "68%", label: "CAC Reduction" },
        { value: "127%", label: "User Growth" },
        { value: "2.8x", label: "LTV Increase" }
      ],
      image: "saas-case-study.jpg"
    }
  };
  
  const activeCase = caseStudies[activeTab as keyof typeof caseStudies];
  
  const featureIcons = ["📊", "👥", "🔍", "📈"];
  
  return (
    <DecisionAgencyContainer>
      <SectionTitle
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        Data-Driven Decision Making for Your Business
      </SectionTitle>
      
      <SectionDescription
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        We leverage advanced analytics and market insights to create strategies that drive measurable results. Our approach combines creativity with data to optimize your marketing campaigns.
      </SectionDescription>
      
      <FeaturesContainer>
        <FeatureItem
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          <IconContainer>
            <IconCircle
              whileHover={{ rotate: 360 }}
              transition={{ duration: 1 }}
            >
              <FeatureIcon>{featureIcons[0]}</FeatureIcon>
            </IconCircle>
          </IconContainer>
          <FeatureContent>
            <FeatureTitle>Comprehensive Analytics</FeatureTitle>
            <FeatureDescription>
              Track and analyze every aspect of your marketing campaigns with our detailed analytics dashboard, providing real-time insights into performance metrics.
            </FeatureDescription>
          </FeatureContent>
        </FeatureItem>
        
        <FeatureItem
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
        >
          <IconContainer>
            <IconCircle
              whileHover={{ rotate: 360 }}
              transition={{ duration: 1 }}
            >
              <FeatureIcon>{featureIcons[1]}</FeatureIcon>
            </IconCircle>
          </IconContainer>
          <FeatureContent>
            <FeatureTitle>Audience Segmentation</FeatureTitle>
            <FeatureDescription>
              Target the right customers with precision using our advanced audience segmentation tools, ensuring your message reaches those most likely to convert.
            </FeatureDescription>
          </FeatureContent>
        </FeatureItem>
        
        <FeatureItem
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <IconContainer>
            <IconCircle
              whileHover={{ rotate: 360 }}
              transition={{ duration: 1 }}
            >
              <FeatureIcon>{featureIcons[2]}</FeatureIcon>
            </IconCircle>
          </IconContainer>
          <FeatureContent>
            <FeatureTitle>Competitive Analysis</FeatureTitle>
            <FeatureDescription>
              Stay ahead of your competition with our in-depth market analysis, identifying opportunities and threats in your industry landscape.
            </FeatureDescription>
          </FeatureContent>
        </FeatureItem>
        
        <FeatureItem
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <IconContainer>
            <IconCircle
              whileHover={{ rotate: 360 }}
              transition={{ duration: 1 }}
            >
              <FeatureIcon>{featureIcons[3]}</FeatureIcon>
            </IconCircle>
          </IconContainer>
          <FeatureContent>
            <FeatureTitle>Performance Reporting</FeatureTitle>
            <FeatureDescription>
              Receive clear, actionable reports that translate complex data into strategic insights, helping you make informed business decisions.
            </FeatureDescription>
          </FeatureContent>
        </FeatureItem>
      </FeaturesContainer>
      
      <CaseStudySection
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <CaseStudyTitle>Success Stories</CaseStudyTitle>
        
        <TabsContainer>
          <Tab 
            active={activeTab === 'ecommerce'} 
            onClick={() => setActiveTab('ecommerce')}
          >
            E-commerce
          </Tab>
          <Tab 
            active={activeTab === 'b2b'} 
            onClick={() => setActiveTab('b2b')}
          >
            B2B
          </Tab>
          <Tab 
            active={activeTab === 'saas'} 
            onClick={() => setActiveTab('saas')}
          >
            SaaS
          </Tab>
        </TabsContainer>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CaseStudyContent>
              <CaseStudyText>
                <CaseStudyDescription>
                  {activeCase.description}
                </CaseStudyDescription>
                
                <CaseStudyStats>
                  {activeCase.stats.map((stat, index) => (
                    <StatBox
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <StatValue>{stat.value}</StatValue>
                      <StatLabel>{stat.label}</StatLabel>
                    </StatBox>
                  ))}
                </CaseStudyStats>
              </CaseStudyText>
              
              <CaseStudyImage
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  background: 'linear-gradient(45deg, rgba(31, 83, 255, 0.3), rgba(255, 67, 163, 0.3))',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '24px',
                  color: 'white'
                }}>
                  {activeCase.title}
                </div>
              </CaseStudyImage>
            </CaseStudyContent>
          </motion.div>
        </AnimatePresence>
      </CaseStudySection>
      
      <AnimatedGraphic
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated bars */}
        <GraphicBar 
          height="60%" 
          color="linear-gradient(180deg, #1F53FF 0%, rgba(31, 83, 255, 0.3) 100%)"
          initial={{ height: "0%" }}
          whileInView={{ height: "60%" }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{ left: "10%" }}
        />
        <GraphicBar 
          height="80%" 
          color="linear-gradient(180deg, #FF43A3 0%, rgba(255, 67, 163, 0.3) 100%)"
          initial={{ height: "0%" }}
          whileInView={{ height: "80%" }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          style={{ left: "20%" }}
        />
        <GraphicBar 
          height="40%" 
          color="linear-gradient(180deg, #4ADE80 0%, rgba(74, 222, 128, 0.3) 100%)"
          initial={{ height: "0%" }}
          whileInView={{ height: "40%" }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
          style={{ left: "30%" }}
        />
        <GraphicBar 
          height="90%" 
          color="linear-gradient(180deg, #FF43A3 0%, rgba(255, 67, 163, 0.3) 100%)"
          initial={{ height: "0%" }}
          whileInView={{ height: "90%" }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8 }}
          style={{ left: "40%" }}
        />
        <GraphicBar 
          height="70%" 
          color="linear-gradient(180deg, #1F53FF 0%, rgba(31, 83, 255, 0.3) 100%)"
          initial={{ height: "0%" }}
          whileInView={{ height: "70%" }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 1 }}
          style={{ left: "50%" }}
        />
        
        {/* Animated circles */}
        <GraphicCircle 
          size="40px" 
          color="rgba(31, 83, 255, 0.2)"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1.2 }}
          style={{ top: "20%", right: "30%" }}
        />
        <GraphicCircle 
          size="60px" 
          color="rgba(255, 67, 163, 0.15)"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1.4 }}
          style={{ top: "50%", right: "20%" }}
        />
        <GraphicCircle 
          size="30px" 
          color="rgba(74, 222, 128, 0.2)"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1.6 }}
          style={{ top: "30%", right: "10%" }}
        />
        
        {/* Animated lines */}
        <GraphicLine 
          width="15%" 
          color="rgba(255, 255, 255, 0.2)"
          initial={{ width: "0%" }}
          whileInView={{ width: "15%" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1.8 }}
          style={{ top: "25%", right: "15%" }}
        />
        <GraphicLine 
          width="20%" 
          color="rgba(255, 255, 255, 0.2)"
          initial={{ width: "0%" }}
          whileInView={{ width: "20%" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 2 }}
          style={{ top: "55%", right: "5%" }}
        />
        
        {/* Data labels */}
        <DataLabel
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 2.2 }}
          style={{ top: "15%", left: "10%" }}
        >
          Conversion Rate
        </DataLabel>
        <DataLabel
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 2.4 }}
          style={{ top: "15%", right: "10%" }}
        >
          User Engagement
        </DataLabel>
        <DataLabel
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 2.6 }}
          style={{ bottom: "15%", left: "40%" }}
        >
          Real-time Analytics
        </DataLabel>
      </AnimatedGraphic>
    </DecisionAgencyContainer>
  );
};

export default DecisionAgency;
