import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Typography, 
  Button, 
  Paper, 
  Container, 
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { supabase } from '../../lib/supabase';
import LandingPageForm from './components/LandingPageForm';
import LandingPageAiIntegration from './components/LandingPageAiIntegration';
import LandingPagePreview from './components/LandingPagePreview';
import LandingPageImageGenerator from './components/LandingPageImageGenerator';
import SavedLandingPages from './components/SavedLandingPages';

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
    try {
      // Call your AI service here with the prompt
      // This is a placeholder for the actual API call
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: promptEngineeredContent,
          formData
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate content');
      }
      
      const data = await response.json();
      setGeneratedContent(data.content);
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
    try {
      // Making a request to the Google Imagen API (this is a placeholder)
      // You'll need to implement the actual API call based on your authentication setup
      const imageResults = await Promise.all(
        imagePrompts.map(async (prompt) => {
          const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              prompt,
              model: 'imagen-3.0-generate-002',
              sampleCount: 1
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to generate image');
          }
          
          const data = await response.json();
          return data.imageUrl;
        })
      );
      
      setGeneratedImages(imageResults);
      setSelectedImages(imageResults.slice(0, 2)); // Default select first 2 images
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
    const html = generateLandingPageHTML();
    
    // Create a Blob with the HTML content
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.campaignName.replace(/\s+/g, '-').toLowerCase()}-landing-page.html`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateLandingPageHTML = () => {
    // This is a simplified version - you would likely want a more sophisticated template
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="${generatedContent.metaDescription}">
        <title>${formData.businessName} - ${generatedContent.headline}</title>
        <style>
          /* Basic styling - you would want to enhance this */
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          header {
            background-color: #f5f5f5;
            padding: 2rem 0;
            text-align: center;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
          }
          .hero {
            background-size: cover;
            background-position: center;
            padding: 4rem 0;
            color: #fff;
            text-align: center;
            background-image: url(${selectedImages[0] || ''});
          }
          .content {
            padding: 3rem 0;
          }
          .cta {
            background-color: #f9f9f9;
            padding: 3rem 0;
            text-align: center;
          }
          .cta-button {
            display: inline-block;
            padding: 0.8rem 1.5rem;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 1rem;
          }
          .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            padding: 3rem 0;
          }
          .feature {
            text-align: center;
            padding: 1.5rem;
          }
          footer {
            background-color: #333;
            color: white;
            text-align: center;
            padding: 2rem 0;
          }
        </style>
      </head>
      <body>
        <header>
          <div class="container">
            <h1>${formData.businessName}</h1>
          </div>
        </header>
        
        <section class="hero">
          <div class="container">
            <h2>${generatedContent.headline}</h2>
            <p>${generatedContent.subheadline}</p>
          </div>
        </section>
        
        <section class="content">
          <div class="container">
            ${generatedContent.bodyContent}
            
            <div class="features">
              ${formData.keyFeatures.map((feature: string) => `
                <div class="feature">
                  <h3>${feature}</h3>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
        
        <section class="cta">
          <div class="container">
            <h2>${formData.callToAction}</h2>
            <a href="#" class="cta-button">${generatedContent.ctaText}</a>
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
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <LandingPageForm formData={formData} onChange={handleFormChange} />;
      case 1:
        return (
          <LandingPageAiIntegration 
            formData={formData} 
            onGenerate={handleGenerateContent} 
            generatedContent={generatedContent}
            setGeneratedContent={setGeneratedContent}
          />
        );
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

  return (
    <Container maxWidth="lg" sx={{ mb: 8 }}>
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Landing Page Generator
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Create high-converting landing pages using AI assistance
        </Typography>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          display: 'flex',
          flexDirection: {xs: 'column', md: 'row'},
          gap: 4
        }}
      >
        <Box sx={{ width: {xs: '100%', md: '70%'} }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {renderStepContent(activeStep)}
              
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                {activeStep < steps.length - 1 && (
                  <Button 
                    variant="contained" 
                    onClick={handleNext}
                    disabled={activeStep === 1 && Object.values(generatedContent).some(val => !val)}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: {xs: 'none', md: 'block'} }} />
        <Divider sx={{ display: {xs: 'block', md: 'none'} }} />

        <Box sx={{ width: {xs: '100%', md: '30%'} }}>
          <SavedLandingPages savedPages={savedPages} />
        </Box>
      </Paper>
    </Container>
  );
};

export default LandingPageGenerator;
