import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getSEOAuditsByClientId, SEOAudit, SEOReport, PageAnalysis } from '../utils/seoService';
import { getCurrentUser } from '../utils/authService';
import { getClientByUserId } from '../utils/clientService';

// Define UI-friendly types for SEO report data
interface UISEOReport {
  summary: string;
  score: number;
  pages: UIPageAnalysis[];
}

interface UIPageAnalysis {
  url: string;
  score: number;
  title?: string;
  headings: {
    h1: string[];
    h2: string[];
  };
  images: UIImageInfo[];
}

interface UIImageInfo {
  src: string;
  alt: string;
}

const PageContainer = styled.div`
  width: 100%;
  max-width: 100vw;
  position: relative;
  background: black;
  overflow: hidden;
`;

interface GradientCircleProps {
  left: string;
  top: string;
}

const GradientCircle = styled(motion.div)(({ left, top }: GradientCircleProps) => ({
  width: '718px',
  height: '718px',
  position: 'absolute',
  background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255, 66.94, 163.42, 0.17) 0%, rgba(255, 66.94, 163.42, 0) 100%)',
  borderRadius: '9999px',
  left,
  top,
  zIndex: 0,
  '@media (max-width: 1200px)': {
    width: '500px',
    height: '500px'
  },
  '@media (max-width: 768px)': {
    width: '300px',
    height: '300px'
  }
}));

const ContentContainer = styled.div({
  position: 'relative',
  zIndex: 1,
  maxWidth: '100%',
  paddingTop: '80px' /* Adjusted space for fixed header */
});

const Section = styled.section({
  padding: '100px 200px',
  position: 'relative',
  '@media (max-width: 1200px)': {
    padding: '80px 100px'
  },
  '@media (max-width: 992px)': {
    padding: '60px 60px'
  },
  '@media (max-width: 768px)': {
    padding: '50px 20px'
  }
});

const SectionTitle = styled(motion.h2)({
  color: 'white',
  fontSize: '48px',
  fontWeight: 700,
  marginBottom: '24px',
  background: 'linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  '@media (max-width: 992px)': {
    fontSize: '40px',
    marginBottom: '20px'
  },
  '@media (max-width: 768px)': {
    fontSize: '32px',
    marginBottom: '16px'
  }
});

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

const Paragraph = styled(motion.p)({
  color: 'rgba(255, 255, 255, 0.81)',
  fontSize: '18px',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: 400,
  lineHeight: '32px',
  marginBottom: '24px',
  maxWidth: '800px',
  '@media (max-width: 992px)': {
    fontSize: '16px',
    lineHeight: '28px',
    marginBottom: '20px'
  },
  '@media (max-width: 768px)': {
    fontSize: '15px',
    lineHeight: '26px',
    marginBottom: '16px'
  }
});

const HeroSection = styled.section({
  padding: '100px 200px 80px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  position: 'relative',
  '@media (max-width: 1200px)': {
    padding: '80px 100px 60px'
  },
  '@media (max-width: 992px)': {
    padding: '60px 60px 40px'
  },
  '@media (max-width: 768px)': {
    padding: '50px 20px 30px'
  }
});

const HeroTitle = styled(motion.h1)({
  color: 'white',
  fontSize: '64px',
  fontWeight: 800,
  marginBottom: '24px',
  maxWidth: '900px',
  background: 'linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  '@media (max-width: 992px)': {
    fontSize: '48px',
    marginBottom: '20px'
  },
  '@media (max-width: 768px)': {
    fontSize: '36px',
    marginBottom: '16px'
  }
});

const HeroSubtitle = styled(motion.p)({
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '24px',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: 400,
  lineHeight: '36px',
  marginBottom: '40px',
  maxWidth: '800px',
  '@media (max-width: 992px)': {
    fontSize: '20px',
    lineHeight: '32px',
    marginBottom: '30px'
  },
  '@media (max-width: 768px)': {
    fontSize: '18px',
    lineHeight: '28px',
    marginBottom: '24px'
  }
});

const ServicesGrid = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '40px',
  marginTop: '60px',
  '@media (max-width: 992px)': {
    gridTemplateColumns: '1fr',
    gap: '30px'
  }
});

const ServiceCard = styled(motion.div)({
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '20px',
  padding: '40px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.08)',
    transform: 'translateY(-5px)'
  },
  '@media (max-width: 768px)': {
    padding: '30px'
  }
});

