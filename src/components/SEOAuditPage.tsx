import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiTrash2, FiDownload, FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { 
  generateSEOAudit, 
  getSEOAuditsByClientId, 
  deleteSEOAudit,
  SEOAudit,
  SEOReport,
  SEOIssue,
  PageAnalysis
} from '../utils/seoService';
import SEOTechnicalSection from './SEOTechnicalSection';

// Utility functions
// Get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return '#34c759';
    case 'in-progress':
      return '#007aff';
    case 'pending':
      return '#ff9500';
    case 'failed':
      return '#ff3b30';
    default:
      return '#8e8e93';
  }
};

// Get score color based on value
const getScoreColor = (score: number) => {
  if (score >= 80) return '#34c759';
  if (score >= 60) return '#ff9500';
  return '#ff3b30';
};

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface SEOAuditPageProps {
  clientId: string;
}

// Helper function to get critical issues from the report
const getCriticalIssues = (report: SEOReport | null): SEOIssue[] => {
  if (!report) return [];

  const allIssues: SEOIssue[] = [];
  
  // Collect issues from all sections
  if (report.technical?.issues) allIssues.push(...report.technical.issues);
  if (report.content?.issues) allIssues.push(...report.content.issues);
  if (report.onPage?.issues) allIssues.push(...report.onPage.issues);
  if (report.performance?.issues) allIssues.push(...report.performance.issues);
  if (report.mobile?.issues) allIssues.push(...report.mobile.issues);
  if (report.backlinks?.issues) allIssues.push(...report.backlinks.issues);
  if (report.keywords?.issues) allIssues.push(...report.keywords.issues);
  
  // Collect issues from pages
  if (report.pages) {
    report.pages.forEach(page => {
      if (page.issues) allIssues.push(...page.issues);
    });
  }
  
  // Filter for high severity issues
  return allIssues
    .filter(issue => issue.severity === 'high')
    .sort((a, b) => {
      // Sort by priority if available
      if (a.priority && b.priority) return a.priority - b.priority;
      return 0;
    })
    .slice(0, 5); // Return top 5 critical issues
};

