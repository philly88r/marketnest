import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiMail, FiPlus, FiCheck, FiX, FiSend, FiCalendar, FiEdit, FiTrash2, FiCopy, FiRefreshCw, FiPenTool, FiChevronDown, FiImage, FiLayout } from 'react-icons/fi';
import { 
  generateEmailTemplates, 
  generateCustomEmailTemplate,
  generateLandingPage,
  getEmailTemplatesByClientId, 
  updateEmailTemplateStatus,
  deleteEmailTemplate,
  EmailTemplate,
  EmailGenerationOptions,
  LIBERTY_BEANS_COLORS,
  getBrandColors
} from '../utils/emailService';

interface EmailMarketingPageProps {
  clientId: string;
  clientName: string;
  clientIndustry: string;
}

const EmailMarketingPage: React.FC<EmailMarketingPageProps> = ({ 
  clientId, 
  clientName,
  clientIndustry 
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showLandingPageForm, setShowLandingPageForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [imagePrompts, setImagePrompts] = useState<string[]>(['']);
  const [brandColors, setBrandColors] = useState(getBrandColors(clientId));
  
  // Hide scroll indicator after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollIndicator(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  // Generation options state
  const [generationOptions, setGenerationOptions] = useState<EmailGenerationOptions>({
    clientId,
    clientName,
    industry: clientIndustry,
    purpose: 'newsletter',
    tone: 'enthusiastic',
    includePromotion: false,
    includeProductHighlight: false
  });

  // Custom content for "Write with AI" feature
  const [customContent, setCustomContent] = useState('');

  // Load email templates when the component mounts
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const emailTemplates = await getEmailTemplatesByClientId(clientId);
        setTemplates(emailTemplates);
        
        // Select the most recent template if available
        if (emailTemplates.length > 0) {
          setSelectedTemplate(emailTemplates[0]);
        }
      } catch (err) {
        console.error('Error loading email templates:', err);
        setError('Failed to load email templates. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTemplates();
  }, [clientId]);

  // Handle generating new email templates
  const handleGenerateTemplates = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newTemplates = await generateEmailTemplates(generationOptions, 3);
      setTemplates(prevTemplates => [...newTemplates, ...prevTemplates]);
      setSelectedTemplate(newTemplates[0]);
      setShowGenerateForm(false);
    } catch (err) {
      console.error('Error generating email templates:', err);
      setError('Failed to generate email templates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle generating custom email template with AI
  const handleGenerateCustomTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    
    try {
      const customOptions = {
        ...generationOptions,
        customContent
      };
      
      const newTemplate = await generateCustomEmailTemplate(customOptions);
      setTemplates(prevTemplates => [newTemplate, ...prevTemplates]);
      setSelectedTemplate(newTemplate);
      setShowCustomForm(false);
      setCustomContent('');
    } catch (err) {
      console.error('Error generating custom email template:', err);
      setError('Failed to generate custom email template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle generating landing page with AI
  const handleGenerateLandingPage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    
    try {
      const landingPageOptions = {
        ...generationOptions,
        customContent,
        isLandingPage: true,
        purpose: 'landing-page' as const,
        landingPageType: generationOptions.landingPageType || 'lead-generation',
        imagePrompts: imagePrompts.filter(prompt => prompt.trim() !== '')
      };
      
      const newTemplate = await generateLandingPage(landingPageOptions);
      setTemplates(prevTemplates => [newTemplate, ...prevTemplates]);
      setSelectedTemplate(newTemplate);
      setShowLandingPageForm(false);
      setCustomContent('');
      setImagePrompts(['']);
    } catch (err) {
      console.error('Error generating landing page:', err);
      setError('Failed to generate landing page. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle approving an email template
  const handleApproveTemplate = async (templateId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await updateEmailTemplateStatus(templateId, 'approved');
      
      // Update the template status in the local state
      setTemplates(prevTemplates => 
        prevTemplates.map(template => 
          template.id === templateId 
            ? { ...template, status: 'approved' as const } 
            : template
        )
      );
      
      // Update selected template if it's the one being approved
      if (selectedTemplate && selectedTemplate.id === templateId) {
        setSelectedTemplate({ ...selectedTemplate, status: 'approved' as const });
      }
    } catch (err) {
      console.error('Error approving email template:', err);
      setError('Failed to approve email template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle scheduling an email template
  const handleScheduleTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTemplate) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await updateEmailTemplateStatus(
        selectedTemplate.id, 
        'approved', 
        scheduledDate
      );
      
      // Update the template in the local state
      const updatedTemplate: EmailTemplate = { 
        ...selectedTemplate, 
        status: 'approved' as const, 
        scheduled_for: scheduledDate 
      };
      
      setTemplates(prevTemplates => 
        prevTemplates.map(template => 
          template.id === selectedTemplate.id 
            ? updatedTemplate
            : template
        )
      );
      
      setSelectedTemplate(updatedTemplate);
      setShowScheduleForm(false);
    } catch (err) {
      console.error('Error scheduling email template:', err);
      setError('Failed to schedule email template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting an email template
  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this email template?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteEmailTemplate(templateId);
      
      // Remove the deleted template from the list
      setTemplates(prevTemplates => 
        prevTemplates.filter(template => template.id !== templateId)
      );
      
      // If the deleted template was selected, clear the selection
      if (selectedTemplate && selectedTemplate.id === templateId) {
        setSelectedTemplate(templates.find(t => t.id !== templateId) || null);
      }
    } catch (err) {
      console.error('Error deleting email template:', err);
      setError('Failed to delete email template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle copying email content to clipboard
  const handleCopyContent = () => {
    if (!selectedTemplate) return;
    
    // Create a temporary textarea to copy the HTML content
    const textarea = document.createElement('textarea');
    textarea.value = selectedTemplate.content;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    // Show a temporary success message
    alert('Email content copied to clipboard!');
  };

  // Handle form input changes
  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setGenerationOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Handle template selection
  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
  };

  // Handle brand color changes
  const handleBrandColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBrandColors(prev => ({
      ...prev,
      [name.replace('Color', '')]: value
    }));
  };

  return (
    <GlobalStyle>
      <Container>
        <Header>
          <HeaderTitle>
            <FiMail style={{ marginRight: '8px' }} /> Email Marketing
          </HeaderTitle>
          <ButtonGroup>
            <Button onClick={() => setShowLandingPageForm(true)}>
              <FiLayout style={{ marginRight: '8px' }} /> Generate Landing Page
            </Button>
            <Button onClick={() => setShowGenerateForm(true)}>
              <FiPlus style={{ marginRight: '8px' }} /> Generate Email Template
            </Button>
          </ButtonGroup>
        </Header>
        <Content>
          <Sidebar>
            <SidebarTitle>Email Templates</SidebarTitle>
            <TemplateList>
              {templates.length === 0 ? (
                <NoTemplates>
                  No email templates yet. Click "Generate Templates" to create some!
                </NoTemplates>
              ) : (
                templates.map(template => (
                  <TemplateItem 
                    key={template.id} 
                    $isActive={selectedTemplate?.id === template.id}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <TemplateInfo>
                      <TemplateTitle>{template.title}</TemplateTitle>
                      <TemplateSubject>{template.subject}</TemplateSubject>
                      <TemplateMetadata>
                        <StatusBadge $status={template.status}>
                          {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                        </StatusBadge>
                        {template.scheduled_for && (
                          <StatusBadge $status="scheduled">
                            <FiCalendar style={{ marginRight: '4px' }} />
                            {new Date(template.scheduled_for).toLocaleDateString()}
                          </StatusBadge>
                        )}
                      </TemplateMetadata>
                    </TemplateInfo>
                    <ActionButton onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id);
                    }}>
                      <FiTrash2 />
                    </ActionButton>
                  </TemplateItem>
                ))
              )}
            </TemplateList>
          </Sidebar>
          <MainContent>
            {isLoading ? (
              <Card>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
                  <FiRefreshCw className="spinning" size={32} color="#999" />
                  <div style={{ marginLeft: '16px', color: '#999' }}>
                    Generating email content...
                  </div>
                </div>
              </Card>
            ) : showGenerateForm ? (
              <Card>
                <CardTitle>Generate Email Templates</CardTitle>
                <Form onSubmit={handleGenerateTemplates}>
                  <FormGroup>
                    <Label>Email Purpose</Label>
                    <Select 
                      name="purpose" 
                      value={generationOptions.purpose}
                      onChange={handleOptionChange}
                    >
                      <option value="newsletter">Newsletter</option>
                      <option value="promotional">Promotional</option>
                      <option value="announcement">Announcement</option>
                      <option value="seasonal">Seasonal</option>
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label>Tone</Label>
                    <Select 
                      name="tone" 
                      value={generationOptions.tone}
                      onChange={handleOptionChange}
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="enthusiastic">Enthusiastic</option>
                      <option value="informative">Informative</option>
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label>Additional Instructions (Optional)</Label>
                    <Textarea 
                      name="additionalInstructions"
                      value={generationOptions.additionalInstructions || ''}
                      onChange={handleOptionChange}
                      placeholder="Any additional instructions for the AI..."
                    />
                  </FormGroup>
                  {error && <ErrorMessage>{error}</ErrorMessage>}
                  <ButtonGroup>
                    <Button 
                      type="button" 
                      $secondary 
                      onClick={() => setShowGenerateForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Generating...' : 'Generate Templates'}
                    </Button>
                  </ButtonGroup>
                </Form>
              </Card>
            ) : showCustomForm ? (
              <Card>
                <CardTitle>Generate Custom Email Template</CardTitle>
                <Form onSubmit={handleGenerateCustomTemplate}>
                  <FormGroup>
                    <Label>Custom Content</Label>
                    <Textarea 
                      value={customContent}
                      onChange={(e) => setCustomContent(e.target.value)}
                      placeholder="Describe what you want in your email..."
                      rows={6}
                      required
                    />
                  </FormGroup>
                  {error && <ErrorMessage>{error}</ErrorMessage>}
                  <ButtonGroup>
                    <Button 
                      type="button" 
                      $secondary 
                      onClick={() => setShowCustomForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Generating...' : 'Generate Custom Template'}
                    </Button>
                  </ButtonGroup>
                </Form>
              </Card>
            ) : showLandingPageForm ? (
              <Card>
                <CardTitle>Generate Landing Page</CardTitle>
                <Form onSubmit={handleGenerateLandingPage}>
                  <FormGroup>
                    <Label>Landing Page Title</Label>
                    <Input 
                      type="text" 
                      value={generationOptions.title || ''}
                      onChange={(e) => setGenerationOptions({
                        ...generationOptions,
                        title: e.target.value
                      })}
                      placeholder="Enter a title for your landing page..."
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Landing Page Description</Label>
                    <Textarea 
                      value={customContent}
                      onChange={(e) => setCustomContent(e.target.value)}
                      placeholder="Describe what you want on your landing page..."
                      rows={6}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Landing Page Type</Label>
                    <Select 
                      name="landingPageType" 
                      value={generationOptions.landingPageType || 'lead-generation'}
                      onChange={handleOptionChange}
                    >
                      <option value="lead-generation">Lead Generation</option>
                      <option value="product">Product</option>
                      <option value="service">Service</option>
                      <option value="event">Event</option>
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label>Image Prompts (one per line)</Label>
                    <Textarea 
                      value={imagePrompts.join('\n')}
                      onChange={(e) => setImagePrompts(e.target.value.split('\n'))}
                      placeholder="Describe the images you want generated (one description per line)..."
                      rows={4}
                    />
                    <small style={{ color: '#999', marginTop: '4px', display: 'block' }}>
                      These will be used to generate images for your landing page using Google's AI image generator.
                    </small>
                  </FormGroup>
                  <FormGroup>
                    <Label>Brand Colors</Label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div>
                        <small>Primary</small>
                        <Input 
                          type="color" 
                          name="primary"
                          value={brandColors.primary}
                          onChange={handleBrandColorChange}
                          style={{ width: '50px', height: '30px', padding: '0' }}
                        />
                      </div>
                      <div>
                        <small>Secondary</small>
                        <Input 
                          type="color" 
                          name="secondary"
                          value={brandColors.secondary}
                          onChange={handleBrandColorChange}
                          style={{ width: '50px', height: '30px', padding: '0' }}
                        />
                      </div>
                      <div>
                        <small>Accent</small>
                        <Input 
                          type="color" 
                          name="accent"
                          value={brandColors.accent}
                          onChange={handleBrandColorChange}
                          style={{ width: '50px', height: '30px', padding: '0' }}
                        />
                      </div>
                    </div>
                  </FormGroup>
                  {error && <ErrorMessage>{error}</ErrorMessage>}
                  <ButtonGroup>
                    <Button 
                      type="button" 
                      $secondary 
                      onClick={() => setShowLandingPageForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <FiRefreshCw className="spinning" style={{ marginRight: '8px' }} />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FiLayout style={{ marginRight: '8px' }} />
                          Generate Landing Page
                        </>
                      )}
                    </Button>
                  </ButtonGroup>
                </Form>
              </Card>
            ) : showScheduleForm && selectedTemplate ? (
              <Card>
                <CardTitle>Schedule Email</CardTitle>
                <Form onSubmit={handleScheduleTemplate}>
                  <FormGroup>
                    <Label>Email Template</Label>
                    <Input 
                      type="text" 
                      value={selectedTemplate.title} 
                      disabled 
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Schedule Date</Label>
                    <Input 
                      type="datetime-local" 
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      required
                    />
                  </FormGroup>
                  {error && <ErrorMessage>{error}</ErrorMessage>}
                  <ButtonGroup>
                    <Button 
                      type="button" 
                      $secondary 
                      onClick={() => setShowScheduleForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      Schedule
                    </Button>
                  </ButtonGroup>
                </Form>
              </Card>
            ) : selectedTemplate ? (
              <>
                <EmailPreviewHeader>
                  <div>
                    <EmailSubject>{selectedTemplate.subject}</EmailSubject>
                    <EmailMetadata>
                      <StatusBadge $status={selectedTemplate.status}>
                        {selectedTemplate.status.charAt(0).toUpperCase() + selectedTemplate.status.slice(1)}
                      </StatusBadge>
                      {selectedTemplate.scheduled_for && (
                        <StatusBadge $status="scheduled">
                          <FiCalendar style={{ marginRight: '4px' }} />
                          {new Date(selectedTemplate.scheduled_for).toLocaleDateString()}
                        </StatusBadge>
                      )}
                    </EmailMetadata>
                  </div>
                  <EmailActions>
                    <Button $secondary onClick={handleCopyContent}>
                      <FiCopy style={{ marginRight: '8px' }} /> Copy
                    </Button>
                    {selectedTemplate.status === 'draft' && (
                      <Button onClick={() => handleApproveTemplate(selectedTemplate.id)}>
                        <FiCheck style={{ marginRight: '8px' }} /> Approve
                      </Button>
                    )}
                    {selectedTemplate.status === 'approved' && !selectedTemplate.scheduled_for && (
                      <Button onClick={() => setShowScheduleForm(true)}>
                        <FiCalendar style={{ marginRight: '8px' }} /> Schedule
                      </Button>
                    )}
                    {selectedTemplate.status === 'approved' && !selectedTemplate.scheduled_for && (
                      <Button>
                        <FiSend style={{ marginRight: '8px' }} /> Send Now
                      </Button>
                    )}
                  </EmailActions>
                </EmailPreviewHeader>
                <EmailPreviewContainer>
                  <EmailContent dangerouslySetInnerHTML={{ __html: selectedTemplate.content }} />
                </EmailPreviewContainer>
                <EmailTags>
                  {selectedTemplate.tags.map((tag, index) => (
                    <Tag key={index}>{tag}</Tag>
                  ))}
                </EmailTags>
              </>
            ) : (
              <NoSelection>
                Select an email template from the sidebar or create a new one
              </NoSelection>
            )}
          </MainContent>
        </Content>
        {showScrollIndicator && (
          <ScrollIndicator>
            <FiChevronDown className="bounce" /> Scroll down for more content <FiChevronDown className="bounce" />
          </ScrollIndicator>
        )}
      </Container>
    </GlobalStyle>
  );
};

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
  overflow-y: auto;
  margin-top: 80px; /* Use margin instead of padding to position below the header */
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: ${LIBERTY_BEANS_COLORS.primary};
  border-bottom: 1px solid #333;
  position: fixed; /* Make header fixed */
  top: 80px; /* Position below the site header */
  left: 0;
  right: 0;
  z-index: 100; /* Ensure header is on top */
`;

const HeaderTitle = styled.h1`
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  min-height: calc(100vh - 60px); /* Subtract header height */
  overflow-y: auto;
`;

const Sidebar = styled.div`
  width: 300px;
  border-right: 1px solid #333;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 60px); /* Subtract header height */
  flex-shrink: 0; /* Prevent sidebar from shrinking */
`;

const SidebarTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  padding: 16px;
  margin: 0;
  border-bottom: 1px solid #333;
`;

const TemplateList = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* Enable scrolling for the template list */
  max-height: calc(100vh - 110px); /* Subtract header height and sidebar title */
`;

const TemplateItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #333;
  cursor: pointer;
  background-color: ${props => props.$isActive ? '#262626' : 'transparent'};
  transition: background-color 0.2s;
  position: relative;
  z-index: 1;

  &:hover {
    background-color: #262626;
  }
`;

const TemplateInfo = styled.div`
  flex: 1;
  overflow: hidden;
  pointer-events: none; /* Ensure clicks pass through to parent */
`;

const TemplateTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TemplateSubject = styled.div`
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TemplateMetadata = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: none; /* Ensure clicks pass through to parent */
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: ${props => {
    switch (props.$status) {
      case 'draft': return 'rgba(255, 149, 0, 0.2)';
      case 'approved': return 'rgba(52, 199, 89, 0.2)';
      case 'sent': return 'rgba(0, 122, 255, 0.2)';
      default: return 'rgba(142, 142, 147, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'draft': return '#ff9500';
      case 'approved': return '#34c759';
      case 'sent': return '#007aff';
      default: return '#8e8e93';
    }
  }};
`;

const ActionButton = styled.button`
  background-color: transparent;
  color: #999;
  border: none;
  padding: 4px;
  cursor: pointer;
  transition: color 0.2s;
  position: relative;
  z-index: 2;

  &:hover {
    color: #fff;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 24px 24px 60px; /* Add padding to the bottom to ensure buttons are visible */
  overflow-y: auto;
  position: relative;
  max-height: calc(100vh - 60px); /* Subtract header height */
`;

const NoTemplates = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: #999;
  font-size: 14px;
  padding: 0 16px;
  text-align: center;
`;

const NoSelection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
  font-size: 16px;
`;

const Card = styled.div`
  background-color: #262626;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 24px 0;
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
    border-color: ${LIBERTY_BEANS_COLORS.secondary};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  background-color: #333;
  color: #ffffff;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 10px 12px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${LIBERTY_BEANS_COLORS.secondary};
  }
`;

const Textarea = styled.textarea`
  background-color: #333;
  color: #ffffff;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 10px 12px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${LIBERTY_BEANS_COLORS.secondary};
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
`;

const Checkbox = styled.input`
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
`;

const Button = styled.button<{ $secondary?: boolean }>`
  display: flex;
  align-items: center;
  background-color: ${props => props.$secondary ? 'transparent' : LIBERTY_BEANS_COLORS.secondary};
  color: ${props => props.$secondary ? '#ffffff' : '#ffffff'};
  border: ${props => props.$secondary ? `1px solid ${LIBERTY_BEANS_COLORS.secondary}` : 'none'};
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.$secondary ? 'rgba(127, 38, 40, 0.2)' : '#9e2e30'};
  }

  &:disabled {
    background-color: #555;
    color: #888;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff3b30;
  font-size: 14px;
  margin-top: 8px;
`;

const EmailPreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

const EmailSubject = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const EmailMetadata = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EmailActions = styled.div`
  display: flex;
  gap: 8px;
`;

const EmailPreviewContainer = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 16px;
  max-width: 800px;
  overflow-y: auto;
  max-height: 600px; /* Add a max height to enable scrolling within the email preview */
`;

const EmailContent = styled.div`
  color: #000000;
  font-family: Arial, sans-serif;
  line-height: 1.6;

  h1, h2, h3, h4, h5, h6 {
    color: ${LIBERTY_BEANS_COLORS.primary} !important;
    background: none !important;
    background-image: none !important;
    background-clip: unset !important;
    -webkit-background-clip: unset !important;
    -webkit-text-fill-color: ${LIBERTY_BEANS_COLORS.primary} !important;
    text-fill-color: ${LIBERTY_BEANS_COLORS.primary} !important;
    background-color: transparent !important;
  }

  p {
    margin-bottom: 16px;
  }

  a {
    color: ${LIBERTY_BEANS_COLORS.secondary};
    text-decoration: none;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  .button {
    display: inline-block;
    background-color: ${LIBERTY_BEANS_COLORS.secondary};
    color: #ffffff;
    padding: 10px 20px;
    border-radius: 4px;
    font-weight: bold;
    text-decoration: none;
  }
`;

const EmailTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;

const Tag = styled.span`
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
`;

const ScrollIndicator = styled.div`
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(127, 38, 40, 0.9);
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 100;
  width: fit-content;
  margin: 0 auto;
  cursor: pointer;
  animation: fadeInUp 0.5s ease-out;
  
  .bounce {
    animation: bounce 1.5s infinite;
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

  .spinning {
    animation: spin 1.5s linear infinite;
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-5px);
    }
    60% {
      transform: translateY(-3px);
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translate(-50%, 20px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
`;

export default EmailMarketingPage;