const ServiceIcon = styled.div({
  width: '60px',
  height: '60px',
  borderRadius: '30px',
  background: 'linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '24px',
  fontSize: '24px',
  color: 'white',
  '@media (max-width: 768px)': {
    width: '50px',
    height: '50px',
    fontSize: '20px'
  }
});

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

const ProcessSection = styled(Section)`
  background: rgba(255, 255, 255, 0.02);
`;

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

const ResultsSection = styled(Section)``;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 60px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const ResultCard = styled(motion.div)`
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

const ResultNumber = styled.h3`
  color: white;
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const ResultText = styled.p`
  color: rgba(255, 255, 255, 0.81);
  font-size: 16px;
  line-height: 24px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 22px;
  }
`;

const FAQSection = styled(Section)`
  background: rgba(255, 255, 255, 0.02);
`;

const FAQContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 60px;
  
  @media (max-width: 992px) {
    gap: 16px;
  }
`;

const FAQItem = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  overflow: hidden;
`;

const FAQQuestion = styled.div<{ $isOpen: boolean }>`
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  
  h4 {
    color: white;
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    
    @media (max-width: 768px) {
      font-size: 18px;
    }
  }
  
  span {
    color: white;
    font-size: 24px;
    transform: ${props => props.$isOpen ? 'rotate(45deg)' : 'rotate(0)'};
    transition: transform 0.3s ease;
  }
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const FAQAnswer = styled(motion.div)`
  padding: 0 24px 24px;
  color: rgba(255, 255, 255, 0.81);
  font-size: 16px;
  line-height: 26px;
  
  @media (max-width: 768px) {
    padding: 0 20px 20px;
    font-size: 14px;
    line-height: 24px;
  }
`;

const CTASection = styled(Section)`
  text-align: center;
  padding-bottom: 150px;
`;

const CTAButton = styled(motion.button)({
  background: 'linear-gradient(90deg, #1F53FF 0%, #FF43A3 100%)',
  color: 'white',
  fontSize: '18px',
  fontWeight: 600,
  padding: '16px 40px',
  border: 'none',
  borderRadius: '30px',
  cursor: 'pointer',
  marginTop: '40px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(31, 83, 255, 0.3)'
  },
  '@media (max-width: 768px)': {
    fontSize: '16px'
  }
});

const SEOServicesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'summary' | 'full'>('summary');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [seoReport, setSeoReport] = useState<UISEOReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleFAQ = (index: number) => {
    if (openFAQ === index) {
      setOpenFAQ(null);
    } else {
      setOpenFAQ(index);
    }
  };

  // Function to convert SEO audit data to UI-friendly format
  const convertToUIFormat = (audit: SEOAudit): UISEOReport | null => {
    if (!audit || !audit.report) return null;
    
    const report = audit.report;
    
    // Create UI-friendly page data
    interface UIPageData {
  url: string;
  title: string;
  score: number;
  images: { src: string; alt: string }[];
  issues: Array<{
    type: string;
    detail: string;
    recommendation: string;
    proof: {
      severity: string;
      impact: string;
    };
  }>;
  headings: {
    h1: string[];
    h2: string[];
  };
}
const uiPages: UIPageData[] = report.pages?.map((page: PageAnalysis) => ({
  url: page.url,
  title: page.title,
  score: page.score,
  images: Array.isArray(page.images) ? page.images.map((img: any) => ({ src: img.src, alt: img.alt })) : [],
  issues: page.issues.map(issue => ({
    type: issue.title,
    detail: issue.description,
    recommendation: issue.recommendation,
    proof: {
      severity: issue.severity,
      impact: issue.impact
    }
  })),
  headings: {
    h1: page.headings.h1 || [],
    h2: page.headings.h2 || []
  }
}));
    
    return {
      summary: report.overall.summary,
      score: report.overall.score,
      pages: uiPages
    };
  };
  
  // Fetch SEO audit data
  useEffect(() => {
    const fetchSEOAuditData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        const user = getCurrentUser();
        if (!user) {
          throw new Error('You must be logged in to view SEO audits');
        }
        
        let clientId = '';
        
        // If admin, use a default client ID or the first client
        if (user.role === 'admin') {
          // For demo purposes, we'll use a hardcoded client ID
          // In a real app, you might want to let the admin select a client
          clientId = '00000000-0000-0000-0000-000000000000';
        } else if (user.role === 'client') {
          // For clients, use their own client ID
          clientId = user.id;
        } else {
          throw new Error('Unknown user role');
        }
        
        // Fetch SEO audits for the client
        const audits = await getSEOAuditsByClientId(clientId);
        
        if (!audits || audits.length === 0) {
          throw new Error('No SEO audits found for this client');
        }
        
        // Use the most recent audit
        const latestAudit = audits[0];
        
        // Convert to UI format
        const formattedReport = convertToUIFormat(latestAudit);
        
        if (!formattedReport) {
          throw new Error('Could not format SEO audit report');
        }
        
        setSeoReport(formattedReport);
      } catch (err) {
        console.error('Error fetching SEO audit:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSEOAuditData();
  }, []);
  
  return (
    <PageContainer>
      {/* ... */}
    </PageContainer>
  );
};

export default SEOServicesPage;

const TabPanel = styled.div({
  background: 'rgba(255,255,255,0.03)',
  borderRadius: '0 0 20px 20px',
  padding: '32px 24px',
  color: 'white',
  minHeight: '300px'
});

const FullReportContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '32px'
});

const ReportPageCard = styled.div({
  background: 'rgba(255,255,255,0.04)',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '16px'
});

const ReportPageTitle = styled.h3({
  color: '#1F53FF',
  fontSize: '24px',
  marginBottom: '4px'
});

const ReportPageUrl = styled.div({
  color: '#FF43A3',
  fontSize: '15px',
  marginBottom: '8px'
});

const ReportPageScore = styled.div({
  color: '#fff',
  fontSize: '17px',
  marginBottom: '12px'
});

const ReportSectionTitle = styled.h4({
  color: '#fff',
  fontSize: '18px',
  marginTop: '18px',
  marginBottom: '8px'
});

const NoIssuesText = styled.div({
  color: '#6ee7b7',
  fontSize: '15px'
});

// Loading state styles
const LoadingContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 0'
});

const spinAnimation = keyframes({
  from: {
    transform: 'rotate(0deg)'
  },
  to: {
    transform: 'rotate(360deg)'
  }
});

const LoadingSpinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #1F53FF;
  width: 50px;
  height: 50px;
  animation: ${spinAnimation} 1s linear infinite;
  margin-bottom: 20px;
`;


