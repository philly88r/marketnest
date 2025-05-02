import React, { useState } from 'react';
import styled from 'styled-components';
import { fetchDocumentation, fetchCodeExamples } from '../utils/context7Service';
import { FiSearch, FiCode, FiBook, FiCopy } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

interface Context7ExplorerProps {
  clientId: string;
}

const Context7Explorer: React.FC<Context7ExplorerProps> = ({ clientId }) => {
  const [query, setQuery] = useState('');
  const [library, setLibrary] = useState('react');
  const [language, setLanguage] = useState('typescript');
  const [activeTab, setActiveTab] = useState<'docs' | 'code'>('docs');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentation, setDocumentation] = useState<string | null>(null);
  const [codeExamples, setCodeExamples] = useState<any[] | null>(null);

  // Handle searching for documentation
  const handleSearchDocs = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query || !library) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchDocumentation(query, library);
      setDocumentation(result.content);
      setActiveTab('docs');
    } catch (err: any) {
      console.error('Error fetching documentation:', err);
      setError(err.message || 'Failed to fetch documentation');
      setDocumentation(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle searching for code examples
  const handleSearchCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query || !language) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchCodeExamples(query, language);
      setCodeExamples(result.examples);
      setActiveTab('code');
    } catch (err: any) {
      console.error('Error fetching code examples:', err);
      setError(err.message || 'Failed to fetch code examples');
      setCodeExamples(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle copying code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  return (
    <Container>
      <Header>
        <h2>Context7 Documentation Explorer</h2>
        <p>Get up-to-date documentation and code examples for your projects</p>
      </Header>

      <TabContainer>
        <Tab 
          $active={activeTab === 'docs'} 
          onClick={() => setActiveTab('docs')}
        >
          <FiBook /> Documentation
        </Tab>
        <Tab 
          $active={activeTab === 'code'} 
          onClick={() => setActiveTab('code')}
        >
          <FiCode /> Code Examples
        </Tab>
      </TabContainer>

      {activeTab === 'docs' ? (
        <Form onSubmit={handleSearchDocs}>
          <FormGroup>
            <Label htmlFor="query">Search Query</Label>
            <Input
              id="query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., How to use React hooks"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="library">Library/Framework</Label>
            <Select
              id="library"
              value={library}
              onChange={(e) => setLibrary(e.target.value)}
              required
            >
              <option value="react">React</option>
              <option value="nextjs">Next.js</option>
              <option value="typescript">TypeScript</option>
              <option value="nodejs">Node.js</option>
              <option value="express">Express</option>
              <option value="supabase">Supabase</option>
            </Select>
          </FormGroup>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : <><FiSearch /> Search Documentation</>}
          </Button>
        </Form>
      ) : (
        <Form onSubmit={handleSearchCode}>
          <FormGroup>
            <Label htmlFor="codeQuery">Search Query</Label>
            <Input
              id="codeQuery"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., React custom hook for API calls"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="language">Programming Language</Label>
            <Select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              required
            >
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="java">Java</option>
            </Select>
          </FormGroup>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : <><FiSearch /> Search Code Examples</>}
          </Button>
        </Form>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <ResultsContainer>
        {activeTab === 'docs' && documentation && (
          <DocumentationContainer>
            <ReactMarkdown>{documentation}</ReactMarkdown>
          </DocumentationContainer>
        )}

        {activeTab === 'code' && codeExamples && codeExamples.length > 0 && (
          <CodeExamplesContainer>
            {codeExamples.map((example, index) => (
              <CodeExample key={index}>
                <CodeHeader>
                  <h4>{example.description || `Example ${index + 1}`}</h4>
                  <CopyButton onClick={() => handleCopyCode(example.code)}>
                    <FiCopy /> Copy
                  </CopyButton>
                </CodeHeader>
                <pre>
                  <code>{example.code}</code>
                </pre>
                {example.source && (
                  <SourceLink href={example.source} target="_blank" rel="noopener noreferrer">
                    Source
                  </SourceLink>
                )}
              </CodeExample>
            ))}
          </CodeExamplesContainer>
        )}

        {activeTab === 'code' && codeExamples && codeExamples.length === 0 && (
          <NoResults>No code examples found for your query.</NoResults>
        )}
      </ResultsContainer>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  margin-bottom: 2rem;
  text-align: center;
  
  h2 {
    font-size: 2rem;
    color: #0d233f;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #666;
    font-size: 1rem;
  }
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 1rem 2rem;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: ${props => props.$active ? '600' : '400'};
  color: ${props => props.$active ? '#0d233f' : '#666'};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? '#0d233f' : 'transparent'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: #0d233f;
  }
  
  svg {
    font-size: 1.2rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-end;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #0d233f;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #0d233f;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #0d233f;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #0a1b2f;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background-color: #fff0f0;
  color: #e53e3e;
  border-radius: 4px;
  margin-bottom: 1rem;
  border-left: 4px solid #e53e3e;
`;

const ResultsContainer = styled.div`
  margin-top: 2rem;
`;

const DocumentationContainer = styled.div`
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  line-height: 1.6;
  
  h1, h2, h3, h4, h5, h6 {
    color: #0d233f;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }
  
  p {
    margin-bottom: 1rem;
  }
  
  code {
    background-color: #f0f0f0;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: monospace;
  }
  
  pre {
    background-color: #f0f0f0;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    margin: 1rem 0;
  }
  
  a {
    color: #0d233f;
    text-decoration: underline;
  }
`;

const CodeExamplesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const CodeExample = styled.div`
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
`;

const CodeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #eee;
  
  h4 {
    margin: 0;
    color: #0d233f;
  }
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: #0d233f;
  }
`;

const SourceLink = styled.a`
  display: block;
  padding: 0.75rem 1rem;
  text-align: right;
  color: #0d233f;
  font-size: 0.875rem;
  text-decoration: none;
  border-top: 1px solid #eee;
  
  &:hover {
    text-decoration: underline;
  }
`;

const NoResults = styled.div`
  padding: 2rem;
  text-align: center;
  color: #666;
  background-color: #f9f9f9;
  border-radius: 4px;
`;

export default Context7Explorer;
