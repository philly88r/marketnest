import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiMail, FiPlus, FiCheck, FiX, FiSend, FiCalendar, FiEdit, FiTrash2, FiCopy, FiRefreshCw, FiPenTool, FiChevronDown, FiImage, FiLayout, FiEye, FiMousePointer, FiShoppingCart } from 'react-icons/fi';
import { 
  generateEmailTemplates, 
  generateCustomEmailTemplate,
  generatePersonalTouchTemplate,
  getEmailTemplatesByClientId, 
  updateEmailTemplateStatus,
  deleteEmailTemplate,
  updateEmailTemplate,
  updateTemplateWithAI,
  EmailTemplate,
  EmailGenerationOptions,
  LIBERTY_BEANS_COLORS,
  saveTemplateToLocalStorage
} from '../utils/emailService';
import { getPreGeneratedTemplates, getTemplateCategories } from '../utils/preGeneratedTemplates';
import { supabase } from '../utils/supabaseClient';
import EmailDebugger from './EmailDebugger';

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
  const [savedTemplates, setSavedTemplates] = useState<EmailTemplate[]>([]);
  const [preGeneratedTemplates, setPreGeneratedTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [imagePrompts, setImagePrompts] = useState<string[]>(['']);
  const [brandColors, setBrandColors] = useState(LIBERTY_BEANS_COLORS);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState<Partial<EmailTemplate>>({});
  const [showAIEditForm, setShowAIEditForm] = useState(false);
  const [aiEditPrompt, setAIEditPrompt] = useState('');
  const [isUpdatingWithAI, setIsUpdatingWithAI] = useState(false);
  const [showBrandColorsModal, setShowBrandColorsModal] = useState(false);
  const [showPreGeneratedModal, setShowPreGeneratedModal] = useState(false);
  const [templateCategories, setTemplateCategories] = useState(getTemplateCategories());
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'saved' | 'generated'>('saved');
  
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
      
      console.log('EmailMarketingPage: Loading templates for client:', clientId);
      
      // Always get pre-generated templates first so we have them available
      const preGenTemplates = getPreGeneratedTemplates(clientId);
      console.log('EmailMarketingPage: Pre-generated templates available:', preGenTemplates.length);
      
      // Debug output of pre-generated templates
      preGenTemplates.forEach((template, index) => {
        console.log(`Pre-generated template ${index + 1}:`, template.title);
      });
      
      // Set pre-generated templates
      setPreGeneratedTemplates([...preGenTemplates]);
      
      try {
        // Try to get templates from the database
        const emailTemplates = await getEmailTemplatesByClientId(clientId);
        console.log('EmailMarketingPage: Received templates from database:', emailTemplates.length);
        console.log('EmailMarketingPage: Database templates:', emailTemplates);
        
        // Store the saved templates separately
        setSavedTemplates([...emailTemplates]);
        
        // Set the templates based on the active tab
        if (activeTab === 'saved') {
          if (emailTemplates.length === 0) {
            console.log('EmailMarketingPage: No saved templates found, switching to generated tab');
            setActiveTab('generated');
            setTemplates([...preGenTemplates]);
          } else {
            console.log('EmailMarketingPage: Using saved templates from database');
            setTemplates([...emailTemplates]);
          }
        } else {
          setTemplates([...preGenTemplates]);
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        setError('Failed to load email templates. Using pre-generated templates as fallback.');
        setSavedTemplates([]);
        setTemplates([...preGenTemplates]);
        setActiveTab('generated');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTemplates();
  }, [clientId]); // Only depend on clientId to avoid infinite loops
  
  // Handle tab change
  const handleTabChange = (tab: 'saved' | 'generated') => {
    console.log(`Switching to tab: ${tab}`);
    console.log(`Saved templates count: ${savedTemplates.length}`);
    console.log(`Pre-generated templates count: ${preGeneratedTemplates.length}`);
    
    setActiveTab(tab);
    
    if (tab === 'saved') {
      console.log('Setting templates to saved templates');
      setTemplates([...savedTemplates]); // Create a new array to ensure state update
    } else {
      console.log('Setting templates to pre-generated templates');
      setTemplates([...preGeneratedTemplates]); // Create a new array to ensure state update
    }
    
    setSelectedTemplate(null);
  };

  // Handle generating new email templates
  const handleGenerateTemplates = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Include brand colors in the generation options
      const optionsWithBranding = {
        ...generationOptions,
        brandColors: brandColors
      };
      
      const newTemplates = await generateEmailTemplates(optionsWithBranding, 3);
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
        customContent,
        brandColors: brandColors
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
  
  // Handle generating personal touch template
  const handleGeneratePersonalTouch = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const personalOptions: EmailGenerationOptions = {
        ...generationOptions,
        purpose: 'personal-touch' as 'personal-touch',
        tone: 'friendly' as 'friendly',
        brandColors: brandColors
      };
      
      const newTemplate = await generatePersonalTouchTemplate(personalOptions);
      setTemplates(prevTemplates => [newTemplate, ...prevTemplates]);
      setSelectedTemplate(newTemplate);
    } catch (err) {
      console.error('Error generating personal touch template:', err);
      setError('Failed to generate personal touch template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle loading pre-generated templates
  const handleLoadPreGeneratedTemplates = () => {
    setShowPreGeneratedModal(true);
  };
  
  // Handle selecting a pre-generated template
  const handleSelectPreGeneratedTemplate = (template: EmailTemplate) => {
    console.log('Selected pre-generated template:', template.title);
    
    // Create a new template based on the pre-generated one
    const newTemplate: EmailTemplate = {
      ...template,
      id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      client_id: clientId,
      created_at: new Date().toISOString(),
      status: 'draft',
      metrics: {
        opens: 0,
        clicks: 0,
        conversions: 0
      }
    };
    
    // Add the new template to the templates list and saved templates list
    setTemplates(prevTemplates => [newTemplate, ...prevTemplates]);
    setSavedTemplates(prevTemplates => [newTemplate, ...prevTemplates]);
    
    // Select the new template
    setSelectedTemplate(newTemplate);
    
    // Close the modal
    setShowPreGeneratedModal(false);
    
    // Save the template to localStorage
    saveTemplateToLocalStorage(newTemplate);
    
    // Try to save to Supabase if available
    try {
      supabase
        .from('email_templates')
        .insert([newTemplate])
        .then(({ error }) => {
          if (error) console.error('Error saving template to Supabase:', error);
        });
    } catch (e) {
      console.error('Error accessing Supabase:', e);
    }
  };

  // Handle selecting a template category
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
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
    
    if (!selectedTemplate || !scheduledDate) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await updateEmailTemplateStatus(
        selectedTemplate.id, 
        'scheduled', 
        scheduledDate
      );
      
      // Update the local state
      const updatedTemplate: EmailTemplate = { 
        ...selectedTemplate, 
        status: 'scheduled', 
        scheduled_for: scheduledDate 
      };
      
      setTemplates(prevTemplates => 
        prevTemplates.map(template => 
          template.id === updatedTemplate.id ? updatedTemplate : template
        )
      );
      
      setSelectedTemplate(updatedTemplate);
      setShowScheduleForm(false);
    } catch (err) {
      console.error('Error scheduling template:', err);
      setError('Failed to schedule template. Please try again.');
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

  // Handle editing a template
  const handleEditTemplate = () => {
    if (!selectedTemplate) return;
    
    setEditedTemplate({
      title: selectedTemplate.title,
      subject: selectedTemplate.subject,
      content: selectedTemplate.content
    });
    setIsEditing(true);
  };

  // Handle saving edited template
  const handleSaveEdit = async () => {
    if (!selectedTemplate || !editedTemplate) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedTemplate = await updateEmailTemplate(
        selectedTemplate.id, 
        editedTemplate
      );
      
      // Update the template in the list
      setTemplates(prevTemplates => 
        prevTemplates.map(template => 
          template.id === updatedTemplate.id ? updatedTemplate : template
        )
      );
      
      setSelectedTemplate(updatedTemplate);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating email template:', err);
      setError('Failed to update email template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTemplate({});
  };

  // Handle updating template with AI
  const handleUpdateWithAI = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTemplate || !aiEditPrompt) return;
    
    setIsUpdatingWithAI(true);
    setError(null);
    
    try {
      // For pre-generated templates that haven't been saved yet, save them first
      let templateToUpdate = selectedTemplate;
      
      // Check if this is a pre-generated template that hasn't been saved to Supabase
      const isSavedTemplate = savedTemplates.some(t => t.id === selectedTemplate.id);
      
      if (!isSavedTemplate) {
        // Create a new template based on the selected one
        const newTemplate: EmailTemplate = {
          ...selectedTemplate,
          id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          client_id: clientId,
          created_at: new Date().toISOString(),
          status: 'draft',
          metrics: {
            opens: 0,
            clicks: 0,
            conversions: 0
          }
        };
        
        // Save to Supabase
        try {
          const { data, error } = await supabase
            .from('email_templates')
            .insert([newTemplate])
            .select();
            
          if (error) throw error;
          if (data && data.length > 0) templateToUpdate = data[0];
          else templateToUpdate = newTemplate;
          
          // Update saved templates list
          setSavedTemplates(prev => [templateToUpdate, ...prev]);
        } catch (e) {
          console.error('Error saving template to Supabase:', e);
          templateToUpdate = newTemplate;
        }
      }
      
      // Now update with AI
      const updatedTemplate = await updateTemplateWithAI(
        templateToUpdate.id,
        aiEditPrompt
      );
      
      // Update the template in both lists
      setTemplates(prevTemplates => 
        prevTemplates.map(template => 
          template.id === updatedTemplate.id ? updatedTemplate : template
        )
      );
      
      setSavedTemplates(prevTemplates => 
        prevTemplates.map(template => 
          template.id === updatedTemplate.id ? updatedTemplate : template
        )
      );
      
      setSelectedTemplate(updatedTemplate);
      setShowAIEditForm(false);
      setAIEditPrompt('');
    } catch (error) {
      console.error('Error updating template with AI:', error);
      setError('Failed to update template with AI. Please try again.');
    } finally {
      setIsUpdatingWithAI(false);
    }
  };

  // Function to fix image URLs
  const fixImageUrl = (content: string): string => {
    // Replace relative image URLs with absolute URLs
    return content.replace(/(src=["'])(\/images\/[^"']+)(["'])/g, (match, p1, p2, p3) => {
      return `${p1}https://marketnest.org${p2}${p3}`;
    });
  };

  // Function to handle updating template status
  const handleUpdateStatus = async (templateId: string, status: 'draft' | 'approved' | 'sent' | 'scheduled') => {
    if (!templateId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedTemplate = await updateEmailTemplateStatus(templateId, status);
      
      // Update the templates list
      setTemplates(prevTemplates => 
        prevTemplates.map(template => 
          template.id === updatedTemplate.id ? updatedTemplate : template
        )
      );
      
      // Update selected template if it's the one being updated
      if (selectedTemplate && selectedTemplate.id === updatedTemplate.id) {
        setSelectedTemplate(updatedTemplate);
      }
    } catch (err) {
      console.error('Error updating template status:', err);
      setError('Failed to update template status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Debug function to show pre-generated templates
  const debugPreGeneratedTemplates = () => {
    const templates = getPreGeneratedTemplates(clientId);
    console.log('Debug: Pre-generated templates:', templates);
    alert(`Found ${templates.length} pre-generated templates. Check console for details.`);
    
    // If there are templates, add the first one to the list
    if (templates.length > 0) {
      setTemplates(prevTemplates => [templates[0], ...prevTemplates]);
      setSelectedTemplate(templates[0]);
    }
  };
  
  return (
    <GlobalStyle>
      <Container>
        <PageTitle>
          <TitleIcon><FiMail /></TitleIcon>
          <TitleText>Email Marketing Hub</TitleText>
          <ActionButtons>
            <Button onClick={() => setShowGenerateForm(true)}>
              <FiPlus /> Generate Templates
            </Button>
            <Button onClick={handleLoadPreGeneratedTemplates}>
              <FiRefreshCw /> Pre-made Templates
            </Button>
            <Button onClick={handleGeneratePersonalTouch}>
              <FiMail /> Personal Touch
            </Button>
            <Button onClick={() => setShowCustomForm(true)}>
              <FiPenTool /> Write with AI
            </Button>
            <Button onClick={() => setShowBrandColorsModal(true)}>
              <FiLayout /> Brand Colors
            </Button>
            {process.env.NODE_ENV !== 'production' && (
              <Button onClick={debugPreGeneratedTemplates} style={{ background: '#ff5722' }}>
                <FiRefreshCw /> Debug Templates
              </Button>
            )}
          </ActionButtons>
        </PageTitle>
        
        <Content>
          <Sidebar>
            <SidebarTabs>
              <SidebarTab 
                $active={activeTab === 'saved'} 
                onClick={() => handleTabChange('saved')}
              >
                Saved Emails
              </SidebarTab>
              <SidebarTab 
                $active={activeTab === 'generated'} 
                onClick={() => handleTabChange('generated')}
              >
                Pre-made Templates
              </SidebarTab>
            </SidebarTabs>
            
            <SidebarTitle>
              {activeTab === 'saved' ? 'Saved Email Templates' : 'Pre-made Templates'}
            </SidebarTitle>
            
            <TemplateList>
              {isLoading && templates.length === 0 ? (
                <LoadingMessage>Loading templates...</LoadingMessage>
              ) : error ? (
                <ErrorMessage>{error}</ErrorMessage>
              ) : templates.length === 0 ? (
                <NoTemplates>
                  <p>No {activeTab === 'saved' ? 'saved' : 'pre-made'} templates found</p>
                  {activeTab === 'saved' ? (
                    <button onClick={() => setShowGenerateForm(true)}>
                      <FiPlus /> Generate New Template
                    </button>
                  ) : (
                    <button onClick={handleLoadPreGeneratedTemplates}>
                      <FiRefreshCw /> Load Pre-made Templates
                    </button>
                  )}
                </NoTemplates>
              ) : (
                templates.map(template => (
                  <TemplateItem 
                    key={template.id} 
                    $isActive={selectedTemplate?.id === template.id}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <TemplateInfo>
                      <TemplateTitle>{template.title}</TemplateTitle>
                      <TemplateDate>
                        {new Date(template.created_at).toLocaleDateString()}
                      </TemplateDate>
                    </TemplateInfo>
                    <TemplateStatus>
                      <StatusBadge $status={template.status || 'template'}>
                        {template.status || 'template'}
                      </StatusBadge>
                    </TemplateStatus>
                  </TemplateItem>
                ))
              )}
            </TemplateList>
          </Sidebar>
          
          <MainContent>
            {/* Debug section - only visible during development */}
            {process.env.NODE_ENV !== 'production' && (
              <div style={{ 
                background: '#333', 
                border: '1px solid #ff5722', 
                borderRadius: '4px', 
                padding: '10px', 
                marginBottom: '15px' 
              }}>
                <h4 style={{ color: '#ff5722', marginTop: 0 }}>Debug Information</h4>
                <p><strong>Client ID:</strong> {clientId}</p>
                <p><strong>Templates Count:</strong> {templates.length}</p>
                <p><strong>Selected Template:</strong> {selectedTemplate ? selectedTemplate.title : 'None'}</p>
                <p><strong>Pre-generated Templates Available:</strong> {getPreGeneratedTemplates(clientId).length}</p>
                <div>
                  <h5 style={{ color: '#ff5722' }}>Pre-generated Template Titles:</h5>
                  <ul>
                    {getPreGeneratedTemplates(clientId).map((template, index) => (
                      <li key={index}>{template.title}</li>
                    ))}
                  </ul>
                </div>
                {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error}</p>}
              </div>
            )}
            
            {isLoading && !selectedTemplate ? (
              <LoadingMessage>Loading...</LoadingMessage>
            ) : error && !selectedTemplate ? (
              <ErrorMessage>{error}</ErrorMessage>
            ) : selectedTemplate ? (
              <TemplateDisplay>
                <EmailHeader>
                  <EmailTitle>
                    {isEditing ? (
                      <EditInput 
                        type="text" 
                        value={editedTemplate.title || ''} 
                        onChange={(e) => setEditedTemplate({...editedTemplate, title: e.target.value})}
                      />
                    ) : (
                      selectedTemplate.title
                    )}
                  </EmailTitle>
                  <EmailActions>
                    {isEditing ? (
                      <>
                        <ActionButton onClick={handleSaveEdit}>
                          <FiCheck /> Save
                        </ActionButton>
                        <ActionButton onClick={handleCancelEdit}>
                          <FiX /> Cancel
                        </ActionButton>
                      </>
                    ) : (
                      <>
                        <ActionButton onClick={handleEditTemplate}>
                          <FiEdit /> Edit
                        </ActionButton>
                        <ActionButton onClick={() => setShowAIEditForm(true)}>
                          <FiRefreshCw /> Edit with AI
                        </ActionButton>
                        <ActionButton onClick={() => handleDeleteTemplate(selectedTemplate.id)}>
                          <FiTrash2 /> Delete
                        </ActionButton>
                      </>
                    )}
                  </EmailActions>
                </EmailHeader>
                
                <EmailSubject>
                  <SubjectLabel>Subject:</SubjectLabel>
                  {isEditing ? (
                    <EditInput 
                      type="text" 
                      value={editedTemplate.subject || ''} 
                      onChange={(e) => setEditedTemplate({...editedTemplate, subject: e.target.value})}
                    />
                  ) : (
                    <span>{selectedTemplate.subject}</span>
                  )}
                </EmailSubject>
                
                <EmailContent 
                  dangerouslySetInnerHTML={{ 
                    __html: fixImageUrl(selectedTemplate.content) 
                  }} 
                />
                
                {/* Email Metrics Section */}
                <EmailMetricsContainer>
                  <MetricsTitle>Email Performance</MetricsTitle>
                  <MetricsGrid>
                    <MetricCard>
                      <MetricIcon><FiEye /></MetricIcon>
                      <MetricValue>
                        {selectedTemplate.metrics?.opens || 0}
                      </MetricValue>
                      <MetricLabel>Opens</MetricLabel>
                    </MetricCard>
                    
                    <MetricCard>
                      <MetricIcon><FiMousePointer /></MetricIcon>
                      <MetricValue>
                        {selectedTemplate.metrics?.clicks || 0}
                      </MetricValue>
                      <MetricLabel>Clicks</MetricLabel>
                    </MetricCard>
                    
                    <MetricCard>
                      <MetricIcon><FiShoppingCart /></MetricIcon>
                      <MetricValue>
                        {selectedTemplate.metrics?.conversions || 0}
                      </MetricValue>
                      <MetricLabel>Conversions</MetricLabel>
                    </MetricCard>
                  </MetricsGrid>
                </EmailMetricsContainer>
                
                <EmailActions>
                  <FooterButton onClick={() => handleUpdateStatus(selectedTemplate.id, 'scheduled')}>
                    <FiCalendar /> Schedule
                  </FooterButton>
                  <FooterButton onClick={() => handleUpdateStatus(selectedTemplate.id, 'sent')}>
                    <FiSend /> Send Now
                  </FooterButton>
                </EmailActions>
                
                {/* AI Edit Form */}
                {showAIEditForm && (
                  <Modal onClose={() => setShowAIEditForm(false)}>
                    <ModalContent>
                      <ModalHeader>
                        <h3>Edit Template with AI</h3>
                        <CloseButton onClick={() => setShowAIEditForm(false)}>
                          <FiX />
                        </CloseButton>
                      </ModalHeader>
                      
                      <FormGroup>
                        <FormLabel>What changes would you like to make?</FormLabel>
                        <FormTextarea 
                          value={aiEditPrompt}
                          onChange={(e) => setAIEditPrompt(e.target.value)}
                          placeholder="E.g., Make the tone more friendly, add a section about our new product, etc."
                          rows={4}
                        />
                      </FormGroup>
                      
                      <ModalFooter>
                        <Button 
                          onClick={handleUpdateWithAI}
                          disabled={isUpdatingWithAI || !aiEditPrompt}
                        >
                          {isUpdatingWithAI ? 'Updating...' : 'Update Template'}
                        </Button>
                        <Button onClick={() => setShowAIEditForm(false)}>
                          Cancel
                        </Button>
                      </ModalFooter>
                    </ModalContent>
                  </Modal>
                )}
              </TemplateDisplay>
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
        {/* Pre-generated Templates Modal */}
        {showPreGeneratedModal && (
          <Modal>
            <ModalContent style={{ maxWidth: '900px' }}>
              <ModalHeader>
                <h3>Pre-made Email Templates</h3>
                <CloseButton onClick={() => setShowPreGeneratedModal(false)}>
                  <FiX size={24} />
                </CloseButton>
              </ModalHeader>
              
              <div>
                <p>Choose from our collection of professionally designed email templates. These templates are ready to use and can be customized to match your brand.</p>
                
                <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <CategoryButton 
                    active={selectedCategory === ''}
                    onClick={() => handleSelectCategory('')}
                  >
                    All Templates
                  </CategoryButton>
                  {templateCategories.map(category => (
                    <CategoryButton 
                      key={category.id}
                      active={selectedCategory === category.id}
                      onClick={() => handleSelectCategory(category.id)}
                    >
                      {category.name}
                    </CategoryButton>
                  ))}
                </div>
                
                <TemplateGrid>
                  {getPreGeneratedTemplates(clientId)
                    .filter(template => selectedCategory === '' || template.tags.includes(selectedCategory))
                    .map(template => (
                      <TemplateCard key={template.id} onClick={() => handleSelectPreGeneratedTemplate(template)}>
                        <TemplateCardTitle>{template.title}</TemplateCardTitle>
                        <TemplateCardSubject>{template.subject}</TemplateCardSubject>
                        <TemplateCardPreview dangerouslySetInnerHTML={{ __html: template.content.substring(0, 150) + '...' }} />
                        <TemplateCardFooter>
                          <TemplateCardTags>
                            {template.tags.slice(0, 3).map(tag => (
                              <TemplateCardTag key={tag}>{tag}</TemplateCardTag>
                            ))}
                          </TemplateCardTags>
                          <TemplateCardButton>Use Template</TemplateCardButton>
                        </TemplateCardFooter>
                      </TemplateCard>
                    ))
                  }
                </TemplateGrid>
              </div>
            </ModalContent>
          </Modal>
        )}
        
        {/* Brand Colors Modal */}
        {showBrandColorsModal && (
          <Modal>
            <ModalContent>
              <ModalHeader>
                <h3>Brand Colors</h3>
                <CloseButton onClick={() => setShowBrandColorsModal(false)}>
                  <FiX size={24} />
                </CloseButton>
              </ModalHeader>
              
              <div>
                <p>Customize the colors used in your email templates. These colors will be applied to headers, buttons, and other elements in your emails.</p>
                
                <FormGroup>
                  <FormLabel>Primary Color (Headers)</FormLabel>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      type="color" 
                      name="primaryColor" 
                      value={brandColors.primary} 
                      onChange={handleBrandColorChange} 
                      style={{ width: '50px', height: '40px', border: 'none' }}
                    />
                    <EditInput 
                      type="text" 
                      name="primaryColor" 
                      value={brandColors.primary} 
                      onChange={handleBrandColorChange} 
                      style={{ flexGrow: 1 }}
                    />
                  </div>
                </FormGroup>
                
                <FormGroup>
                  <FormLabel>Secondary Color (Accents)</FormLabel>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      type="color" 
                      name="secondaryColor" 
                      value={brandColors.secondary} 
                      onChange={handleBrandColorChange} 
                      style={{ width: '50px', height: '40px', border: 'none' }}
                    />
                    <EditInput 
                      type="text" 
                      name="secondaryColor" 
                      value={brandColors.secondary} 
                      onChange={handleBrandColorChange} 
                      style={{ flexGrow: 1 }}
                    />
                  </div>
                </FormGroup>
                
                <FormGroup>
                  <FormLabel>Accent Color (Highlights)</FormLabel>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      type="color" 
                      name="accentColor" 
                      value={brandColors.accent} 
                      onChange={handleBrandColorChange} 
                      style={{ width: '50px', height: '40px', border: 'none' }}
                    />
                    <EditInput 
                      type="text" 
                      name="accentColor" 
                      value={brandColors.accent} 
                      onChange={handleBrandColorChange} 
                      style={{ flexGrow: 1 }}
                    />
                  </div>
                </FormGroup>
                
                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Preview</h4>
                  <div style={{ 
                    padding: '15px', 
                    background: '#fff', 
                    borderRadius: '4px',
                    color: '#333'
                  }}>
                    <h3 style={{ color: brandColors.primary, margin: '0 0 10px 0' }}>Sample Header</h3>
                    <p>This is how your email content will look with the selected colors.</p>
                    <div style={{ 
                      background: brandColors.secondary, 
                      color: '#fff', 
                      padding: '8px 12px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      marginTop: '10px'
                    }}>
                      Button Example
                    </div>
                    <p style={{ marginTop: '15px' }}>
                      <span style={{ color: brandColors.accent, fontWeight: 'bold' }}>Highlighted text</span> will use your accent color.
                    </p>
                  </div>
                </div>
              </div>
              
              <ModalFooter>
                <Button onClick={() => setShowBrandColorsModal(false)}>Close</Button>
                <Button primary onClick={() => setShowBrandColorsModal(false)}>Apply Colors</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
        
        {/* Add EmailDebugger for troubleshooting */}
        <EmailDebugger clientId={clientId} />
        
        {/* Edit template modal */}
        {isEditing && selectedTemplate && (
          <Modal>
            <ModalContent>
              <ModalHeader>
                <h3>Edit Email Template</h3>
                <CloseButton onClick={handleCancelEdit}>
                  <FiX size={24} />
                </CloseButton>
              </ModalHeader>
              
              <FormGroup>
                <FormLabel>Title</FormLabel>
                <EditInput
                  type="text"
                  value={editedTemplate.title || ''}
                  onChange={(e) => setEditedTemplate({...editedTemplate, title: e.target.value})}
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel>Subject</FormLabel>
                <EditInput
                  type="text"
                  value={editedTemplate.subject || ''}
                  onChange={(e) => setEditedTemplate({...editedTemplate, subject: e.target.value})}
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel>Content (HTML)</FormLabel>
                <FormTextarea
                  value={editedTemplate.content || ''}
                  onChange={(e) => setEditedTemplate({...editedTemplate, content: e.target.value})}
                />
              </FormGroup>
              
              <ModalFooter>
                <Button onClick={handleCancelEdit}>Cancel</Button>
                <Button primary onClick={handleSaveEdit}>Save Changes</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
        
        {/* AI Edit modal */}
        {showAIEditForm && selectedTemplate && (
          <Modal>
            <ModalContent>
              <ModalHeader>
                <h3>Edit with AI</h3>
                <CloseButton onClick={() => setShowAIEditForm(false)}>
                  <FiX size={24} />
                </CloseButton>
              </ModalHeader>
              
              <form onSubmit={handleUpdateWithAI}>
                <FormGroup>
                  <FormLabel>What changes would you like to make?</FormLabel>
                  <FormTextarea
                    value={aiEditPrompt}
                    onChange={(e) => setAIEditPrompt(e.target.value)}
                    placeholder="E.g., Make the tone more casual, add more information about the French Vanilla product, include a special discount code COFFEE20 for 20% off"
                  />
                </FormGroup>
                
                <ModalFooter>
                  <Button type="button" onClick={() => setShowAIEditForm(false)}>Cancel</Button>
                  <Button primary type="submit" disabled={isUpdatingWithAI}>
                    {isUpdatingWithAI ? 'Updating...' : 'Update Template'}
                  </Button>
                </ModalFooter>
              </form>
            </ModalContent>
          </Modal>
        )}
        
        {/* Generate Templates Modal */}
        {showGenerateForm && (
          <Modal>
            <ModalContent>
              <ModalHeader>
                <h3>Generate Email Templates</h3>
                <CloseButton onClick={() => setShowGenerateForm(false)}>
                  <FiX size={24} />
                </CloseButton>
              </ModalHeader>
              
              <form onSubmit={handleGenerateTemplates}>
                <FormGroup>
                  <FormLabel>Purpose</FormLabel>
                  <select 
                    value={generationOptions.purpose}
                    onChange={(e) => setGenerationOptions({
                      ...generationOptions, 
                      purpose: e.target.value as 'promotional' | 'newsletter' | 'announcement' | 'seasonal'
                    })}
                  >
                    <option value="promotional">Promotional</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="announcement">Announcement</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                </FormGroup>
                
                <FormGroup>
                  <FormLabel>Tone</FormLabel>
                  <select 
                    value={generationOptions.tone}
                    onChange={(e) => setGenerationOptions({
                      ...generationOptions, 
                      tone: e.target.value as 'casual' | 'professional' | 'enthusiastic' | 'informative'
                    })}
                  >
                    <option value="casual">Casual</option>
                    <option value="professional">Professional</option>
                    <option value="enthusiastic">Enthusiastic</option>
                    <option value="informative">Informative</option>
                  </select>
                </FormGroup>
                
                <FormGroup>
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      checked={generationOptions.includePromotion || false}
                      onChange={(e) => setGenerationOptions({
                        ...generationOptions, 
                        includePromotion: e.target.checked
                      })}
                    />
                    Include Promotion
                  </CheckboxLabel>
                  
                  {generationOptions.includePromotion && (
                    <FormTextarea
                      value={generationOptions.promotionDetails || ''}
                      onChange={(e) => setGenerationOptions({
                        ...generationOptions, 
                        promotionDetails: e.target.value
                      })}
                      placeholder="Describe the promotion (e.g., 20% off all coffee beans this weekend)"
                    />
                  )}
                </FormGroup>
                
                <FormGroup>
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      checked={generationOptions.includeProductHighlight || false}
                      onChange={(e) => setGenerationOptions({
                        ...generationOptions, 
                        includeProductHighlight: e.target.checked
                      })}
                    />
                    Highlight Products
                  </CheckboxLabel>
                  
                  {generationOptions.includeProductHighlight && (
                    <FormTextarea
                      value={generationOptions.productDetails || ''}
                      onChange={(e) => setGenerationOptions({
                        ...generationOptions, 
                        productDetails: e.target.value
                      })}
                      placeholder="Describe the products to highlight (e.g., our new French Vanilla blend)"
                    />
                  )}
                </FormGroup>
                
                <FormGroup>
                  <FormLabel>Additional Instructions (Optional)</FormLabel>
                  <FormTextarea
                    value={generationOptions.additionalInstructions || ''}
                    onChange={(e) => setGenerationOptions({
                      ...generationOptions, 
                      additionalInstructions: e.target.value
                    })}
                    placeholder="Any additional instructions for the AI (e.g., mention our upcoming event, focus on sustainability)"
                  />
                </FormGroup>
                
                <ModalFooter>
                  <Button type="button" onClick={() => setShowGenerateForm(false)}>Cancel</Button>
                  <Button primary type="submit" disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Templates'}
                  </Button>
                </ModalFooter>
              </form>
            </ModalContent>
          </Modal>
        )}
        
        {/* Custom Email Form */}
        {showCustomForm && (
          <Modal>
            <ModalContent>
              <ModalHeader>
                <h3>Write Email with AI</h3>
                <CloseButton onClick={() => setShowCustomForm(false)}>
                  <FiX size={24} />
                </CloseButton>
              </ModalHeader>
              
              <form onSubmit={handleGenerateCustomTemplate}>
                <FormGroup>
                  <FormLabel>Purpose</FormLabel>
                  <select 
                    value={generationOptions.purpose}
                    onChange={(e) => setGenerationOptions({
                      ...generationOptions, 
                      purpose: e.target.value as 'promotional' | 'newsletter' | 'announcement' | 'seasonal'
                    })}
                  >
                    <option value="promotional">Promotional</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="announcement">Announcement</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                </FormGroup>
                
                <FormGroup>
                  <FormLabel>Tone</FormLabel>
                  <select 
                    value={generationOptions.tone}
                    onChange={(e) => setGenerationOptions({
                      ...generationOptions, 
                      tone: e.target.value as 'casual' | 'professional' | 'enthusiastic' | 'informative'
                    })}
                  >
                    <option value="casual">Casual</option>
                    <option value="professional">Professional</option>
                    <option value="enthusiastic">Enthusiastic</option>
                    <option value="informative">Informative</option>
                  </select>
                </FormGroup>
                
                <FormGroup>
                  <FormLabel>Your Content</FormLabel>
                  <FormTextarea
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    placeholder="Write your content here, and the AI will enhance and format it into a professional email"
                    rows={6}
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel>Additional Instructions (Optional)</FormLabel>
                  <FormTextarea
                    value={generationOptions.additionalInstructions || ''}
                    onChange={(e) => setGenerationOptions({
                      ...generationOptions, 
                      additionalInstructions: e.target.value
                    })}
                    placeholder="Any additional instructions for the AI (e.g., mention our upcoming event, focus on sustainability)"
                  />
                </FormGroup>
                
                <ModalFooter>
                  <Button type="button" onClick={() => setShowCustomForm(false)}>Cancel</Button>
                  <Button primary type="submit" disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Email'}
                  </Button>
                </ModalFooter>
              </form>
            </ModalContent>
          </Modal>
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
  padding-top: 40px;
`;

const PageTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: ${LIBERTY_BEANS_COLORS.primary};
  border-bottom: 1px solid #333;
  position: relative;
  z-index: 20; /* Increased z-index to ensure it's above the site header */
  margin-bottom: 20px;
  border-radius: 8px;
  margin: 0 20px 20px 20px;
`;

const TitleIcon = styled.div`
  font-size: 20px;
  margin-right: 8px;
`;

const TitleText = styled.h1`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  position: relative;
  z-index: 30; /* Higher z-index than PageTitle to ensure buttons are clickable */
`;

const Button = styled.button<{ primary?: boolean }>`
  background-color: ${props => props.primary ? LIBERTY_BEANS_COLORS.primary : '#333'};
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.primary ? '#0a1b2f' : '#444'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    margin-right: 8px;
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  min-height: calc(100vh - 60px);
  overflow-y: auto;
`;

const Sidebar = styled.div`
  width: 300px;
  border-right: 1px solid #333;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 60px);
  flex-shrink: 0;
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
  overflow-y: auto;
  max-height: calc(100vh - 110px);
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
  pointer-events: none;
`;

const TemplateTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TemplateDate = styled.div`
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TemplateStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: none;
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
  padding: 24px 24px 60px;
  overflow-y: auto;
  position: relative;
  max-height: calc(100vh - 60px);
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
  padding: 40px;
  color: #999;
  font-size: 16px;
`;

const TemplateDisplay = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-top: 24px;
  max-width: 800px;
  overflow-y: auto;
  max-height: 600px;
`;

const EmailHeader = styled.div`
  margin-bottom: 24px;
`;

const EmailTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 8px;
`;

const EmailSubject = styled.div`
  font-size: 16px;
  color: #666;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  
  strong {
    margin-right: 8px;
  }
`;

const EmailContent = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  
  img {
    max-width: 100%;
    height: auto;
    margin: 16px 0;
  }
`;

const EmailActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
`;

const FooterButton = styled.button`
  background-color: #333;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #444;
  }

  svg {
    margin-right: 8px;
  }
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

const ErrorMessage = styled.div`
  color: #ff3b30;
  font-size: 14px;
  margin-top: 8px;
`;

const SubjectLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
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

const EditInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  background: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: ${LIBERTY_BEANS_COLORS.secondary};
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #333;
  color: #ffffff;
  padding: 24px;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const CloseButton = styled.button`
  background-color: transparent;
  color: #999;
  border: none;
  padding: 4px;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #fff;
  }
`;

const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
`;

const FormTextarea = styled.textarea`
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

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
`;

// Template grid and card components
const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const TemplateCard = styled.div`
  border: 1px solid #444;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #333;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    border-color: ${LIBERTY_BEANS_COLORS.secondary};
  }
`;

const TemplateCardTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
`;

const TemplateCardSubject = styled.div`
  font-size: 14px;
  color: #aaa;
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TemplateCardPreview = styled.div`
  font-size: 13px;
  color: #bbb;
  margin-bottom: 15px;
  max-height: 80px;
  overflow: hidden;
  line-height: 1.4;
`;

const TemplateCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const TemplateCardTags = styled.div`
  display: flex;
  gap: 5px;
`;

const TemplateCardTag = styled.span`
  background: #444;
  color: #ddd;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
`;

const TemplateCardButton = styled.button`
  background: ${LIBERTY_BEANS_COLORS.primary};
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: ${LIBERTY_BEANS_COLORS.secondary};
  }
`;

const CategoryButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? LIBERTY_BEANS_COLORS.primary : 'transparent'};
  color: ${props => props.active ? 'white' : '#aaa'};
  border: ${props => props.active ? 'none' : '1px solid #444'};
  padding: 8px 15px;
  border-radius: 4px;
  margin-right: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  
  &:hover {
    background: ${props => props.active ? LIBERTY_BEANS_COLORS.secondary : '#444'};
  }
`;

// Additional styled components for metrics display
const EmailMetricsContainer = styled.div`
  margin-top: 30px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const MetricsTitle = styled.h4`
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #fff;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.08);
  }
`;

const MetricIcon = styled.div`
  font-size: 24px;
  color: ${LIBERTY_BEANS_COLORS.secondary};
  margin-bottom: 10px;
`;

const MetricValue = styled.div`
  font-size: 28px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 5px;
`;

const MetricLabel = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
`;

// Additional styled components for tabs
const SidebarTabs = styled.div`
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SidebarTab = styled.div<{ $active: boolean }>`
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '400'};
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.6)'};
  border-bottom: 2px solid ${props => props.$active ? LIBERTY_BEANS_COLORS.secondary : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.05);
  }
`;

export default EmailMarketingPage;
