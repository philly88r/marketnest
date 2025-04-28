import React, { useState } from 'react';
import styled from 'styled-components';
import { FiAlertCircle, FiAlertTriangle, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { SEOIssue, SEOScoreSection } from '../utils/seoService';

interface SEOTechnicalSectionProps {
  technicalData: SEOScoreSection | string;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return '#34c759';
  if (score >= 60) return '#ff9500';
  return '#ff3b30';
};

const SEOTechnicalSection: React.FC<SEOTechnicalSectionProps> = ({ technicalData }) => {
  // Always declare hooks at the top level, regardless of conditions
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Check if technicalData is a string (HTML content)
  if (typeof technicalData === 'string') {
    return (
      <Container>
        <div 
          className="seo-technical-content"
          dangerouslySetInnerHTML={{ __html: technicalData }}
          style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#ffffff',
            padding: '20px',
            backgroundColor: '#262626',
            borderRadius: '8px',
          }}
        />
      </Container>
    );
  }
  
  const { score, issues } = technicalData;

  // Filter issues based on severity and search query
  const filteredIssues = issues.filter(issue => {
    const matchesSeverity = !filterSeverity || issue.severity === filterSeverity;
    const matchesSearch = !searchQuery || 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSeverity && matchesSearch;
  });

  // Count issues by severity
  const highCount = issues.filter(issue => issue.severity === 'high').length;
  const mediumCount = issues.filter(issue => issue.severity === 'medium').length;
  const lowCount = issues.filter(issue => issue.severity === 'low').length;

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <FiAlertCircle color="#ff3b30" />;
      case 'medium':
        return <FiAlertTriangle color="#ff9500" />;
      case 'low':
        return <FiInfo color="#5ac8fa" />;
      default:
        return <FiInfo color="#8e8e93" />;
    }
  };

  return (
    <Container>
      <Header>
        <Title>Technical SEO</Title>
        <Score $score={score}>{score}/100</Score>
      </Header>

      <SummaryCards>
        <SummaryCard $severity="high" onClick={() => setFilterSeverity(filterSeverity === 'high' ? null : 'high')}>
          <SummaryValue>{highCount}</SummaryValue>
          <SummaryLabel>High Issues</SummaryLabel>
        </SummaryCard>
        <SummaryCard $severity="medium" onClick={() => setFilterSeverity(filterSeverity === 'medium' ? null : 'medium')}>
          <SummaryValue>{mediumCount}</SummaryValue>
          <SummaryLabel>Medium Issues</SummaryLabel>
        </SummaryCard>
        <SummaryCard $severity="low" onClick={() => setFilterSeverity(filterSeverity === 'low' ? null : 'low')}>
          <SummaryValue>{lowCount}</SummaryValue>
          <SummaryLabel>Low Issues</SummaryLabel>
        </SummaryCard>
      </SummaryCards>

      <FilterContainer>
        <SearchInput
          type="text"
          placeholder="Search issues..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FilterTags>
          {filterSeverity && (
            <FilterTag $severity={filterSeverity} onClick={() => setFilterSeverity(null)}>
              {filterSeverity.charAt(0).toUpperCase() + filterSeverity.slice(1)} ×
            </FilterTag>
          )}
        </FilterTags>
      </FilterContainer>

      <IssuesList>
        {filteredIssues.length === 0 && (
          <NoIssues>
            {issues.length === 0 ? (
              <>
                <FiCheckCircle color="#34c759" style={{ marginRight: '8px' }} />
                No technical SEO issues found!
              </>
            ) : (
              <>
                <FiInfo color="#8e8e93" style={{ marginRight: '8px' }} />
                No issues match your filters.
              </>
            )}
          </NoIssues>
        )}
        
        {filteredIssues.map((issue, index) => (
          <IssueCard key={index}>
            <IssueHeader>
              <IssueSeverity $severity={issue.severity}>
                {getSeverityIcon(issue.severity)}
                {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
              </IssueSeverity>
            </IssueHeader>
            
            <IssueTitle>{issue.title}</IssueTitle>
            <IssueDescription>{issue.description}</IssueDescription>
            
            <IssueSection>
              <IssueSectionTitle>Impact</IssueSectionTitle>
              <IssueSectionContent>{issue.impact}</IssueSectionContent>
            </IssueSection>
            
            <IssueSection>
              <IssueSectionTitle>Recommendation</IssueSectionTitle>
              <IssueSectionContent>{issue.recommendation}</IssueSectionContent>
            </IssueSection>
          </IssueCard>
        ))}
      </IssuesList>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const Score = styled.div<{ $score: number }>`
  font-size: 18px;
  font-weight: 600;
  color: ${props => getScoreColor(props.$score)};
`;

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const SummaryCard = styled.div<{ $severity: string }>`
  background-color: ${props => {
    switch (props.$severity) {
      case 'high': return 'rgba(255, 59, 48, 0.1)';
      case 'medium': return 'rgba(255, 149, 0, 0.1)';
      case 'low': return 'rgba(90, 200, 250, 0.1)';
      default: return 'rgba(142, 142, 147, 0.1)';
    }
  }};
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const SummaryValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  text-align: center;
`;

const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const SearchInput = styled.input`
  background-color: #333;
  color: #ffffff;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 10px 12px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0df9b6;
  }
`;

const FilterTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterTag = styled.div<{ $severity: string }>`
  background-color: ${props => {
    switch (props.$severity) {
      case 'high': return 'rgba(255, 59, 48, 0.1)';
      case 'medium': return 'rgba(255, 149, 0, 0.1)';
      case 'low': return 'rgba(90, 200, 250, 0.1)';
      default: return 'rgba(142, 142, 147, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.$severity) {
      case 'high': return '#ff3b30';
      case 'medium': return '#ff9500';
      case 'low': return '#5ac8fa';
      default: return '#8e8e93';
    }
  }};
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
`;

const IssuesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NoIssues = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: #999;
  font-size: 14px;
`;

const IssueCard = styled.div`
  background-color: #262626;
  border-radius: 8px;
  padding: 16px;
`;

const IssueHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const IssueSeverity = styled.div<{ $severity: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => {
    switch (props.$severity) {
      case 'high': return '#ff3b30';
      case 'medium': return '#ff9500';
      case 'low': return '#5ac8fa';
      default: return '#8e8e93';
    }
  }};
`;

const IssueTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
`;

const IssueDescription = styled.p`
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 16px 0;
  color: #ccc;
`;

const IssueSection = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const IssueSectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #999;
`;

const IssueSectionContent = styled.p`
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
`;

export default SEOTechnicalSection;
