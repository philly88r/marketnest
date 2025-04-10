import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const StatsSectionContainer = styled.section`
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
  margin-bottom: 60px;
  text-align: center;
  
  @media (max-width: 992px) {
    font-size: 40px;
    margin-bottom: 40px;
  }
  
  @media (max-width: 768px) {
    font-size: 32px;
    margin-bottom: 30px;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 100px;
  
  @media (max-width: 992px) {
    flex-wrap: wrap;
    gap: 40px;
    justify-content: center;
    margin-bottom: 60px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 30px;
    margin-bottom: 50px;
  }
`;

const StatItem = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 992px) {
    width: 45%;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StatValue = styled(motion.div)`
  color: white;
  font-size: 64px;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(90deg, #0df9b6 0%, #de681d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 992px) {
    font-size: 54px;
  }
  
  @media (max-width: 768px) {
    font-size: 48px;
  }
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.81);
  font-size: 18px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const MapSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MapTitle = styled(motion.h3)`
  color: white;
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 40px;
  text-align: center;
  
  @media (max-width: 992px) {
    font-size: 30px;
    margin-bottom: 30px;
  }
  
  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 20px;
  }
`;

const MapContainer = styled(motion.div)`
  width: 100%;
  max-width: 1000px;
  height: 500px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 992px) {
    height: 400px;
  }
  
  @media (max-width: 768px) {
    height: 300px;
  }
`;

const WorldMap = styled.div`
  width: 90%;
  height: 90%;
  position: relative;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const MapDot = styled(motion.div)<{ x: string; y: string; size: string }>`
  position: absolute;
  width: ${props => props.size};
  height: ${props => props.size};
  border-radius: 50%;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  left: ${props => props.x};
  top: ${props => props.y};
  cursor: pointer;
  z-index: 2;
  
  &::after {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    border-radius: 50%;
    background: rgba(255, 67, 163, 0.3);
    left: -50%;
    top: -50%;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      transform: scale(0.5);
      opacity: 1;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }
`;

const LocationTooltip = styled(motion.div)`
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 15px;
  color: white;
  font-size: 14px;
  pointer-events: none;
  z-index: 3;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid rgba(0, 0, 0, 0.8);
  }
`;

const CustomerSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const AvatarGroup = styled.div`
  display: flex;
  position: relative;
  margin-bottom: 30px;
`;

const Avatar = styled.div`
  width: 70px;
  height: 70px;
  background: #888888;
  border-radius: 9999px;
  border: 2.39px black solid;
  position: relative;
  margin-right: -23px;
`;

const LastAvatar = styled(Avatar)`
  background: linear-gradient(180deg, #FF43A3 0%, #1F53FF 100%);
  margin-right: 0;
`;

const AvatarText = styled.div`
  width: 46px;
  height: 32px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  font-size: 22px;
  font-weight: 600;
`;

const CustomerInfo = styled.div`
  margin-left: 20px;
`;

const CustomerTitle = styled.div`
  color: rgba(255, 255, 255, 0.81);
  font-size: 20px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  line-height: 30px;
  
  span {
    color: white;
    font-size: 21px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
  }
`;

const CustomerDescription = styled.div`
  width: 288px;
  color: rgba(255, 255, 255, 0.81);
  font-size: 17px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  line-height: 30px;
`;

const StatsCard = styled(motion.div)`
  width: 510px;
  height: auto;
  background: rgba(255, 255, 255, 0.10);
  border-radius: 30px;
  border: 1px rgba(255, 255, 255, 0.15) solid;
  backdrop-filter: blur(8px);
  padding: 30px;
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 20px;
  }
`;

const CountryRow = styled(motion.div)`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    cursor: pointer;
  }
  
  @media (max-width: 576px) {
    flex-wrap: wrap;
  }
`;

