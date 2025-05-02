/**
 * AI-Powered HTML Cleanup Agent
 * 
 * This utility uses the Gemini API to intelligently clean up HTML content,
 * remove duplicate tables, and fix formatting issues in SEO audit reports.
 */
import { SEOAudit } from './seoService';
import axios from 'axios';

// Get API key from environment variables
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Use the flash-lite model which can handle larger inputs
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';

// Maximum content length for Gemini API (in characters)
const MAX_CONTENT_LENGTH = 30000;

/**
 * Process HTML content using Gemini AI to clean up and improve the report
 */
export async function cleanupHtmlReport(audit: SEOAudit): Promise<SEOAudit> {
  console.log('AI HTML Cleanup Agent: Starting cleanup process for audit', audit.id);
  
  // Get the HTML content from the report
  const geminiAudit = (audit.report as any)?.geminiAudit;
  if (!geminiAudit) {
    console.log('AI HTML Cleanup Agent: No geminiAudit found in report');
    return audit;
  }
  
  // Find the HTML content - check htmlContent first, then rawResponse
  let htmlContent = null;
  
  if (geminiAudit.htmlContent && typeof geminiAudit.htmlContent === 'string') {
    htmlContent = geminiAudit.htmlContent;
    console.log('AI HTML Cleanup Agent: Found HTML in geminiAudit.htmlContent');
  } else if (geminiAudit.rawResponse && typeof geminiAudit.rawResponse === 'string') {
    htmlContent = geminiAudit.rawResponse;
    console.log('AI HTML Cleanup Agent: Found HTML in geminiAudit.rawResponse');
  }
  
  if (!htmlContent) {
    console.log('AI HTML Cleanup Agent: No HTML content found in report');
    return audit;
  }
  
  try {
    // Check if Gemini API key is available
    if (!GEMINI_API_KEY) {
      console.error('AI HTML Cleanup Agent: GEMINI_API_KEY is not defined in environment variables');
      return audit;
    }
    
    // Use Gemini to intelligently clean up the HTML
    console.log('AI HTML Cleanup Agent: Calling Gemini API to clean HTML');
    const cleanedHtml = await processHtmlWithGemini(htmlContent, audit.url);
    
    if (!cleanedHtml) {
      console.log('AI HTML Cleanup Agent: Gemini returned empty content, using original');
      return audit;
    }
    
    // Update the audit with the cleaned HTML
    const timestamp = new Date().toISOString();
    const updatedAudit = {
      ...audit,
      cleanupTimestamp: timestamp,
      report: {
        ...(audit.report as any),
        geminiAudit: {
          ...geminiAudit,
          // Update both htmlContent and rawResponse with the cleaned HTML
          htmlContent: cleanedHtml,
          rawResponse: cleanedHtml,
          cleanedTimestamp: timestamp
        }
      }
    };
    
    console.log('AI HTML Cleanup Agent: Updated both htmlContent and rawResponse fields');
    
    console.log('AI HTML Cleanup Agent: Cleanup completed successfully');
    return updatedAudit;
  } catch (error) {
    console.error('AI HTML Cleanup Agent: Error cleaning up HTML', error);
    // If there's an error, return the original audit
    return audit;
  }
}

/**
 * Cleans and extracts HTML content, removing markdown, JSON wrappers, and excessive whitespace.
 * Handles specific patterns seen in AI-generated SEO audit reports.
 *
 * @param content The raw string content, potentially containing JSON, markdown, and HTML.
 * @returns The cleaned HTML string, or null if no valid HTML could be extracted.
 */
