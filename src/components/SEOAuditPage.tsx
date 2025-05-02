import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiDownload, FiRefreshCw, FiCheck } from 'react-icons/fi';
import { 
  generateSEOAudit, 
  getSEOAuditsByClientId, 
  deleteSEOAudit,
  SEOAudit,
  SEOReport,
  SEOIssue
} from '../utils/seoService';
import { getCurrentUser } from '../utils/authService';
import { downloadAsHtml } from '../utils/reportExporter';
import { simpleExportToGoogleDocs } from '../utils/simpleReportExporter';
import { cleanupHtmlReport } from '../utils/htmlCleanupAgent';

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

const ButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer !important;
  transition: all 0.2s ease;
  background-color: #262626;
  color: #ffffff;
  border: 1px solid #333;
  position: relative;
  z-index: 10;
  pointer-events: auto;

  &:hover {
    background-color: #333;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed !important;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: #0df9b6;
  color: #000000;
  border: none;

  &:hover {
    background-color: #0be0a5;
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #1a1a1a;
  
  /* Fix z-index stacking context */
  isolation: isolate;
`;

const MainContent = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const AuditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: #262626;
  border-radius: 8px;
  position: relative;
  z-index: 5;
  
  /* Ensure buttons are clickable */
  button {
    pointer-events: auto;
  }
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
    text-align: center;
    max-width: 400px;
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: #666;
  }
`;

const CleanupIndicator = styled(LoadingSpinner)`
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin: 20px 0;
  padding: 30px;
  color: #495057;
  
  svg {
    color: #0df9b6;
    animation: pulse 1.5s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
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

const NoAuditsMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: #262626;
  border-radius: 8px;
  text-align: center;
`;

const AIReportContainer = styled.div`
  width: 100%;
  margin-top: 20px;
  background-color: white;
  color: #333;
  padding: 30px;
  border-radius: 8px;
  margin-top: 20px;
  overflow-x: auto;
  
  /* Modern table styling */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 30px;
    table-layout: fixed;
    font-size: 14px;
    max-width: 100%;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: none;
  }
  
  th {
    background-color: #f8f9fa;
    color: #495057;
    font-weight: 600;
    text-align: left;
    padding: 12px 15px;
    border: none;
    border-bottom: 2px solid #e9ecef;
    word-wrap: break-word;
    overflow-wrap: break-word;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  td {
    padding: 12px 15px;
    border: none;
    border-bottom: 1px solid #e9ecef;
    vertical-align: top;
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-width: 300px;
    white-space: normal;
    height: auto;
    overflow: visible;
    line-height: 1.6;
  }
  
  tr:nth-child(even) {
    background-color: #f8f9fa;
  }
  
  tr:hover {
    background-color: #f1f3f5;
  }
  
  /* Make URL columns narrower */
  td:nth-child(1) {
    max-width: 180px;
    white-space: normal;
    color: #0066cc;
  }
  
  /* Make Type columns narrower */
  td:nth-child(2), th:nth-child(2) {
    max-width: 100px;
  }
  
  /* Ensure tables don't overflow */
  .table-container {
    width: 100%;
    overflow-x: auto;
    margin-bottom: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    background: white;
    position: relative;
  }
  
  /* Add horizontal scrolling indicator for wide tables */
  .table-container:after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 5px;
    background: linear-gradient(to right, rgba(255,255,255,0), rgba(0,0,0,0.1));
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .table-container.scrollable:after {
    opacity: 1;
  }
  
  /* Additional styling for SEO tables */
  table.seo-table {
    table-layout: fixed;
    width: 100%;
    border-spacing: 0;
    margin-bottom: 30px;
  }
  
  table.seo-table th {
    background-color: #f8f9fa;
    color: #495057;
    padding: 12px 15px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: none;
    border-bottom: 2px solid #e9ecef;
  }
  
  table.seo-table td {
    padding: 12px 15px;
    line-height: 1.6;
    vertical-align: top;
    border: none;
    border-bottom: 1px solid #e9ecef;
    word-break: break-word;
  }
  
  /* Prevent text from flowing into other cells */
  table.seo-table td p {
    margin: 0 0 8px 0;
  }
  
  /* Improve heading styles */
  
  h1, h2, h3, h4, h5, h6 {
    color: #333;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  h2 {
    font-size: 20px;
  }
  
  h3 {
    font-size: 18px;
  }
  
  p {
    line-height: 1.6;
    margin-bottom: 15px;
  }
  
  .critical {
    color: #d9534f;
  }
  
  .warning {
    color: #f0ad4e;
  }
  
  .good {
    color: #5cb85c;
  }
  
  /* Make tables responsive without breaking their structure */
  @media screen and (max-width: 768px) {
    .table-container {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    
    table {
      min-width: 600px; /* Ensure table maintains minimum width */
      width: 100%;
    }
    
    /* Keep table structure intact */
    th, td {
      padding: 8px;
      font-size: 13px;
    }
    
    /* Ensure column widths are maintained */
    th:nth-child(1), td:nth-child(1) {
      min-width: 150px;
    }
    
    th:nth-child(2), td:nth-child(2) {
      min-width: 100px;
    }
    
    th:nth-child(3), td:nth-child(3) {
      min-width: 80px;
    }
    
    th:nth-child(4), td:nth-child(4) {
      min-width: 150px;
    }
  }
`;

// Type definitions
interface SEOAuditPageProps {
  clientId: string;
}

// Main component
const SEOAuditPage: React.FC<SEOAuditPageProps> = ({ clientId }) => {
  const [audits, setAudits] = useState<SEOAudit[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<SEOAudit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [showNewAuditForm, setShowNewAuditForm] = useState(false);

  // Load audits when the component mounts
  useEffect(() => {
    const loadAudits = async () => {
      try {
        setIsLoading(true);
        const fetchedAudits = await getSEOAuditsByClientId(clientId);
        
        if (fetchedAudits && Array.isArray(fetchedAudits)) {
          setAudits(fetchedAudits);
          
          // If there are audits, select the most recent one
          if (fetchedAudits.length > 0) {
            setSelectedAudit(fetchedAudits[0]);
          }
        } else {
          console.warn('Invalid audits data:', fetchedAudits);
          setAudits([]);
        }
      } catch (err) {
        console.error('Error loading SEO audits:', err);
        setError('Failed to load SEO audits');
        setAudits([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAudits();
  }, [clientId]);

  // State to track if HTML cleanup is in progress
  const [cleanupInProgress, setCleanupInProgress] = useState<string | null>(null);

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
        // Get the latest audits
        const latestAudits = await getSEOAuditsByClientId(clientId);
        
        // Find the current audit in the list
        const updatedAudit = latestAudits.find(audit => audit && audit.id === selectedAudit?.id);
        
        // If we found the audit and it has a status, update the UI
        if (updatedAudit) {
          // Force React to see this as a new object by creating a shallow copy
          const refreshedAudit = {...updatedAudit};
          
          // If the audit just completed, run the HTML cleanup agent
          if (refreshedAudit.status === 'completed' && 
              selectedAudit.status !== 'completed' && 
              !cleanupInProgress) {
            console.log('Audit just completed, running HTML cleanup agent');
            setCleanupInProgress(refreshedAudit.id);
          }
          
          // Update the selected audit to trigger a re-render
          setSelectedAudit(refreshedAudit);
          
          // Also update the audit in the list
          setAudits(prevAudits => 
            prevAudits.map(audit => 
              audit.id === refreshedAudit.id ? refreshedAudit : audit
            )
          );
          
          // If the audit is completed or failed, stop polling
          if (refreshedAudit.status === 'completed' || refreshedAudit.status === 'failed') {
            console.log('Audit completed or failed, stopping polling');
            clearInterval(pollInterval);
            
            // If the audit just completed and cleanup hasn't started yet, trigger it directly
            if (refreshedAudit.status === 'completed' && !cleanupInProgress) {
              console.log('Audit completed, triggering HTML cleanup directly');
              setCleanupInProgress(refreshedAudit.id);
            }
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
  }, [selectedAudit?.id, clientId, cleanupInProgress]);
  
  // Effect to run the HTML cleanup agent when an audit is completed
  useEffect(() => {
    // Only run cleanup if an audit is marked for cleanup
    if (!cleanupInProgress || !selectedAudit || selectedAudit.id !== cleanupInProgress) {
      return;
    }
    
    console.log('Cleanup effect triggered for audit:', selectedAudit.id);
    
    const runHtmlCleanup = async () => {
      try {
        console.log('Starting HTML cleanup for audit:', cleanupInProgress);
        
        // Run the HTML cleanup agent
        const cleanedAudit = await cleanupHtmlReport(selectedAudit);
        
        // Update the audit with the cleaned HTML
        setSelectedAudit(cleanedAudit);
        
        // Also update the audit in the list
        setAudits(prevAudits => 
          prevAudits.map(audit => 
            audit.id === cleanedAudit.id ? cleanedAudit : audit
          )
        );
        
        console.log('HTML cleanup completed successfully');
      } catch (error) {
        console.error('Error running HTML cleanup:', error);
      } finally {
        // Reset cleanup state
        setCleanupInProgress(null);
      }
    };
    
    runHtmlCleanup();
  }, [cleanupInProgress, selectedAudit]);

  // Handle creating a new SEO audit
  const handleCreateAudit = async () => {
    console.log('handleCreateAudit function called');
    if (!url) {
      setError('Please enter a URL to audit');
      return;
    }
    
    // Show a message to the user that this might take a few minutes
    setError(null); // Clear any previous errors
    alert('Your SEO audit is being created. This could take a few minutes to complete. You will see the results when it\'s done.');
    
    // Ensure URL has protocol
    let auditUrl = url;
    if (!auditUrl.startsWith('http://') && !auditUrl.startsWith('https://')) {
      auditUrl = 'https://' + auditUrl;
      console.log('Added https:// protocol to URL:', auditUrl);
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Creating new SEO audit for URL:', auditUrl);
      
      // Get the current user to use their real UUID
      const user = getCurrentUser();
      const userId = user?.id || 'anonymous';
      
      // Use the real user ID instead of client ID to ensure real audits
      // Only fall back to anonymous if no user is logged in
      const userUuid = userId !== 'anonymous' ? userId : '00000000-0000-0000-0000-000000000000';
      console.log('Using user ID:', userUuid);
      
      // Create a new audit with error handling
      console.log('Calling generateSEOAudit with URL:', auditUrl, 'and userUuid:', userUuid);
      const newAudit = await generateSEOAudit(auditUrl, userUuid);
      
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

  // Handle export to Google Docs
  const handleExportToGoogleDocs = () => {
    try {
      // Use our direct converter function
      const html = simpleExportToGoogleDocs(selectedAudit);
      
      // Open in a new tab
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(html);
        newWindow.document.close();
      }
    } catch (error) {
      console.error('Error exporting to Google Docs:', error);
      alert('Could not generate report. Please try again later.');
    }
  };

  // Handle download as HTML
  const handleDownloadAsHtml = () => {
    if (selectedAudit) {
      downloadAsHtml(selectedAudit);
    }
  };

  // Handle audit selection
  const handleAuditSelect = (audit: SEOAudit) => {
    setSelectedAudit(audit);
    
    // If the audit is completed and hasn't been cleaned up yet, run the cleanup
    if (audit.status === 'completed' && !audit.cleanupTimestamp && !cleanupInProgress) {
      console.log('Selected completed audit without cleanup, triggering cleanup');
      setCleanupInProgress(audit.id);
    }
  };

  return (
    <Container>
      <Header>
        <Title>SEO Audit</Title>
        <ButtonsContainer>
          {!showNewAuditForm && (
            <PrimaryButton onClick={() => setShowNewAuditForm(true)}>
              <FiPlus size={16} />
              New Audit
            </PrimaryButton>
          )}
          {selectedAudit && selectedAudit.status === 'completed' && (
            <>
              <Button onClick={handleExportToGoogleDocs}>
                <FiDownload size={16} />
                Export to Google Docs
              </Button>
              <Button onClick={handleDownloadAsHtml}>
                <FiDownload size={16} />
                Download HTML
              </Button>
            </>
          )}
        </ButtonsContainer>
      </Header>

      <ContentContainer>
        <MainContent>
          {/* New Audit Form */}
          {showNewAuditForm && (
            <AuditForm 
              onSubmit={(e) => {
                e.preventDefault();
                console.log('Form submitted');
                handleCreateAudit();
              }}
              style={{ position: 'relative', zIndex: 10 }}
            >
              <FormTitle>Create New SEO Audit</FormTitle>
              <FormGroup>
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  type="text"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  autoFocus
                />
              </FormGroup>
              {error && <ErrorMessage>{error}</ErrorMessage>}
              <ButtonsContainer style={{ position: 'relative', zIndex: 100 }}>
                <PrimaryButton 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Create Audit button clicked');
                    handleCreateAudit();
                  }} 
                  disabled={isLoading}
                  type="submit"
                  style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                >
                  {isLoading ? (
                    <>
                      <FiRefreshCw size={16} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiPlus size={16} />
                      Create Audit
                    </>
                  )}
                </PrimaryButton>
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Cancel button clicked');
                    setShowNewAuditForm(false);
                  }}
                  type="button"
                  style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                >
                  Cancel
                </Button>
              </ButtonsContainer>
            </AuditForm>
          )}

          {/* Loading State */}
          {isLoading && !showNewAuditForm && (
            <LoadingSpinner>
              <FiRefreshCw size={32} />
              <h3>Creating Your SEO Audit</h3>
              <p>This process could take a few minutes as we crawl the website and analyze up to 30 pages. Please be patient.</p>
            </LoadingSpinner>
          )}

          {/* No Audits Message */}
          {!isLoading && audits.length === 0 && !showNewAuditForm && (
            <NoAuditsMessage>
              <p>No SEO audits found for this client.</p>
              <PrimaryButton onClick={() => setShowNewAuditForm(true)}>
                <FiPlus size={16} />
                Create Your First Audit
              </PrimaryButton>
            </NoAuditsMessage>
          )}

          {/* HTML Cleanup Indicator */}
          {cleanupInProgress === selectedAudit?.id && (
            <CleanupIndicator>
              <FiCheck size={24} />
              <h3>Optimizing Report</h3>
              <p>Our cleanup agent is removing duplicate tables and fixing any formatting issues...</p>
            </CleanupIndicator>
          )}

          {/* AI-Generated Report */}
          {selectedAudit && selectedAudit.status === 'completed' && !cleanupInProgress && (
            <AIReportContainer>
              {(selectedAudit.report as any)?.geminiAudit && (
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: (() => {
                      // Process the HTML content to fix formatting issues
                      if (typeof (selectedAudit.report as any).geminiAudit !== 'string') {
                        return JSON.stringify((selectedAudit.report as any).geminiAudit, null, 2);
                      }

                      let htmlContent = (selectedAudit.report as any).geminiAudit;
                      
                      // Check if it's HTML content
                      const isHtml = htmlContent.startsWith('<!DOCTYPE') || 
                                    htmlContent.startsWith('<html') || 
                                    htmlContent.includes('<table');
                      
                      if (!isHtml) {
                        return `<div>${htmlContent}</div>`;
                      }
                      
                      // Create a temporary div to process the HTML
                      const tempDiv = document.createElement('div');
                      
                      // Extract just the body content if it's a full HTML document
                      if (htmlContent.includes('<body')) {
                        const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                        if (bodyMatch && bodyMatch[1]) {
                          htmlContent = bodyMatch[1];
                        }
                      }
                      
                      // Clean up the HTML content
                      htmlContent = htmlContent
                        // Remove all \n, \r, \t characters
                        .replace(/\\n|\n|\\r|\r|\\t|\t/g, ' ')
                        // Remove HTML comments
                        .replace(/<!--[\s\S]*?-->/g, '')
                        // Replace multiple spaces with a single space
                        .replace(/\s{2,}/g, ' ')
                        // Fix common escape sequences
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        // Remove any <pre> or <code> blocks
                        .replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, '')
                        .replace(/<code[^>]*>[\s\S]*?<\/code>/gi, '');
                      
                      // Set the processed HTML to the temp div
                      tempDiv.innerHTML = htmlContent;
                      
                      // Remove any duplicate tables (tables with identical headers)
                      const tables = Array.from(tempDiv.querySelectorAll('table'));
                      const processedHeaders = new Set();
                      
                      tables.forEach(table => {
                        // Get table headers as a signature
                        const headers = Array.from(table.querySelectorAll('th'))
                          .map(th => th.textContent?.trim())
                          .join('|');
                          
                        // If we've seen this header pattern before, it's likely a duplicate table
                        if (headers && processedHeaders.has(headers)) {
                          table.parentNode?.removeChild(table);
                        } else if (headers) {
                          processedHeaders.add(headers);
                          
                          // Add class for styling
                          table.classList.add('seo-table');
                          
                          // Wrap table in a container div if not already wrapped
                          if (!table.parentElement?.classList.contains('table-container')) {
                            const container = document.createElement('div');
                            container.className = 'table-container';
                            table.parentNode?.insertBefore(container, table);
                            container.appendChild(table);
                          }
                          
                          // Process all cells to fix formatting
                          const cells = table.querySelectorAll('td');
                          cells.forEach(cell => {
                            // Clean up cell content
                            let content = cell.innerHTML
                              // Replace any remaining escape characters
                              .replace(/\\n|\n|\\r|\r/g, '<br>')
                              .replace(/\\t|\t/g, ' ')
                              // Add line breaks after sentences for readability
                              .replace(/(\. |\? |\! )(?=[A-Z])/g, '$1<br>');
                              
                            // Remove any raw HTML tags that might be displayed as text
                            content = content.replace(/&lt;[^&]*&gt;/g, '');
                            
                            cell.innerHTML = content;
                          });
                        }
                      });
                      
                      // Remove any raw HTML or markdown code blocks that might be displayed as text
                      const allElements = tempDiv.querySelectorAll('*');
                      allElements.forEach(el => {
                        if (el.textContent) {
                          el.textContent = el.textContent
                            .replace(/```[\s\S]*?```/g, '')
                            .replace(/`[^`]*`/g, '');
                        }
                      });
                      
                      return tempDiv.innerHTML;
                    })()
                  }} 
                  ref={(el) => {
                    if (el) {
                      // Add scrollable class to table containers that need horizontal scrolling
                      setTimeout(() => {
                        const tableContainers = el.querySelectorAll('.table-container');
                        tableContainers.forEach(container => {
                          const table = container.querySelector('table');
                          // Fix TypeScript error by using HTMLElement type assertion
                          if (table && (table as HTMLElement).offsetWidth > (container as HTMLElement).offsetWidth) {
                            container.classList.add('scrollable');
                          }
                          
                          // Wrap any tables that aren't already in a table-container
                          const unwrappedTables = el.querySelectorAll('table:not(.table-container table)');
                          unwrappedTables.forEach(unwrappedTable => {
                            // Skip tables that are already in a table-container
                            if (unwrappedTable.parentElement?.classList.contains('table-container')) {
                              return;
                            }
                            
                            // Create a table container and wrap the table
                            const tableContainer = document.createElement('div');
                            tableContainer.className = 'table-container';
                            unwrappedTable.parentNode?.insertBefore(tableContainer, unwrappedTable);
                            tableContainer.appendChild(unwrappedTable);
                          });
                        });
                      }, 500);
                    }
                  }}
                />
              )}
            </AIReportContainer>
          )}
        </MainContent>
      </ContentContainer>
    </Container>
  );
};

export default SEOAuditPage;
