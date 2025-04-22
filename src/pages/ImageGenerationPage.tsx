import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import * as FaIcons from 'react-icons/fa';
import axios from 'axios';

// Styled components
const PageContainer = styled.div`
  padding: 120px 24px 80px;
  max-width: 1200px;
  margin: 0 auto;
  color: white;
  
  @media (max-width: 768px) {
    padding: 100px 16px 60px;
  }
`;

const PageTitle = styled(motion.h1)`
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #1F53FF, #FF43A3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const PageDescription = styled.p`
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 800px;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const InputSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
`;

const OutputSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 16px;
  margin-bottom: 16px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #1F53FF;
  }
`;

const SelectInput = styled.select`
  width: 100%;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 16px;
  margin-bottom: 16px;
  
  &:focus {
    outline: none;
    border-color: #1F53FF;
  }
`;

const OptionGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  
  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
  }
`;

const Button = styled.button`
  background: linear-gradient(90deg, #1F53FF, #9C42F5);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(31, 83, 255, 0.3);
  }
  
  &:disabled {
    background: #555;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ImageContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const ImageCard = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: auto;
    display: block;
  }
  
  .image-actions {
    padding: 8px;
    display: flex;
    justify-content: center;
    
    button {
      background: transparent;
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
`;

const StatusMessage = styled.div<{ type: 'info' | 'success' | 'error' }>`
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  background: ${props => 
    props.type === 'info' ? 'rgba(31, 83, 255, 0.1)' : 
    props.type === 'success' ? 'rgba(0, 200, 83, 0.1)' : 
    'rgba(255, 67, 67, 0.1)'
  };
  border-left: 3px solid ${props => 
    props.type === 'info' ? '#1F53FF' : 
    props.type === 'success' ? '#00C853' : 
    '#FF4343'
  };
  color: ${props => 
    props.type === 'info' ? '#1F53FF' : 
    props.type === 'success' ? '#00C853' : 
    '#FF4343'
  };
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TextResponse = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
`;

// Main component
const ImageGenerationPage: React.FC = () => {
  // State
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [numberOfImages, setNumberOfImages] = useState('1');
  const [safetyFilterLevel, setSafetyFilterLevel] = useState('BLOCK_NONE');
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Array<{ filename: string; path: string; mimeType: string }>>([]);
  const [textResponse, setTextResponse] = useState<string | null>(null);

  // Generate images
  const handleGenerateImages = async () => {
    if (!prompt.trim()) {
      setStatusMessage({ text: 'Please enter a prompt', type: 'error' });
      return;
    }

    try {
      setIsGenerating(true);
      setStatusMessage({ text: 'Generating images...', type: 'info' });
      setGeneratedImages([]);
      setTextResponse(null);

      const response = await axios.post('/api/generate-image', {
        prompt,
        aspectRatio,
        numberOfImages: parseInt(numberOfImages, 10),
        safetyFilterLevel,
        enhancePrompt
      });

      if (response.data.images && response.data.images.length > 0) {
        setGeneratedImages(response.data.images);
        setStatusMessage({ text: 'Images generated successfully!', type: 'success' });
      } else {
        setStatusMessage({ text: 'No images were generated. Try a different prompt.', type: 'error' });
      }

      if (response.data.text) {
        setTextResponse(response.data.text);
      }

      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating images:', error);
      setStatusMessage({ 
        text: 'Failed to generate images. Please try again.', 
        type: 'error' 
      });
      setIsGenerating(false);
    }
  };

  // Download image
  const handleDownloadImage = (imagePath: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imagePath;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageContainer>
      <PageTitle
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        AI Image Generation
      </PageTitle>
      <PageDescription>
        Create stunning, custom images with our AI-powered image generation tool.
        Powered by Google's Gemini 2.0 Flash model, our tool can generate high-quality
        images based on your text descriptions in seconds.
      </PageDescription>

      <ContentContainer>
        <InputSection>
          <SectionTitle>
            <FaIcons.FaMagic /> Image Prompt
          </SectionTitle>
          <InputLabel>Describe the image you want to generate:</InputLabel>
          <TextArea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A futuristic cityscape with flying cars and neon lights, digital art style"
            disabled={isGenerating}
          />

          <OptionGroup>
            <div>
              <InputLabel>Aspect Ratio:</InputLabel>
              <SelectInput 
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                disabled={isGenerating}
              >
                <option value="1:1">Square (1:1)</option>
                <option value="16:9">Landscape (16:9)</option>
                <option value="9:16">Portrait (9:16)</option>
                <option value="4:3">Standard (4:3)</option>
                <option value="3:2">Photo (3:2)</option>
              </SelectInput>
            </div>
            <div>
              <InputLabel>Number of Images:</InputLabel>
              <SelectInput 
                value={numberOfImages}
                onChange={(e) => setNumberOfImages(e.target.value)}
                disabled={isGenerating}
              >
                <option value="1">1 Image</option>
                <option value="2">2 Images</option>
                <option value="3">3 Images</option>
                <option value="4">4 Images</option>
              </SelectInput>
            </div>
          </OptionGroup>

          <InputLabel>Safety Filter Level:</InputLabel>
          <SelectInput 
            value={safetyFilterLevel}
            onChange={(e) => setSafetyFilterLevel(e.target.value)}
            disabled={isGenerating}
          >
            <option value="BLOCK_NONE">No Filtering</option>
            <option value="BLOCK_ONLY_HIGH">Block High Risk Content</option>
            <option value="BLOCK_MEDIUM_AND_ABOVE">Block Medium & High Risk Content</option>
            <option value="BLOCK_LOW_AND_ABOVE">Maximum Filtering</option>
          </SelectInput>

          <Checkbox>
            <input 
              type="checkbox" 
              id="enhancePrompt" 
              checked={enhancePrompt}
              onChange={(e) => setEnhancePrompt(e.target.checked)}
              disabled={isGenerating}
            />
            <label htmlFor="enhancePrompt">Enhance prompt (AI will improve your prompt)</label>
          </Checkbox>

          <Button 
            onClick={handleGenerateImages}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? (
              <>
                <FaIcons.FaSpinner className="animate-spin" /> Generating...
              </>
            ) : (
              <>
                <FaIcons.FaImage /> Generate Images
              </>
            )}
          </Button>

          {statusMessage && (
            <StatusMessage type={statusMessage.type}>
              {statusMessage.type === 'info' && <FaIcons.FaSpinner className="animate-spin" />}
              {statusMessage.type === 'success' && <span>✓</span>}
              {statusMessage.type === 'error' && <span>⚠️</span>}
              {statusMessage.text}
            </StatusMessage>
          )}
        </InputSection>

        <OutputSection>
          <SectionTitle>
            <FaIcons.FaImage /> Generated Images
          </SectionTitle>
          
          {textResponse && (
            <TextResponse>
              <strong>AI Response:</strong> {textResponse}
            </TextResponse>
          )}
          
          {generatedImages.length > 0 ? (
            <ImageContainer>
              {generatedImages.map((image, index) => (
                <ImageCard key={index}>
                  <img src={image.path} alt={`Generated image ${index + 1}`} />
                  <div className="image-actions">
                    <button onClick={() => handleDownloadImage(image.path, image.filename)}>
                      <FaIcons.FaDownload /> Download
                    </button>
                  </div>
                </ImageCard>
              ))}
            </ImageContainer>
          ) : (
            <p>Generated images will appear here...</p>
          )}
        </OutputSection>
      </ContentContainer>
    </PageContainer>
  );
};

export default ImageGenerationPage;
