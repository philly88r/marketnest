import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
// CORRECTED: Added FiDownload and FiMail to import
import { FiSearch, FiExternalLink, FiArrowUp, FiArrowDown, FiDownload, FiMail } from 'react-icons/fi';
import { getSearchConsoleData, SearchConsoleData } from '../utils/searchConsoleService';

interface AnalyticsDashboardProps {
  clientId?: string;
  dateRange?: 'week' | 'month' | 'quarter' | 'year';
}

// Styled Components (Defined first to avoid potential reference errors later)
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
`;

const LoadingSpinner = styled.div`
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top: 3px solid #0df9b6;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SmallLoadingSpinner = styled(LoadingSpinner)`
  width: 16px;
  height: 16px;
  border-width: 2px;
  margin: 0 0 0 10px;
  display: inline-block;
  vertical-align: middle;
`;

const LoadingText = styled.p`
  font-size: 14px;
  color: #666;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  background-color: #fff8f8;
  border-radius: 8px;
  margin: 20px 0;
`;

const ErrorText = styled.p`
  color: #e53935;
  margin-bottom: 16px;
  font-size: 14px;
`;

const RetryButton = styled.button`
  background-color: #0df9b6;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #0be0a5;
  }
`;

const DashboardContainer = styled.div`
  background-color: #ffffff; /* Assuming white background based on later styles */
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
  overflow: hidden;
  color: #333; /* Assuming text color should be dark on light background */
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
    /* Gradient text might not work well on white, consider solid color */
    /* background: linear-gradient(90deg, #0df9b6, #0db8f9);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent; */
     color: #1a2b4d; /* Example solid color */
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
  background: ${props => props.$active ? 'rgba(13, 249, 182, 0.1)' : '#eee'}; /* Adjusted bg */
  border: 1px solid ${props => props.$active ? '#0df9b6' : '#ddd'}; /* Added subtle border */
  border-radius: 20px;
  color: ${props => props.$active ? '#0b9a71' : '#555'}; /* Adjusted colors */
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? 'rgba(13, 249, 182, 0.2)' : '#e0e0e0'};
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
  background: #f8f9fa; /* Lighter background for cards */
  border: 1px solid #e9ecef; /* Subtle border */
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
  color: #6c757d; /* Adjusted color */
`;

const MetricChange = styled.div<{ $positive: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.$positive ? '#28a745' : '#dc3545'}; /* Bootstrap-like colors */
  display: flex;
  align-items: center;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #212529; /* Darker value color */
`;

const SparklineContainer = styled.div`
  height: 30px;
  margin-bottom: 8px;
`;

const MetricFooter = styled.div`
  font-size: 12px;
  color: #adb5bd; /* Adjusted color */
`;

const TableContainer = styled.div`
  overflow-x: auto;
  max-height: 400px; /* Added max-height for scroll */
  overflow-y: auto; /* Added y-scroll */
  border: 1px solid #dee2e6; /* Added border */
  border-radius: 4px; /* Optional rounded corners */
  margin-top: 16px; /* Added margin */
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th, td {
    padding: 10px 12px; /* Adjusted padding */
    text-align: left;
    border-bottom: 1px solid #dee2e6; /* Adjusted border color */
    white-space: nowrap; /* Prevent wrapping */
  }

  th {
    font-weight: 600;
    color: #495057; /* Adjusted header color */
    background: #f8f9fa; /* Light background for header */
    position: sticky;
    top: 0;
    z-index: 1;
  }

  td {
     color: #343a40; /* Adjusted cell color */
  }

  tbody tr:hover {
    background-color: #f1f3f5; /* Slightly darker hover */
  }

   tbody tr td:first-child {
     white-space: normal; /* Allow page names to wrap */
     word-break: break-all; /* Break long URLs */
   }
`;

// NOTE: This styled component is defined but not used in the JSX below
const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th, td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    font-weight: 600;
    color: #666;
    position: sticky;
    top: 0;
    background: white;
    z-index: 1;
  }

  tbody tr:hover {
    background-color: #f9f9f9;
  }
