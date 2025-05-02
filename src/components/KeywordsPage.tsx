import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSearch, FiDownload, FiLoader } from 'react-icons/fi';
import axios from 'axios';

// Styled components
const KeywordsContainer = styled.div`
  padding: 20px;
`;

const KeywordsHeader = styled.div`
  margin-bottom: 30px;
`;

const KeywordsTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 22px;
`;

const KeywordsDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20px;
  max-width: 800px;
  line-height: 1.6;
`;

const KeywordsForm = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 15px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 15px;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: rgba(31, 83, 255, 0.5);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 15px;
  min-height: 100px;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: rgba(31, 83, 255, 0.5);
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const GenerateButton = styled.button`
  background: rgba(31, 83, 255, 0.8);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(31, 83, 255, 1);
  }
  
  &:disabled {
    background: rgba(31, 83, 255, 0.3);
    cursor: not-allowed;
  }
`;

const ResultsContainer = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 25px;
  margin-top: 30px;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ResultsTitle = styled.h4`
  margin: 0;
  font-size: 18px;
`;

const ExportButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 15px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const KeywordSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h5`
  margin: 0 0 15px 0;
  font-size: 16px;
  color: rgba(31, 83, 255, 0.9);
`;

const KeywordTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 12px 15px;
    background: rgba(0, 0, 0, 0.2);
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    font-size: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  td {
    padding: 12px 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 14px;
  }
  
  tr:hover td {
    background: rgba(255, 255, 255, 0.02);
  }
`;

const LoadingOverlay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.7);
  
  svg {
    animation: spin 1.5s linear infinite;
    margin-bottom: 15px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const DifficultyBadge = styled.span<{ $difficulty: number }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  
  background: ${props => {
    if (props.$difficulty <= 30) return 'rgba(52, 199, 89, 0.2)';
    if (props.$difficulty <= 60) return 'rgba(255, 149, 0, 0.2)';
    return 'rgba(255, 59, 48, 0.2)';
  }};
  
  color: ${props => {
    if (props.$difficulty <= 30) return '#34c759';
    if (props.$difficulty <= 60) return '#ff9500';
    return '#ff3b30';
  }};
`;

interface Keyword {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  intent: string;
}

interface KeywordMap {
  mainKeywords: Keyword[];
  longTailKeywords: Keyword[];
  relatedTopics: string[];
  summary: string;
}

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent';