const SEOAuditPage: React.FC<SEOAuditPageProps> = ({ clientId }) => {
  const [audits, setAudits] = useState<SEOAudit[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<SEOAudit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [showNewAuditForm, setShowNewAuditForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'pages' | 'technical' | 'content' | 'onPage' | 'performance' | 'backlinks' | 'keywords' | 'recommendations'>('overview');

  // Load audits when the component mounts
  useEffect(() => {
    const loadAudits = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Use a default client ID if not available (for testing without Supabase setup)
        const effectiveClientId = clientId === 'anonymous' ? '00000000-0000-0000-0000-000000000000' : clientId;
        console.log('Loading audits for client ID:', effectiveClientId);
        
        const auditData = await getSEOAuditsByClientId(effectiveClientId);
        setAudits(auditData);
        
        // Select the most recent audit if available
        if (auditData && auditData.length > 0) {
          // Sort by created date (newest first) and select the first one
          const sortedAudits = [...auditData].sort((a, b) => {
            // If an audit is in progress or processing, prioritize it
            if (a.status === 'in-progress' || a.status === 'processing') return -1;
            if (b.status === 'in-progress' || b.status === 'processing') return 1;
            
            // Otherwise sort by created date
            return new Date(b.id).getTime() - new Date(a.id).getTime();
          });
          
          setSelectedAudit(sortedAudits[0]);
        }
      } catch (err) {
        console.error('Error loading SEO audits:', err);
        setError('Failed to load SEO audits. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAudits();
  }, [clientId]);

  // Handle polling for audit updates
  useEffect(() => {
    // Only set up polling if we have a selected audit in progress
    if (!selectedAudit || selectedAudit.status === 'completed' || selectedAudit.status === 'failed') {
      return;
    }
    
    console.log('Setting up polling for audit:', selectedAudit.id);
    
    // Start polling for updates
    const pollInterval = setInterval(async () => {
      try {
        // Fetch the latest audits
        const updatedAudits = await getSEOAuditsByClientId(clientId);
        
        if (!updatedAudits || !Array.isArray(updatedAudits)) {
          console.error('Invalid audit data received:', updatedAudits);
          return;
        }
        
        setAudits(updatedAudits);
        
        // Find the current audit in the updated list
        const updatedAudit = updatedAudits.find(audit => audit && audit.id === selectedAudit.id);
        
        // Update the selected audit if it exists
        if (updatedAudit) {
          setSelectedAudit(updatedAudit);
          
          // If the audit is completed or failed, stop polling
          if (updatedAudit.status === 'completed' || updatedAudit.status === 'failed') {
            clearInterval(pollInterval);
          }
        }
      } catch (pollError) {
        console.error('Error polling for audit updates:', pollError);
        clearInterval(pollInterval);
      }
    }, 5000); // Poll every 5 seconds
    
    // Clean up the interval when the component unmounts or selectedAudit changes
    return () => {
      console.log('Cleaning up polling interval');
      clearInterval(pollInterval);
    };
  }, [selectedAudit?.id, clientId]);

  // Handle creating a new SEO audit
  const handleCreateAudit = async () => {
    if (!url) {
      setError('Please enter a URL to audit');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Creating new SEO audit for URL:', url);
      
      // Use a default client ID if not available (for testing without Supabase setup)
      const effectiveClientId = clientId === 'anonymous' ? '00000000-0000-0000-0000-000000000000' : clientId;
      console.log('Using client ID:', effectiveClientId);
      
      // Generate a new UUID for each audit - don't reuse existing IDs
      // Create an initial audit with 'in-progress' status
      const newAudit = await generateSEOAudit(url, effectiveClientId);
      
      console.log('Received new audit:', newAudit);
      
      // Verify we have a valid audit object with an ID
      if (!newAudit || !newAudit.id) {
        console.error('Invalid audit response:', newAudit);
        throw new Error('Failed to create audit - invalid response');
      }
      
      // Add the new audit to the list and select it
      setAudits(prevAudits => [newAudit, ...prevAudits]);
      setSelectedAudit(newAudit);
      setUrl('');
      setShowNewAuditForm(false);
      
      // Refresh the audit list after a short delay to get updated status
      setTimeout(async () => {
        try {
          const refreshedAudits = await getSEOAuditsByClientId(clientId);
          if (refreshedAudits && Array.isArray(refreshedAudits)) {
            setAudits(refreshedAudits);
            
            // Find and select the newly created audit
            const createdAudit = refreshedAudits.find(audit => audit.id === newAudit.id);
            if (createdAudit) {
              setSelectedAudit(createdAudit);
            }
          } else {
            console.warn('Refreshed audits returned invalid data:', refreshedAudits);
          }
        } catch (refreshError) {
          console.error('Error refreshing audits:', refreshError);
        }
      }, 2000);
    } catch (err: any) {
      console.error('Error creating SEO audit:', err);
      setError(`Failed to create SEO audit: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting an SEO audit
  const handleDeleteAudit = async (auditId: string) => {
    if (!window.confirm('Are you sure you want to delete this SEO audit?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteSEOAudit(auditId);
      
      // Remove the deleted audit from the list
      setAudits(prevAudits => prevAudits.filter(audit => audit.id !== auditId));
      
      // If the deleted audit was selected, clear the selection
      if (selectedAudit && selectedAudit.id === auditId) {
        setSelectedAudit(null);
      }
    } catch (err) {
      console.error('Error deleting SEO audit:', err);
      setError('Failed to delete SEO audit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>SEO Audit</Title>
        <ActionButton onClick={() => setShowNewAuditForm(true)}>
          <FiPlus size={16} /> New Audit
        </ActionButton>
      </Header>
      
      <Content>
        {error && (
          <ErrorContainer>
            <FiAlertCircle size={18} />
            <ErrorMessage>{error}</ErrorMessage>
          </ErrorContainer>
        )}

        {showNewAuditForm && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(0, 0, 0, 0.7)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            zIndex: 1000
          }}>
            <Card>
              <CardTitle>Create New SEO Audit</CardTitle>
              <Form onSubmit={(e) => e.preventDefault()}>
                <FormGroup>
                  <Label>Website URL</Label>
                  <Input 
                    type="url" 
                    value={url} 
                    onChange={(e) => setUrl(e.target.value)} 
                    placeholder="https://example.com" 
                    required 
                  />
                </FormGroup>
                <ButtonGroup>
                  <Button 
                    type="button" 
                    $secondary 
                    onClick={() => setShowNewAuditForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleCreateAudit} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <FiRefreshCw size={16} style={{ marginRight: '8px', animation: 'spin 2s linear infinite' }} />
                        Creating...
                      </>
                    ) : (
                      'Create Audit'
                    )}
                  </Button>
                </ButtonGroup>
              </Form>
            </Card>
          </div>
        )}

        <ContentContainer>
          <Sidebar>
            <SidebarTitle>Audit History</SidebarTitle>
            {isLoading && audits.length === 0 ? (
              <Loading>Loading audits...</Loading>
            ) : audits.length === 0 ? (
              <NoData>No audits found</NoData>
            ) : (
              audits.filter(audit => audit && audit.id).map(audit => (
                <AuditItem 
                  key={audit.id} 
                  $isSelected={selectedAudit?.id === audit.id}
                  onClick={() => setSelectedAudit(audit)}
                >
                  <AuditItemHeader>
                    <AuditItemUrl>{audit.url}</AuditItemUrl>
                    <StatusBadge $status={audit.status}>
                      {audit.status.charAt(0).toUpperCase() + audit.status.slice(1)}
                    </StatusBadge>
                  </AuditItemHeader>
                  <AuditItemMeta>
                    {formatDate(audit.created_at)}
                  </AuditItemMeta>
                  <AuditItemActions>
                    <ActionIcon 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAudit(audit.id);
                      }}
                      title="Delete Audit"
                    >
                      <FiTrash2 size={16} />
                    </ActionIcon>
                  </AuditItemActions>
                </AuditItem>
              ))
            )}
          </Sidebar>

          <MainContent>
            {selectedAudit ? (
              <>
                <AuditHeader>
                  <AuditUrl href={selectedAudit.url} target="_blank" rel="noopener noreferrer">
                    {selectedAudit.url}
                  </AuditUrl>
                  <AuditMeta>
                    <AuditDate>
                      {formatDate(selectedAudit.created_at)}
                      {selectedAudit.status === 'in-progress' && (
                        <StatusBadge $status={selectedAudit.status}>
                          <FiRefreshCw size={12} style={{ marginRight: '4px', animation: 'spin 2s linear infinite' }} /> Processing
                        </StatusBadge>
                      )}
                      {selectedAudit.status === 'failed' && (
                        <StatusBadge $status={selectedAudit.status}>
                          <FiAlertCircle size={12} style={{ marginRight: '4px' }} /> Failed
                        </StatusBadge>
                      )}
                    </AuditDate>
                    {selectedAudit.status === 'completed' && selectedAudit?.report?.overall && (
                      <AuditScore $score={selectedAudit?.report?.overall?.score || 0}>
                        Score: {selectedAudit?.report?.overall?.score || 'N/A'}/100
                      </AuditScore>
                    )}
                  </AuditMeta>
                </AuditHeader>

                {selectedAudit.status === 'in-progress' && (
                  <SummaryCard>
                    <SummaryText>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <FiRefreshCw size={24} style={{ marginRight: '12px', animation: 'spin 2s linear infinite' }} />
                        <span>Your SEO audit is currently processing. This may take a few minutes. The page will automatically update when the audit is complete.</span>
                      </div>
                    </SummaryText>
                  </SummaryCard>
                )}

                {selectedAudit.status === 'failed' && (
                  <SummaryCard>
                    <SummaryText>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', color: '#ff3b30' }}>
                        <FiAlertCircle size={24} style={{ marginRight: '12px' }} />
                        <span>There was an error processing this SEO audit. Please try again or contact support if the issue persists.</span>
                      </div>
                    </SummaryText>
                  </SummaryCard>
                )}

                {selectedAudit.status === 'completed' && (
                  <>
                    <TabsContainer>
                      <Tab 
                        $isActive={activeTab === 'overview'} 
                        onClick={() => setActiveTab('overview')}
                      >
                        Overview
                      </Tab>
                      <Tab 
                        $isActive={activeTab === 'technical'} 
                        onClick={() => setActiveTab('technical')}
                      >
                        Technical SEO
                      </Tab>
                      <Tab 
                        onClick={() => setActiveTab('recommendations')}
                      >
                        Recommendations
                      </Tab>
                    </TabsContainer>

                    <TabContent>
                      {activeTab === 'overview' && selectedAudit?.report && (
                        <>
                          <SummaryCard>
                            <SectionTitle>Executive Summary</SectionTitle>
                            <SummaryText>
                              {selectedAudit.report.overall.summary}
                            </SummaryText>
                            <AuditTimestamp>
                              Audit performed: {new Date(selectedAudit.report.overall.timestamp).toLocaleString()}
                            </AuditTimestamp>
                          </SummaryCard>
                          
                          <OverviewSection>
                            <SectionTitle>Performance Scores</SectionTitle>
                            <ScoreGrid>
                              <ScoreCard>
                                <ScoreLabel>Overall Score</ScoreLabel>
                                <ScoreValue $score={selectedAudit?.report?.overall?.score || 0}>
                                  {selectedAudit?.report?.overall?.score || 'N/A'}
                                </ScoreValue>
                                <ScoreDescription>
                                  Overall SEO health assessment
                                </ScoreDescription>
                              </ScoreCard>
                              <ScoreCard>
                                <ScoreLabel>Technical SEO</ScoreLabel>
                                <ScoreValue $score={selectedAudit?.report?.technical?.score || 0}>
                                  {selectedAudit?.report?.technical?.score || 'N/A'}
                                </ScoreValue>
                                <ScoreDescription>
                                  Site structure, crawlability, indexability
                                </ScoreDescription>
                              </ScoreCard>
                              <ScoreCard>
                                <ScoreLabel>Content Quality</ScoreLabel>
                                <ScoreValue $score={selectedAudit?.report?.content?.score || 0}>
                                  {selectedAudit?.report?.content?.score || 'N/A'}
                                </ScoreValue>
                                <ScoreDescription>
                                  Content depth, relevance, readability
                                </ScoreDescription>
                              </ScoreCard>
                              <ScoreCard>
                                <ScoreLabel>On-Page SEO</ScoreLabel>
                                <ScoreValue $score={selectedAudit?.report?.onPage?.score || 0}>
                                  {selectedAudit?.report?.onPage?.score || 'N/A'}
                                </ScoreValue>
                                <ScoreDescription>
                                  Meta tags, headings, URL structure
                                </ScoreDescription>
                              </ScoreCard>
                              <ScoreCard>
                                <ScoreLabel>Performance</ScoreLabel>
                                <ScoreValue $score={selectedAudit?.report?.performance?.score || 0}>
                                  {selectedAudit?.report?.performance?.score || 'N/A'}
                                </ScoreValue>
                                <ScoreDescription>
                                  Page speed, Core Web Vitals
                                </ScoreDescription>
                              </ScoreCard>
                              <ScoreCard>
                                <ScoreLabel>Mobile-Friendly</ScoreLabel>
                                <ScoreValue $score={selectedAudit?.report?.mobile?.score || 0}>
                                  {selectedAudit?.report?.mobile?.score || 'N/A'}
                                </ScoreValue>
                                <ScoreDescription>
                                  Responsive design, mobile usability
                                </ScoreDescription>
                              </ScoreCard>
                              <ScoreCard>
                                <ScoreLabel>Backlinks</ScoreLabel>
                                <ScoreValue $score={selectedAudit?.report?.backlinks?.score || 0}>
                                  {selectedAudit?.report?.backlinks?.score || 'N/A'}
                                </ScoreValue>
                                <ScoreDescription>
                                  Backlink quality and quantity
                                </ScoreDescription>
                              </ScoreCard>
                              <ScoreCard>
                                <ScoreLabel>Keywords</ScoreLabel>
                                <ScoreValue $score={selectedAudit?.report?.keywords?.score || 0}>
                                  {selectedAudit?.report?.keywords?.score || 'N/A'}
                                </ScoreValue>
                                <ScoreDescription>
                                  Keyword targeting and optimization
                                </ScoreDescription>
                              </ScoreCard>
                            </ScoreGrid>
                          </OverviewSection>
                          
                          <OverviewSection>
                            <SectionTitle>Site Information</SectionTitle>
                            <SiteInfoGrid>
                              <SiteInfoCard>
                                <SiteInfoLabel>URL</SiteInfoLabel>
                                <SiteInfoValue>
                                  <a href={selectedAudit?.report?.url} target="_blank" rel="noopener noreferrer">
                                    {selectedAudit?.report?.url}
                                  </a>
                                </SiteInfoValue>
                              </SiteInfoCard>
                              
                              <SiteInfoCard>
                                <SiteInfoLabel>Title</SiteInfoLabel>
                                <SiteInfoValue>{selectedAudit?.report?.metaTags?.title || 'Not found'}</SiteInfoValue>
                              </SiteInfoCard>
                              
                              <SiteInfoCard>
                                <SiteInfoLabel>Description</SiteInfoLabel>
                                <SiteInfoValue>{selectedAudit?.report?.metaTags?.description || 'Not found'}</SiteInfoValue>
                              </SiteInfoCard>
                              
                              <SiteInfoCard>
                                <SiteInfoLabel>Content Word Count</SiteInfoLabel>
                                <SiteInfoValue>{selectedAudit?.report?.contentWordCount?.toLocaleString() || 'Not available'}</SiteInfoValue>
                              </SiteInfoCard>
                              
                              <SiteInfoCard>
                                <SiteInfoLabel>Internal Links</SiteInfoLabel>
                                <SiteInfoValue>{selectedAudit?.report?.links?.internalCount || 'Not available'}</SiteInfoValue>
                              </SiteInfoCard>
                              
                              <SiteInfoCard>
                                <SiteInfoLabel>External Links</SiteInfoLabel>
                                <SiteInfoValue>{selectedAudit?.report?.links?.externalCount || 'Not available'}</SiteInfoValue>
                              </SiteInfoCard>
                              
                              <SiteInfoCard>
                                <SiteInfoLabel>Images</SiteInfoLabel>
                                <SiteInfoValue>
                                  {selectedAudit?.report?.images?.total || 'Not available'}
                                  {selectedAudit?.report?.images?.total > 0 && (
                                    <span> ({selectedAudit?.report?.images?.withAlt} with alt text)</span>
                                  )}
                                </SiteInfoValue>
                              </SiteInfoCard>
                            </SiteInfoGrid>
                          </OverviewSection>
                          
                          <OverviewSection>
                            <SectionTitle>Critical Issues</SectionTitle>
                            <CriticalIssuesList>
                              {getCriticalIssues(selectedAudit.report).map((issue, index) => (
                                <CriticalIssueCard key={index}>
                                  <CriticalIssueHeader>
                                    <CriticalIssueTitle>{issue.title}</CriticalIssueTitle>
                                    <CriticalIssueSeverity $severity={issue.severity}>
                                      {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                                      {issue.priority && ` • Priority ${issue.priority}`}
                                    </CriticalIssueSeverity>
                                  </CriticalIssueHeader>
                                  <CriticalIssueDescription>{issue.description}</CriticalIssueDescription>
                                  <CriticalIssueAction>{issue.recommendation}</CriticalIssueAction>
                                </CriticalIssueCard>
                              ))}
                              {getCriticalIssues(selectedAudit.report).length === 0 && (
                                <NoCriticalIssues>
                                  <FiCheckCircle color="#34c759" style={{ marginRight: '8px' }} />
                                  No critical issues found!
                                </NoCriticalIssues>
                              )}
                            </CriticalIssuesList>
                          </OverviewSection>
                          
                          {selectedAudit?.report?.competitiveAnalysis && (
                            <OverviewSection>
                              <SectionTitle>Competitive Analysis</SectionTitle>
                              <CompetitiveAnalysisCard>
                                {selectedAudit?.report?.competitiveAnalysis?.topCompetitors && (
                                  <CompetitiveAnalysisSection>
                                    <CompetitiveAnalysisTitle>Top Competitors</CompetitiveAnalysisTitle>
                                    <CompetitiveAnalysisList>
                                      {selectedAudit.report.competitiveAnalysis.topCompetitors.map((competitor, index) => (
                                        <CompetitiveAnalysisItem key={index}>{competitor}</CompetitiveAnalysisItem>
                                      ))}
                                    </CompetitiveAnalysisList>
                                  </CompetitiveAnalysisSection>
                                )}
                                
                                {selectedAudit?.report?.competitiveAnalysis?.competitiveAdvantages && (
                                  <CompetitiveAnalysisSection>
                                    <CompetitiveAnalysisTitle>Competitive Advantages</CompetitiveAnalysisTitle>
                                    <CompetitiveAnalysisList>
                                      {selectedAudit.report.competitiveAnalysis.competitiveAdvantages.map((advantage, index) => (
                                        <CompetitiveAnalysisItem key={index}>{advantage}</CompetitiveAnalysisItem>
                                      ))}
                                    </CompetitiveAnalysisList>
                                  </CompetitiveAnalysisSection>
                                )}
                                
                                {selectedAudit?.report?.competitiveAnalysis?.competitiveGaps && (
                                  <CompetitiveAnalysisSection>
                                    <CompetitiveAnalysisTitle>Competitive Gaps</CompetitiveAnalysisTitle>
                                    <CompetitiveAnalysisList>
                                      {selectedAudit.report.competitiveAnalysis.competitiveGaps.map((gap, index) => (
                                        <CompetitiveAnalysisItem key={index}>{gap}</CompetitiveAnalysisItem>
                                      ))}
                                    </CompetitiveAnalysisList>
                                  </CompetitiveAnalysisSection>
                                )}
                              </CompetitiveAnalysisCard>
                            </OverviewSection>
                          )}
                        </>)}
                      
                      {activeTab === 'technical' && selectedAudit?.report && (
                        <SEOTechnicalSection technicalData={selectedAudit?.report?.technical} />
                      )}
                      
                      {activeTab === 'content' && selectedAudit?.report && (
                        <SectionContainer>
                          <SectionHeader>
                            <SectionTitle>Content Analysis</SectionTitle>
                            <ScoreBadge $score={selectedAudit?.report?.content?.score || 0}>
                              {selectedAudit?.report?.content?.score || 'N/A'}
                            </ScoreBadge>
                          </SectionHeader>
                          
                          {selectedAudit?.report?.content?.summary && (
                            <SummaryBox>
                              <p>{selectedAudit.report.content.summary}</p>
                            </SummaryBox>
                          )}
                          
                          <IssuesList>
                            {selectedAudit?.report?.content?.issues?.length > 0 ? (
                              selectedAudit.report.content.issues.map((issue, index) => (
                                <IssueCard key={index}>
                                  <IssueSeverity $severity={issue.severity}>
                                    {issue.severity === 'high' ? <FiAlertCircle /> : 
                                     issue.severity === 'medium' ? <FiAlertTriangle /> : <FiInfo />}
                                    {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                                  </IssueSeverity>
                                  <IssueTitle>{issue.title}</IssueTitle>
                                  <IssueDescription>{issue.description}</IssueDescription>
                                  <IssueDetail>
                                    <IssueDetailTitle>Impact:</IssueDetailTitle>
                                    <IssueDetailContent>{issue.impact}</IssueDetailContent>
                                  </IssueDetail>
                                  <IssueDetail>
                                    <IssueDetailTitle>Recommendation:</IssueDetailTitle>
                                    <IssueDetailContent>{issue.recommendation}</IssueDetailContent>
                                  </IssueDetail>
                                </IssueCard>
                              ))
                            ) : (
                              <NoIssues>
                                <FiCheckCircle color="#34c759" style={{ marginRight: '8px' }} />
                                No content issues found!
                              </NoIssues>
                            )}
                          </IssuesList>
                          
                          {selectedAudit?.report?.contentWordCount && (
                            <MetaInfoCard>
                              <MetaInfoTitle>Content Word Count</MetaInfoTitle>
                              <MetaInfoValue>{selectedAudit.report.contentWordCount}</MetaInfoValue>
                            </MetaInfoCard>
                          )}
                        </SectionContainer>
                      )}
                      
                      {activeTab === 'onPage' && selectedAudit?.report && (
                        <SectionContainer>
                          <SectionHeader>
                            <SectionTitle>On-Page SEO</SectionTitle>
                            <SectionScore $score={selectedAudit?.report?.onPage?.score || 0}>
                              {selectedAudit?.report?.onPage?.score || 'N/A'}/100
                            </SectionScore>
                          </SectionHeader>
                          
                          <MetaTagsSection>
                            <MetaSectionTitle>Meta Tags</MetaSectionTitle>
                            <MetaTagCard>
                              <MetaTagName>Title</MetaTagName>
                              <MetaTagValue>{selectedAudit?.report?.metaTags?.title || 'Not found'}</MetaTagValue>
                            </MetaTagCard>
                            <MetaTagCard>
                              <MetaTagName>Description</MetaTagName>
                              <MetaTagValue>{selectedAudit?.report?.metaTags?.description || 'Not found'}</MetaTagValue>
                            </MetaTagCard>
                            <MetaTagCard>
                              <MetaTagName>Keywords</MetaTagName>
                              <MetaTagValue>{selectedAudit?.report?.metaTags?.keywords || 'Not found'}</MetaTagValue>
                            </MetaTagCard>
                          </MetaTagsSection>
                          
                          <HeadingsSection>
                            <MetaSectionTitle>Headings</MetaSectionTitle>
                            <HeadingTypeContainer>
                              <HeadingType>H1 Tags ({selectedAudit?.report?.headings?.h1?.length || 0})</HeadingType>
                              <HeadingsList>
                                {selectedAudit?.report?.headings?.h1?.length > 0 ? (
                                  selectedAudit.report.headings.h1.map((heading, index) => (
                                    <HeadingItem key={index}>{heading}</HeadingItem>
                                  ))
                                ) : (
                                  <NoHeadings>No H1 headings found</NoHeadings>
                                )}
                              </HeadingsList>
                            </HeadingTypeContainer>
                            
                            <HeadingTypeContainer>
                              <HeadingType>H2 Tags ({selectedAudit?.report?.headings?.h2?.length || 0})</HeadingType>
                              <HeadingsList>
                                {selectedAudit?.report?.headings?.h2?.length > 0 ? (
                                  selectedAudit.report.headings.h2.map((heading, index) => (
                                    <HeadingItem key={index}>{heading}</HeadingItem>
                                  ))
                                ) : (
                                  <NoHeadings>No H2 headings found</NoHeadings>
                                )}
                              </HeadingsList>
                            </HeadingTypeContainer>
                          </HeadingsSection>
                          
                          <IssuesList>
                            {selectedAudit?.report?.onPage?.issues?.length > 0 ? (
                              selectedAudit.report.onPage.issues.map((issue, index) => (
                                <IssueCard key={index}>
                                  <IssueSeverity $severity={issue.severity}>
                                    {issue.severity === 'high' ? <FiAlertCircle /> : 
                                     issue.severity === 'medium' ? <FiAlertTriangle /> : <FiInfo />}
                                    {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                                  </IssueSeverity>
                                  <IssueTitle>{issue.title}</IssueTitle>
                                  <IssueDescription>{issue.description}</IssueDescription>
                                  <IssueDetail>
                                    <IssueDetailTitle>Impact:</IssueDetailTitle>
                                    <IssueDetailContent>{issue.impact}</IssueDetailContent>
                                  </IssueDetail>
                                  <IssueDetail>
                                    <IssueDetailTitle>Recommendation:</IssueDetailTitle>
                                    <IssueDetailContent>{issue.recommendation}</IssueDetailContent>
                                  </IssueDetail>
                                </IssueCard>
                              ))
                            ) : (
                              <NoIssues>
                                <FiCheckCircle color="#34c759" style={{ marginRight: '8px' }} />
                                No on-page SEO issues found!
                              </NoIssues>
                            )}
                          </IssuesList>
                        </SectionContainer>
                      )}
                      
                      {activeTab === 'pages' && selectedAudit?.report && (
                        <SectionContainer>
                          <SectionTitle>Page-by-Page Analysis</SectionTitle>
                          <PagesList>
                            {selectedAudit?.report?.pages?.length > 0 ? (
                              selectedAudit.report.pages.map((page, pageIndex) => (
                                <PageCard key={pageIndex}>
                                  <PageHeader>
                                    <PageUrl href={page.url} target="_blank" rel="noopener noreferrer">{page.url}</PageUrl>
                                    <PageScore $score={page.score || 0}>{page.score || 'N/A'}/100</PageScore>
                                  </PageHeader>
                                  <PageTitle>{page.title}</PageTitle>
                                  
                                  {/* Page Meta Tags */}
                                  <PageSection>
                                    <PageSectionTitle>Meta Tags</PageSectionTitle>
                                    <MetaTagCard>
                                      <MetaTagName>Title</MetaTagName>
                                      <MetaTagValue>{page.metaTags?.title || 'Not found'}</MetaTagValue>
                                      {page.metaTags?.analysis?.titleLength && (
                                        <MetaTagAnalysis>
                                          Length: {page.metaTags.analysis.titleLength} characters • 
                                          {page.metaTags.analysis.titleQuality}
                                        </MetaTagAnalysis>
                                      )}
                                    </MetaTagCard>
                                    <MetaTagCard>
                                      <MetaTagName>Description</MetaTagName>
                                      <MetaTagValue>{page.metaTags?.description || 'Not found'}</MetaTagValue>
                                      {page.metaTags?.analysis?.descriptionLength && (
                                        <MetaTagAnalysis>
                                          Length: {page.metaTags.analysis.descriptionLength} characters • 
                                          {page.metaTags.analysis.descriptionQuality}
                                        </MetaTagAnalysis>
                                      )}
                                    </MetaTagCard>
                                  </PageSection>
                                  
                                  {/* Page Content Analysis */}
                                  <PageSection>
                                    <PageSectionTitle>Content Analysis</PageSectionTitle>
                                    <ContentAnalysisGrid>
                                      {page.content?.wordCount && (
                                        <ContentMetric>
                                          <ContentMetricLabel>Word Count</ContentMetricLabel>
                                          <ContentMetricValue>{page.content.wordCount}</ContentMetricValue>
                                        </ContentMetric>
                                      )}
                                      {page.content?.readabilityScore && (
                                        <ContentMetric>
                                          <ContentMetricLabel>Readability</ContentMetricLabel>
                                          <ContentMetricValue $score={page.content.readabilityScore}>
                                            {page.content.readabilityScore}/100
                                          </ContentMetricValue>
                                        </ContentMetric>
                                      )}
                                    </ContentAnalysisGrid>
                                    {page.content?.keywordDensity?.primary && (
                                      <KeywordDensity>
                                        <KeywordDensityLabel>Primary Keyword Density</KeywordDensityLabel>
                                        <KeywordDensityValue>{page.content.keywordDensity.primary}%</KeywordDensityValue>
                                      </KeywordDensity>
                                    )}
                                    {page.content?.quality && (
                                      <ContentQuality>{page.content.quality}</ContentQuality>
                                    )}
                                  </PageSection>
                                  
                                  {/* Page Issues */}
                                  <PageSection>
                                    <PageSectionTitle>Issues ({page.issues?.length || 0})</PageSectionTitle>
                                    <IssuesList>
                                      {page.issues?.length > 0 ? (
                                        page.issues.map((issue, issueIndex) => (
                                          <IssueCard key={issueIndex}>
                                            <IssueSeverity $severity={issue.severity}>
                                              {issue.severity === 'high' ? <FiAlertCircle /> : 
                                               issue.severity === 'medium' ? <FiAlertTriangle /> : <FiInfo />}
                                              {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                                              {issue.priority && ` • Priority ${issue.priority}`}
                                            </IssueSeverity>
                                            <IssueTitle>{issue.title}</IssueTitle>
                                            <IssueDescription>{issue.description}</IssueDescription>
                                            <IssueDetail>
                                              <IssueDetailTitle>Impact:</IssueDetailTitle>
                                              <IssueDetailContent>{issue.impact}</IssueDetailContent>
                                            </IssueDetail>
                                            <IssueDetail>
                                              <IssueDetailTitle>Recommendation:</IssueDetailTitle>
                                              <IssueDetailContent>{issue.recommendation}</IssueDetailContent>
                                            </IssueDetail>
                                          </IssueCard>
                                        ))
                                      ) : (
                                        <NoIssues>
                                          <FiCheckCircle color="#34c759" style={{ marginRight: '8px' }} />
                                          No issues found for this page!
                                        </NoIssues>
                                      )}
                                    </IssuesList>
                                  </PageSection>
                                  
                                  {/* Performance Metrics */}
                                  {page.performance && (
                                    <PageSection>
                                      <PageSectionTitle>Performance</PageSectionTitle>
                                      <PerformanceMetrics>
                                        {page.performance.estimatedLoadTime && (
                                          <PerformanceMetric>
                                            <PerformanceMetricLabel>Load Time</PerformanceMetricLabel>
                                            <PerformanceMetricValue>{page.performance.estimatedLoadTime}</PerformanceMetricValue>
                                          </PerformanceMetric>
                                        )}
                                        {page.performance.mobileCompatibility && (
                                          <PerformanceMetric>
                                            <PerformanceMetricLabel>Mobile Compatibility</PerformanceMetricLabel>
                                            <PerformanceMetricValue $score={page.performance.mobileCompatibility}>
                                              {page.performance.mobileCompatibility}/100
                                            </PerformanceMetricValue>
                                          </PerformanceMetric>
                                        )}
                                      </PerformanceMetrics>
                                      {page.performance.coreWebVitals && (
                                        <CoreWebVitals>
                                          <CoreWebVitalsTitle>Core Web Vitals</CoreWebVitalsTitle>
                                          <CoreWebVitalsList>
                                            {page.performance.coreWebVitals.LCP && (
                                              <CoreWebVital>
                                                <CoreWebVitalLabel>LCP</CoreWebVitalLabel>
                                                <CoreWebVitalValue>{page.performance.coreWebVitals.LCP}</CoreWebVitalValue>
                                              </CoreWebVital>
                                            )}
                                            {page.performance.coreWebVitals.FID && (
                                              <CoreWebVital>
                                                <CoreWebVitalLabel>FID</CoreWebVitalLabel>
                                                <CoreWebVitalValue>{page.performance.coreWebVitals.FID}</CoreWebVitalValue>
                                              </CoreWebVital>
                                            )}
                                            {page.performance.coreWebVitals.CLS && (
                                              <CoreWebVital>
                                                <CoreWebVitalLabel>CLS</CoreWebVitalLabel>
                                                <CoreWebVitalValue>{page.performance.coreWebVitals.CLS}</CoreWebVitalValue>
                                              </CoreWebVital>
                                            )}
                                          </CoreWebVitalsList>
                                        </CoreWebVitals>
                                      )}
                                    </PageSection>
                                  )}
                                </PageCard>
                              ))
                            ) : (
                              <NoPages>
                                <FiInfo color="#8e8e93" style={{ marginRight: '8px' }} />
                                No page analysis available.
                              </NoPages>
                            )}
                          </PagesList>
                        </SectionContainer>
                      )}
                      
                      {activeTab === 'recommendations' && selectedAudit?.report && (
                        <SectionContainer>
                          <SectionTitle>Recommendations</SectionTitle>
                          <RecommendationsList>
                            {selectedAudit?.report?.recommendations?.length > 0 ? (
                              selectedAudit.report.recommendations.map((rec, index) => (
                                <RecommendationCard key={index}>
                                  <RecommendationHeader>
                                    <RecommendationTitle>{rec.title}</RecommendationTitle>
                                    <RecommendationSeverity $severity={rec.severity}>
                                      {rec.severity.charAt(0).toUpperCase() + rec.severity.slice(1)} Priority
                                      {rec.priority && ` • ${rec.priority}`}
                                    </RecommendationSeverity>
                                  </RecommendationHeader>
                                  <RecommendationDescription>{rec.description}</RecommendationDescription>
                                  <RecommendationDetail>
                                    <RecommendationDetailTitle>Expected Impact:</RecommendationDetailTitle>
                                    <RecommendationDetailContent>{rec.impact}</RecommendationDetailContent>
                                  </RecommendationDetail>
                                  <RecommendationDetail>
                                    <RecommendationDetailTitle>How to Implement:</RecommendationDetailTitle>
                                    <RecommendationDetailContent>{rec.recommendation}</RecommendationDetailContent>
                                  </RecommendationDetail>
                                  {rec.estimatedEffort && (
                                    <RecommendationDetail>
                                      <RecommendationDetailTitle>Estimated Effort:</RecommendationDetailTitle>
                                      <RecommendationDetailContent>{rec.estimatedEffort}</RecommendationDetailContent>
                                    </RecommendationDetail>
                                  )}
                                  {rec.estimatedImpact && (
                                    <RecommendationDetail>
                                      <RecommendationDetailTitle>Estimated Impact:</RecommendationDetailTitle>
                                      <RecommendationDetailContent>{rec.estimatedImpact}</RecommendationDetailContent>
                                    </RecommendationDetail>
                                  )}
                                </RecommendationCard>
                              ))
                            ) : (
                              <NoRecommendations>
                                <FiInfo color="#8e8e93" style={{ marginRight: '8px' }} />
                                No recommendations available.
                              </NoRecommendations>
                            )}
                          </RecommendationsList>
                        </SectionContainer>
                      )}
                    </TabContent>
                  </>
                )}
              </>
            ) : (
              <NoData>
                {isLoading ? (
                  <div>
                    <FiRefreshCw size={24} style={{ marginRight: '8px', animation: 'spin 2s linear infinite' }} />
                    Loading SEO audits...
                  </div>
                ) : (
                  <>
                    <FiInfo size={24} style={{ marginRight: '8px' }} />
                    No SEO audit selected. Create a new audit or select one from the sidebar.
                  </>
                )}
              </NoData>
            )}
          </MainContent>
        </ContentContainer>
      </Content>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ScoreBadge = styled.div<{ $score: number }>`
  background-color: ${props => {
    if (props.$score >= 80) return 'rgba(52, 199, 89, 0.2)';
    if (props.$score >= 60) return 'rgba(255, 204, 0, 0.2)';
    return 'rgba(255, 59, 48, 0.2)';
  }};
  color: ${props => {
    if (props.$score >= 80) return '#34c759';
    if (props.$score >= 60) return '#ffcc00';
    return '#ff3b30';
  }};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
`;

const SummaryBox = styled.div`
  background-color: #262626;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  
  p {
    margin: 0;
    line-height: 1.6;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #333;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #0df9b6;
  color: #000000;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0ce0a3;
  }
`;

const ErrorMessage = styled.div`
  background-color: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
  padding: 12px 16px;
  margin: 16px;
  border-radius: 4px;
  font-size: 14px;
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
  padding: 12px 16px;
  margin: 16px;
  border-radius: 4px;
  font-size: 14px;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  position: relative;
  z-index: 1;
`;

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 300px;
  border-right: 1px solid #333;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const SidebarTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  padding: 16px;
  margin: 0;
  border-bottom: 1px solid #333;
`;

const AuditList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
`;

const AuditItem = styled.div<{ $isSelected: boolean }>`
  background-color: ${props => props.$isSelected ? '#333' : '#262626'};
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.$isSelected ? '#333' : '#2a2a2a'};
  }
`;

const AuditItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const AuditItemUrl = styled.div`
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
`;

const StatusBadge = styled.span<{ $status: string }>`
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: ${props => {
    const color = getStatusColor(props.$status);
    return `${color}20`; // 20% opacity
  }};
  color: ${props => getStatusColor(props.$status)};
`;

const AuditItemMeta = styled.div`
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
`;

const AuditItemActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ActionIcon = styled.button`
  background-color: transparent;
  color: #999;
  border: none;
  padding: 4px;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #ff3b30;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  position: relative;
  z-index: 2;
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: #999;
  font-size: 14px;
`;

const NoData = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: #999;
  font-size: 14px;
`;

const AuditHeader = styled.div`
  margin-bottom: 24px;
`;

const AuditUrl = styled.a`
  font-size: 20px;
  font-weight: 600;
  color: #0df9b6;
  text-decoration: none;
  display: block;
  margin-bottom: 8px;

  &:hover {
    text-decoration: underline;
  }
`;

const AuditMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AuditDate = styled.div`
  font-size: 14px;
  color: #999;
`;

const AuditScore = styled.div<{ $score: number }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => getScoreColor(props.$score)};
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #333;
  margin-bottom: 24px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tab = styled.button<{ $isActive: boolean }>`
  background-color: transparent;
  color: ${props => props.$isActive ? '#0df9b6' : '#ffffff'};
  border: none;
  border-bottom: 2px solid ${props => props.$isActive ? '#0df9b6' : 'transparent'};
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  white-space: nowrap;

  &:hover {
    color: #0df9b6;
  }
`;

const TabContent = styled.div`
  margin-top: 24px;
`;

const OverviewSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
`;

const SummaryCard = styled.div`
  background-color: #262626;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

const SummaryText = styled.div`
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
`;

const ScoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
`;

const ScoreCard = styled.div`
  background-color: #262626;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ScoreLabel = styled.div`
  font-size: 14px;
  margin-bottom: 8px;
`;

const ScoreValue = styled.div<{ $score: number }>`
  font-size: 24px;
  font-weight: 600;
  color: ${props => getScoreColor(props.$score)};
`;

const Card = styled.div`
  background-color: #262626;
  border-radius: 8px;
  padding: 20px;
  margin: 16px;
  position: relative;
  z-index: 9999;
  pointer-events: auto;
  box-shadow: 0 8px 40px 0 rgba(0,0,0,0.65);
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
`;

const Button = styled.button<{ $secondary?: boolean }>`
  background-color: ${props => props.$secondary ? 'transparent' : '#0df9b6'};
  color: ${props => props.$secondary ? '#ffffff' : '#000000'};
  border: ${props => props.$secondary ? '1px solid #444' : 'none'};
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: ${props => props.$secondary ? 'rgba(255, 255, 255, 0.05)' : '#0ce0a3'};
  }

  &:disabled {
    background-color: #555;
    color: #888;
    cursor: not-allowed;
  }
`;

// Section components for content, onPage, and recommendations tabs
const SectionContainer = styled.div`
  margin: 0 16px 32px 16px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionScore = styled.div<{ $score: number }>`
  font-size: 18px;
  font-weight: 600;
  color: ${props => getScoreColor(props.$score)};
`;

// Issue components for displaying SEO issues
const IssuesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`;

const IssueCard = styled.div`
  background-color: #262626;
  border-radius: 8px;
  padding: 16px;
`;

const IssueSeverity = styled.div<{ $severity: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  background-color: ${props => {
    switch (props.$severity) {
      case 'high': return 'rgba(255, 59, 48, 0.2)';
      case 'medium': return 'rgba(255, 149, 0, 0.2)';
      case 'low': return 'rgba(142, 142, 147, 0.2)';
      default: return 'rgba(142, 142, 147, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.$severity) {
      case 'high': return '#ff3b30';
      case 'medium': return '#ff9500';
      case 'low': return '#8e8e93';
      default: return '#8e8e93';
    }
  }};
`;

const IssueTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 8px 0;
`;

const IssueDescription = styled.p`
  font-size: 14px;
  margin: 0 0 16px 0;
  color: #cccccc;
`;

const IssueDetail = styled.div`
  margin-bottom: 12px;
`;

const IssueDetailTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
`;

const IssueDetailContent = styled.p`
  font-size: 14px;
  margin: 0;
  color: #cccccc;
`;

const NoIssues = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: #262626;
  border-radius: 8px;
  color: #cccccc;
`;

// Meta info components for displaying content word count, etc.
const MetaInfoCard = styled.div`
  background-color: #262626;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const MetaInfoTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const MetaInfoValue = styled.p`
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  color: #0df9b6;
`;

// Meta tags section components
const MetaTagsSection = styled.div`
  background-color: #262626;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

const MetaSectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
`;

const MetaTagCard = styled.div`
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #333;
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const MetaTagName = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const MetaTagValue = styled.p`
  font-size: 14px;
  margin: 0;
  color: #cccccc;
  word-break: break-word;
`;

// Headings section components
const HeadingsSection = styled.div`
  background-color: #262626;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

const HeadingTypeContainer = styled.div`
  margin-bottom: 24px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const HeadingType = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
`;

const HeadingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HeadingItem = styled.div`
  font-size: 14px;
  padding: 8px 12px;
  background-color: #333;
  border-radius: 4px;
  color: #cccccc;
`;

const NoHeadings = styled.div`
  font-size: 14px;
  color: #999;
  padding: 8px 0;
`;

// Recommendation components
const RecommendationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RecommendationCard = styled.div`
  background-color: #262626;
  border-radius: 8px;
  padding: 16px;
`;

const RecommendationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const RecommendationTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  flex: 1;
`;

const RecommendationSeverity = styled.div<{ $severity: string }>`
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: ${props => {
    switch (props.$severity) {
      case 'high': return 'rgba(255, 59, 48, 0.2)';
      case 'medium': return 'rgba(255, 149, 0, 0.2)';
      case 'low': return 'rgba(142, 142, 147, 0.2)';
      default: return 'rgba(142, 142, 147, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.$severity) {
      case 'high': return '#ff3b30';
      case 'medium': return '#ff9500';
      case 'low': return '#8e8e93';
      default: return '#8e8e93';
    }
  }};
`;

const RecommendationDescription = styled.p`
  font-size: 14px;
  margin: 0 0 16px 0;
  color: #cccccc;
`;

const RecommendationDetail = styled.div`
  margin-bottom: 12px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const RecommendationDetailTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
`;

const RecommendationDetailContent = styled.p`
  font-size: 14px;
  margin: 0;
  color: #cccccc;
`;

// Page-by-page analysis components
const PagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const PageCard = styled.div`
  background-color: #262626;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const PageUrl = styled.a`
  font-size: 16px;
  font-weight: 600;
  color: #0df9b6;
  text-decoration: none;
  word-break: break-all;
  max-width: 80%;
  
  &:hover {
    text-decoration: underline;
  }
`;

const PageTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #ffffff;
`;

const PageScore = styled.div<{ $score: number }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => getScoreColor(props.$score)};
  padding: 4px 8px;
  border-radius: 4px;
  background-color: ${props => {
    const color = getScoreColor(props.$score);
    return `${color}20`; // 20% opacity
  }};
`;

const PageSection = styled.div`
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #333;
  
  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const PageSectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #ffffff;
`;

const ContentAnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const ContentMetric = styled.div`
  background-color: #333;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ContentMetricLabel = styled.div`
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
`;

const ContentMetricValue = styled.div<{ $score?: number }>`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.$score ? getScoreColor(props.$score) : '#ffffff'};
`;

const KeywordDensity = styled.div`
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const KeywordDensityLabel = styled.div`
  font-size: 14px;
  color: #999;
`;

const KeywordDensityValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
`;

const ContentQuality = styled.div`
  margin-top: 16px;
  font-size: 14px;
  line-height: 1.5;
  color: #cccccc;
  padding: 12px;
  background-color: #333;
  border-radius: 8px;
`;

const PerformanceMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const PerformanceMetric = styled.div`
  background-color: #333;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PerformanceMetricLabel = styled.div`
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
`;

const PerformanceMetricValue = styled.div<{ $score?: number }>`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.$score ? getScoreColor(props.$score) : '#ffffff'};
`;

const CoreWebVitals = styled.div`
  margin-top: 16px;
