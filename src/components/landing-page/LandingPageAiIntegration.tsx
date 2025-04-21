import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiEdit, FiRefreshCw, FiZap } from 'react-icons/fi';

interface LandingPageAiIntegrationProps {
  formData: any;
  onGenerate: (promptEngineeredContent: string) => Promise<void>;
  generatedContent: {
    headline: string;
    subheadline: string;
    bodyContent: string;
    ctaText: string;
    metaDescription: string;
  };
  setGeneratedContent: React.Dispatch<React.SetStateAction<{
    headline: string;
    subheadline: string;
    bodyContent: string;
    ctaText: string;
    metaDescription: string;
  }>>;
}

const Container = styled.div`
  margin-bottom: 20px;
`;

const Typography = styled.h1`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Paper = styled.div`
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

interface TextFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}

const TextField = styled.textarea<TextFieldProps>`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  min-height: ${props => props.rows ? `${props.rows * 24}px` : '120px'};
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

const Button = styled.button<ButtonProps>`
  background-color: ${props => props.disabled ? '#cccccc' : '#4CAF50'};
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: ${props => props.disabled ? '#cccccc' : '#45a049'};
  }
`;

const Card = styled.div`
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const CardContent = styled.div`
  padding: 20px;
`;

const Box = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 20px;
`;

const GridItem = styled.div`
  grid-column: 1 / 2;
`;

const LandingPageAiIntegration: React.FC<LandingPageAiIntegrationProps> = ({
  formData,
  onGenerate,
  generatedContent,
  setGeneratedContent
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [isEditingHeadline, setIsEditingHeadline] = useState(false);
  const [isEditingSubheadline, setIsEditingSubheadline] = useState(false);
  const [isEditingBodyContent, setIsEditingBodyContent] = useState(false);
  const [isEditingCtaText, setIsEditingCtaText] = useState(false);
  const [isEditingMetaDescription, setIsEditingMetaDescription] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate a prompt based on form data
  useEffect(() => {
    const generatedPrompt = createDefaultPrompt();
    setCustomPrompt(generatedPrompt);
  }, [formData]);

  const createDefaultPrompt = () => {
    let prompt = `Create compelling landing page content for a ${formData.industry} business named "${formData.businessName}".
    
Campaign Goal: ${formData.campaignGoal}
Target Audience: ${formData.targetAudience}
Call to Action: ${formData.callToAction}
Tone: ${formData.tone || 'Professional'}

Key Features/Benefits to highlight:
${formData.keyFeatures.map((feature: string) => `- ${feature}`).join('\n')}

I need the following components:
1. A catchy headline (max 10 words)
2. A subheadline that expands on the headline (max 20 words)
3. Body content that emphasizes benefits and features (3-4 paragraphs)
4. A compelling CTA button text (max 5 words)
5. A meta description for SEO (max 160 characters)

Format the response as structured JSON with the following keys:
- headline
- subheadline
- bodyContent (with HTML formatting)
- ctaText
- metaDescription`;

    // Add e-commerce specific instructions if applicable
    if (formData.isEcommerce && formData.products.length > 0) {
      prompt += `\n\nThis is an e-commerce landing page featuring the following products:
${formData.products.map((product: any) => 
  `- ${product.name} - $${product.price}${product.description ? ` - ${product.description}` : ''}`
).join('\n')}