`;

const PositionIndicator = styled.span<{ $position: number }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.$position <= 10 ? '#196a49' : props.$position <= 20 ? '#b96e00' : '#a51e1a'}; /* Adjusted text colors */
  background-color: ${props => props.$position <= 10 ? '#d4edda' : props.$position <= 20 ? '#fff3cd' : '#f8d7da'}; /* Bootstrap-like backgrounds */
`;

const EmptyState = styled.div`
  padding: 40px 0;
  text-align: center;
  color: #6c757d; /* Adjusted color */
  font-size: 14px;
`;

const ExportSection = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px; /* Added margin */

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-end; /* Align buttons right on mobile */
  }
`;

const ExportButton = styled.button`
  background: #6c757d; /* Adjusted background */
  border: none;
  border-radius: 8px;
  color: #fff; /* White text */
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #5a6268; /* Darker hover */
  }

  svg {
    color: #0df9b6; /* Keep icon color */
  }
`;

// --- Removed duplicate styled-components that were inside the 'search-console' tab block ---
// Definitions like TabContent, SectionTitle, SectionGrid, Section, TableContainer, Table, MetricDescription were removed from here


const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  clientId,
  dateRange = 'month'
}) => {
  const [activeDateRange, setActiveDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>(dateRange);
  const [searchConsoleData, setSearchConsoleData] = useState<SearchConsoleData | null>(null);
  const [isLoadingSearchConsole, setIsLoadingSearchConsole] = useState(false);
  const [searchConsoleError, setSearchConsoleError] = useState<string | null>(null);
  // Note: topQueries and topPages state were defined but not used after removing tab sections
  // const [topQueries, setTopQueries] = useState<any[]>([]);
  // const [topPages, setTopPages] = useState<any[]>([]);
  // const [isLoadingQueries, setIsLoadingQueries] = useState(false);
  // const [isLoadingPages, setIsLoadingPages] = useState(false);

  // Function to format numbers with commas
  const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Function to format time in minutes and seconds (not used currently)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60); // Use round for seconds
    return `${mins}m ${secs}s`;
  };

  // Generate chart points for sparklines
  const generateSparkline = (data: number[]): string => {
     // Handle edge cases: no data or single point
    if (!data || data.length === 0) return "0,30";
    if (data.length === 1) return `0,15 100,15`; // Flat line in the middle

    // Filter out invalid numbers
    const validData = data.filter(n => typeof n === 'number' && !isNaN(n));
    if (validData.length < 2) return "0,15 100,15"; // Need at least two points

    // Find min and max to normalize
    const min = Math.min(...validData);
    const max = Math.max(...validData);
    // Avoid division by zero if all points are the same
    const range = (max - min) === 0 ? 1 : (max - min);

    // Normalize to 0-30 range (for height)
    const normalized = validData.map(val => 30 - ((val - min) / range) * 30);

    // Generate points for the polyline
    let points = '';
    const step = 100 / (validData.length - 1);

    normalized.forEach((val, index) => {
      points += `${index * step},${val} `;
    });

    return points.trim();
  };

  // Load Search Console data when component mounts or date range changes
  useEffect(() => {
    // Determine the siteUrl for the client
    let siteUrl = '';
    if ((clientId || 'client-liberty-beans') === 'client-liberty-beans') {
      siteUrl = 'https://www.libertybeanscoffee.com/';
    } else {
      // TODO: Add logic to look up siteUrl for other clients if needed
      siteUrl = '';
    }
    console.log(`[AnalyticsDashboard] Using site URL: ${siteUrl}`);
    loadSearchConsoleData(siteUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, activeDateRange]); // Keep dependencies

  // Function to load Search Console data
  const loadSearchConsoleData = async (siteUrl: string) => {
    if (!siteUrl) return;

    console.log('[loadSearchConsoleData] Loading data for site:', siteUrl, 'Range:', activeDateRange);
    setIsLoadingSearchConsole(true);
    // setIsLoadingQueries(true); // Not used currently
    // setIsLoadingPages(true); // Not used currently
    setSearchConsoleError(null);
    setSearchConsoleData(null); // Clear previous data

    try {
      // Calculate date range
      const endDate = new Date();
      let startDate = new Date();

      switch (activeDateRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

       // Google Search Console API typically requires dates 2 days prior
      // Adjust if your service function doesn't handle this
      // endDate.setDate(endDate.getDate() - 2);
      // startDate.setDate(startDate.getDate() - 2);

      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      console.log('[loadSearchConsoleData] Date range:', formattedStartDate, 'to', formattedEndDate);

      // Fetch Search Console data from backend (siteUrl-based)
      console.log('[loadSearchConsoleData] Calling getSearchConsoleData...');
      const data = await getSearchConsoleData(siteUrl, formattedStartDate, formattedEndDate);
      console.log('[loadSearchConsoleData] Received data:', data);

      if (!data) {
          throw new Error("No data returned from Search Console service.");
      }

      setSearchConsoleData(data);
      // Data fetching for queries/pages might be included in getSearchConsoleData
      // Or handled separately if needed - currently commented out
      // console.log('[loadSearchConsoleData] Fetching top queries...');
      // const queriesData = await getTopQueries(clientId, formattedStartDate, formattedEndDate);
      // setTopQueries(queriesData || []);
      // setIsLoadingQueries(false);
      // console.log('[loadSearchConsoleData] Fetching top pages...');
      // const pagesData = await getTopPages(clientId, formattedStartDate, formattedEndDate);
      // setTopPages(pagesData || []);
      // setIsLoadingPages(false);

    } catch (error: any) {
      console.error('[loadSearchConsoleData] Error loading Search Console data:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      setSearchConsoleError(`Failed to load Search Console data: ${errorMsg}`);
      // setIsLoadingQueries(false); // Not used currently
      // setIsLoadingPages(false); // Not used currently
    } finally {
      setIsLoadingSearchConsole(false);
      console.log('[loadSearchConsoleData] Loading completed');
    }
  };

  // Calculate Metric Change Percentage Safely
  const calculatePercentageChange = (current: number | undefined | null, previous: number | undefined | null): number => {
      // This requires fetching previous period data, which is not currently done.
      // Placeholder: Returning simple positive/negative indicator for now.
      const currentValue = current ?? 0;
      return currentValue > 0 ? 1 : currentValue < 0 ? -1 : 0; // 1 for positive, -1 for negative, 0 for zero
  };

  // Placeholder for getting previous period data (needed for accurate % change)
  const getPreviousPeriodValue = (metric: keyof SearchConsoleData): number | undefined => {
      // In a real implementation, you would fetch data for the previous period
      // based on the activeDateRange and return the corresponding value.
      // Example: if metric is 'clicks', return clicks from the prior month/week etc.
      return undefined; // Placeholder
  };

  return (
    <DashboardContainer
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <DashboardHeader>
        <h2>Search Console Analytics</h2>
        <DateRangeSelector>
          <DateRangeButton
            $active={activeDateRange === 'week'}
            onClick={() => setActiveDateRange('week')}
            disabled={isLoadingSearchConsole}
          >
            Week
          </DateRangeButton>
          <DateRangeButton
            $active={activeDateRange === 'month'}
            onClick={() => setActiveDateRange('month')}
            disabled={isLoadingSearchConsole}
          >
            Month
          </DateRangeButton>
          <DateRangeButton
            $active={activeDateRange === 'quarter'}
            onClick={() => setActiveDateRange('quarter')}
            disabled={isLoadingSearchConsole}
          >
            Quarter
          </DateRangeButton>
          <DateRangeButton
            $active={activeDateRange === 'year'}
            onClick={() => setActiveDateRange('year')}
            disabled={isLoadingSearchConsole}
          >
            Year
          </DateRangeButton>
        </DateRangeSelector>
      </DashboardHeader>

      {isLoadingSearchConsole && (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading Search Console data...</LoadingText>
        </LoadingContainer>
      )}

      {searchConsoleError && !isLoadingSearchConsole && (
        <ErrorContainer>
          <ErrorText>{searchConsoleError}</ErrorText>
          <RetryButton onClick={loadSearchConsoleData}>
            Retry
          </RetryButton>
        </ErrorContainer>
      )}

      {!isLoadingSearchConsole && !searchConsoleError && !searchConsoleData && (
         <EmptyState>No Search Console data available for the selected period.</EmptyState>
      )}

      {!isLoadingSearchConsole && !searchConsoleError && searchConsoleData && (
        <>
          <MetricsGrid>
            {/* Clicks */}
            <MetricCard>
              <MetricHeader>
                <MetricTitle>Total Clicks</MetricTitle>
                 {/* Placeholder change indicator - requires previous period data */}
                 {/* <MetricChange $positive={calculatePercentageChange(searchConsoleData.clicks, getPreviousPeriodValue('clicks')) >= 0}>
                   {calculatePercentageChange(searchConsoleData.clicks, getPreviousPeriodValue('clicks')) > 0 ? <FiArrowUp size={14}/> : calculatePercentageChange(searchConsoleData.clicks, getPreviousPeriodValue('clicks')) < 0 ? <FiArrowDown size={14}/> : null}
                   {Math.abs(calculatePercentageChange(searchConsoleData.clicks, getPreviousPeriodValue('clicks'))).toFixed(1)}%
                 </MetricChange> */}
              </MetricHeader>
              <MetricValue>{formatNumber(searchConsoleData.clicks)}</MetricValue>
              <SparklineContainer>
                <svg width="100%" height="30" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#0dacf9" /* Adjusted color */
                    strokeWidth="2"
                    // Sparkline needs historical data points, not just the total
                    // Placeholder: using the single value which creates a flat line
                    points={generateSparkline([searchConsoleData.clicks ?? 0])}
                  />
                </svg>
              </SparklineContainer>
              <MetricFooter>Total clicks from Google Search</MetricFooter>
            </MetricCard>

            {/* Impressions */}
            <MetricCard>
              <MetricHeader>
                <MetricTitle>Impressions</MetricTitle>
                {/* Placeholder change indicator */}
              </MetricHeader>
              <MetricValue>{formatNumber(searchConsoleData.impressions)}</MetricValue>
              <SparklineContainer>
                <svg width="100%" height="30" viewBox="0 0 100 30" preserveAspectRatio="none">
                   <polyline
                    fill="none"
                    stroke="#0dacf9" /* Adjusted color */
                    strokeWidth="2"
                    points={generateSparkline([searchConsoleData.impressions ?? 0])} // Placeholder
                  />
                </svg>
              </SparklineContainer>
              <MetricFooter>Total impressions in search results</MetricFooter>
            </MetricCard>

            {/* CTR */}
            <MetricCard>
              <MetricHeader>
                <MetricTitle>CTR</MetricTitle>
                 {/* Placeholder change indicator */}
              </MetricHeader>
              <MetricValue>{((searchConsoleData.ctr ?? 0) * 100).toFixed(2)}%</MetricValue>
              <SparklineContainer>
                 <svg width="100%" height="30" viewBox="0 0 100 30" preserveAspectRatio="none">
                   <polyline
                    fill="none"
                    stroke="#0df9b6" /* Adjusted color */
                    strokeWidth="2"
                    points={generateSparkline([(searchConsoleData.ctr ?? 0) * 100])} // Placeholder
                  />
                </svg>
              </SparklineContainer>
              <MetricFooter>Click-through rate</MetricFooter>
            </MetricCard>

            {/* Position */}
            <MetricCard>
              <MetricHeader>
                <MetricTitle>Avg. Position</MetricTitle>
                 {/* Placeholder change indicator - lower is better */}
                 {/* <MetricChange $positive={calculatePercentageChange(searchConsoleData.position, getPreviousPeriodValue('position')) <= 0}>
                    Lower is better
                 </MetricChange> */}
              </MetricHeader>
              <MetricValue>{(searchConsoleData.position ?? 0).toFixed(1)}</MetricValue>
               <SparklineContainer>
                 <svg width="100%" height="30" viewBox="0 0 100 30" preserveAspectRatio="none">
                   <polyline
                    fill="none"
                    stroke="#ff9a00" /* Adjusted color */
                    strokeWidth="2"
                    points={generateSparkline([30 - (searchConsoleData.position ?? 0)])} // Invert position for visual
                  />
                </svg>
              </SparklineContainer>
              <MetricFooter>Average position in search results</MetricFooter>
            </MetricCard>
          </MetricsGrid>

            {/* Top Pages Table */}
            {(searchConsoleData.pages && searchConsoleData.pages.length > 0) && (
                 <TableContainer>
                   <Table>
                     <thead>
                       <tr>
                         <th>Page</th>
                         <th>Clicks</th>
                         <th>Impressions</th>
                         <th>CTR</th>
                         <th>Position</th>
                         <th>Traffic %</th> {/* Changed heading */}
                       </tr>
                     </thead>
                     <tbody>
                       {searchConsoleData.pages.map((page, index) => {
                         // Calculate percentage of total clicks safely
                         const totalClicks = searchConsoleData.clicks || 1; // Avoid division by zero
                         const pageClicks = page.clicks || 0;
                         const clickPercentage = totalClicks > 0 ? (pageClicks / totalClicks) * 100 : 0;

                         return (
                           <tr key={page.page || index}> {/* Use page URL as key if available */}
                             {/* Page URL */}
                             <td>
                               <a href={page.page} target="_blank" rel="noopener noreferrer" title={page.page}>
                                {page.page.replace(/^https?:\/\/[^/]+/, '') || page.page} {/* Show relative or full path */}
                                <FiExternalLink size={12} style={{ marginLeft: '4px', opacity: 0.6 }}/>
                               </a>
                             </td>
                             {/* Clicks */}
                             <td style={{ textAlign: 'right' }}>{formatNumber(page.clicks)}</td>
                             {/* Impressions */}
                             <td style={{ textAlign: 'right' }}>{formatNumber(page.impressions)}</td>
                             {/* CTR */}
                             <td style={{ textAlign: 'right' }}>{(page.ctr * 100).toFixed(2)}%</td>
                             {/* Position */}
                             <td style={{ textAlign: 'right' }}>
                                <PositionIndicator $position={page.position}>
                                    {page.position.toFixed(1)}
                                </PositionIndicator>
                             </td>
                              {/* Traffic Bar */}
                             <td>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
                                 <div title={`${clickPercentage.toFixed(1)}% of total clicks`} style={{
                                   flexGrow: 1,
                                   height: '8px',
                                   background: '#e9ecef',
                                   borderRadius: '4px',
                                   overflow: 'hidden'
                                 }}>
                                   <div style={{
                                     width: `${Math.min(100, clickPercentage)}%`, // Use direct percentage
                                     height: '100%',
                                     background: '#2196f3'
                                   }} />
                                 {/* CORRECTED: Removed the unclosed div here */}
                                 </div>
                                 <span style={{ fontSize: '12px', color: '#6c757d' }}>{clickPercentage.toFixed(1)}%</span>
                                {/* CORRECTED: Closed the wrapping flex div */}
                               </div>
                             </td>
                           </tr>
                         );
                       })}
                     </tbody> {/* CORRECTED: Added missing closing tbody tag */}
                   </Table>
                 </TableContainer>
            )}

            {/* Top Queries Table */}
             {(searchConsoleData.queries && searchConsoleData.queries.length > 0) && (
                 <TableContainer>
                   <Table>
                     <thead>
                       <tr>
                         <th>Query</th>
                         <th>Clicks</th>
                         <th>Impressions</th>
                         <th>CTR</th>
                         <th>Position</th>
                       </tr>
                     </thead>
                     <tbody>
                       {searchConsoleData.queries.map((query, index) => (
                            <tr key={query.query || index}>
                              <td>{query.query}</td>
                              <td style={{ textAlign: 'right' }}>{formatNumber(query.clicks)}</td>
                              <td style={{ textAlign: 'right' }}>{formatNumber(query.impressions)}</td>
                              <td style={{ textAlign: 'right' }}>{(query.ctr * 100).toFixed(2)}%</td>
                              <td style={{ textAlign: 'right' }}>
                                  <PositionIndicator $position={query.position}>
                                    {query.position.toFixed(1)}
                                  </PositionIndicator>
                              </td>
                            </tr>
                          ))}
                       </tbody>
                   </Table>
                 </TableContainer>
             )}

           {/* Device Breakdown Table */}
             {(searchConsoleData.devices && searchConsoleData.devices.length > 0) && (
                 <TableContainer>
                   <Table>
                     <thead>
                       <tr>
                         <th>Device</th>
                         <th>Clicks</th>
                         <th>Impressions</th>
                         <th>CTR</th>
                         <th>Position</th>
                       </tr>
                     </thead>
                     <tbody>
                       {searchConsoleData.devices.map((device, index) => (
                            <tr key={device.device || index}>
                              <td>{device.device}</td>
                              <td style={{ textAlign: 'right' }}>{formatNumber(device.clicks)}</td>
                              <td style={{ textAlign: 'right' }}>{formatNumber(device.impressions)}</td>
                              <td style={{ textAlign: 'right' }}>{(device.ctr * 100).toFixed(2)}%</td>
                              <td style={{ textAlign: 'right' }}>
                                   <PositionIndicator $position={device.position}>
                                    {device.position.toFixed(1)}
                                   </PositionIndicator>
                              </td>
                            </tr>
                          ))}
                       </tbody>
                   </Table>
                 </TableContainer>
             )}

             {/* Country Breakdown Table */}
              {(searchConsoleData.countries && searchConsoleData.countries.length > 0) && (
                 <TableContainer>
                   <Table>
                     <thead>
                       <tr>
                         <th>Country</th>
                         <th>Clicks</th>
                         <th>Impressions</th>
                         <th>CTR</th>
                         <th>Position</th>
                       </tr>
                     </thead>
                     <tbody>
                       {searchConsoleData.countries.map((country, index) => (
                            <tr key={country.country || index}>
                              <td>{country.country}</td>
                              <td style={{ textAlign: 'right' }}>{formatNumber(country.clicks)}</td>
                              <td style={{ textAlign: 'right' }}>{formatNumber(country.impressions)}</td>
                              <td style={{ textAlign: 'right' }}>{(country.ctr * 100).toFixed(2)}%</td>
                              <td style={{ textAlign: 'right' }}>
                                   <PositionIndicator $position={country.position}>
                                     {country.position.toFixed(1)}
                                   </PositionIndicator>
                              </td>
                            </tr>
                          ))}
                       </tbody>
                   </Table>
                 </TableContainer>
             )}
          {/* CORRECTED: Moved the closing parenthesis here */}
        </>
      )}

       {/* Removed the orphaned blocks for 'analyticsData' and 'activeTab' checks */}

      <ExportSection>
        <ExportButton>
          <FiDownload size={16} /> {/* Use component directly */}
          <span>Export Report</span>
        </ExportButton>
        <ExportButton>
          <FiMail size={16} /> {/* Use component directly */}
          <span>Schedule Reports</span>
        </ExportButton>
      </ExportSection>
    </DashboardContainer>
  );
};

export default AnalyticsDashboard;