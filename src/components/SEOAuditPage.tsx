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
import { getCurrentUser } from '../utils/authService';
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

// Function to format a date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Function to render the Gemini analysis in a structured way
const renderGeminiAnalysis = (geminiAudit: any) => {
  console.log('renderGeminiAnalysis called with:', geminiAudit);
  console.log('geminiAudit type:', typeof geminiAudit);
  
  // If geminiAudit is null or undefined, show a message
  if (!geminiAudit) {
    console.log('geminiAudit is null or undefined');
    return (
      <div>
        <h2>No AI Analysis Available</h2>
        <p>The AI analysis data is missing or not yet generated.</p>
      </div>
    );
  }
  
  // If there's an error in the Gemini audit
  if (geminiAudit?.error) {
    console.log('geminiAudit contains an error:', geminiAudit.error);
    return (
      <div>
        <h2>Analysis Error</h2>
        <p>{geminiAudit.error}</p>
        {geminiAudit.errorDetails && <p>Details: {geminiAudit.errorDetails}</p>}
        {geminiAudit.rawTextPreview && (
          <div>
            <h3>Raw Response Preview</h3>
            <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
              {geminiAudit.rawTextPreview}
            </pre>
          </div>
        )}
      </div>
    );
  }

  // Log the structure of the Gemini audit
  console.log('Gemini audit structure:', JSON.stringify(geminiAudit).substring(0, 500) + '...');
  
  // If the Gemini audit is still a raw JSON object, display it in a structured way
  if (typeof geminiAudit === 'object') {
    return (
      <div>
        <h2>SEO Analysis Summary</h2>
        
        {/* Overall Score */}
        {geminiAudit.overall && (
          <div>
            <h3>Overall Score: <span className={`score-${getScoreClass(geminiAudit.overall.score)}`}>
              {geminiAudit.overall.score}/100
            </span></h3>
            <p>{geminiAudit.overall.summary}</p>
          </div>
        )}
        
        {/* Technical SEO */}
        {geminiAudit.technical && (
          <div>
            <h2>Technical SEO</h2>
            <h3>Score: <span className={`score-${getScoreClass(geminiAudit.technical.score)}`}>
              {geminiAudit.technical.score}/100
            </span></h3>
            <p>{geminiAudit.technical.summary}</p>
            
            {geminiAudit.technical.issues && geminiAudit.technical.issues.length > 0 && (
              <div>
                <h3>Issues</h3>
                <ul>
                  {geminiAudit.technical.issues.map((issue: any, index: number) => (
                    <li key={index}>{issue.title || issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Content */}
        {geminiAudit.content && (
          <div>
            <h2>Content Analysis</h2>
            <h3>Score: <span className={`score-${getScoreClass(geminiAudit.content.score)}`}>
              {geminiAudit.content.score}/100
            </span></h3>
            
            {geminiAudit.content.contentAudit && (
              <div>
                <h3>Content Quality</h3>
                <p>{geminiAudit.content.contentAudit.qualityAssessment}</p>
              </div>
            )}
            
            {geminiAudit.content.readability && (
              <div>
                <h3>Readability</h3>
                <p>{geminiAudit.content.readability.assessment}</p>
              </div>
            )}
          </div>
        )}
        
        {/* On-Page SEO */}
        {geminiAudit.onPage && (
          <div>
            <h2>On-Page SEO</h2>
            <h3>Score: <span className={`score-${getScoreClass(geminiAudit.onPage.score)}`}>
              {geminiAudit.onPage.score}/100
            </span></h3>
            
            {geminiAudit.onPage.metaTagsAudit && (
              <div>
                <h3>Meta Tags</h3>
                <p>Title Tags: {geminiAudit.onPage.metaTagsAudit.titleTags}</p>
                <p>Meta Descriptions: {geminiAudit.onPage.metaTagsAudit.metaDescriptions}</p>
              </div>
            )}
            
            {geminiAudit.onPage.urlStructure && (
              <div>
                <h3>URL Structure</h3>
                <p>{geminiAudit.onPage.urlStructure.assessment}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Backlinks */}
        {geminiAudit.backlinks && (
          <div>
            <h2>Backlink Analysis</h2>
            <h3>Score: <span className={`score-${getScoreClass(geminiAudit.backlinks.score)}`}>
              {geminiAudit.backlinks.score}/100
            </span></h3>
            
            {geminiAudit.backlinks.backlinkProfile && (
              <div>
                <h3>Backlink Profile</h3>
                <p>Total Backlinks: {geminiAudit.backlinks.backlinkProfile.totalBacklinks}</p>
                <p>Unique Domains: {geminiAudit.backlinks.backlinkProfile.uniqueDomains}</p>
                <p>{geminiAudit.backlinks.backlinkProfile.qualityAssessment}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Recommendations */}
        {geminiAudit.recommendations && geminiAudit.recommendations.length > 0 && (
          <div>
            <h2>Recommendations</h2>
            <ul>
              {geminiAudit.recommendations.map((rec: any, index: number) => (
                <li key={index}>{typeof rec === 'string' ? rec : rec.title || JSON.stringify(rec)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
  
  // Fallback if the structure is unexpected
  console.log('Using fallback display for Gemini audit');
  return (
    <div>
      <h2>AI Analysis (Raw Data)</h2>
      <p>The AI analysis data structure is different than expected. Displaying raw data:</p>
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap', maxHeight: '500px', overflow: 'auto' }}>
          {JSON.stringify(geminiAudit, null, 2)}
        </pre>
      </div>
    </div>
  );
};

// Helper function to determine score class
const getScoreClass = (score: number): string => {
  if (score >= 80) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
};

// Function to extract and render all issues from the report
const renderAllIssues = (report: any) => {
  // Array to store all issues
  const allIssues: Array<{
    title: string;
    description?: string;
    category: string;
    severity: string;
    priority?: number;
    impact?: string;
    recommendation?: string;
  }> = [];
  
  // Extract issues from technical SEO
  if (report.technical?.issues && Array.isArray(report.technical.issues)) {
    report.technical.issues.forEach((issue: any) => {
      allIssues.push({
        title: typeof issue === 'string' ? issue : issue.title || 'Technical Issue',
        description: issue.description,
        category: 'Technical SEO',
        severity: issue.severity || 'medium',
        priority: issue.priority,
        impact: issue.impact,
        recommendation: issue.recommendation
      });
    });
  }
  
  // Extract issues from content
  if (report.content?.issues && Array.isArray(report.content.issues)) {
    report.content.issues.forEach((issue: any) => {
      allIssues.push({
        title: typeof issue === 'string' ? issue : issue.title || 'Content Issue',
        description: issue.description,
        category: 'Content',
        severity: issue.severity || 'medium',
        priority: issue.priority,
        impact: issue.impact,
        recommendation: issue.recommendation
      });
    });
  }
  
  // Extract issues from on-page SEO
  if (report.onPage?.issues && Array.isArray(report.onPage.issues)) {
    report.onPage.issues.forEach((issue: any) => {
      allIssues.push({
        title: typeof issue === 'string' ? issue : issue.title || 'On-Page SEO Issue',
        description: issue.description,
        category: 'On-Page SEO',
        severity: issue.severity || 'medium',
        priority: issue.priority,
        impact: issue.impact,
        recommendation: issue.recommendation
      });
    });
  }
  
  // Extract issues from performance
  if (report.performance?.issues && Array.isArray(report.performance.issues)) {
    report.performance.issues.forEach((issue: any) => {
      allIssues.push({
        title: typeof issue === 'string' ? issue : issue.title || 'Performance Issue',
        description: issue.description,
        category: 'Performance',
        severity: issue.severity || 'medium',
        priority: issue.priority,
        impact: issue.impact,
        recommendation: issue.recommendation
      });
    });
  }
  
  // Extract issues from mobile
  if (report.mobile?.issues && Array.isArray(report.mobile.issues)) {
    report.mobile.issues.forEach((issue: any) => {
      allIssues.push({
        title: typeof issue === 'string' ? issue : issue.title || 'Mobile Issue',
        description: issue.description,
        category: 'Mobile',
        severity: issue.severity || 'medium',
        priority: issue.priority,
        impact: issue.impact,
        recommendation: issue.recommendation
      });
    });
  }
  
  // Extract issues from backlinks
  if (report.backlinks?.issues && Array.isArray(report.backlinks.issues)) {
    report.backlinks.issues.forEach((issue: any) => {
      allIssues.push({
        title: typeof issue === 'string' ? issue : issue.title || 'Backlink Issue',
        description: issue.description,
        category: 'Backlinks',
        severity: issue.severity || 'medium',
        priority: issue.priority,
        impact: issue.impact,
        recommendation: issue.recommendation
      });
    });
  }
  
  // Extract issues from keywords
  if (report.keywords?.issues && Array.isArray(report.keywords.issues)) {
    report.keywords.issues.forEach((issue: any) => {
      allIssues.push({
        title: typeof issue === 'string' ? issue : issue.title || 'Keyword Issue',
        description: issue.description,
        category: 'Keywords',
        severity: issue.severity || 'medium',
        priority: issue.priority,
        impact: issue.impact,
        recommendation: issue.recommendation
      });
    });
  }
  
  // Extract issues from Gemini analysis if available
  if ((report as any)?.geminiAudit) {
    const geminiAudit = (report as any).geminiAudit;
    
    // Try to extract issues from various sections of the Gemini audit
    const extractGeminiIssues = (section: any, category: string) => {
      if (section?.issues && Array.isArray(section.issues)) {
        section.issues.forEach((issue: any) => {
          allIssues.push({
            title: typeof issue === 'string' ? issue : issue.title || `${category} Issue`,
            description: issue.description,
            category: `${category} (AI)`,
            severity: issue.severity || 'medium',
            priority: issue.priority,
            impact: issue.impact,
            recommendation: issue.recommendation
          });
        });
      }
    };
    
    // Extract issues from different sections of the Gemini audit
    if (geminiAudit.technical) extractGeminiIssues(geminiAudit.technical, 'Technical SEO');
    if (geminiAudit.content) extractGeminiIssues(geminiAudit.content, 'Content');
    if (geminiAudit.onPage) extractGeminiIssues(geminiAudit.onPage, 'On-Page SEO');
    if (geminiAudit.performance) extractGeminiIssues(geminiAudit.performance, 'Performance');
    if (geminiAudit.mobile) extractGeminiIssues(geminiAudit.mobile, 'Mobile');
    if (geminiAudit.backlinks) extractGeminiIssues(geminiAudit.backlinks, 'Backlinks');
    if (geminiAudit.keywords) extractGeminiIssues(geminiAudit.keywords, 'Keywords');
  }
  
  // Sort issues by severity (high to low)
  const severityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
  allIssues.sort((a, b) => {
    const severityA = (a.severity?.toLowerCase() || 'medium') as 'high' | 'medium' | 'low';
    const severityB = (b.severity?.toLowerCase() || 'medium') as 'high' | 'medium' | 'low';
    return severityOrder[severityA] - severityOrder[severityB];
  });
  
  // If no issues found
  if (allIssues.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>No issues found. Your website is performing well!</p>
      </div>
    );
  }
  
  // Render all issues
  return (
    <div>
      <IssuesTable>
        <thead>
          <tr>
            <th>Severity</th>
            <th>Issue</th>
            <th>Category</th>
            <th>Recommendation</th>
          </tr>
        </thead>
        <tbody>
          {allIssues.map((issue, index) => (
            <tr key={index}>
              <td>
                <SeverityBadge $severity={issue.severity || 'medium'}>
                  {issue.severity?.toUpperCase() || 'MEDIUM'}
                </SeverityBadge>
              </td>
              <td>
                <strong>{issue.title}</strong>
                {issue.description && <p>{issue.description}</p>}
                {issue.impact && <p><strong>Impact:</strong> {issue.impact}</p>}
              </td>
              <td>{issue.category}</td>
              <td>{issue.recommendation || 'Fix the issue to improve SEO performance.'}</td>
            </tr>
          ))}
        </tbody>
      </IssuesTable>
    </div>
  );
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
  const [activeTab, setActiveTab] = useState<'overview' | 'pages' | 'technical' | 'content' | 'onPage' | 'performance' | 'backlinks' | 'keywords' | 'recommendations' | 'rawdata' | 'aianalysis' | 'issues'>('overview');

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
    
    // Start polling for updates - with in-memory storage, we need to force UI refreshes
    const pollInterval = setInterval(() => {
      try {
        // With in-memory storage, we need to directly access the current audits array
        // and force a refresh of the UI by creating new references
        
        // Get the latest audits from memory (this will have the updated report)
        const latestAudits = [...audits]; // Create a copy to force React to see changes
        
        // Find the current audit in the list
        const updatedAudit = latestAudits.find(audit => audit && audit.id === selectedAudit?.id);
        
        // If we found the audit and it has a status, update the UI
        if (updatedAudit) {
          // Force React to see this as a new object by creating a shallow copy
          const refreshedAudit = {...updatedAudit};
          
          // Update the selected audit to trigger a re-render
          setSelectedAudit(refreshedAudit);
          
          console.log('Polling: Audit status =', refreshedAudit.status, 'Has report =', !!refreshedAudit.report);
          
          // Debug the report data
          if (refreshedAudit.report) {
            console.log('REPORT DATA:', JSON.stringify(refreshedAudit.report, null, 2).substring(0, 500) + '...');
          }
          
          // If the audit is completed or failed, stop polling
          if (refreshedAudit.status === 'completed' || refreshedAudit.status === 'failed') {
            console.log('Audit completed or failed, stopping polling');
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
      
      // Get the current user to use their real UUID
      const user = getCurrentUser();
      const userId = user?.id || 'anonymous';
      
      // Use the real user ID instead of client ID to ensure real audits
      // Only fall back to anonymous if no user is logged in
      const userUuid = userId !== 'anonymous' ? userId : '00000000-0000-0000-0000-000000000000';
      console.log('Using user ID:', userUuid);
      
      // Generate a new UUID for each audit - don't reuse existing IDs
      // Create an initial audit with 'in-progress' status
      const newAudit = await generateSEOAudit(url, userUuid);
      
      console.log('Received new audit:', newAudit);
      
      // Verify we have a valid audit object with an ID
      if (!newAudit || !newAudit.id) {
        console.error('Invalid audit response:', newAudit);
        throw new Error('Failed to create audit - invalid response');
      }
      
      // Add the new audit to the list and select it, ensuring no duplicates
      setAudits(prevAudits => {
        // Check if this audit ID already exists in the array
        const exists = prevAudits.some(audit => audit.id === newAudit.id);
        if (exists) {
          // If it exists, replace it instead of adding a duplicate
          return prevAudits.map(audit => 
            audit.id === newAudit.id ? newAudit : audit
          );
        } else {
          // If it's new, add it to the beginning of the array
          return [newAudit, ...prevAudits];
        }
      });
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
                    <SummaryCard>
                      <SectionTitle>Debug Information</SectionTitle>
                      <div style={{ marginBottom: '20px' }}>
                        <strong>Status:</strong> {selectedAudit.status}<br />
                        <strong>Has Report:</strong> {selectedAudit.report ? 'Yes' : 'No'}<br />
                        <strong>Score:</strong> {selectedAudit.score}<br />
                        <strong>Report Keys:</strong> {selectedAudit.report ? Object.keys(selectedAudit.report).join(', ') : 'No report'}<br />
                        <strong>Overall:</strong> {selectedAudit.report?.overall ? JSON.stringify(selectedAudit.report.overall).substring(0, 100) : 'No overall data'}
                      </div>
                    </SummaryCard>
                    
                    <SummaryCard>
                      <SectionTitle>Raw Crawler Data</SectionTitle>
                      <div style={{ marginBottom: '20px', maxHeight: '400px', overflow: 'auto' }}>
                        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                          {JSON.stringify(selectedAudit.report, null, 2)}
                        </pre>
                      </div>
                    </SummaryCard>

                    <TabsContainer>
                      <Tab 
                        $isActive={activeTab === 'overview'} 
                        onClick={() => setActiveTab('overview')}
                      >
                        Overview
                      </Tab>
                      <Tab 
                        $isActive={activeTab === 'rawdata'} 
                        onClick={() => setActiveTab('rawdata')}
                      >
                        Raw Data
                      </Tab>
                      <Tab 
                        $isActive={activeTab === 'aianalysis'} 
                        onClick={() => setActiveTab('aianalysis')}
                      >
                        AI Analysis
                      </Tab>
                      <Tab 
                        $isActive={activeTab === 'issues'} 
                        onClick={() => setActiveTab('issues')}
                      >
                        Issues Summary
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
                      {activeTab === 'rawdata' && selectedAudit && (
                        <>
                          <SummaryCard>
                            <SectionTitle>Raw Crawler Data</SectionTitle>
                            <div style={{ maxHeight: '600px', overflow: 'auto' }}>
                              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                                {JSON.stringify((selectedAudit.report as any)?.rawData || selectedAudit.report, null, 2)}
                              </pre>
                            </div>
                          </SummaryCard>
                          
                          {/* GEMINI ANALYSIS DISPLAY #2 */}
                          <SummaryCard style={{ marginTop: '20px' }}>
                            <SectionTitle>Gemini AI Analysis</SectionTitle>
                            <div style={{ maxHeight: '600px', overflow: 'auto' }}>
                              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                                {JSON.stringify((selectedAudit.report as any)?.geminiAudit, null, 2)}
                              </pre>
                            </div>
                          </SummaryCard>
                        </>
                      )}
                      
                      {activeTab === 'issues' && selectedAudit?.report && (
                        <>
                          {console.log('Issues tab selected, rendering issues...')}
                          <SummaryCard>
                            <SectionTitle>All SEO Issues</SectionTitle>
                            <SummaryText>
                              Consolidated list of all issues found across different SEO categories, sorted by severity.
                            </SummaryText>
                            
                            {/* Direct display of issues in a simple format */}
                            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                              <h3>Technical Issues</h3>
                              <ul>
                                {selectedAudit.report.technical?.issues?.map((issue: any, index: number) => (
                                  <li key={`tech-${index}`}>
                                    {typeof issue === 'string' ? issue : issue.title || 'Technical Issue'}
                                  </li>
                                )) || <li>No technical issues found</li>}
                              </ul>
                              
                              <h3>Content Issues</h3>
                              <ul>
                                {selectedAudit.report.content?.issues?.map((issue: any, index: number) => (
                                  <li key={`content-${index}`}>
                                    {typeof issue === 'string' ? issue : issue.title || 'Content Issue'}
                                  </li>
                                )) || <li>No content issues found</li>}
                              </ul>
                              
                              <h3>On-Page Issues</h3>
                              <ul>
                                {selectedAudit.report.onPage?.issues?.map((issue: any, index: number) => (
                                  <li key={`onpage-${index}`}>
                                    {typeof issue === 'string' ? issue : issue.title || 'On-Page Issue'}
                                  </li>
                                )) || <li>No on-page issues found</li>}
                              </ul>
                            </div>
                            
                            <div style={{ marginTop: '30px' }}>
                              <h3>All Issues (Using renderAllIssues)</h3>
                              {renderAllIssues(selectedAudit.report)}
                            </div>
                          </SummaryCard>
                        </>
                      )}
                      
                      {activeTab === 'aianalysis' && selectedAudit && (
                        <>
                          <SummaryCard>
                            <SectionTitle>AI-Powered SEO Analysis</SectionTitle>
                            <SummaryText>
                              Comprehensive analysis powered by Google's Gemini AI
                            </SummaryText>
                            {(() => {
                              console.log('AI Analysis tab selected');
                              console.log('Selected audit:', selectedAudit);
                              console.log('Report structure:', selectedAudit?.report ? Object.keys(selectedAudit.report) : 'No report');
                              console.log('Gemini audit available:', (selectedAudit.report as any)?.geminiAudit ? 'Yes' : 'No');
                              
                              if ((selectedAudit.report as any)?.geminiAudit) {
                                console.log('Gemini audit data type:', typeof (selectedAudit.report as any).geminiAudit);
                                console.log('Gemini audit keys:', Object.keys((selectedAudit.report as any).geminiAudit));
                                return (
                                  <div style={{ maxHeight: '600px', overflow: 'auto' }}>
                                    <AIAnalysisContainer>
                                      {renderGeminiAnalysis((selectedAudit.report as any)?.geminiAudit)}
                                    </AIAnalysisContainer>
                                  </div>
                                );
                              } else {
                                return (
                                  <SummaryText>
                                    AI analysis is still processing or unavailable. Please check back in a few minutes.
                                    <br/><br/>
                                    <strong>Debug Info:</strong><br/>
                                    Report available: {selectedAudit?.report ? 'Yes' : 'No'}<br/>
                                    Report keys: {selectedAudit?.report ? Object.keys(selectedAudit.report).join(', ') : 'None'}<br/>
                                    Status: {selectedAudit?.status}<br/>
                                    Last updated: {selectedAudit?.updated_at}
                                  </SummaryText>
                                );
                              }
                            })()}
                          </SummaryCard>
                        </>
                      )}
                      
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
                            
                            {/* GEMINI ANALYSIS DISPLAY #1 */}
                            {(selectedAudit.report as any)?.geminiAudit && (
                              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                                <h3 style={{ marginBottom: '10px', color: '#4a5568' }}>AI-Powered Insights</h3>
                                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                                  <pre style={{ whiteSpace: 'pre-wrap', maxHeight: '300px', overflow: 'auto' }}>
                                    {JSON.stringify((selectedAudit.report as any).geminiAudit, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </SummaryCard>
                          
                          <OverviewSection>
                            <SectionTitle>Critical Issues Summary</SectionTitle>
                            <div style={{ marginBottom: '30px' }}>
                              {renderAllIssues(selectedAudit.report)}
                            </div>
                            
                            <SectionTitle>SEO Score Breakdown</SectionTitle>
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
  font-size: 16px;
  line-height: 1.6;
  color: #4a5568;
  margin-bottom: 20px;
`;

const IssuesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  font-family: 'DM Sans', sans-serif;
  
  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }
  
  th {
    background-color: #f7fafc;
    font-weight: 600;
    color: #4a5568;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  tr:hover {
    background-color: #f7fafc;
  }
  
  td p {
    margin: 5px 0 0 0;
    font-size: 14px;
    color: #718096;
  }
`;

interface SeverityBadgeProps {
  $severity: string;
}

const SeverityBadge = styled.span<SeverityBadgeProps>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background-color: ${props => {
    switch (props.$severity.toLowerCase()) {
      case 'high':
        return '#FED7D7';
      case 'medium':
        return '#FEEBC8';
      case 'low':
        return '#C6F6D5';
      default:
        return '#EDF2F7';
    }
  }};
  color: ${props => {
    switch (props.$severity.toLowerCase()) {
      case 'high':
        return '#9B2C2C';
      case 'medium':
        return '#9C4221';
      case 'low':
        return '#276749';
      default:
        return '#4A5568';
    }
  }};
`;

const AIAnalysisContainer = styled.div`
  padding: 20px;
  font-family: 'DM Sans', sans-serif;
  
  h2 {
    font-size: 20px;
    font-weight: 600;
    margin-top: 30px;
    margin-bottom: 15px;
    color: #2d3748;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 8px;
  }
  
  h3 {
    font-size: 18px;
    font-weight: 500;
    margin-top: 20px;
    margin-bottom: 10px;
    color: #4a5568;
  }
  
  p {
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 15px;
    color: #4a5568;
  }
  
  ul, ol {
    margin-left: 20px;
    margin-bottom: 20px;
  }
  
  li {
    margin-bottom: 8px;
    line-height: 1.5;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  
  th, td {
    border: 1px solid #e2e8f0;
    padding: 10px;
    text-align: left;
  }
  
  th {
    background-color: #f7fafc;
    font-weight: 600;
  }
  
  code {
    background-color: #f7fafc;
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 14px;
  }
  
  .score-high {
    color: #38a169;
    font-weight: 600;
  }
  
  .score-medium {
    color: #dd6b20;
    font-weight: 600;
  }
  
  .score-low {
    color: #e53e3e;
    font-weight: 600;
  }
`;

const ScoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
{{ ... }}
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
