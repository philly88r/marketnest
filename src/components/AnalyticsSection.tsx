import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const AnalyticsSectionContainer = styled.section`
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

const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 60px;
  
  @media (max-width: 992px) {
    flex-direction: column;
    gap: 40px;
  }
`;

const TextContent = styled.div`
  flex: 1;
`;

const SectionTitle = styled(motion.h2)`
  color: white;
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 24px;
  
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
  font-size: 18px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  line-height: 30px;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    font-size: 16px;
    line-height: 26px;
    margin-bottom: 30px;
  }
`;

const FeaturesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FeatureItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 16px;
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const FeatureContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FeatureTitle = styled.h3`
  color: white;
  font-size: 20px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 18px;
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

const DashboardContainer = styled(motion.div)`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  
  @media (max-width: 992px) {
    width: 100%;
  }
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const DashboardTitle = styled.h3`
  color: white;
  font-size: 20px;
  font-weight: 600;
`;

const DashboardTabs = styled.div`
  display: flex;
  gap: 16px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const DashboardTab = styled.div<{ active: boolean }>`
  color: white;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 20px;
  background: ${props => props.active 
    ? 'linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%)' 
    : 'rgba(255, 255, 255, 0.1)'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.active 
      ? '0 5px 15px rgba(255, 67, 163, 0.3)' 
      : '0 5px 15px rgba(255, 255, 255, 0.1)'};
  }
`;

const DashboardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ChartContainer = styled.div`
  height: 200px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const ChartLabels = styled.div`
  display: flex;
  justify-content: space-between;
  position: absolute;
  bottom: 8px;
  left: 16px;
  right: 16px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 10px;
`;

const ChartLine = styled(motion.div)<{ data: string }>`
  position: absolute;
  bottom: 30px;
  left: 0;
  width: 100%;
  height: 100px;
  background: linear-gradient(180deg, rgba(31, 83, 255, 0.2) 0%, rgba(31, 83, 255, 0) 100%);
  clip-path: ${props => `polygon(${props.data})`};
`;

const ChartLinePath = styled(motion.div)<{ data: string }>`
  position: absolute;
  bottom: 30px;
  left: 0;
  width: 100%;
  height: 100px;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
    clip-path: ${props => `polygon(${props.data})`};
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(255, 67, 163, 0.3);
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`;

const MetricLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-family: 'Plus Jakarta Sans', sans-serif;
`;

const MetricValue = styled.div`
  color: white;
  font-size: 24px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const MetricChange = styled.div<{ positive: boolean }>`
  color: ${props => props.positive ? '#4ADE80' : '#F87171'};
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

// Chart data for different time periods
const chartData = {
  week: "0 100%, 5% 70%, 10% 85%, 15% 60%, 20% 80%, 25% 50%, 30% 60%, 35% 40%, 40% 30%, 45% 40%, 50% 20%, 55% 30%, 60% 10%, 65% 30%, 70% 20%, 75% 40%, 80% 30%, 85% 50%, 90% 40%, 95% 60%, 100% 30%, 100% 100%",
  month: "0 100%, 5% 50%, 10% 60%, 15% 40%, 20% 45%, 25% 30%, 30% 35%, 35% 25%, 40% 20%, 45% 15%, 50% 10%, 55% 15%, 60% 5%, 65% 10%, 70% 15%, 75% 5%, 80% 10%, 85% 15%, 90% 5%, 95% 10%, 100% 5%, 100% 100%",
  year: "0 100%, 5% 90%, 10% 85%, 15% 80%, 20% 70%, 25% 65%, 30% 60%, 35% 55%, 40% 50%, 45% 45%, 50% 40%, 55% 35%, 60% 30%, 65% 25%, 70% 20%, 75% 15%, 80% 10%, 85% 15%, 90% 10%, 95% 5%, 100% 10%, 100% 100%"
};

// Metrics data for different time periods
const metricsData = {
  week: [
    { label: "Conversion Rate", value: "8.7%", change: "+1.2%", positive: true },
    { label: "Avg. Session", value: "3:42", change: "+0:22", positive: true },
    { label: "New Users", value: "1,247", change: "+18%", positive: true },
    { label: "Bounce Rate", value: "24.8%", change: "-2.1%", positive: true }
  ],
  month: [
    { label: "Conversion Rate", value: "7.9%", change: "+0.8%", positive: true },
    { label: "Avg. Session", value: "3:21", change: "+0:15", positive: true },
    { label: "New Users", value: "5,842", change: "+22%", positive: true },
    { label: "Bounce Rate", value: "26.3%", change: "+1.5%", positive: false }
  ],
  year: [
    { label: "Conversion Rate", value: "6.5%", change: "+2.3%", positive: true },
    { label: "Avg. Session", value: "2:58", change: "+0:42", positive: true },
    { label: "New Users", value: "42,198", change: "+137%", positive: true },
    { label: "Bounce Rate", value: "28.4%", change: "-5.7%", positive: true }
  ]
};

const AnalyticsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'year'>('week');
  
  return (
    <AnalyticsSectionContainer>
      <ContentWrapper>
        <TextContent>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Advanced Analytics Dashboard
          </SectionTitle>
          
          <SectionDescription
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Our comprehensive analytics platform provides real-time insights into your marketing performance, helping you make data-driven decisions to optimize your campaigns.
          </SectionDescription>
          
          <FeaturesList>
            <FeatureItem
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <FeatureIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21H3V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 9L15 3L9 9L3 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </FeatureIcon>
              <FeatureContent>
                <FeatureTitle>Real-Time Tracking</FeatureTitle>
                <FeatureDescription>
                  Monitor your campaign performance as it happens with our real-time analytics dashboard, allowing for immediate adjustments.
                </FeatureDescription>
              </FeatureContent>
            </FeatureItem>
            
            <FeatureItem
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <FeatureIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </FeatureIcon>
              <FeatureContent>
                <FeatureTitle>Multi-Channel Integration</FeatureTitle>
                <FeatureDescription>
                  Consolidate data from all your marketing channels in one place for a comprehensive view of your performance.
                </FeatureDescription>
              </FeatureContent>
            </FeatureItem>
            
            <FeatureItem
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <FeatureIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </FeatureIcon>
              <FeatureContent>
                <FeatureTitle>Custom Reporting</FeatureTitle>
                <FeatureDescription>
                  Create tailored reports that focus on the metrics that matter most to your business objectives.
                </FeatureDescription>
              </FeatureContent>
            </FeatureItem>
          </FeaturesList>
        </TextContent>
        
        <DashboardContainer
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <DashboardHeader>
            <DashboardTitle>Campaign Performance</DashboardTitle>
            <DashboardTabs>
              <DashboardTab 
                active={activeTab === 'week'} 
                onClick={() => setActiveTab('week')}
              >
                Week
              </DashboardTab>
              <DashboardTab 
                active={activeTab === 'month'} 
                onClick={() => setActiveTab('month')}
              >
                Month
              </DashboardTab>
              <DashboardTab 
                active={activeTab === 'year'} 
                onClick={() => setActiveTab('year')}
              >
                Year
              </DashboardTab>
            </DashboardTabs>
          </DashboardHeader>
          
          <DashboardContent>
            <ChartContainer>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ width: '100%', height: '100%', position: 'relative' }}
                >
                  <ChartLine 
                    data={chartData[activeTab]}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                  <ChartLinePath 
                    data={chartData[activeTab]}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </motion.div>
              </AnimatePresence>
              
              <ChartLabels>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </ChartLabels>
            </ChartContainer>
            
            <MetricsGrid>
              <AnimatePresence mode="wait">
                {metricsData[activeTab].map((metric, index) => (
                  <MetricCard
                    key={`${activeTab}-${metric.label}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <MetricLabel>{metric.label}</MetricLabel>
                    <MetricValue>{metric.value}</MetricValue>
                    <MetricChange positive={metric.positive}>
                      {metric.positive ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M5 12L12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M19 12L12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {metric.change}
                    </MetricChange>
                  </MetricCard>
                ))}
              </AnimatePresence>
            </MetricsGrid>
          </DashboardContent>
        </DashboardContainer>
      </ContentWrapper>
    </AnalyticsSectionContainer>
  );
};

export default AnalyticsSection;