Please incorporate product information in the body content and emphasize urgency and exclusivity.`;
    }

    // Add color scheme information if provided
    if (formData.colorScheme) {
      prompt += `\n\nColor scheme: ${formData.colorScheme}`;
    }

    // Add any additional notes if provided
    if (formData.additionalNotes) {
      prompt += `\n\nAdditional information: ${formData.additionalNotes}`;
    }

    return prompt;
  };

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    try {
      await onGenerate(customPrompt);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContentChange = (field: string, value: string) => {
    setGeneratedContent({
      ...generatedContent,
      [field]: value
    });
  };

  const handleRegenerateField = async (field: string) => {
    // This is a placeholder for field-specific regeneration logic
    // In a real implementation, you would create a specific prompt for just this field
    // and update only that field with the result
    
    // For now, we'll just simulate this by regenerating all content
    await handleGenerateContent();
  };

  return (
    <Container>
      <Typography>
        AI Content Generation (Gemini 2.0 Flash)
      </Typography>
      
      <Paper>
        <Typography>
          AI Prompt
        </Typography>
        <TextField
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          rows={8}
        />
        <Box>
          <Button
            onClick={handleGenerateContent}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <FiZap />
                Generating...
              </>
            ) : (
              'Generate Content with Gemini'
            )}
          </Button>
        </Box>
      </Paper>

      {Object.values(generatedContent).some(value => value) && (
        <Box>
          <Typography>
            Generated Content
          </Typography>

          <Grid>
            <GridItem>
              <Card>
                <CardContent>
                  <Box>
                    <Typography>
                      Headline
                    </Typography>
                    <Box>
                      <Button 
                        onClick={() => setIsEditingHeadline(!isEditingHeadline)}
                      >
                        <FiEdit />
                      </Button>
                      <Button 
                        onClick={() => handleRegenerateField('headline')}
                      >
                        <FiRefreshCw />
                      </Button>
                    </Box>
                  </Box>
                  
                  {isEditingHeadline ? (
                    <TextField
                      value={generatedContent.headline}
                      onChange={(e) => handleContentChange('headline', e.target.value)}
                      rows={1}
                    />
                  ) : (
                    <Typography>
                      {generatedContent.headline || 'Your headline will appear here'}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </GridItem>

            <GridItem>
              <Card>
                <CardContent>
                  <Box>
                    <Typography>
                      Subheadline
                    </Typography>
                    <Box>
                      <Button 
                        onClick={() => setIsEditingSubheadline(!isEditingSubheadline)}
                      >
                        <FiEdit />
                      </Button>
                      <Button 
                        onClick={() => handleRegenerateField('subheadline')}
                      >
                        <FiRefreshCw />
                      </Button>
                    </Box>
                  </Box>
                  
                  {isEditingSubheadline ? (
                    <TextField
                      value={generatedContent.subheadline}
                      onChange={(e) => handleContentChange('subheadline', e.target.value)}
                      rows={2}
                    />
                  ) : (
                    <Typography>
                      {generatedContent.subheadline || 'Your subheadline will appear here'}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </GridItem>

            <GridItem>
              <Card>
                <CardContent>
                  <Box>
                    <Typography>
                      Body Content
                    </Typography>
                    <Box>
                      <Button 
                        onClick={() => setIsEditingBodyContent(!isEditingBodyContent)}
                      >
                        <FiEdit />
                      </Button>
                      <Button 
                        onClick={() => handleRegenerateField('bodyContent')}
                      >
                        <FiRefreshCw />
                      </Button>
                    </Box>
                  </Box>
                  
                  {isEditingBodyContent ? (
                    <TextField
                      value={generatedContent.bodyContent}
                      onChange={(e) => handleContentChange('bodyContent', e.target.value)}
                      rows={8}
                    />
                  ) : (
                    <Typography>
                      {generatedContent.bodyContent ? (
                        <div dangerouslySetInnerHTML={{ __html: generatedContent.bodyContent }} />
                      ) : (
                        'Your body content will appear here'
                      )}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </GridItem>

            <GridItem>
              <Card>
                <CardContent>
                  <Box>
                    <Typography>
                      CTA Button Text
                    </Typography>
                    <Box>
                      <Button 
                        onClick={() => setIsEditingCtaText(!isEditingCtaText)}
                      >
                        <FiEdit />
                      </Button>
                      <Button 
                        onClick={() => handleRegenerateField('ctaText')}
                      >
                        <FiRefreshCw />
                      </Button>
                    </Box>
                  </Box>
                  
                  {isEditingCtaText ? (
                    <TextField
                      value={generatedContent.ctaText}
                      onChange={(e) => handleContentChange('ctaText', e.target.value)}
                      rows={1}
                    />
                  ) : (
                    <Button 
                      variant="contained" 
                      color="primary"
                    >
                      {generatedContent.ctaText || 'Your CTA text'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </GridItem>

            <GridItem>
              <Card>
                <CardContent>
                  <Box>
                    <Typography>
                      Meta Description
                    </Typography>
                    <Box>
                      <Button 
                        onClick={() => setIsEditingMetaDescription(!isEditingMetaDescription)}
                      >
                        <FiEdit />
                      </Button>
                      <Button 
                        onClick={() => handleRegenerateField('metaDescription')}
                      >
                        <FiRefreshCw />
                      </Button>
                    </Box>
                  </Box>
                  
                  {isEditingMetaDescription ? (
                    <TextField
                      value={generatedContent.metaDescription}
                      onChange={(e) => handleContentChange('metaDescription', e.target.value)}
                      rows={2}
                    />
                  ) : (
                    <Typography>
                      {generatedContent.metaDescription || 'Your meta description will appear here'}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </GridItem>
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default LandingPageAiIntegration;