function cleanAndExtractHtml(content: string | null): string | null {
  if (!content) {
    console.log('AI HTML Cleanup Agent: No content provided.');
    return null;
  }

  console.log('AI HTML Cleanup Agent: Starting HTML cleanup process.');
  // Log the first 500 chars for debugging initial state
  console.log('AI HTML Cleanup Agent: Initial content (first 500 chars):', content.substring(0, 500));

  let processedContent = content;

  // 1. Handle potential JSON wrapper { "htmlContent": "..." }
  try {
    const trimmedContent = processedContent.trim();
    console.log('AI HTML Cleanup Agent: Attempting JSON match on trimmed content (first 100):', trimmedContent.substring(0, 100));
    // Use non-greedy match for content to better handle potential nested/escaped quotes within HTML
    const jsonMatch = trimmedContent.match(/^\{\s*"htmlContent"\s*:\s*"(.*)"\s*\}$/s);
    if (jsonMatch && jsonMatch[1]) {
        processedContent = jsonMatch[1];
        console.log('AI HTML Cleanup Agent: JSON match successful. Extracted content (first 100):', processedContent.substring(0, 100));
        // Decode escaped characters *within* the JSON string value
        processedContent = processedContent.replace(/\\n/g, '\n')
                                       .replace(/\\"/g, '"')
                                       .replace(/\\'/g, "'")
                                       .replace(/\\t/g, '\t')
                                       .replace(/\\\\/g, '\\');
         console.log('AI HTML Cleanup Agent: Decoded escaped characters from JSON string.');
    } else {
        console.log('AI HTML Cleanup Agent: JSON match failed or captured group empty. Regex result:', jsonMatch);
        // If not the specific JSON structure, still decode globally just in case
        processedContent = processedContent.replace(/\\n/g, '\n');
        console.log('AI HTML Cleanup Agent: Decoded escaped newlines globally (no JSON wrapper detected).');
    }
  } catch (error) {
    console.warn('AI HTML Cleanup Agent: Could not parse content as JSON, proceeding with raw content.', error);
    // Ensure global decoding even if JSON parsing failed
    processedContent = processedContent.replace(/\\n/g, '\n');
  }
  console.log('AI HTML Cleanup Agent: After JSON/Decode handling (first 500 chars):', processedContent.substring(0, 500));

  // 2. Remove Markdown code block syntax (```html ... ``` or variations)
  // Be aggressive: Remove ```html, ```, potentially with surrounding whitespace/newlines

  // Consolidated initial removal: target ```html or ``` at the start, allowing optional leading whitespace
  // and requiring at least one space/newline after the tag to consume the extra newlines.
  processedContent = processedContent.replace(/^\s*```(?:html)?(?:\s|\n)+/i, '');

  // Remove potential standalone ``` at the very end, requiring whitespace/newline before it
  processedContent = processedContent.replace(/(?:\s|\n)+```\s*$/i, '');
  // Replace ```html or ``` in the middle with a separator, requiring whitespace/newline before
  processedContent = processedContent.replace(/((?:\s|\n)+)```html(?:\s|\n)+/gi, '$1<hr class="ai-section-break">\n'); // Middle (```html)
  processedContent = processedContent.replace(/((?:\s|\n)+)```(?:\s|\n)+/g, '$1<hr class="ai-section-break">\n');     // Middle (generic ```)

  console.log('AI HTML Cleanup Agent: Removed markdown code block syntax.');
  console.log('AI HTML Cleanup Agent: After Markdown removal (first 500 chars):', processedContent.substring(0, 500));

  // 3. Collapse multiple consecutive newlines/whitespace lines globally
  // Replace 3+ newlines with exactly two newlines (paragraph break)
  processedContent = processedContent.replace(/(\s*\n){3,}/g, '\n\n');
  console.log('AI HTML Cleanup Agent: Collapsed excessive consecutive newlines.');
  console.log('AI HTML Cleanup Agent: After newline collapse (first 500 chars):', processedContent.substring(0, 500));

  // 4. Reduce excessive whitespace *before* common block elements
  // Ensure max 2 newlines before these tags
  processedContent = processedContent.replace(/(\s*\n){2,}(<(?:table|h[1-6]|div|p|ul|ol|section|article|header|footer|aside|nav)\b)/gi, '\n\n$2');
  console.log('AI HTML Cleanup Agent: Reduced whitespace before block elements.');

  // 5. Final trim of leading/trailing whitespace (including newlines)
  processedContent = processedContent.trim();
  console.log('AI HTML Cleanup Agent: Trimmed leading/trailing whitespace.');

  // 6. Check if the result contains any HTML tags as a basic validation
  if (!/<[^>]+>/.test(processedContent)) {
    console.warn('AI HTML Cleanup Agent: Processed content does not appear to contain HTML tags. Returning original content.');
    // Fallback strategy: return the globally decoded original content if cleaning removed everything meaningful
    return content.replace(/\\n/g, '\n').trim();
  }

  console.log('AI HTML Cleanup Agent: Preprocessing finished.');
  console.log('AI HTML Cleanup Agent: Final preprocessed content (first 500 chars):', processedContent.substring(0, 500));

  return processedContent;
}

/**
 * Process HTML content using Gemini API to intelligently clean it up
 */
async function processHtmlWithGemini(html: string, url: string): Promise<string | null> {
  try {
    // Pre-process the HTML to remove markdown code block syntax and fix formatting issues
    let preprocessedHtml = cleanAndExtractHtml(html);
    
    console.log('AI HTML Cleanup Agent: Starting preprocessing of HTML content');
    console.log('AI HTML Cleanup Agent: First 100 characters:', preprocessedHtml.substring(0, 100));
    
    // Check if content is too large for a single API call
    if (preprocessedHtml.length > MAX_CONTENT_LENGTH) {
      console.log(`AI HTML Cleanup Agent: Content is too large (${preprocessedHtml.length} chars), splitting into chunks`);
      return await processLargeHtml(preprocessedHtml, url);
    }
    
    // For smaller content, process in a single API call
    return await processSingleChunk(preprocessedHtml, url);
  } catch (error) {
    console.error('AI HTML Cleanup Agent: Error processing HTML', error);
    return null;
  }
}

/**
 * Split HTML content into chunks based on natural boundaries like table or div elements
 */
function splitHtmlIntoChunks(html: string, maxChunkSize: number): string[] {
  // If the content is already small enough, return it as a single chunk
  if (html.length <= maxChunkSize) {
    return [html];
  }

  const chunks: string[] = [];
  let currentChunk = '';
  
  // Try to split at natural boundaries like closing tags for tables, divs, or sections
  const htmlParts = html.split(/(<\/table>|<\/div>|<\/section>)/);
  
  for (let i = 0; i < htmlParts.length; i++) {
    const part = htmlParts[i];
    // If adding this part would exceed the max size, start a new chunk
    if (currentChunk.length + part.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = part;
    } else {
      currentChunk += part;
    }
    
    // If this part is a closing tag and we're at the end of a tag pair, consider ending the chunk
    if ((part === '</table>' || part === '</div>' || part === '</section>') && 
        currentChunk.length > maxChunkSize/2) {
      chunks.push(currentChunk);
      currentChunk = '';
    }
  }
  
  // Add any remaining content as the final chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  console.log(`AI HTML Cleanup Agent: Split HTML into ${chunks.length} chunks`);
  return chunks;
}

/**
 * Process a single chunk of HTML content
 */
async function processSingleChunk(html: string, url: string): Promise<string | null> {
  try {
    // Create the prompt for Gemini API
    const promptText = [
      'You are an expert HTML cleaner for SEO audit reports. Your task is to clean up the following HTML content from an SEO audit report for ' + url + '.',
      '',
      'Here\'s what you need to do:',
      '1. Remove all duplicate tables (tables with identical or very similar headers/content)',
      '2. Convert all HTML entities (like &lt;html&gt;) to their proper HTML representation',
      '3. Fix the large pre-formatted section containing Gemini analysis by:',
      '   - Removing the <pre> tags and style attributes',
      '   - Extracting the actual content and tables inside the pre section',
      '   - Converting it to proper HTML with appropriate divs and formatting',
      '4. Remove escape characters (\\n, \\t, \\r) but preserve paragraph structure',
      '5. Ensure all tables have proper structure with <thead> and <tbody>',
      '6. Wrap all tables in a div with class "table-container" and give tables class "seo-table"',
      '7. Preserve the structure of the SEO Audit sections (Executive Summary, Technical SEO, etc.)',
      '8. Fix any broken or improperly nested tags',
      '9. CRITICAL: Remove any remaining markdown code block syntax (```html) at the beginning or end',
      '10. CRITICAL: Standardize spacing: Collapse multiple consecutive newlines or whitespace lines so that there is at most one blank line separating block-level elements (like paragraphs, tables, headings, divs). Remove leading/trailing whitespace from lines and ensure consistent spacing between elements like tables.',
      '',
      'IMPORTANT:',
      '- Return ONLY the cleaned HTML content, with no explanations, markdown, or additional text',
      '- Preserve all the actual report content and data',
      '- Make sure the output is valid HTML that can be rendered in a browser',
      '- DO NOT include any markdown code block syntax (```html) in your response',
      '',
      'Here\'s the HTML content to clean:',
      html
    ].join('\n');

    // Log the prompt length for debugging
    console.log(`AI HTML Cleanup Agent: Prompt length is ${promptText.length} characters`);
    
    // Send the request to Gemini API
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [{
          parts: [{
            text: promptText
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192 // Ensure we get a complete response
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        }
      }
    );
    
    // Check if we have a valid response
    if (!response.data || !response.data.candidates || !response.data.candidates[0] || 
        !response.data.candidates[0].content || !response.data.candidates[0].content.parts || 
        !response.data.candidates[0].content.parts[0] || !response.data.candidates[0].content.parts[0].text) {
      console.error('AI HTML Cleanup Agent: Invalid response structure from Gemini API');
      console.error('Response:', JSON.stringify(response.data, null, 2));
      return null;
    }
    
    // Extract the generated content
    const generatedText = response.data.candidates[0].content.parts[0].text;
    
    if (!generatedText) {
      console.error('AI HTML Cleanup Agent: Gemini returned empty response');
      return null;
    }
    
    // Final cleanup of any remaining markdown or JSON artifacts
    let cleanedHtml = generatedText;
    
    // Remove any remaining markdown code block syntax
    cleanedHtml = cleanedHtml.replace(/^```html\s*\n/g, '').replace(/\n```\s*$/g, '');
    
    // Remove any JSON wrapper that might have been included in the response
    if (cleanedHtml.includes('"htmlContent":')) {
      try {
        const jsonMatch = cleanedHtml.match(/\{\s*"htmlContent":\s*"([\s\S]*?)"\s*\}/);
        if (jsonMatch && jsonMatch[1]) {
          cleanedHtml = jsonMatch[1].replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r');
        }
      } catch (e) {
        console.error('AI HTML Cleanup Agent: Error parsing JSON in response', e);
      }
    }
    
    console.log('AI HTML Cleanup Agent: Single chunk cleanup completed');
    return cleanedHtml;
  } catch (error) {
    console.error('AI HTML Cleanup Agent: Error calling Gemini API', error);
    return null;
  }
}

/**
 * Process large HTML content by splitting it into chunks
 */
async function processLargeHtml(html: string, url: string): Promise<string | null> {
  try {
    // Split the HTML into manageable chunks
    const chunks = splitHtmlIntoChunks(html, MAX_CONTENT_LENGTH - 2000); // Leave room for prompt text
    
    console.log(`AI HTML Cleanup Agent: Processing ${chunks.length} chunks of HTML`);
    
    // Process each chunk separately
    const processedChunks: string[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      console.log(`AI HTML Cleanup Agent: Processing chunk ${i+1} of ${chunks.length}`);
      
      // Add special instructions for chunk processing
      const chunkPrompt = [
        `You are an expert HTML cleaner for SEO audit reports. This is chunk ${i+1} of ${chunks.length} from an SEO audit report for ${url}.`,
        '',
        'Here\'s what you need to do:',
        '1. Fix any broken or improperly nested tags in this chunk',
        '2. Convert all HTML entities to their proper representation',
        '3. Remove escape characters (\\n, \\t, \\r) but preserve paragraph structure',
        '4. Ensure all tables have proper structure with <thead> and <tbody>',
        '5. Wrap all tables in a div with class "table-container" and give tables class "seo-table"',
        '6. CRITICAL: Do not remove any content, just clean up the formatting',
        '',
        'IMPORTANT:',
        '- Return ONLY the cleaned HTML content for this chunk',
        '- Do not add any explanations or markdown',
        '- Preserve all the actual report content and data',
        '- Make sure the output is valid HTML that can be combined with other chunks',
        '',
        'Here\'s the HTML chunk to clean:',
        chunks[i]
      ].join('\n');
      
      // Send the request to Gemini API
      try {
        const response = await axios.post(
          GEMINI_API_URL,
          {
            contents: [{
              parts: [{
                text: chunkPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.1,
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
        
        // Check if we have a valid response
        if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.error(`AI HTML Cleanup Agent: Invalid response for chunk ${i+1}`);
          // Use the original chunk as fallback
          processedChunks.push(chunks[i]);
          continue;
        }
        
        const cleanedChunk = response.data.candidates[0].content.parts[0].text;
        processedChunks.push(cleanedChunk);
        
        console.log(`AI HTML Cleanup Agent: Successfully processed chunk ${i+1}`);
      } catch (error) {
        console.error(`AI HTML Cleanup Agent: Error processing chunk ${i+1}`, error);
        // Use the original chunk as fallback
        processedChunks.push(chunks[i]);
      }
      
      // Add a small delay between API calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Combine the processed chunks
    const combinedHtml = processedChunks.join('');
    
    // Final cleanup pass on the combined HTML
    // This is a simplified prompt for the final cleanup
    const finalCleanupPrompt = [
      'You are an expert HTML cleaner for SEO audit reports. Your task is to do a final cleanup of the following HTML content.',
      '',
      'Focus only on these tasks:',
      '1. Remove any duplicate tables that might have been created during the chunking process.',
      '2. Fix any broken tags or structural issues introduced at the chunk boundaries.',
      '3. Ensure the overall HTML structure is valid.',
      '4. Standardize spacing: Collapse multiple consecutive newlines or whitespace lines so that there is at most one blank line separating block-level elements. Remove leading/trailing whitespace from lines.',
      '5. Remove any remaining markdown code block syntax.',
      '',
      'IMPORTANT:',
      '- Return ONLY the cleaned HTML content.',
      '- Do not remove any actual content',
      '',
      'Here\'s the HTML to clean:',
      combinedHtml.substring(0, MAX_CONTENT_LENGTH - 1000) // Ensure we stay within limits
    ].join('\n');
    
    try {
      // Only do a final cleanup if the combined HTML isn't too large
      if (combinedHtml.length < MAX_CONTENT_LENGTH - 1000) {
        console.log('AI HTML Cleanup Agent: Performing final cleanup on combined HTML');
        
        const finalResponse = await axios.post(
          GEMINI_API_URL,
          {
            contents: [{
              parts: [{
                text: finalCleanupPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.1,
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
        
        if (finalResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          const finalCleanedHtml = finalResponse.data.candidates[0].content.parts[0].text;
          console.log('AI HTML Cleanup Agent: Final cleanup completed successfully');
          return finalCleanedHtml;
        }
      }
    } catch (error) {
      console.error('AI HTML Cleanup Agent: Error in final cleanup', error);
      // Continue with the combined HTML if final cleanup fails
    }
    
    console.log('AI HTML Cleanup Agent: Returning combined HTML from chunks');
    return combinedHtml;
  } catch (error) {
    console.error('AI HTML Cleanup Agent: Error processing large HTML', error);
    return null;
  }
}