const FlagContainer = styled.div`
  width: 32px;
  height: 32px;
  position: relative;
  overflow: hidden;
  margin-right: 15px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CountryName = styled.div`
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  width: 120px;
  background: linear-gradient(90deg, #0df9b6 0%, #de681d 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ProgressBarContainer = styled.div`
  width: 246px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin: 0 15px;
  overflow: hidden;
  
  @media (max-width: 576px) {
    width: 100%;
    margin: 10px 0;
  }
`;

const ProgressBar = styled(motion.div)<{ width: string }>`
  width: 0%;
  height: 18px;
  background: linear-gradient(90deg, #0df9b6 0%, #de681d 100%);
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(13, 249, 182, 0.3);
`;

const PercentageText = styled.div`
  color: white;
  font-size: 18px;
  font-weight: 400;
  line-height: 24px;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? 'linear-gradient(90deg, #0df9b6 0%, #de681d 100%)' : 'rgba(255, 255, 255, 0.1)'};
  border: none;
  border-radius: 20px;
  color: white;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.$active ? '0 4px 10px rgba(13, 249, 182, 0.3)' : 'none'};
  
  &:hover {
    background: ${props => props.$active ? 'linear-gradient(90deg, #0df9b6 0%, #de681d 100%)' : 'rgba(255, 255, 255, 0.2)'};
    transform: translateY(-2px);
  }
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
  padding: 0 20px;
`;

const DecisionAgencyContainer = styled.div`
  margin-top: 50px;
`;

const DecisionTitle = styled(motion.h3)`
  color: white;
  font-size: 32px;
  font-weight: 500;
  margin-bottom: 20px;
`;

const DecisionDescription = styled(motion.p)`
  width: 509px;
  color: rgba(255, 255, 255, 0.81);
  font-size: 18px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  line-height: 30px;
