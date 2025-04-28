/**
 * Context7 Service for MarketNest Agency Website
 * 
 * This service provides functions to interact with the Context7 MCP integration
 * for fetching up-to-date documentation and code examples.
 */

/**
 * Fetch documentation from Context7
 * @param query - The documentation query
 * @param library - The library or framework name (e.g., 'nextjs', 'react')
 * @param version - Optional version specification
 * @returns Documentation data
 */
export const fetchDocumentation = async (
  query: string,
  library: string,
  version: string = 'latest'
): Promise<any> => {
  try {
    const response = await fetch('/api/context7/documentation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        library,
        version
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch documentation: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching documentation from Context7:', error);
    throw error;
  }
};

/**
 * Fetch code examples from Context7
 * @param query - The code example query
 * @param language - Programming language (e.g., 'javascript', 'typescript')
 * @returns Code examples data
 */
export const fetchCodeExamples = async (
  query: string,
  language: string
): Promise<any> => {
  try {
    const response = await fetch('/api/context7/code-examples', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        language
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch code examples: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching code examples from Context7:', error);
    throw error;
  }
};

/**
 * Interface for Context7 documentation result
 */
export interface Context7Documentation {
  content: string;
  source: string;
  version: string;
  timestamp: string;
}

/**
 * Interface for Context7 code example
 */
export interface Context7CodeExample {
  code: string;
  language: string;
  description: string;
  source: string;
}

/**
 * Interface for Context7 code examples result
 */
export interface Context7CodeExamples {
  examples: Context7CodeExample[];
  query: string;
}