const LoadingText = styled.div({
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '18px'
});

// Error state styles
const ErrorContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 0',
  textAlign: 'center'
});

const ErrorIcon = styled.div({
  fontSize: '40px',
  marginBottom: '16px'
});

const ErrorMessage = styled.div({
  color: '#ff4d4d',
  fontSize: '20px',
  marginBottom: '8px',
  fontWeight: 600
});

const ErrorHint = styled.div({
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '16px',
  maxWidth: '400px'
});

// No data state styles
const NoDataContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 0',
  textAlign: 'center'
});

const NoDataIcon = styled.div({
  fontSize: '40px',
  marginBottom: '16px'
});

const NoDataMessage = styled.div({
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '20px',
  marginBottom: '8px',
  fontWeight: 600
});

const NoDataHint = styled.div({
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '16px',
  maxWidth: '400px'
});

// Summary tab styles
const SummaryContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '32px'
});

const OverallScore = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '20px'
});

const ScoreLabel = styled.div({
  fontSize: '18px',
  color: 'rgba(255, 255, 255, 0.8)'
});

const PageScoresContainer = styled.div({
  marginTop: '20px'
});

const PageScoresTitle = styled.h4({
  color: 'white',
  fontSize: '20px',
  marginBottom: '16px'
});

const PageScoresList = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
});

const PageScoreItem = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
  '@media (max-width: 768px)': {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px'
  }
});

const PageScoreUrl = styled.div({
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '15px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '300px',
  '@media (max-width: 992px)': {
    maxWidth: '200px'
  }
});

interface PageScoreBarProps {
  score: number;
}
const PageScoreBar = styled.div(({ score }: PageScoreBarProps) => ({
  flex: 1,
  height: '24px',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  position: 'relative',
  overflow: 'hidden',
  minWidth: '200px',
  '&:before': {
    content: "''",
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: score + '%',
    background: 
      score >= 80 ? 'linear-gradient(90deg, #34d399 0%, #10b981 100%)' :
      score >= 60 ? 'linear-gradient(90deg, #fbbf24 0%, #d97706 100%)' :
      'linear-gradient(90deg, #f87171 0%, #dc2626 100%)'
  }
}));

const PageScoreValue = styled.div({
  position: 'absolute',
  right: '10px',
  top: 0,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  color: 'white',
  fontSize: '14px',
  fontWeight: 600,
  zIndex: 1
});
// --- END SEO Audit Tab Styles ---


