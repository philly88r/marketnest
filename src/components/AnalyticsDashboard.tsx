import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiGrid, FiTrendingUp, FiTarget, FiDownload, FiShare2, FiMail } from 'react-icons/fi';

// Mock data for analytics
const analyticsData = {
  websiteTraffic: {
    current: 15420,
    previous: 12840,
    change: 20.1,
    data: [4200, 4800, 5100, 4700, 5300, 5800, 6100, 5900, 6300, 6800, 7200, 7500]
  },
  conversions: {
    current: 342,
    previous: 289,
    change: 18.3,
    data: [82, 94, 88, 92, 98, 105, 112, 108, 118, 124, 130, 138]
  },
  bounceRate: {
    current: 42.3,
    previous: 48.7,
    change: -13.1,
    data: [52, 50, 49, 48, 47, 46, 45, 44, 43, 42, 41, 40]
  },
  avgSessionDuration: {
    current: 185,
    previous: 162,
    change: 14.2,
    data: [145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200]
  },
  topSources: [
    { source: 'Google', sessions: 8240, conversions: 186 },
    { source: 'Direct', sessions: 3120, conversions: 74 },
    { source: 'Facebook', sessions: 1840, conversions: 42 },
    { source: 'Instagram', sessions: 1240, conversions: 28 },
    { source: 'Email', sessions: 980, conversions: 12 }
  ],
  topPages: [
    { page: 'Home', views: 7840, avgTime: 145 },
    { page: 'Services', views: 4320, avgTime: 210 },
    { page: 'About', views: 2180, avgTime: 120 },
    { page: 'Blog', views: 1920, avgTime: 240 },
    { page: 'Contact', views: 1640, avgTime: 90 }
  ],
  deviceBreakdown: {
    mobile: 58,
    desktop: 32,
    tablet: 10
  },
  campaignPerformance: [
    { name: 'Summer Sale', impressions: 125000, clicks: 8750, conversions: 438, cost: 3500 },
    { name: 'Product Launch', impressions: 98000, clicks: 6860, conversions: 343, cost: 2800 },
    { name: 'Brand Awareness', impressions: 210000, clicks: 4200, conversions: 126, cost: 1800 }
  ]
};

