import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSave, FiCode, FiDownload, FiCopy, FiEye } from 'react-icons/fi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`preview-tabpanel-${index}`}
      aria-labelledby={`preview-tab-${index}`}
      {...other}
    >
      {value === index && (
        <TabPanelContent>
          {children}
        </TabPanelContent>
      )}
    </div>
  );
}

interface LandingPagePreviewProps {
  formData: any;
  generatedContent: {
    headline: string;
    subheadline: string;
    bodyContent: string;
    ctaText: string;
    metaDescription: string;
  };
  selectedImages: string[];
  onSave: (landingPageData: any) => Promise<void>;
  onExport: () => void;
}

// Styled Components
const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
`;

const TabsContainer = styled.div`
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
`;

const TabList = styled.div`
  display: flex;
  gap: 10px;
`;

const TabButton = styled.button<{ active?: boolean }>`
  padding: 10px 15px;
  background: ${props => props.active ? '#4a90e2' : 'transparent'};
  color: ${props => props.active ? 'white' : '#333'};
  border: none;
  border-bottom: ${props => props.active ? '2px solid #4a90e2' : 'none'};
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: ${props => props.active ? '#4a90e2' : '#f5f5f5'};
  }
`;

const TabPanelContent = styled.div`
  padding: 20px 0;
`;

const PreviewContainer = styled.div`
  max-width: 100%;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const PreviewHeader = styled.div`
  background-color: #f8f9fa;
  padding: 20px;
  border-bottom: 1px solid #eee;
`;

const PreviewContent = styled.div`
  padding: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const Button = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${props => props.primary ? '#4a90e2' : '#f5f5f5'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: ${props => props.primary ? '#2979ff' : '#e0e0e0'};
  }
`;

const CodeBlock = styled.pre`
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow: auto;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 20px;
`;

const Card = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
`;

const CardContent = styled.div`
  padding: 15px;
`;

const Alert = styled.div<{ type?: 'success' | 'error' | 'info' }>`
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  background-color: ${props => {
    switch(props.type) {
      case 'success': return '#e8f5e9';
      case 'error': return '#ffebee';
      default: return '#e3f2fd';
    }
  }};
  color: ${props => {
    switch(props.type) {
      case 'success': return '#2e7d32';
      case 'error': return '#c62828';
      default: return '#1565c0';
    }
  }};
`;

const LandingPagePreview: React.FC<LandingPagePreviewProps> = ({
  formData,
  generatedContent,
  selectedImages,
  onSave,
  onExport
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      setSnackbarMessage('Landing page saved successfully!');
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage('Failed to save landing page');
      setSnackbarSeverity('error');
    } finally {
      setIsSaving(false);
      setOpenSnackbar(true);
    }
  };

  const handleExport = () => {
    onExport();
    setSnackbarMessage('HTML code exported successfully!');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  const handleCopyHtml = () => {
    const htmlCode = generateLandingPageHTML();
    navigator.clipboard.writeText(htmlCode);
    setSnackbarMessage('HTML code copied to clipboard!');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const generateLandingPageHTML = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${generatedContent.metaDescription}">
  <title>${formData.businessName} - ${generatedContent.headline}</title>
  <style>
    /* Basic styling */
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
      position: relative;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1;
    }
    .hero-content {
      position: relative;
      z-index: 2;
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
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    .product-card {
      border: 1px solid #eee;
      border-radius: 5px;
      overflow: hidden;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    .product-image {
      height: 200px;
      background-size: cover;
      background-position: center;
    }
    .product-details {
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
    <div class="container hero-content">
      <h2>${generatedContent.headline}</h2>
      <p>${generatedContent.subheadline}</p>
    </div>
  </section>
  
  <section class="content">
    <div class="container">
      <div dangerouslySetInnerHTML={{ __html: generatedContent.bodyContent }} />
      
      <div class="features">
        ${formData.keyFeatures.map((feature: string) => `
          <div class="feature">
            <h3>${feature}</h3>
          </div>
        `).join('')}
      </div>
      
      ${formData.isEcommerce && formData.products.length > 0 ? `
      <div class="product-section">
        <h2>Our Products</h2>
        <div class="product-grid">
          ${formData.products.map((product: any) => `
            <div class="product-card">
              <div class="product-image" style="background-image: url(${selectedImages[1] || selectedImages[0] || ''})"></div>
              <div class="product-details">
                <h3>${product.name}</h3>
                <p>$${product.price}</p>
                ${product.description ? `<p>${product.description}</p>` : ''}
                <button class="cta-button">${generatedContent.ctaText}</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
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

  return (
    <Container>
      <Title>Preview & Export</Title>
      
      <ButtonGroup>
        <Button primary onClick={handleSave} disabled={isSaving}>
          <FiSave />
          {isSaving ? 'Saving...' : 'Save to Library'}
        </Button>
        <Button onClick={handleExport}>
          <FiDownload />
          Export HTML
        </Button>
      </ButtonGroup>
      
      <TabsContainer>
        <TabList>
          <TabButton active={tabValue === 0} onClick={() => setTabValue(0)}>
            <FiEye />
            Preview
          </TabButton>
          <TabButton active={tabValue === 1} onClick={() => setTabValue(1)}>
            <FiCode />
            HTML Code
          </TabButton>
        </TabList>
      </TabsContainer>
      
      <TabPanel value={tabValue} index={0}>
        <PreviewContainer>
          <PreviewHeader>
            <h2>Preview</h2>
          </PreviewHeader>
          <PreviewContent>
            <iframe 
              srcDoc={generateLandingPageHTML()}
              title="Landing Page Preview"
              frameBorder="0"
              width="100%"
              height="600"
            />
          </PreviewContent>
        </PreviewContainer>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <CodeBlock>
          {generateLandingPageHTML()}
        </CodeBlock>
        <Button onClick={handleCopyHtml}>
          <FiCopy />
          Copy HTML
        </Button>
      </TabPanel>

      <Alert type={snackbarSeverity} style={{ display: openSnackbar ? 'block' : 'none' }}>
        {snackbarMessage}
      </Alert>
    </Container>
  );
};

export default LandingPagePreview;