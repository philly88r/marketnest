import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiChevronRight, FiChevronLeft, FiSave, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { supabase } from '../utils/supabaseClient';
import LandingPageForm from './landing-page/LandingPageForm';
import LandingPageAiIntegration from './landing-page/LandingPageAiIntegration';
import LandingPagePreview from './landing-page/LandingPagePreview';
import LandingPageImageGenerator from './landing-page/LandingPageImageGenerator';
import SavedLandingPages from './landing-page/SavedLandingPages';
import { generateLandingPageContent } from '../utils/geminiService';
import { generateImages } from '../utils/imagenService';

const steps = [
  'Campaign Information',
  'AI Content Generation',
  'Image Selection',
  'Preview & Export'
];

const LandingPageGenerator: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    campaignName: '',
    businessName: '',
    industry: '',
    campaignGoal: '',
    targetAudience: '',
    callToAction: '',
    keyFeatures: [],
    isEcommerce: false,
    products: [],
    colorScheme: '',
    tone: '',
    additionalNotes: ''
  });
  const [generatedContent, setGeneratedContent] = useState({
    headline: '',
    subheadline: '',
    bodyContent: '',
    ctaText: '',
    metaDescription: ''
  });
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedPages, setSavedPages] = useState<any[]>([]);
  const [clientId, setClientId] = useState('');
  
  // Fetch saved landing pages on component mount
  useEffect(() => {
    fetchSavedPages();
  }, []);

  const fetchSavedPages = async () => {
    try {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setSavedPages(data);
      }
    } catch (err) {
      console.error('Error fetching saved landing pages:', err);
      setError('Failed to fetch saved landing pages');
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateFormData()) {
      setError('Please fill out all required fields');
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const validateFormData = () => {
    const requiredFields = ['campaignName', 'businessName', 'campaignGoal', 'targetAudience', 'callToAction'];
    return requiredFields.every(field => formData[field as keyof typeof formData]);
  };

  const handleFormChange = (data: any) => {
    setFormData(data);
  };

  const handleGenerateContent = async (promptEngineeredContent: string) => {
    setIsLoading(true);
    setError('');
    try {
      const content = await generateLandingPageContent(promptEngineeredContent);
      setGeneratedContent(content);
      handleNext();
    } catch (err) {
      console.error('Error generating content:', err);
      setError('Failed to generate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImages = async (imagePrompts: string[]) => {
    setIsLoading(true);
    setError('');
    try {
      const imageUrls = await generateImages(imagePrompts);
      setGeneratedImages(imageUrls);
      setSelectedImages(imageUrls.slice(0, 2)); // Default select first 2 images
    } catch (err) {
      console.error('Error generating images:', err);
      setError('Failed to generate images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLandingPage = async () => {
    try {
      const landingPageData = {
        name: formData.campaignName,
        business_name: formData.businessName,
        content: generatedContent,
        images: selectedImages,
        form_data: formData,
        created_at: new Date()
      };
      
      const { data, error } = await supabase
        .from('landing_pages')
        .insert([landingPageData])
        .select();
        
      if (error) throw error;
      
      alert('Landing page saved successfully!');
      fetchSavedPages();
    } catch (err) {
      console.error('Error saving landing page:', err);
      setError('Failed to save landing page');
    }
  };

  const handleExportHTML = () => {
    // Generate HTML code for the landing page
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${generatedContent.metaDescription}">
  <title>${formData.businessName} - ${generatedContent.headline}</title>
  <style>
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    /* Header */
    header {
      background-color: #fff;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 20px 0;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
    }
    /* Hero section */
    .hero {
      padding: 80px 0;
      background-color: #f9f9f9;
      text-align: center;
    }
    .hero h1 {
      font-size: 48px;
      margin-bottom: 20px;
      color: #222;
    }
    .hero h2 {
      font-size: 24px;
      margin-bottom: 40px;
      color: #555;
      font-weight: normal;
    }
    .hero-image {
      max-width: 100%;
      height: auto;
      margin: 40px 0;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    /* Content section */
    .content {
      padding: 80px 0;
    }
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      align-items: center;
    }
    .content-image {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    /* CTA section */
    .cta {
      padding: 80px 0;
      background-color: #f0f0f0;
      text-align: center;
    }
    .button {
      display: inline-block;
      padding: 15px 30px;
      background-color: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 18px;
      margin-top: 20px;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #45a049;
    }
    /* Footer */
    footer {
      background-color: #333;
      color: white;
      padding: 40px 0;
      text-align: center;
    }
    /* Responsive */
    @media (max-width: 768px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
      .hero h1 {
        font-size: 36px;
      }
      .hero h2 {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="logo">${formData.businessName}</div>
    </div>
  </header>

  <section class="hero">
    <div class="container">
      <h1>${generatedContent.headline}</h1>
      <h2>${generatedContent.subheadline}</h2>
      ${selectedImages.length > 0 ? `<img src="${selectedImages[0]}" alt="${formData.businessName}" class="hero-image">` : ''}
    </div>
  </section>

  <section class="content">
    <div class="container">
      <div class="content-grid">
        <div>
          ${generatedContent.bodyContent.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
        </div>
        ${selectedImages.length > 1 ? `<img src="${selectedImages[1]}" alt="${formData.businessName} product" class="content-image">` : ''}
      </div>
    </div>
  </section>

  <section class="cta">
    <div class="container">
      <h2>Ready to get started?</h2>
      <a href="#" class="button">${generatedContent.ctaText}</a>
    </div>
  </section>

  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${formData.businessName}. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>
    `;
    
    // Create a blob and download link
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.campaignName.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <LandingPageForm formData={formData} onChange={handleFormChange} />;
      case 1:
        return <LandingPageAiIntegration 
          formData={formData} 
          onGenerate={handleGenerateContent} 
          generatedContent={generatedContent}
          setGeneratedContent={setGeneratedContent}
        />;
      case 2:
        return (
          <LandingPageImageGenerator 
            formData={formData}
            generatedContent={generatedContent}
            onGenerateImages={handleGenerateImages}
            generatedImages={generatedImages}
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
          />
        );
      case 3:
        return (
          <LandingPagePreview 
            formData={formData}
            generatedContent={generatedContent}
            selectedImages={selectedImages}
            onSave={handleSaveLandingPage}
            onExport={handleExportHTML}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  const handleEditLandingPage = (id: string) => {
    // Implement logic to edit a landing page
  };

  return (
    <Container>
      <PageTitle>Landing Page Generator</PageTitle>
      
      <FlexContainer>
        <MainContent>
          <Paper>
            <StepperContainer>
              <StyledStepper activeStep={activeStep}>
                {steps.map((label) => (
                  <StyledStep key={label}>
                    <StyledStepLabel>{label}</StyledStepLabel>
                  </StyledStep>
                ))}
              </StyledStepper>
            </StepperContainer>
            
            {error && <ErrorAlert>{error}</ErrorAlert>}
            
            <ContentContainer>
              {isLoading ? (
                <LoadingContainer>
                  <Spinner />
                  <LoadingText>Processing...</LoadingText>
                </LoadingContainer>
              ) : (
                getStepContent(activeStep)
              )}
            </ContentContainer>
            
            <ButtonContainer>
              <Button 
                disabled={activeStep === 0} 
                onClick={handleBack}
              >
                <FiChevronLeft /> Back
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <>
                  <Button onClick={handleSaveLandingPage}>
                    <FiSave /> Save
                  </Button>
                  <Button onClick={handleExportHTML}>
                    <FiDownload /> Export HTML
                  </Button>
                </>
              ) : (
                <Button onClick={handleNext}>
                  Next <FiChevronRight />
                </Button>
              )}
            </ButtonContainer>
          </Paper>
        </MainContent>
        
        <Divider />
        
        <Sidebar>
          <SavedLandingPages clientId={clientId} onEdit={handleEditLandingPage} />
        </Sidebar>
      </FlexContainer>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  margin-bottom: 30px;
  color: #333;
`;

const FlexContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const MainContent = styled.div`
  flex: 1;
`;

const Sidebar = styled.div`
  width: 300px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Paper = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const StepperContainer = styled.div`
  padding: 20px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
`;

const StepperBase = styled.div`
  display: flex;
  justify-content: space-between;
`;

interface StepperProps {
  activeStep: number;
  children?: React.ReactNode;
}

const StyledStepper: React.FC<StepperProps> = ({ activeStep, children }) => {
  return <StepperBase data-active-step={activeStep}>{children}</StepperBase>;
};

const StyledStep = styled.div`
  flex: 1;
  text-align: center;
`;

const StyledStepLabel = styled.div`
  font-size: 14px;
  color: #666;
`;

const ContentContainer = styled.div`
  padding: 30px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px 30px;
  border-top: 1px solid #eee;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #3367d6;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  width: 1px;
  background-color: #eee;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 1px;
    margin: 20px 0;
  }
`;

const ErrorAlert = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px 20px;
  border-radius: 4px;
  margin: 20px 30px 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
`;

const Spinner = styled(FiRefreshCw)`
  animation: spin 2s linear infinite;
  font-size: 40px;
  color: #4285f4;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  margin-top: 16px;
  font-size: 16px;
  color: #666;
`;

export default LandingPageGenerator;