`;

const CoreWebVitalsTitle = styled.h5`
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #ffffff;
`;

const CoreWebVitalsList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const CoreWebVital = styled.div`
  background-color: #333;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CoreWebVitalLabel = styled.div`
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
`;

const CoreWebVitalValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
`;

const MetaTagAnalysis = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 4px;
`;

const NoPages = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: #262626;
  border-radius: 8px;
  color: #cccccc;
`;

// Overview page additional components
const AuditTimestamp = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 16px;
  text-align: right;
`;

const ScoreDescription = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  text-align: center;
`;

const SiteInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const SiteInfoCard = styled.div`
  background-color: #262626;
  border-radius: 8px;
  padding: 16px;
`;

const SiteInfoLabel = styled.div`
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
`;

const SiteInfoValue = styled.div`
  font-size: 14px;
  word-break: break-word;
  
  a {
    color: #0df9b6;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const CriticalIssuesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CriticalIssueCard = styled.div`
  background-color: #262626;
  border-radius: 8px;
  padding: 16px;
`;

const CriticalIssueHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const CriticalIssueTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  flex: 1;
`;

const CriticalIssueSeverity = styled.div<{ $severity: string }>`
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: ${props => {
    switch (props.$severity) {
      case 'high': return 'rgba(255, 59, 48, 0.2)';
      case 'medium': return 'rgba(255, 149, 0, 0.2)';
      case 'low': return 'rgba(142, 142, 147, 0.2)';
      default: return 'rgba(142, 142, 147, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.$severity) {
      case 'high': return '#ff3b30';
      case 'medium': return '#ff9500';
      case 'low': return '#8e8e93';
      default: return '#8e8e93';
    }
  }};
`;

const CriticalIssueDescription = styled.p`
  font-size: 14px;
  margin: 0 0 16px 0;
  color: #cccccc;
`;

const CriticalIssueAction = styled.div`
  font-size: 14px;
  padding: 12px;
  background-color: rgba(13, 249, 182, 0.1);
  border-left: 3px solid #0df9b6;
  border-radius: 4px;
  color: #ffffff;
`;

const NoCriticalIssues = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: #262626;
  border-radius: 8px;
  color: #cccccc;
`;

const CompetitiveAnalysisCard = styled.div`
  background-color: #262626;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const CompetitiveAnalysisSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CompetitiveAnalysisTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
`;

const CompetitiveAnalysisList = styled.ul`
  margin: 0;
  padding: 0 0 0 20px;
`;

const CompetitiveAnalysisItem = styled.li`
  font-size: 14px;
  margin-bottom: 8px;
  color: #cccccc;
`;

const NoRecommendations = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: #262626;
  border-radius: 8px;
  color: #cccccc;
`;

const GlobalStyle = styled.div`
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export default SEOAuditPage;
