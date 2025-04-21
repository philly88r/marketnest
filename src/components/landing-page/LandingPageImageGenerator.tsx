import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiRefreshCw, FiZap, FiTrash2, FiInfo } from 'react-icons/fi';

interface LandingPageImageGeneratorProps {
  formData: any;
  generatedContent: {
    headline: string;
    subheadline: string;
    bodyContent: string;
    ctaText: string;
    metaDescription: string;
  };
  onGenerateImages: (imagePrompts: string[]) => Promise<void>;
  generatedImages: string[];
  selectedImages: string[];
  setSelectedImages: React.Dispatch<React.SetStateAction<string[]>>;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Typography = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Paper = styled.div`
  background-color: #fff;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Box = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const TextField = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Button = styled.button`
  background-color: #4CAF50;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const IconButton = styled.button`
  background-color: transparent;
  border: none;
  padding: 10px;
  cursor: pointer;
`;

const Card = styled.div`
  background-color: #fff;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const CardMedia = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px 10px 0 0;
`;

const CardContent = styled.div`
  padding: 20px;
`;

const CardActions = styled.div`
  padding: 20px;
  border-top: 1px solid #ddd;
`;

const FormControlLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

const CircularProgress = styled.div`
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-top: 5px solid #4CAF50;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 2s linear infinite;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 20px;
  width: 100%;
`;

const GridItem = styled.div`
  width: 100%;
`;

const LandingPageImageGenerator: React.FC<LandingPageImageGeneratorProps> = ({
  formData,
  generatedContent,
  onGenerateImages,
  generatedImages,
  selectedImages,
  setSelectedImages
}) => {
  const [customPrompts, setCustomPrompts] = useState<string[]>([
    `Create a professional header image for a ${formData.industry} business landing page that showcases "${formData.businessName}". The image should reflect the brand's focus on ${formData.keyFeatures[0] || 'quality service'}.`,
    `Create an image showing the target audience (${formData.targetAudience}) engaging with ${formData.businessName}'s products or services. Use a ${formData.colorScheme || 'professional'} color scheme.`,
    `Create an image that visually represents the key benefit "${formData.keyFeatures[0] || 'main feature'}" for ${formData.businessName}'s landing page.`
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tempPrompt, setTempPrompt] = useState('');

  const handleGenerateImages = async () => {
    setIsGenerating(true);
    try {
      await onGenerateImages(customPrompts);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddPrompt = () => {
    if (tempPrompt.trim()) {
      setCustomPrompts([...customPrompts, tempPrompt.trim()]);
      setTempPrompt('');
    }
  };

  const handleRemovePrompt = (index: number) => {
    const updatedPrompts = [...customPrompts];
    updatedPrompts.splice(index, 1);
    setCustomPrompts(updatedPrompts);
  };

  const handleUpdatePrompt = (index: number, value: string) => {
    const updatedPrompts = [...customPrompts];
    updatedPrompts[index] = value;
    setCustomPrompts(updatedPrompts);
  };

  const handleToggleSelectImage = (imageUrl: string) => {
    if (selectedImages.includes(imageUrl)) {
      setSelectedImages(selectedImages.filter(url => url !== imageUrl));
    } else {
      setSelectedImages([...selectedImages, imageUrl]);
    }
  };

  return (
    <Container>
      <Typography>
        Image Generation (Google Imagen 3.0)
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Paper>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography>
              Image Prompts
            </Typography>
            <IconButton size="small">
              <FiInfo />
            </IconButton>
          </Box>
          
          {customPrompts.map((prompt, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                mb: 2, 
                gap: 1,
                alignItems: 'flex-start' 
              }}
            >
              <TextField
                fullWidth
                value={prompt}
                onChange={(e) => handleUpdatePrompt(index, e.target.value)}
                variant="outlined"
                size="small"
                multiline
                minRows={2}
              />
              <IconButton 
                onClick={() => handleRemovePrompt(index)}
                color="error"
                sx={{ mt: 1 }}
              >
                <FiTrash2 />
              </IconButton>
            </Box>
          ))}
          
          <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
            <TextField
              fullWidth
              label="Add a new image prompt"
              value={tempPrompt}
              onChange={(e) => setTempPrompt(e.target.value)}
              variant="outlined"
              size="small"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddPrompt();
                }
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddPrompt}
              startIcon={<FiPlus />}
            >
              Add
            </Button>
          </Box>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FiZap />}
            onClick={handleGenerateImages}
            disabled={isGenerating || customPrompts.length === 0}
          >
            {isGenerating ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                Generating Images...
              </>
            ) : (
              'Generate Images'
            )}
          </Button>
        </Box>
      </Box>

      {generatedImages.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography>
            Generated Images
          </Typography>
          <Typography>
            Select the images you want to use in your landing page (selected images will be highlighted)
          </Typography>
          
          <Grid>
            {generatedImages.map((imageUrl, index) => (
              <GridItem key={index}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    border: selectedImages.includes(imageUrl) ? 2 : 1,
                    borderColor: selectedImages.includes(imageUrl) ? 'primary.main' : 'divider'
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={imageUrl}
                    alt={`Generated image ${index + 1}`}
                  />
                  <CardContent sx={{ py: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Image #{index + 1}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedImages.includes(imageUrl)}
                          onChange={() => handleToggleSelectImage(imageUrl)}
                          color="primary"
                        />
                      }
                      label="Use this image"
                    />
                  </CardActions>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default LandingPageImageGenerator;