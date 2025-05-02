import axios from 'axios';
import { repairJson, safeParseJson } from './jsonRepair';
import { getSEOAuditPrompt } from './seoPrompt';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent';

if (!GEMINI_API_KEY) {
  console.error('WARNING: REACT_APP_GEMINI_API_KEY is not set in environment variables! Gemini audit will not work.');
}

// Variable to store the prompt once it's loaded
let BASE_PROMPT = '';

// Flag to track if we've already tried to load the prompt
let promptLoaded = false;

/**
 * Fetch the prompt from the server endpoint
 */
async function fetchPromptFromServer(): Promise<string> {
  try {
    // Determine the server URL based on environment
    const serverUrl = process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:3001';
    const response = await fetch(`${serverUrl}/api/seo/audit-prompt`, {
      headers: {
        'Accept': 'text/plain'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch prompt: ${response.status} ${response.statusText}`);
    }
    
    // Get the text content and log the first 100 characters for debugging
    const promptContent = await response.text();
    console.log('Successfully loaded prompt from server endpoint');
    console.log(`Prompt starts with: ${promptContent.substring(0, 100)}...`);
    
    // Ensure the prompt is valid by checking for basic content
    if (!promptContent || promptContent.length < 10) {
      throw new Error('Prompt content is too short or empty');
    }
    
    return promptContent;
  } catch (error) {
    console.error('Error fetching prompt from server:', error);
    // Return a basic fallback prompt if the server fetch fails
    return getSEOAuditPrompt('https://example.com');
  }
}

// Function to update the URL in the prompt
function getPromptWithUpdatedUrl(prompt: string, url: string): string {
  // Replace the hardcoded URL with the actual URL being audited
  return prompt.replace(/https:\/\/libertybeanscoffee\.com/g, url);
}

// Initialize the prompt loading - this will happen once when the module is imported
(async function initializePrompt() {
  if (!promptLoaded) {
    BASE_PROMPT = await fetchPromptFromServer();
    promptLoaded = true;
  }
})().catch(error => {
  console.error('Failed to initialize prompt:', error);
});

/**
 * Attempts to fix common issues in malformed JSON
 */
function fixMalformedJson(text: string): string {
  // Fix 1: Ensure property names are double-quoted
  let fixed = text.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
  
  // Fix 2: Replace single quotes with double quotes (but not inside already double-quoted strings)
  // This is a simplified approach and might not work for all cases
  let inDoubleQuotes = false;
  let result = '';
  
  for (let i = 0; i < fixed.length; i++) {
    const char = fixed[i];
    const prevChar = i > 0 ? fixed[i-1] : '';
    
    if (char === '"' && prevChar !== '\\') {
      inDoubleQuotes = !inDoubleQuotes;
      result += char;
    } else if (char === "'" && !inDoubleQuotes) {
      result += '"';
    } else {
      result += char;
    }
  }
  
  // Fix 3: Fix trailing commas in arrays and objects
  result = result.replace(/,\s*([\]\}])/g, '$1');
  
  // Fix 4: Ensure boolean values are lowercase
  result = result.replace(/:\s*True\b/g, ':true').replace(/:\s*False\b/g, ':false');
  
  // Fix 5: Handle unquoted string values that should be quoted
  // This is a simplified approach and might not work for all cases
  result = result.replace(/:\s*([a-zA-Z][a-zA-Z0-9_]*)\s*([,\}])/g, ':"$1"$2');
  
  return result;
}

/**
 * Check if HTML content appears to be a React error page
 * @param html HTML content to check
 * @returns boolean indicating if this is a React error page
 */
function isReactErrorPage(html: string): boolean {
  if (!html) return false;
  
  // Check for common React error page patterns
  const hasReactCreateElement = html.includes('React.createElement');
  const hasErrorText = html.includes('Error:') || html.includes('stack:');
  const hasWebpackInternal = html.includes('webpack-internal:');
  const hasComponentStack = html.includes('The above error occurred in');
  
  // If it has multiple React error indicators, it's likely an error page
  let errorSignals = 0;
  if (hasReactCreateElement) errorSignals++;
  if (hasErrorText) errorSignals++;
  if (hasWebpackInternal) errorSignals++;
  if (hasComponentStack) errorSignals++;
  
  return errorSignals >= 2; // If 2 or more signals are present, it's likely an error page
}

export async function getGeminiSEOAduit(siteUrl: string, crawlData: any): Promise<any> {
  if (!GEMINI_API_KEY) {
    console.error('Gemini API key not set. Using fallback analysis.');
    return {
      htmlContent: `<h2>SEO Analysis for ${siteUrl}</h2><p>Unable to perform AI-powered analysis: API key not configured.</p>`,
      timestamp: new Date().toISOString(),
      error: 'API key not configured'
    };
  }
  
  // Check if we received a React error page instead of real website content
  if (crawlData.html && isReactErrorPage(crawlData.html)) {
    console.error('Detected React error page in crawl data. Refusing to analyze fake content.');
    return {
      error: true,
      message: 'The crawler received a React error page instead of the actual website content. This would result in fake analysis data.',
      recommendation: 'Please check your server logs for errors in the crawling process.'
    };
  }
  
  // Also check pages array if it exists
  if (crawlData.pages && Array.isArray(crawlData.pages)) {
    const reactErrorPages = crawlData.pages.filter(page => 
      page.html && isReactErrorPage(page.html)
    );
    
    if (reactErrorPages.length > 0) {
      console.error(`Detected ${reactErrorPages.length} React error pages in multi-page crawl data.`);
      // If ALL pages are React errors, abort
      if (reactErrorPages.length === crawlData.pages.length) {
        return {
          error: true,
          message: 'All crawled pages contain React error content instead of actual website content. This would result in fake analysis data.',
          recommendation: 'Please check your server logs for errors in the crawling process.'
        };
      }
      // Otherwise, just log a warning and continue with the valid pages
      console.warn(`Proceeding with analysis of ${crawlData.pages.length - reactErrorPages.length} valid pages.`);
    }
  }
  
  // Add verification metadata to help prevent hallucinations
  const verificationMetadata = {
    analysisTimestamp: new Date().toISOString(),
    dataVerification: {
      url: siteUrl,
      dataType: typeof crawlData,
      isBundle: typeof crawlData === 'object' && !Array.isArray(crawlData),
      htmlProvided: typeof crawlData === 'string' || (typeof crawlData === 'object' && crawlData.html),
      htmlSize: typeof crawlData === 'string' ? crawlData.length : 
               (typeof crawlData === 'object' && crawlData.html ? crawlData.html.length : 0),
      hasScreenshot: typeof crawlData === 'object' && !!crawlData.screenshot,
      pagesProvided: typeof crawlData === 'object' && Array.isArray(crawlData.crawledPages) ? 
                    crawlData.crawledPages.length : 
                    (typeof crawlData === 'object' && Array.isArray(crawlData.pages) ? crawlData.pages.length : 0),
      htmlSample: typeof crawlData === 'string' ? crawlData.substring(0, 100) : 
                (typeof crawlData === 'object' && crawlData.html ? crawlData.html.substring(0, 100) : 'No HTML provided')
    }
  };
  
  console.log('Verification metadata:', verificationMetadata);

  console.log(`Starting Gemini API call for ${siteUrl}...`);
  
  // Prepare crawl data for the prompt
  let crawlDataForPrompt = '';
  
  // Define interface for crawl summary
  interface CrawlSummary {
    title?: string;
    metaDescription?: string;
    h1Count?: number;
    h2Count?: number;
    wordCount?: number;
    imageCount?: number;
    imagesWithAlt?: number;
    linkCount?: number;
    internalLinks?: number;
    externalLinks?: number;
    pageCount?: number;
    crawledUrls?: number;
    sampleUrls?: string[];
    technicalIssues?: number;
    contentIssues?: number;
  }
  
  // Initialize with proper typing
  let crawlSummary: CrawlSummary = {};
  
  // Check if crawlData is already a string (HTML) or an object
  if (typeof crawlData === 'string') {
    // It's HTML, extract key information
    try {
      const cheerio = await import('cheerio');
      const $ = cheerio.load(crawlData);
      
      // Extract key SEO elements
      const title = $('title').text();
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      const h1s = $('h1').map((i, el) => $(el).text().trim()).get();
      const h2s = $('h2').map((i, el) => $(el).text().trim()).get().slice(0, 10); // Limit to 10 headings
      
      // Count images and check for alt text
      const images = $('img');
      const imagesWithAlt = $('img[alt]');
      
      // Count links and categorize them
      const allLinks = $('a');
      const internalLinks = $('a[href^="/"], a[href^="' + siteUrl + '"]');
      const externalLinks = allLinks.length - internalLinks.length;
      
      // Create a summary of the HTML content
      crawlSummary = {
        title,
        metaDescription,
        h1Count: h1s.length,
        h2Count: h2s.length,
        wordCount: $('body').text().split(/\s+/).length,
        imageCount: images.length,
        imagesWithAlt: imagesWithAlt.length,
        linkCount: allLinks.length,
        internalLinks: internalLinks.length,
        externalLinks: externalLinks
      };
      
      crawlDataForPrompt = `
Page Title: ${title}
Meta Description: ${metaDescription}
H1 Headings (${h1s.length}): ${h1s.join(', ')}
Sample H2 Headings (${h2s.length} total): ${h2s.join(', ')}
Total Word Count: ${crawlSummary.wordCount}
Images: ${images.length} (${imagesWithAlt.length} with alt text, ${images.length - imagesWithAlt.length} without)
Links: ${allLinks.length} (${internalLinks.length} internal, ${externalLinks} external)
`;
      
      console.log('Successfully extracted key SEO data from HTML for Gemini');
    } catch (error) {
      console.error('Error extracting data from HTML:', error);
      crawlDataForPrompt = 'Error extracting data from HTML. Raw HTML content is too large to include.';
    }
  } else {
    // It's an object, create a summary and then stringify it
    try {
      // Extract key information from the crawler data object
      const pages = crawlData.pages || [];
      const crawledUrls = crawlData.crawledUrls || [];
      
      crawlSummary = {
        pageCount: pages.length,
        crawledUrls: crawledUrls.length,
        sampleUrls: crawledUrls.slice(0, 5),
        technicalIssues: (crawlData.technicalIssues || []).length,
        contentIssues: (crawlData.contentIssues || []).length
      };
      
      // Create a summary string
      crawlDataForPrompt = `
Pages Analyzed: ${pages.length}
Crawled URLs: ${crawledUrls.length}
Sample URLs: ${crawlSummary.sampleUrls.join('\n')}
Technical Issues: ${crawlSummary.technicalIssues}
Content Issues: ${crawlSummary.contentIssues}
`;
      
      // Add the full data (limited to 500,000 chars to utilize the higher token limit of gemini-2.0-flash-lite)
      crawlDataForPrompt += `
Full crawl data (truncated):
` + 
        JSON.stringify(crawlData, null, 2).slice(0, 500000);
      
      console.log('Successfully created crawler data summary for Gemini');
    } catch (error) {
      console.error('Error processing crawl data:', error);
      crawlDataForPrompt = 'Error processing crawl data: ' + error.message;
    }
  }
  
  console.log(`Prompt length: ${BASE_PROMPT.length + siteUrl.length + crawlDataForPrompt.length} characters`);
  console.log('Crawl summary:', crawlSummary);
  
  // Make sure the prompt is loaded
  if (!promptLoaded) {
    console.log('Prompt not yet loaded, fetching now...');
    // Get the SEO audit prompt for this site
    BASE_PROMPT = getSEOAuditPrompt(siteUrl);
    promptLoaded = true;
  }
  // Update the prompt with the actual URL being audited
  const updatedBasePrompt = getPromptWithUpdatedUrl(BASE_PROMPT, siteUrl);
  
  // Compose the prompt with site URL, crawl data summary, and verification metadata
  const prompt = `${updatedBasePrompt}\n\nCrawl data summary:\n${crawlDataForPrompt}\n\nVERIFICATION METADATA (DO NOT FABRICATE BEYOND THIS DATA):\n${JSON.stringify(verificationMetadata, null, 2)}`;

  try {
    // Set a timeout of 10 minutes for the Gemini API call to allow for thorough analysis
    console.log('Sending request to Gemini API...');
    console.log(`Request timestamp: ${new Date().toISOString()}`);
    console.log(`Prompt length: ${prompt.length} characters`);
    console.log(`API URL: ${GEMINI_API_URL}`);
    console.log('API Key defined:', !!GEMINI_API_KEY);
    
    // Log the start time for performance tracking
    const startTime = Date.now();
    
    // Create a promise that rejects after 10 minutes
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Gemini API call timed out after 10 minutes'));
      }, 600000); // 600 second timeout (10 minutes)
    });
    
    // Race the API call against the timeout
    const response = await Promise.race([
      axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            { role: 'user', parts: [{ text: prompt }] }
          ]
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 600000 // 600 second timeout in axios as well (10 minutes)
        }
      ),
      timeoutPromise
    ]) as any; // Type assertion to avoid TypeScript errors
    
    // Log the response time
    const responseTime = Date.now() - startTime;
    console.log(`Gemini API response received in ${responseTime}ms`);
    console.log(`Response status: ${response.status} ${response.statusText}`);
    console.log(`Response headers:`, response.headers);
    
    // Add robust error handling for the response
    if (response.status !== 200) {
      console.error(`Gemini API error: ${response.status} ${response.statusText}`);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }
    
    // Get the text response from Gemini with robust error handling
    let text = '';
    
    try {
      // Check if we have a valid response structure
      if (response.data && response.data.candidates && 
          response.data.candidates[0] && 
          response.data.candidates[0].content && 
          response.data.candidates[0].content.parts && 
          response.data.candidates[0].content.parts[0]) {
        
        text = response.data.candidates[0].content.parts[0].text || '';
      } else {
        // If response structure is unexpected, try to extract useful information
        console.warn('Unexpected Gemini API response structure:', JSON.stringify(response.data).substring(0, 500));
        
        // Try to extract any text content we can find
        if (typeof response.data === 'string') {
          text = response.data;
        } else if (typeof response.data === 'object') {
          text = JSON.stringify(response.data);
        } else {
          throw new Error('Unable to extract text from Gemini response');
        }
      }
    } catch (error) {
      console.error('Error extracting text from Gemini response:', error);
      throw error;
    }
    console.log(`Gemini API call completed for ${siteUrl}. Response length: ${text.length} characters`);
    console.log(`First 100 characters of response: ${text.substring(0, 100)}...`);
    
    // Try to parse the response as JSON using our advanced repair utility
    try {
      console.log('Attempting to repair and parse JSON response...');
      
      // Use our new JSON repair utility to fix common issues
      const repairedJson = repairJson(text);
      console.log(`JSON repair completed. Length: ${repairedJson.length} characters`);
      
      // Try to parse the repaired JSON
      const jsonData = safeParseJson(repairedJson);
      
      // Check if we got back a string (parsing failed) or an object (parsing succeeded)
      if (typeof jsonData === 'string') {
        throw new Error('JSON parsing failed even after repair');
      }
      
      console.log('Successfully parsed Gemini response as JSON after repair');
      
      // Create a nicely formatted HTML representation for display
      const formattedHtml = `
        <div class="gemini-analysis">
          <h2>SEO Analysis for ${siteUrl}</h2>
          
          ${jsonData.overall?.summary ? `
            <div class="analysis-section">
              <h3>Overall Assessment</h3>
              <p>${jsonData.overall.summary}</p>
              ${jsonData.overall.score ? `<p><strong>Score:</strong> ${jsonData.overall.score}/100</p>` : ''}
            </div>
          ` : ''}
          
          ${jsonData.keyFindings?.length > 0 ? `
            <div class="analysis-section">
              <h3>Key Findings</h3>
              <ul>
                ${jsonData.keyFindings.map(finding => `<li>${finding}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${jsonData.quickWins?.length > 0 ? `
            <div class="analysis-section">
              <h3>Quick Wins</h3>
              <ul>
                ${jsonData.quickWins.map(win => `<li>${win}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${jsonData.technicalIssues?.length > 0 ? `
            <div class="analysis-section">
              <h3>Technical Issues</h3>
              <ul>
                ${jsonData.technicalIssues.map(issue => `
                  <li>
                    <strong>${issue.title}</strong> - ${issue.priority || 'Medium'} Priority
                    <p>${issue.description}</p>
                    ${issue.recommendation ? `<p><em>Recommendation:</em> ${issue.recommendation}</p>` : ''}
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${jsonData.contentIssues?.length > 0 ? `
            <div class="analysis-section">
              <h3>Content Issues</h3>
              <ul>
                ${jsonData.contentIssues.map(issue => `
                  <li>
                    <strong>${issue.title}</strong> - ${issue.priority || 'Medium'} Priority
                    <p>${issue.description}</p>
                    ${issue.recommendation ? `<p><em>Recommendation:</em> ${issue.recommendation}</p>` : ''}
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `;
      
      // Return both the parsed JSON and the formatted HTML content
      return {
        data: jsonData,
        htmlContent: formattedHtml,
        rawResponse: text, // Store the original response for debugging
        timestamp: new Date().toISOString(),
        crawlSummary
      };
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON even after repair:', parseError);
      console.log('Generating HTML from raw response...');
      
      // Clean the raw text directly instead of wrapping it
      let cleanedRawText = text.trim();
      // Remove potential leading ```html or ``` with surrounding whitespace/newlines
      cleanedRawText = cleanedRawText.replace(/^\s*```html[\s\n]*/i, '');
      cleanedRawText = cleanedRawText.replace(/^\s*```[\s\n]*/i, '');
      // Remove potential trailing ``` with surrounding whitespace/newlines
      cleanedRawText = cleanedRawText.replace(/[\s\n]*```\s*$/i, '');

      console.log('Cleaned raw response fallback (first 500 chars):', cleanedRawText.substring(0, 500));

      // Return the cleaned HTML content and the *original* raw response for debugging
      return {
        htmlContent: cleanedRawText, // Use the cleaned text
        rawResponse: text,          // Keep original raw text for reference if needed
        timestamp: new Date().toISOString(),
        crawlSummary,
        parseError: parseError.message
      };
    }
  } catch (err: any) {
    console.error(`Gemini audit call failed for ${siteUrl}:`, err?.response?.data || err);
    
    // Create a more user-friendly error message
    const errorMessage = err?.response?.data?.error?.message || err?.message || 'Unknown error';
    console.error('Error details:', errorMessage);
    
    // Check if this is a timeout error
    const isTimeout = errorMessage.includes('timeout') || 
                      errorMessage.includes('timed out') ||
                      err?.code === 'ECONNABORTED' ||
                      err?.name === 'AbortError';
    
    if (isTimeout) {
      console.log('Gemini API call timed out, providing fallback response');
      
      // Create a simple fallback SEO analysis with the HTML we've already extracted
      return {
        data: {
          url: siteUrl,
          timestamp: new Date().toISOString(),
          summary: 'SEO analysis was automatically generated due to API timeout.',
          technicalSEO: {
            score: 'N/A',
            issues: [
              {
                title: 'HTML Content Successfully Extracted',
                description: 'The crawler successfully extracted HTML content from the website.',
                recommendation: 'The HTML content is available for manual review.'
              }
            ]
          },
          contentAnalysis: {
            score: 'N/A',
            summary: 'Content analysis not available due to API timeout.'
          }
        },
        htmlContent: `
          <div class="success-container">
            <h2>SEO Analysis for ${siteUrl}</h2>
            <p>The AI-powered analysis timed out, but we've successfully extracted the HTML content from your website.</p>
            <p>HTML content size: ${verificationMetadata.dataVerification.htmlSize} bytes</p>
            <p>Pages crawled: ${verificationMetadata.dataVerification.pagesProvided}</p>
            <h3>Next Steps</h3>
            <ul>
              <li>Try running the analysis again</li>
              <li>If the timeout persists, consider analyzing fewer pages</li>
              <li>The HTML content has been successfully extracted and is available for review</li>
            </ul>
          </div>
        `,
        timestamp: new Date().toISOString(),
        crawlSummary
      };
    }
    
    // For other errors, return a generic error message
    return {
      htmlContent: `<div class="error-container">
        <h2>SEO Analysis Error</h2>
        <p>We encountered an error while analyzing ${siteUrl}:</p>
        <pre>${errorMessage}</pre>
        <p>Please try again later or contact support if the problem persists.</p>
      </div>`,
      timestamp: new Date().toISOString(),
      error: errorMessage,
      crawlSummary
    };
  }
}