const KeywordsPage: React.FC<{ clientId: string }> = ({ clientId }) => {
  const [topic, setTopic] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [loading, setLoading] = useState(false);
  const [keywordMap, setKeywordMap] = useState<KeywordMap | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateKeywordMap = async () => {
    if (!topic) {
      setError('Please enter a main topic');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not defined in environment variables');
      }
      
      const prompt = `
        You are an expert SEO keyword researcher. Generate a comprehensive keyword map for the following topic:
        
        TOPIC: ${topic}
        ${industry ? `INDUSTRY: ${industry}` : ''}
        ${targetAudience ? `TARGET AUDIENCE: ${targetAudience}` : ''}
        ${competitors ? `COMPETITORS: ${competitors}` : ''}
        
        Please provide:
        
        1. At least 50 main keywords related to this topic, including:
           - Estimated monthly search volume (approximate)
           - Difficulty score (1-100, where higher is more difficult)
           - Search intent (informational, navigational, commercial, transactional)
        
        2. At least 50 long-tail keywords related to this topic, including:
           - Estimated monthly search volume (approximate)
           - Difficulty score (1-100, where higher is more difficult)
           - Search intent (informational, navigational, commercial, transactional)
        
        3. 10-15 related topic clusters that could be developed into content pillars
        
        4. A brief summary of keyword opportunities and recommendations
        
        Format your response as a JSON object with the following structure:
        {
          "mainKeywords": [
            { "keyword": "example keyword", "searchVolume": 1000, "difficulty": 45, "intent": "informational" },
            ...
          ],
          "longTailKeywords": [
            { "keyword": "example long tail keyword", "searchVolume": 200, "difficulty": 25, "intent": "transactional" },
            ...
          ],
          "relatedTopics": ["topic 1", "topic 2", ...],
          "summary": "Brief analysis and recommendations..."
        }
        
        IMPORTANT: Return ONLY the JSON object with no additional text or explanations.
      `;
      
      const response = await axios.post(
        GEMINI_API_URL,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 8192
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY
          }
        }
      );
      
      if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response from Gemini API');
      }
      
      const rawText = response.data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response (in case there's any extra text)
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from Gemini response');
      }
      
      const parsedData = JSON.parse(jsonMatch[0]);
      setKeywordMap(parsedData);
    } catch (err: any) {
      console.error('Error generating keyword map:', err);
      setError(err.message || 'Failed to generate keyword map');
    } finally {
      setLoading(false);
    }
  };

  const exportToCsv = () => {
    if (!keywordMap) return;
    
    // Prepare CSV content
    const mainKeywordsCsv = [
      'Keyword,Search Volume,Difficulty,Intent',
      ...keywordMap.mainKeywords.map(k => 
        `"${k.keyword}",${k.searchVolume},${k.difficulty},"${k.intent}"`)
    ].join('\n');
    
    const longTailKeywordsCsv = [
      'Keyword,Search Volume,Difficulty,Intent',
      ...keywordMap.longTailKeywords.map(k => 
        `"${k.keyword}",${k.searchVolume},${k.difficulty},"${k.intent}"`)
    ].join('\n');
    
    const relatedTopicsCsv = [
      'Related Topics',
      ...keywordMap.relatedTopics.map(t => `"${t}"`)
    ].join('\n');
    
    const fullCsv = [
      '# Keyword Map for: ' + topic,
      '# Generated: ' + new Date().toLocaleString(),
      '# Summary:',
      '# ' + keywordMap.summary.replace(/\n/g, '\n# '),
      '',
      '## MAIN KEYWORDS',
      mainKeywordsCsv,
      '',
      '## LONG TAIL KEYWORDS',
      longTailKeywordsCsv,
      '',
      '## RELATED TOPICS',
      relatedTopicsCsv
    ].join('\n');
    
    // Create and download the CSV file
    const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `keyword-map-${topic.replace(/\s+/g, '-').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <KeywordsContainer>
      <KeywordsHeader>
        <KeywordsTitle>Keyword Topical Map Generator</KeywordsTitle>
        <KeywordsDescription>
          Generate a comprehensive keyword map with main keywords, long-tail variations, and related topics. 
          Our AI-powered tool analyzes search intent and difficulty to help you build an effective content strategy.
        </KeywordsDescription>
      </KeywordsHeader>
      
      <KeywordsForm>
        <FormGroup>
          <Label>Main Topic or Focus Keyword *</Label>
          <Input 
            type="text" 
            value={topic} 
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., coffee beans, digital marketing, yoga mats"
          />
        </FormGroup>
        
        <FormRow>
          <FormGroup>
            <Label>Industry</Label>
            <Input 
              type="text" 
              value={industry} 
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., Food & Beverage, SaaS, Health & Fitness"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Target Audience</Label>
            <Input 
              type="text" 
              value={targetAudience} 
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., coffee enthusiasts, small business owners"
            />
          </FormGroup>
        </FormRow>
        
        <FormGroup>
          <Label>Competitors (optional)</Label>
          <TextArea 
            value={competitors} 
            onChange={(e) => setCompetitors(e.target.value)}
            placeholder="List main competitors, one per line"
          />
        </FormGroup>
        
        {error && (
          <div style={{ color: '#ff3b30', marginBottom: '15px' }}>
            {error}
          </div>
        )}
        
        <GenerateButton 
          onClick={generateKeywordMap} 
          disabled={loading || !topic}
        >
          {loading ? (
            <>
              <FiLoader size={18} />
              Generating Keyword Map...
            </>
          ) : (
            <>
              <FiSearch size={18} />
              Generate Keyword Map
            </>
          )}
        </GenerateButton>
      </KeywordsForm>
      
      {loading && (
        <LoadingOverlay>
          <FiLoader size={32} />
          <div>Generating comprehensive keyword map...</div>
          <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.7 }}>
            This may take up to 60 seconds
          </div>
        </LoadingOverlay>
      )}
      
      {keywordMap && !loading && (
        <ResultsContainer>
          <ResultsHeader>
            <ResultsTitle>Keyword Map Results for "{topic}"</ResultsTitle>
            <ExportButton onClick={exportToCsv}>
              <FiDownload size={16} />
              Export to CSV
            </ExportButton>
          </ResultsHeader>
          
          <KeywordSection>
            <SectionTitle>Summary & Recommendations</SectionTitle>
            <div style={{ 
              background: 'rgba(0, 0, 0, 0.2)', 
              padding: '15px', 
              borderRadius: '6px',
              lineHeight: '1.6',
              whiteSpace: 'pre-line'
            }}>
              {keywordMap.summary}
            </div>
          </KeywordSection>
          
          <KeywordSection>
            <SectionTitle>Main Keywords</SectionTitle>
            <KeywordTable>
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th>Search Volume</th>
                  <th>Difficulty</th>
                  <th>Intent</th>
                </tr>
              </thead>
              <tbody>
                {keywordMap.mainKeywords.map((keyword, index) => (
                  <tr key={`main-${index}`}>
                    <td>{keyword.keyword}</td>
                    <td>{keyword.searchVolume.toLocaleString()}</td>
                    <td>
                      <DifficultyBadge $difficulty={keyword.difficulty}>
                        {keyword.difficulty}/100
                      </DifficultyBadge>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{keyword.intent}</td>
                  </tr>
                ))}
              </tbody>
            </KeywordTable>
          </KeywordSection>
          
          <KeywordSection>
            <SectionTitle>Long-Tail Keywords</SectionTitle>
            <KeywordTable>
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th>Search Volume</th>
                  <th>Difficulty</th>
                  <th>Intent</th>
                </tr>
              </thead>
              <tbody>
                {keywordMap.longTailKeywords.map((keyword, index) => (
                  <tr key={`long-${index}`}>
                    <td>{keyword.keyword}</td>
                    <td>{keyword.searchVolume.toLocaleString()}</td>
                    <td>
                      <DifficultyBadge $difficulty={keyword.difficulty}>
                        {keyword.difficulty}/100
                      </DifficultyBadge>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{keyword.intent}</td>
                  </tr>
                ))}
              </tbody>
            </KeywordTable>
          </KeywordSection>
          
          <KeywordSection>
            <SectionTitle>Related Topic Clusters</SectionTitle>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '10px' 
            }}>
              {keywordMap.relatedTopics.map((topic, index) => (
                <div 
                  key={`topic-${index}`}
                  style={{
                    background: 'rgba(31, 83, 255, 0.1)',
                    color: 'rgba(31, 83, 255, 0.9)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  {topic}
                </div>
              ))}
            </div>
          </KeywordSection>
        </ResultsContainer>
      )}
    </KeywordsContainer>
  );
};

export default KeywordsPage;