`;

const StatsSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [animationComplete, setAnimationComplete] = useState(false);
  
  const locations = [
    { id: 1, name: "New York", x: "25%", y: "30%", size: "16px", clients: 145, growth: "+22%" },
    { id: 2, name: "Los Angeles", x: "15%", y: "42%", size: "14px", clients: 112, growth: "+18%" },
    { id: 3, name: "Chicago", x: "30%", y: "35%", size: "14px", clients: 98, growth: "+15%" },
    { id: 4, name: "Miami", x: "35%", y: "50%", size: "12px", clients: 76, growth: "+24%" },
    { id: 5, name: "Seattle", x: "12%", y: "28%", size: "12px", clients: 68, growth: "+19%" },
    { id: 6, name: "Austin", x: "25%", y: "48%", size: "14px", clients: 87, growth: "+28%" },
    { id: 7, name: "Boston", x: "38%", y: "32%", size: "12px", clients: 72, growth: "+16%" },
    { id: 8, name: "Denver", x: "22%", y: "38%", size: "12px", clients: 65, growth: "+21%" },
  ];
  
  const industries = [
    { name: "E-commerce", percentage: 95, industry: "ecommerce", revenue: "$2.8M", clients: 142, growth: "+32%" },
    { name: "SaaS", percentage: 88, industry: "saas", revenue: "$3.2M", clients: 98, growth: "+41%" },
    { name: "Healthcare", percentage: 78, industry: "healthcare", revenue: "$1.9M", clients: 76, growth: "+24%" },
    { name: "Finance", percentage: 86, industry: "finance", revenue: "$4.5M", clients: 64, growth: "+18%" },
    { name: "Real Estate", percentage: 82, industry: "realestate", revenue: "$2.1M", clients: 58, growth: "+27%" },
    { name: "Education", percentage: 75, industry: "education", revenue: "$1.6M", clients: 87, growth: "+35%" },
    { name: "Manufacturing", percentage: 79, industry: "manufacturing", revenue: "$3.7M", clients: 52, growth: "+22%" },
    { name: "Hospitality", percentage: 84, industry: "hospitality", revenue: "$2.3M", clients: 65, growth: "+29%" },
  ];
  
  const filteredIndustries = activeFilter === 'all' 
    ? industries 
    : industries.filter(industry => industry.industry === activeFilter);
  
  const handleLocationHover = (locationId: number, event: React.MouseEvent) => {
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      setSelectedLocation(location.name);
      setTooltipPosition({ 
        x: event.clientX, 
        y: event.clientY - 60 
      });
    }
  };
  
  useEffect(() => {
    if (animationComplete) {
      const progressBars = document.querySelectorAll('.progress-bar');
      progressBars.forEach((bar, index) => {
        setTimeout(() => {
          (bar as HTMLElement).style.width = `${filteredIndustries[index]?.percentage || 0}%`;
        }, index * 200);
      });
    }
  }, [animationComplete, filteredIndustries]);
  
  return (
    <StatsSectionContainer>
      <SectionTitle
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        Our Impact in Numbers
      </SectionTitle>
      
      <StatsContainer>
        <StatItem
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <StatValue
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            500+
          </StatValue>
          <StatLabel>Satisfied Clients</StatLabel>
        </StatItem>
        
        <StatItem
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <StatValue
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            94%
          </StatValue>
          <StatLabel>Retention Rate</StatLabel>
        </StatItem>
        
        <StatItem
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <StatValue
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            $2.4M
          </StatValue>
          <StatLabel>Average ROI</StatLabel>
        </StatItem>
        
        <StatItem
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <StatValue
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            32
          </StatValue>
          <StatLabel>Countries Served</StatLabel>
        </StatItem>
      </StatsContainer>
      
      <MapSection>
        <MapTitle
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Global Reach, Local Impact
        </MapTitle>
        
        <MapContainer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <WorldMap>
            <svg viewBox="0 0 1000 500" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M250,90 L300,80 L350,85 L400,75 L450,90 L500,85 L550,95 L600,90 L650,100 L700,95 L750,105" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
              <path d="M200,150 L250,140 L300,145 L350,135 L400,150 L450,145 L500,155 L550,150 L600,160 L650,155 L700,165 L750,160 L800,170" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
              <path d="M150,200 L200,190 L250,195 L300,185 L350,200 L400,195 L450,205 L500,200 L550,210 L600,205 L650,215 L700,210 L750,220 L800,215 L850,225" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
              <path d="M200,250 L250,240 L300,245 L350,235 L400,250 L450,245 L500,255 L550,250 L600,260 L650,255 L700,265 L750,260 L800,270" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
              <path d="M250,300 L300,290 L350,295 L400,285 L450,300 L500,295 L550,305 L600,300 L650,310 L700,305 L750,315" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
            </svg>
            
            {locations.map((location) => (
              <React.Fragment key={location.id}>
                <MapDot 
                  x={location.x} 
                  y={location.y} 
                  size={location.size}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 1 + (location.id * 0.2) }}
                  onMouseEnter={(e) => handleLocationHover(location.id, e)}
                  onMouseLeave={() => setSelectedLocation(null)}
                  whileHover={{ scale: 1.2 }}
                />
              </React.Fragment>
            ))}
            
            <AnimatePresence>
              {selectedLocation && (
                <LocationTooltip
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  style={{ 
                    left: `${tooltipPosition.x}px`, 
                    top: `${tooltipPosition.y}px`,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <strong>{selectedLocation}</strong>
                  <div>
                    {locations.find(loc => loc.name === selectedLocation)?.clients} Clients
                  </div>
                  <div style={{ color: '#4ADE80' }}>
                    {locations.find(loc => loc.name === selectedLocation)?.growth} Growth
                  </div>
                </LocationTooltip>
              )}
            </AnimatePresence>
          </WorldMap>
        </MapContainer>
      </MapSection>
      
      <CustomerSection>
        <AvatarGroup>
          <Avatar 
            as={motion.div}
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ zIndex: 4 }} 
          />
          <Avatar 
            as={motion.div}
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ zIndex: 3 }} 
          />
          <Avatar 
            as={motion.div}
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ zIndex: 2 }} 
          />
          <LastAvatar 
            as={motion.div}
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ zIndex: 1 }}
          >
            <AvatarText>+99</AvatarText>
          </LastAvatar>
        </AvatarGroup>
        
        <CustomerInfo>
          <CustomerTitle
            as={motion.div}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Customers <span>642K+</span>
          </CustomerTitle>
          <CustomerDescription
            as={motion.div}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Trusted by businesses across industries worldwide
          </CustomerDescription>
        </CustomerInfo>
      </CustomerSection>
      
      <FilterContainer>
        <FilterButton 
          $active={activeFilter === 'all'} 
          onClick={() => setActiveFilter('all')}
        >
          All
        </FilterButton>
        <FilterButton 
          $active={activeFilter === 'ecommerce'} 
          onClick={() => setActiveFilter('ecommerce')}
        >
          E-commerce
        </FilterButton>
        <FilterButton 
          $active={activeFilter === 'saas'} 
          onClick={() => setActiveFilter('saas')}
        >
          SaaS
        </FilterButton>
        <FilterButton 
          $active={activeFilter === 'healthcare'} 
          onClick={() => setActiveFilter('healthcare')}
        >
          Healthcare
        </FilterButton>
        <FilterButton 
          $active={activeFilter === 'finance'} 
          onClick={() => setActiveFilter('finance')}
        >
          Finance
        </FilterButton>
        <FilterButton 
          $active={activeFilter === 'realestate'} 
          onClick={() => setActiveFilter('realestate')}
        >
          Real Estate
        </FilterButton>
        <FilterButton 
          $active={activeFilter === 'education'} 
          onClick={() => setActiveFilter('education')}
        >
          Education
        </FilterButton>
        <FilterButton 
          $active={activeFilter === 'manufacturing'} 
          onClick={() => setActiveFilter('manufacturing')}
        >
          Manufacturing
        </FilterButton>
        <FilterButton 
          $active={activeFilter === 'hospitality'} 
          onClick={() => setActiveFilter('hospitality')}
        >
          Hospitality
        </FilterButton>
      </FilterContainer>
      
      <StatsCard
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        onAnimationComplete={() => setAnimationComplete(true)}
      >
        {filteredIndustries.map((industry, index) => (
          <CountryRow
            key={industry.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <FlagContainer>
              {industry.industry === "ecommerce" && (
                <div style={{ width: '100%', height: '100%', background: '#FF6B6B', position: 'relative', borderRadius: '4px' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '10px', color: 'white' }}>🛒</div>
                </div>
              )}
              {industry.industry === "saas" && (
                <div style={{ width: '100%', height: '100%', background: '#4D96FF', position: 'relative', borderRadius: '4px' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '10px', color: 'white' }}>💻</div>
                </div>
              )}
              {industry.industry === "healthcare" && (
                <div style={{ width: '100%', height: '100%', background: '#6BCB77', position: 'relative', borderRadius: '4px' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '10px', color: 'white' }}>🏥</div>
                </div>
              )}
              {industry.industry === "finance" && (
                <div style={{ width: '100%', height: '100%', background: '#FFD93D', position: 'relative', borderRadius: '4px' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '10px', color: 'black' }}>💰</div>
                </div>
              )}
              {industry.industry === "realestate" && (
                <div style={{ width: '100%', height: '100%', background: '#4E31AA', position: 'relative', borderRadius: '4px' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '10px', color: 'white' }}>🏠</div>
                </div>
              )}
              {industry.industry === "education" && (
                <div style={{ width: '100%', height: '100%', background: '#FF9F45', position: 'relative', borderRadius: '4px' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '10px', color: 'white' }}>🎓</div>
                </div>
              )}
              {industry.industry === "manufacturing" && (
                <div style={{ width: '100%', height: '100%', background: '#748DA6', position: 'relative', borderRadius: '4px' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '10px', color: 'white' }}>🏭</div>
                </div>
              )}
              {industry.industry === "hospitality" && (
                <div style={{ width: '100%', height: '100%', background: '#9C51E0', position: 'relative', borderRadius: '4px' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '10px', color: 'white' }}>🏨</div>
                </div>
              )}
            </FlagContainer>
            <CountryName>{industry.name}</CountryName>
            <ProgressBarContainer>
              <ProgressBar 
                className="progress-bar"
                width={`${industry.percentage}%`}
                initial={{ width: "0%" }}
                transition={{ duration: 1, delay: index * 0.2 }}
              />
            </ProgressBarContainer>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <PercentageText>{industry.percentage}%</PercentageText>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                <div>Revenue: <span style={{ color: '#4ADE80' }}>{industry.revenue}</span></div>
                <div>Growth: <span style={{ color: '#FF43A3' }}>{industry.growth}</span></div>
              </div>
            </div>
          </CountryRow>
        ))}
      </StatsCard>
      
      <DecisionAgencyContainer>
        <DecisionTitle
          as={motion.h3}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Decision Agency
        </DecisionTitle>
        <DecisionDescription
          as={motion.p}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Our detailed reports offer insights into key metrics, such as website traffic, conversion rates, and customer engagement across global markets.
        </DecisionDescription>
      </DecisionAgencyContainer>
    </StatsSectionContainer>
  );
};

export default StatsSection;
