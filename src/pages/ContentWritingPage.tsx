import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaSearch, FaSpinner, FaPen, FaClipboard, FaCheck } from 'react-icons/fa';
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

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 'rgba(31, 83, 255, 0.1)' : 'transparent'};
  color: ${props => props.active ? '#1F53FF' : 'white'};
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? '#1F53FF' : 'transparent'};
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(31, 83, 255, 0.05);
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

const TextInput = styled.input`
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

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
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

const OutputContent = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 16px;
  min-height: 300px;
  max-height: 600px;
  overflow-y: auto;
  white-space: pre-wrap;
  line-height: 1.6;
  margin-bottom: 16px;
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

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin-bottom: 16px;
  overflow: hidden;
`;

const Progress = styled.div<{ width: number }>`
  height: 100%;
  width: ${props => props.width}%;
  background: linear-gradient(90deg, #1F53FF, #9C42F5);
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const CopyButton = styled.button`
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const ResearchItem = styled.div`
  padding: 12px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.2);
  margin-bottom: 12px;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }
`;

// Main component
const ContentWritingPage: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<'research' | 'write'>('research');
  const [searchQuery, setSearchQuery] = useState('');
  const [contentPrompt, setContentPrompt] = useState('');
  const [researchData, setResearchData] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [researchProgress, setResearchProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [copied, setCopied] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);

  // Start web research
  const startWebResearch = async () => {
    if (!searchQuery.trim()) {
      setStatusMessage({ text: 'Please enter a search query', type: 'error' });
      return;
    }

    try {
      setIsResearching(true);
      setResearchProgress(0);
      setStatusMessage({ text: 'Starting web research...', type: 'info' });
      setResearchData('');

      const response = await axios.post('/api/browser-use/research', { query: searchQuery });
      setTaskId(response.data.taskId);
      
      // Start polling for status
      setStatusMessage({ text: 'Research in progress...', type: 'info' });
    } catch (error) {
      console.error('Error starting research:', error);
      setStatusMessage({ 
        text: 'Failed to start research. Please try again.', 
        type: 'error' 
      });
      setIsResearching(false);
    }
  };

  // Poll for research status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (taskId && isResearching) {
      interval = setInterval(async () => {
        try {
          const statusResponse = await axios.get(`/api/browser-use/research/${taskId}/status`);
          const status = statusResponse.data;
          
          // Update progress based on status
          if (status.progress) {
            setResearchProgress(status.progress * 100);
          }
          
          // Check if task is complete
          if (status.status === 'finished') {
            clearInterval(interval);
            
            // Get results
            const resultsResponse = await axios.get(`/api/browser-use/research/${taskId}/results`);
            const results = resultsResponse.data;
            
            // Format research data
            const formattedData = results.output || 'No research data available';
            setResearchData(formattedData);
            
            setStatusMessage({ text: 'Research completed successfully!', type: 'success' });
            setIsResearching(false);
          } else if (status.status === 'failed' || status.status === 'stopped') {
            clearInterval(interval);
            setStatusMessage({ text: 'Research failed. Please try again.', type: 'error' });
            setIsResearching(false);
          }
        } catch (error) {
          console.error('Error checking research status:', error);
          clearInterval(interval);
          setStatusMessage({ text: 'Error checking research status', type: 'error' });
          setIsResearching(false);
        }
      }, 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [taskId, isResearching]);

  // Generate content
  const generateContent = async () => {
    if (!contentPrompt.trim()) {
      setStatusMessage({ text: 'Please enter a content prompt', type: 'error' });
      return;
    }
    
    if (!researchData.trim()) {
      setStatusMessage({ text: 'Please conduct research first', type: 'error' });
      return;
    }

    try {
      setIsGenerating(true);
      setStatusMessage({ text: 'Generating content...', type: 'info' });

      const response = await axios.post('/api/browser-use/generate-content', {
        prompt: contentPrompt,
        researchData
      });

      setGeneratedContent(response.data.content);
      setStatusMessage({ text: 'Content generated successfully!', type: 'success' });
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating content:', error);
      setStatusMessage({ 
        text: 'Failed to generate content. Please try again.', 
        type: 'error' 
      });
      setIsGenerating(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <PageContainer>
      <PageTitle
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        AI Content Writing
      </PageTitle>
      <PageDescription>
        Create high-quality, well-researched content with our AI-powered content writing tool.
        Our system uses Gemini-2.5-Pro-Preview-03-25 with Browser Use for advanced web research, 
        and Gemini-2.0-Flash for fast, high-quality content generation. Get accurate, informative, 
        and engaging content in minutes.
      </PageDescription>

      <TabContainer>
        <Tab 
          active={activeTab === 'research'} 
          onClick={() => setActiveTab('research')}
        >
          Research
        </Tab>
        <Tab 
          active={activeTab === 'write'} 
          onClick={() => setActiveTab('write')}
        >
          Write
        </Tab>
      </TabContainer>

      {activeTab === 'research' && (
        <ContentContainer>
          <InputSection>
            <SectionTitle>
              {FaSearch({})} Research Topic
            </SectionTitle>
            <InputLabel>Enter a topic to research (powered by Gemini-2.5-Pro-Preview-03-25):</InputLabel>
            <TextInput 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., Benefits of content marketing for small businesses"
              disabled={isResearching}
            />
            <Button 
              onClick={startWebResearch}
              disabled={isResearching || !searchQuery.trim()}
            >
              {isResearching ? (
                <>
                  {FaSpinner({ className: "animate-spin" })} Researching...
                </>
              ) : (
                <>
                  {FaSearch({})} Start Research
                </>
              )}
            </Button>

            {isResearching && (
              <ProgressBar>
                <Progress width={researchProgress} />
              </ProgressBar>
            )}

            {statusMessage && (
              <StatusMessage type={statusMessage.type}>
                {statusMessage.type === 'info' && FaSpinner({ className: "animate-spin" })}
                {statusMessage.type === 'success' && FaCheck({})}
                {statusMessage.type === 'error' && <span>⚠️</span>}
                {statusMessage.text}
              </StatusMessage>
            )}
          </InputSection>

          <OutputSection>
            <SectionTitle>Research Results</SectionTitle>
            <OutputContent>
              {researchData || 'Research results will appear here...'}
            </OutputContent>
          </OutputSection>
        </ContentContainer>
      )}

      {activeTab === 'write' && (
        <ContentContainer>
          <InputSection>
            <SectionTitle>
              {FaPen({})} Content Prompt
            </SectionTitle>
            <InputLabel>What would you like to write about? (powered by Gemini-2.0-Flash)</InputLabel>
            <TextArea 
              value={contentPrompt}
              onChange={(e) => setContentPrompt(e.target.value)}
              placeholder="e.g., Write a blog post about the top 10 benefits of content marketing for small businesses"
              disabled={isGenerating}
            />
            <Button 
              onClick={generateContent}
              disabled={isGenerating || !contentPrompt.trim() || !researchData.trim()}
            >
              {isGenerating ? (
                <>
                  {FaSpinner({ className: "animate-spin" })} Generating...
                </>
              ) : (
                <>
                  {FaPen({})} Generate Content
                </>
              )}
            </Button>

            {statusMessage && (
              <StatusMessage type={statusMessage.type}>
                {statusMessage.type === 'info' && FaSpinner({ className: "animate-spin" })}
                {statusMessage.type === 'success' && FaCheck({})}
                {statusMessage.type === 'error' && <span>⚠️</span>}
                {statusMessage.text}
              </StatusMessage>
            )}
          </InputSection>

          <OutputSection>
            <SectionTitle>Generated Content</SectionTitle>
            <OutputContent>
              {generatedContent || 'Generated content will appear here...'}
            </OutputContent>
            {generatedContent && (
              <CopyButton onClick={copyToClipboard}>
                {copied ? (
                  <>
                    {FaCheck({})} Copied!
                  </>
                ) : (
                  <>
                    {FaClipboard({})} Copy to Clipboard
                  </>
                )}
              </CopyButton>
            )}
          </OutputSection>
        </ContentContainer>
      )}
    </PageContainer>
  );
};

export default ContentWritingPage;
