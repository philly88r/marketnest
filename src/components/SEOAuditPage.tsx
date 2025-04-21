import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiSearch, FiTrash2, FiDownload, FiRefreshCw, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { 
  generateSEOAudit, 
  getSEOAuditsByClientId, 
  deleteSEOAudit,
  SEOAudit
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

const SEOAuditPage: React.FC<SEOAuditPageProps> = ({ clientId }) => {
  const [audits, setAudits] = useState<SEOAudit[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<SEOAudit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [showNewAuditForm, setShowNewAuditForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'content' | 'onPage' | 'performance' | 'backlinks' | 'keywords' | 'recommendations'>('overview');

  // Load audits when the component mounts
  useEffect(() => {
    const loadAudits = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const auditData = await getSEOAuditsByClientId(clientId);
        setAudits(auditData);
        
        // Select the most recent audit if available
        if (auditData.length > 0) {
          setSelectedAudit(auditData[0]);
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

  // Handle creating a new SEO audit
  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create an initial audit with 'in-progress' status
      const newAudit = await generateSEOAudit(url, clientId);
      
      // Add the new audit to the list and select it
      setAudits(prevAudits => [newAudit, ...prevAudits]);
      setSelectedAudit(newAudit);
      setUrl('');
      setShowNewAuditForm(false);
      
      // Set up polling to check for audit updates
      const pollInterval = setInterval(async () => {
        try {
          // Fetch the latest audits
          const updatedAudits = await getSEOAuditsByClientId(clientId);
          setAudits(updatedAudits);
          
          // Find the current audit in the updated list
          const updatedAudit = updatedAudits.find(audit => audit.id === newAudit.id);
          
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
      
      // Clean up the interval when the component unmounts
      return () => clearInterval(pollInterval);
      
    } catch (err) {
      console.error('Error creating SEO audit:', err);
      setError('Failed to create SEO audit. Please try again.');
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
              <Form onSubmit={handleCreateAudit}>
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
                  <Button type="submit" disabled={isLoading}>
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
              audits.map(audit => (
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
                    <ActionIcon onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAudit(audit.id);
                    }}>
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
                        $isActive={activeTab === 'content'} 
                        onClick={() => setActiveTab('content')}
                      >
                        Content
                      </Tab>
                      <Tab 
                        $isActive={activeTab === 'onPage'} 
                        onClick={() => setActiveTab('onPage')}
                      >
                        On-Page SEO
                      </Tab>
                      <Tab 
                        $isActive={activeTab === 'performance'} 
                        onClick={() => setActiveTab('performance')}
                      >
                        Performance
                      </Tab>
                      <Tab 
                        $isActive={activeTab === 'backlinks'} 
                        onClick={() => setActiveTab('backlinks')}
                      >
                        Backlinks
                      </Tab>
                      <Tab 
                        $isActive={activeTab === 'keywords'} 
                        onClick={() => setActiveTab('keywords')}
                      >
                        Keywords
                      </Tab>
                      <Tab 
                        $isActive={activeTab === 'recommendations'} 
                        onClick={() => setActiveTab('recommendations')}
                      >
                        Recommendations
                      </Tab>
                    </TabsContainer>

                    <TabContent>
                      {activeTab === 'overview' && selectedAudit?.report && (
                        <OverviewSection>
                          <SectionTitle>Overview</SectionTitle>
                          <SummaryCard>
                            <SummaryText>
                              {selectedAudit?.report?.overall?.summary || 'No summary available for this audit.'}
                            </SummaryText>
                          </SummaryCard>
                          
                          <SectionTitle>Key Metrics</SectionTitle>
                          <ScoreGrid>
                            <ScoreCard>
                              <ScoreLabel>Overall Score</ScoreLabel>
                              <ScoreValue $score={selectedAudit?.report?.overall?.score || 0}>
                                {selectedAudit?.report?.overall?.score || 'N/A'}
                              </ScoreValue>
                            </ScoreCard>
                            <ScoreCard>
                              <ScoreLabel>Technical SEO</ScoreLabel>
                              <ScoreValue $score={selectedAudit?.report?.technical?.score || 0}>
                                {selectedAudit?.report?.technical?.score || 'N/A'}
                              </ScoreValue>
                            </ScoreCard>
                            <ScoreCard>
                              <ScoreLabel>Content Quality</ScoreLabel>
                              <ScoreValue $score={selectedAudit?.report?.content?.score || 0}>
                                {selectedAudit?.report?.content?.score || 'N/A'}
                              </ScoreValue>
                            </ScoreCard>
                            <ScoreCard>
                              <ScoreLabel>On-Page SEO</ScoreLabel>
                              <ScoreValue $score={selectedAudit?.report?.onPage?.score || 0}>
                                {selectedAudit?.report?.onPage?.score || 'N/A'}
                              </ScoreValue>
                            </ScoreCard>
                            <ScoreCard>
                              <ScoreLabel>Performance</ScoreLabel>
                              <ScoreValue $score={selectedAudit?.report?.performance?.score || 0}>
                                {selectedAudit?.report?.performance?.score || 'N/A'}
                              </ScoreValue>
                            </ScoreCard>
                            <ScoreCard>
                              <ScoreLabel>Mobile-Friendly</ScoreLabel>
                              <ScoreValue $score={selectedAudit?.report?.mobile?.score || 0}>
                                {selectedAudit?.report?.mobile?.score || 'N/A'}
                              </ScoreValue>
                            </ScoreCard>
                          </ScoreGrid>
                        </OverviewSection>
                      )}
                      
                      {activeTab === 'technical' && selectedAudit?.report && (
                        <SEOTechnicalSection technicalData={selectedAudit?.report?.technical} />
                      )}
                      
                      {/* Other tab contents would go here */}
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
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #1a1a1a;
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

const SummaryText = styled.p`
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