interface AnalyticsDashboardProps {
  clientId?: string;
  dateRange?: 'week' | 'month' | 'quarter' | 'year';
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  clientId,
  dateRange = 'month'
}) => {
  const [activeDateRange, setActiveDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>(dateRange);
  const [activeTab, setActiveTab] = useState<'overview' | 'traffic' | 'campaigns'>('overview');
  
  // Function to format numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Function to format time in minutes and seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  // Generate chart points for sparklines
  const generateSparkline = (data: number[]) => {
    // Find min and max to normalize
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    // Normalize to 0-30 range (for height)
    const normalized = data.map(val => 30 - ((val - min) / range) * 30);
    
    // Generate points for the polyline
    let points = '';
    const step = 100 / (data.length - 1);
    
    normalized.forEach((val, index) => {
      points += `${index * step},${val} `;
    });
    
    return points.trim();
  };
  
  return (
    <DashboardContainer
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <DashboardHeader>
        <h2>Analytics Dashboard</h2>
        <DateRangeSelector>
          <DateRangeButton 
            $active={activeDateRange === 'week'} 
            onClick={() => setActiveDateRange('week')}
          >
            Week
          </DateRangeButton>
          <DateRangeButton 
            $active={activeDateRange === 'month'} 
            onClick={() => setActiveDateRange('month')}
          >
            Month
          </DateRangeButton>
          <DateRangeButton 
            $active={activeDateRange === 'quarter'} 
            onClick={() => setActiveDateRange('quarter')}
          >
            Quarter
          </DateRangeButton>
          <DateRangeButton 
            $active={activeDateRange === 'year'} 
            onClick={() => setActiveDateRange('year')}
          >
            Year
          </DateRangeButton>
        </DateRangeSelector>
      </DashboardHeader>
      
      <TabsContainer>
        <TabButton 
          $active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')}
        >
          <FiGrid size={16} />
          <span>Overview</span>
        </TabButton>
        <TabButton 
          $active={activeTab === 'traffic'} 
          onClick={() => setActiveTab('traffic')}
        >
          <FiTrendingUp size={16} />
          <span>Traffic Sources</span>
        </TabButton>
        <TabButton 
          $active={activeTab === 'campaigns'} 
          onClick={() => setActiveTab('campaigns')}
        >
          <FiTarget size={16} />
          <span>Campaigns</span>
        </TabButton>
      </TabsContainer>
      
      {activeTab === 'overview' && (
        <>
          <MetricsGrid>
            <MetricCard>
              <MetricHeader>
                <MetricTitle>Website Traffic</MetricTitle>
                <MetricChange $positive={analyticsData.websiteTraffic.change > 0}>
                  {analyticsData.websiteTraffic.change > 0 ? '+' : ''}
                  {analyticsData.websiteTraffic.change}%
                </MetricChange>
              </MetricHeader>
              <MetricValue>{formatNumber(analyticsData.websiteTraffic.current)}</MetricValue>
              <SparklineContainer>
                <svg width="100%" height="30" viewBox="0 0 100 30">
                  <polyline
                    fill="none"
                    stroke="#0df9b6"
                    strokeWidth="2"
                    points={generateSparkline(analyticsData.websiteTraffic.data)}
                  />
                </svg>
              </SparklineContainer>
              <MetricFooter>vs. {formatNumber(analyticsData.websiteTraffic.previous)} last period</MetricFooter>
            </MetricCard>
            
            <MetricCard>
              <MetricHeader>
                <MetricTitle>Conversions</MetricTitle>
                <MetricChange $positive={analyticsData.conversions.change > 0}>
                  {analyticsData.conversions.change > 0 ? '+' : ''}
                  {analyticsData.conversions.change}%
                </MetricChange>
              </MetricHeader>
              <MetricValue>{formatNumber(analyticsData.conversions.current)}</MetricValue>
              <SparklineContainer>
                <svg width="100%" height="30" viewBox="0 0 100 30">
                  <polyline
                    fill="none"
                    stroke="#0df9b6"
                    strokeWidth="2"
                    points={generateSparkline(analyticsData.conversions.data)}
                  />
                </svg>
              </SparklineContainer>
              <MetricFooter>vs. {formatNumber(analyticsData.conversions.previous)} last period</MetricFooter>
            </MetricCard>
            
            <MetricCard>
              <MetricHeader>
                <MetricTitle>Bounce Rate</MetricTitle>
                <MetricChange $positive={analyticsData.bounceRate.change < 0}>
                  {analyticsData.bounceRate.change > 0 ? '+' : ''}
                  {analyticsData.bounceRate.change}%
                </MetricChange>
              </MetricHeader>
              <MetricValue>{analyticsData.bounceRate.current}%</MetricValue>
              <SparklineContainer>
                <svg width="100%" height="30" viewBox="0 0 100 30">
                  <polyline
                    fill="none"
                    stroke={analyticsData.bounceRate.change < 0 ? "#0df9b6" : "#ff3b30"}
                    strokeWidth="2"
                    points={generateSparkline(analyticsData.bounceRate.data)}
                  />
                </svg>
              </SparklineContainer>
              <MetricFooter>vs. {analyticsData.bounceRate.previous}% last period</MetricFooter>
            </MetricCard>
            
            <MetricCard>
              <MetricHeader>
                <MetricTitle>Avg. Session Duration</MetricTitle>
                <MetricChange $positive={analyticsData.avgSessionDuration.change > 0}>
                  {analyticsData.avgSessionDuration.change > 0 ? '+' : ''}
                  {analyticsData.avgSessionDuration.change}%
                </MetricChange>
              </MetricHeader>
              <MetricValue>{formatTime(analyticsData.avgSessionDuration.current)}</MetricValue>
              <SparklineContainer>
                <svg width="100%" height="30" viewBox="0 0 100 30">
                  <polyline
                    fill="none"
                    stroke="#0df9b6"
                    strokeWidth="2"
                    points={generateSparkline(analyticsData.avgSessionDuration.data)}
                  />
                </svg>
              </SparklineContainer>
              <MetricFooter>vs. {formatTime(analyticsData.avgSessionDuration.previous)} last period</MetricFooter>
            </MetricCard>
          </MetricsGrid>
          
          <DashboardRow>
            <DashboardColumn>
              <DataCard>
                <DataCardHeader>
                  <h3>Device Breakdown</h3>
                </DataCardHeader>
                <DeviceBreakdown>
                  <DeviceBar>
                    <DeviceSegment 
                      $width={`${analyticsData.deviceBreakdown.mobile}%`}
                      $color="#0df9b6"
                    />
                    <DeviceSegment 
                      $width={`${analyticsData.deviceBreakdown.desktop}%`}
                      $color="#0db8f9"
                    />
                    <DeviceSegment 
                      $width={`${analyticsData.deviceBreakdown.tablet}%`}
                      $color="#9b59b6"
                    />
                  </DeviceBar>
                  <DeviceLegend>
                    <LegendItem>
                      <LegendColor $color="#0df9b6" />
                      <span>Mobile ({analyticsData.deviceBreakdown.mobile}%)</span>
                    </LegendItem>
                    <LegendItem>
                      <LegendColor $color="#0db8f9" />
                      <span>Desktop ({analyticsData.deviceBreakdown.desktop}%)</span>
                    </LegendItem>
                    <LegendItem>
                      <LegendColor $color="#9b59b6" />
                      <span>Tablet ({analyticsData.deviceBreakdown.tablet}%)</span>
                    </LegendItem>
                  </DeviceLegend>
                </DeviceBreakdown>
              </DataCard>
            </DashboardColumn>
            
            <DashboardColumn>
              <DataCard>
                <DataCardHeader>
                  <h3>Top Pages</h3>
                </DataCardHeader>
                <DataTable>
                  <thead>
                    <tr>
                      <th>Page</th>
                      <th>Views</th>
                      <th>Avg. Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.topPages.map((page, index) => (
                      <tr key={index}>
                        <td>{page.page}</td>
                        <td>{formatNumber(page.views)}</td>
                        <td>{formatTime(page.avgTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              </DataCard>
            </DashboardColumn>
          </DashboardRow>
        </>
      )}
      
      {activeTab === 'traffic' && (
        <DashboardRow>
          <DashboardColumn>
            <DataCard>
              <DataCardHeader>
                <h3>Traffic Sources</h3>
              </DataCardHeader>
              <DataTable>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Sessions</th>
                    <th>Conversions</th>
                    <th>Conv. Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.topSources.map((source, index) => (
                    <tr key={index}>
                      <td>{source.source}</td>
                      <td>{formatNumber(source.sessions)}</td>
                      <td>{source.conversions}</td>
                      <td>{((source.conversions / source.sessions) * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </DataCard>
          </DashboardColumn>
        </DashboardRow>
      )}
      
      {activeTab === 'campaigns' && (
        <DashboardRow>
          <DashboardColumn>
            <DataCard>
              <DataCardHeader>
                <h3>Campaign Performance</h3>
              </DataCardHeader>
              <DataTable>
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Impressions</th>
                    <th>Clicks</th>
                    <th>CTR</th>
                    <th>Conv.</th>
                    <th>Cost</th>
                    <th>CPA</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.campaignPerformance.map((campaign, index) => (
                    <tr key={index}>
                      <td>{campaign.name}</td>
                      <td>{formatNumber(campaign.impressions)}</td>
                      <td>{formatNumber(campaign.clicks)}</td>
                      <td>{((campaign.clicks / campaign.impressions) * 100).toFixed(2)}%</td>
                      <td>{campaign.conversions}</td>
                      <td>${formatNumber(campaign.cost)}</td>
                      <td>${(campaign.cost / campaign.conversions).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </DataCard>
          </DashboardColumn>
        </DashboardRow>
      )}
      
      <ExportSection>
        <ExportButton>
          <FiDownload size={16} />
          <span>Export Report</span>
        </ExportButton>
        <ExportButton>
          <FiMail size={16} />
          <span>Schedule Reports</span>
        </ExportButton>
      </ExportSection>
    </DashboardContainer>
  );
};

// Styled Components
const DashboardContainer = styled.div`
  background: #1a1a2e;
  border-radius: 12px;
  padding: 24px;
  color: #fff;
  margin-bottom: 24px;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h2 {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    background: linear-gradient(90deg, #0df9b6, #0db8f9);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    
    h2 {
      margin-bottom: 16px;
    }
  }
`;

const DateRangeSelector = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 768px) {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 8px;
  }
`;

const DateRangeButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? 'rgba(13, 249, 182, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: none;
  border-radius: 20px;
  color: ${props => props.$active ? '#0df9b6' : '#fff'};
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(13, 249, 182, 0.15);
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 12px;
  
  @media (max-width: 768px) {
    overflow-x: auto;
    padding-bottom: 12px;
  }
`;

const TabButton = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  color: ${props => props.$active ? '#0df9b6' : 'rgba(255, 255, 255, 0.7)'};
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${props => props.$active ? '#0df9b6' : 'transparent'};
    transition: all 0.2s ease;
  }
  
  &:hover {
    color: ${props => props.$active ? '#0df9b6' : '#fff'};
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
`;

const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const MetricTitle = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
`;

const MetricChange = styled.div<{ $positive: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.$positive ? '#34c759' : '#ff3b30'};
  display: flex;
  align-items: center;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const SparklineContainer = styled.div`
  height: 30px;
  margin-bottom: 8px;
`;

const MetricFooter = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`;

const DashboardRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

const DashboardColumn = styled.div`
  flex: 1;
`;

const DataCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  height: 100%;
`;

const DataCardHeader = styled.div`
  margin-bottom: 16px;
  
  h3 {
    font-size: 18px;
    font-weight: 500;
    margin: 0;
  }
`;

const DeviceBreakdown = styled.div`
  margin-top: 20px;
`;

const DeviceBar = styled.div`
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  margin-bottom: 16px;
`;

const DeviceSegment = styled.div<{ $width: string; $color: string }>`
  width: ${props => props.$width};
  height: 100%;
  background-color: ${props => props.$color};
`;

const DeviceLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background-color: ${props => props.$color};
  margin-right: 8px;
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 12px 8px;
    text-align: left;
    font-size: 14px;
  }
  
  th {
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  td {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    display: block;
    overflow-x: auto;
  }
`;

const ExportSection = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ExportButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: #fff;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
  
  svg {
    color: #0df9b6;
  }
`;

export default AnalyticsDashboard;
