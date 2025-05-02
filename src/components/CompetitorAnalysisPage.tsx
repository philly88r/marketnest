import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiSearch, FiRefreshCw, FiExternalLink, FiChevronDown, FiChevronUp, FiCheck, FiX } from 'react-icons/fi';
import { 
  analyzeCompetitors, 
  getCompetitorAnalysesByClientId, 
  deleteCompetitorAnalysis,
  CompetitorAnalysis,
  CompetitorData
} from '../utils/competitorAnalysisService';
import { getCurrentUser } from '../utils/authService';

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  color: #ffffff;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #333;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #1a1a1a;
`;

const MainContent = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const AnalysisForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: #262626;
  border-radius: 8px;
  position: relative;
  z-index: 1;
  overflow: visible;
`;

const FormTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: 6px;
  background-color: #333;
  border: 1px solid #444;
  color: #ffffff;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0df9b6;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #262626;
  color: #ffffff;
  border: 1px solid #333;

  &:hover {
    background-color: #333;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: #0df9b6;
  color: #000000;
  border: none;
  position: relative;
  z-index: 100;
  cursor: pointer;
  pointer-events: auto;

  &:hover {
    background-color: #0be0a5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #0df9b6;
    color: #000000;
  }
`;

const ErrorMessage = styled.div`
  color: #ff3b30;
  font-size: 14px;
  margin-top: 8px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  font-size: 14px;
  color: #999;

  svg {
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
    font-size: 24px;
  }
  
  p {
    margin: 8px 0 0 0;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const NoAnalysesMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: #262626;
  border-radius: 8px;
  text-align: center;
`;

const AnalysisList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
`;

const AnalysisCard = styled.div`
  background-color: #262626;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
`;

const AnalysisCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #333;
  cursor: pointer;
  position: relative;
  z-index: 2;
  
  &:hover {
    background-color: #2a2a2a;
  }
  
  &:active {
    background-color: #333;
  }
`;

const AnalysisCardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const AnalysisCardContent = styled.div`
  padding: 20px;
  position: relative;
  z-index: 1;
  overflow: visible;
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;

  background: ${props => 
    props.$status === 'completed' ? 'rgba(52, 199, 89, 0.2)' : 
    props.$status === 'in-progress' || props.$status === 'processing' ? 'rgba(0, 122, 255, 0.2)' : 
    'rgba(255, 59, 48, 0.2)'};
  color: ${props => 
    props.$status === 'completed' ? '#34c759' : 
    props.$status === 'in-progress' || props.$status === 'processing' ? '#007aff' : 
    '#ff3b30'};
`;

const CompetitorsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
`;

const CompetitorCard = styled.div`
  background-color: #333;
  border-radius: 8px;
  padding: 16px;
`;

const CompetitorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const CompetitorTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const CompetitorUrl = styled.a`
  color: #0df9b6;
  font-size: 14px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    text-decoration: underline;
  }
`;

const CompetitorDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionTitle = styled.h5`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #999;
`;

const List = styled.ul`
  margin: 0;
  padding: 0 0 0 20px;
  list-style-type: disc;
`;

const ListItem = styled.li`
  margin-bottom: 4px;
  font-size: 14px;
`;

const ScoreBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #262626;
  font-size: 14px;
  font-weight: 600;
  color: ${props => {
    const score = parseInt(props.children as string);
    if (score >= 80) return '#34c759';
    if (score >= 60) return '#ffcc00';
    return '#ff3b30';
  }};
  border: 2px solid ${props => {
    const score = parseInt(props.children as string);
    if (score >= 80) return '#34c759';
    if (score >= 60) return '#ffcc00';
    return '#ff3b30';
  }};
`;

const RecommendationsList = styled.div`
  margin-top: 24px;
  background-color: #333;
  border-radius: 8px;
  padding: 20px;
`;

const RecommendationsTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
`;

const DeleteButton = styled(Button)`
  background-color: rgba(255, 59, 48, 0.2);
  color: #ff3b30;
  border: 1px solid rgba(255, 59, 48, 0.4);

  &:hover {
    background-color: rgba(255, 59, 48, 0.3);
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  position: relative;
  z-index: 10;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  &:active {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

interface CompetitorAnalysisPageProps {
  clientId: string;
}

const CompetitorAnalysisPage: React.FC<CompetitorAnalysisPageProps> = ({ clientId }) => {
  const [analyses, setAnalyses] = useState<CompetitorAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedAnalysisId, setExpandedAnalysisId] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch analyses on component mount
  useEffect(() => {
    fetchAnalyses();
    
    return () => {
      // Clean up refresh interval on unmount
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [clientId]);

  // Set up refresh interval for in-progress analyses
  useEffect(() => {
    const hasInProgressAnalyses = analyses.some(
      analysis => analysis.status === 'in-progress' || analysis.status === 'processing'
    );
    
    if (hasInProgressAnalyses && !refreshInterval) {
      // Set up interval to refresh analyses every 10 seconds
      const interval = setInterval(() => {
        fetchAnalyses(false);
      }, 10000);
      
      setRefreshInterval(interval);
    } else if (!hasInProgressAnalyses && refreshInterval) {
      // Clear interval if no analyses are in progress
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [analyses, refreshInterval]);

  const fetchAnalyses = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      const analyses = await getCompetitorAnalysesByClientId(clientId);
      setAnalyses(analyses);
    } catch (err) {
      console.error('Error fetching competitor analyses:', err);
      setError('Failed to load competitor analyses. Please try again later.');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword.trim()) {
      setError('Please enter a keyword to analyze.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const user = getCurrentUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      await analyzeCompetitors(keyword.trim(), user.id, clientId);
      
      // Clear form
      setKeyword('');
      
      // Refresh analyses
      await fetchAnalyses();
      
    } catch (err) {
      console.error('Error submitting competitor analysis:', err);
      setError('Failed to start competitor analysis. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnalysis = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this competitor analysis?')) {
      return;
    }
    
    try {
      await deleteCompetitorAnalysis(id);
      
      // Remove from state
      setAnalyses(analyses.filter(analysis => analysis.id !== id));
      
      // Close expanded view if this analysis was expanded
      if (expandedAnalysisId === id) {
        setExpandedAnalysisId(null);
      }
    } catch (err) {
      console.error('Error deleting competitor analysis:', err);
      alert('Failed to delete competitor analysis. Please try again.');
    }
  };

  const toggleAnalysisExpand = (id: string, event?: React.MouseEvent) => {
    // Stop propagation to prevent double-triggering
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('Toggling analysis expand for ID:', id);
    console.log('Current expandedAnalysisId:', expandedAnalysisId);
    
    setExpandedAnalysisId(prevId => {
      const newId = prevId === id ? null : id;
      console.log('Setting expandedAnalysisId to:', newId);
      return newId;
    });
  };

  const renderStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <StatusBadge $status={status}><FiCheck size={12} /> Completed</StatusBadge>;
    }
    
    if (status === 'in-progress' || status === 'processing') {
      return <StatusBadge $status={status}><FiRefreshCw size={12} /> In Progress</StatusBadge>;
    }
    
    return <StatusBadge $status={status}><FiX size={12} /> Failed</StatusBadge>;
  };

  const renderCompetitor = (competitor: CompetitorData | null) => {
    // If competitor is null or undefined, show a placeholder
    if (!competitor) {
      return (
        <CompetitorCard>
          <CompetitorHeader>
            <div>
              <CompetitorTitle>No competitor data available</CompetitorTitle>
            </div>
          </CompetitorHeader>
          <CompetitorDetails>
            <DetailSection>
              <p>The competitor data could not be loaded or is incomplete.</p>
            </DetailSection>
          </CompetitorDetails>
        </CompetitorCard>
      );
    }
    
    // Safe access to properties with fallbacks
    const title = competitor.title || 'Untitled';
    const url = competitor.url || '#';
    const strengths = competitor.strengths || [];
    const weaknesses = competitor.weaknesses || [];
    const score = competitor.seoAudit?.score;
    
    return (
      <CompetitorCard key={url}>
        <CompetitorHeader>
          <div>
            <CompetitorTitle>{title}</CompetitorTitle>
            <CompetitorUrl href={url} target="_blank" rel="noopener noreferrer">
              {url.length > 50 ? url.substring(0, 50) + '...' : url}
              <FiExternalLink size={12} />
            </CompetitorUrl>
          </div>
          {score !== undefined && (
            <ScoreBadge>{Math.round(score)}</ScoreBadge>
          )}
        </CompetitorHeader>
        
        <CompetitorDetails>
          {strengths.length > 0 && (
            <DetailSection>
              <SectionTitle>Strengths</SectionTitle>
              <List>
                {strengths.map((strength, index) => (
                  <ListItem key={index}>{strength}</ListItem>
                ))}
              </List>
            </DetailSection>
          )}
          
          {weaknesses.length > 0 && (
            <DetailSection>
              <SectionTitle>Weaknesses</SectionTitle>
              <List>
                {weaknesses.map((weakness, index) => (
                  <ListItem key={index}>{weakness}</ListItem>
                ))}
              </List>
            </DetailSection>
          )}
        </CompetitorDetails>
      </CompetitorCard>
    );
  };

  const renderAnalysisCard = (analysis: CompetitorAnalysis) => {
    const isExpanded = expandedAnalysisId === analysis.id;
    
    return (
      <AnalysisCard key={analysis.id}>
        <AnalysisCardHeader onClick={() => toggleAnalysisExpand(analysis.id)}>
          <AnalysisCardTitle>
            Keyword: "{analysis.keyword}"
          </AnalysisCardTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {renderStatusBadge(analysis.status)}
            <ToggleButton 
              onClick={(e) => toggleAnalysisExpand(analysis.id, e)}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </ToggleButton>
          </div>
        </AnalysisCardHeader>
        
        {isExpanded && (
          <AnalysisCardContent>
            {(analysis.status === 'in-progress' || analysis.status === 'processing') && (
              <LoadingSpinner>
                <FiRefreshCw size={24} />
                <p>Analyzing competitors for "{analysis.keyword}"...</p>
                <p>This may take a few minutes.</p>
              </LoadingSpinner>
            )}
            
            {analysis.status === 'completed' && (
              <>
                <CompetitorsList>
                  {Array.isArray(analysis.competitors) && analysis.competitors.length > 0 
                    ? analysis.competitors.map((competitor, index) => (
                        <div key={index}>{renderCompetitor(competitor)}</div>
                      ))
                    : <p>No competitor data available. The analysis may be incomplete.</p>
                  }
                </CompetitorsList>
                
                {Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 ? (
                  <RecommendationsList>
                    <RecommendationsTitle>Recommendations to Outrank Competitors</RecommendationsTitle>
                    <List>
                      {analysis.recommendations.map((recommendation, index) => (
                        <ListItem key={index}>{recommendation || 'No recommendation available'}</ListItem>
                      ))}
                    </List>
                  </RecommendationsList>
                ) : null}
              </>
            )}
            
            {analysis.status === 'failed' && (
              <ErrorMessage>
                The analysis failed to complete. Please try again with a different keyword.
              </ErrorMessage>
            )}
            
            <ActionButtons>
              <DeleteButton onClick={() => handleDeleteAnalysis(analysis.id)}>
                Delete Analysis
              </DeleteButton>
            </ActionButtons>
          </AnalysisCardContent>
        )}
      </AnalysisCard>
    );
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Competitor Analysis</Title>
        </Header>
        <ContentContainer>
          <MainContent>
            <LoadingSpinner>
              <FiRefreshCw size={24} />
              <p>Loading competitor analyses...</p>
            </LoadingSpinner>
          </MainContent>
        </ContentContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Competitor Analysis</Title>
      </Header>
      
      <ContentContainer>
        <MainContent>
          <AnalysisForm onSubmit={handleSubmit}>
            <FormTitle>Analyze Competitors for a Keyword</FormTitle>
            
            <FormGroup>
              <Label htmlFor="keyword">Keyword</Label>
              <Input
                id="keyword"
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="Enter a keyword to analyze competitors"
                disabled={isSubmitting}
              />
            </FormGroup>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <PrimaryButton 
                key={`submit-button-${Date.now()}`}
                type="submit" 
                disabled={isSubmitting || !keyword.trim()}
                style={{ position: 'relative', zIndex: 10 }}
              >
                {isSubmitting ? <FiRefreshCw size={16} /> : <FiSearch size={16} />}
                {isSubmitting ? 'Analyzing...' : 'Analyze Competitors'}
              </PrimaryButton>
            </div>
          </AnalysisForm>
          
          {analyses.length === 0 ? (
            <NoAnalysesMessage>
              <p>No competitor analyses found for this client.</p>
              <p>Enter a keyword above to analyze competitors.</p>
            </NoAnalysesMessage>
          ) : (
            <AnalysisList>
              {analyses.map(analysis => renderAnalysisCard(analysis))}
            </AnalysisList>
          )}
        </MainContent>
      </ContentContainer>
    </Container>
  );
};

export default CompetitorAnalysisPage;
