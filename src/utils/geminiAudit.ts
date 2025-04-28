import axios from 'axios';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-03-25:generateContent';

if (!GEMINI_API_KEY) {
  console.error('WARNING: REACT_APP_GEMINI_API_KEY is not set in environment variables! Gemini audit will not work.');
}

// The extremely detailed audit prompt template (as provided by the user)
const BASE_PROMPT = `Analyze the website thoroughly, crawling multiple pages to provide a comprehensive audit. Include:

1. Page-by-page analysis: Examine at least 20-25 individual pages (including homepage, product pages, category pages, blog posts, and key landing pages) and provide specific issues and recommendations for each.

2. Technical SEO: Evaluate crawlability, indexability, site structure, SSL, robots.txt, sitemap.xml, server configuration, mobile-friendliness, JavaScript rendering, internationalization, duplicate content, canonicalization, structured data implementation, and advanced technical aspects such as pagination, infinite scroll, and faceted navigation.

3. On-page SEO: Analyze meta tags, headings, URL structure, internal linking, content layout, and HTML quality for each page. Provide detailed assessment of title tags, meta descriptions, canonical tags, hreflang tags, robots meta directives, Open Graph tags, and Twitter Card implementation.

4. Performance: Assess page speed, Core Web Vitals (LCP, FID, CLS, INP), resource optimization, server performance, caching implementation, resource preloading, and advanced performance aspects such as HTTP/2, HTTP/3, and service worker implementation.

5. Content quality: Evaluate content depth, relevance, readability, keyword usage, content freshness, topic clustering, entity optimization, E-A-T signals, multimedia usage, and identify content gaps. Analyze sentiment, readability scores, user engagement metrics, and provide content strategy recommendations.

6. Mobile optimization: Assess responsive design, mobile usability, touch-friendliness, mobile-specific configurations, and mobile SERP appearance. Evaluate viewport configuration, tap target sizes, font sizes, content overflow, popup implementation, and interstitial compliance.

7. Backlink profile: Analyze backlink quality, quantity, diversity, anchor text distribution, toxic links, and identify link building opportunities. Provide detailed assessment of domain authority, linking domain relevance, and competitive comparison.

8. Keyword targeting: Identify current keyword rankings, keyword cannibalization issues, new keyword opportunities, and competitor keyword analysis. Analyze keyword mapping, user intent coverage, seasonality, and provide keyword strategy recommendations.

9. Competitive analysis: Compare with direct competitors to identify advantages, gaps, market opportunities, and provide competitive strategy recommendations. Analyze competitor content strategies, technical implementations, backlink profiles, and keyword targeting.

10. Local SEO: Assess Google Business Profile optimization, citation consistency and coverage, local keyword targeting, location-specific content, and local backlink strategy.

11. E-commerce SEO: Evaluate product page optimization, category page structure, product hierarchy, cart and checkout process, and on-site search implementation.

12. Social media integration: Assess social profile optimization, social sharing implementation, social engagement strategy, and influencer collaboration opportunities.

13. Security and privacy: Evaluate SSL implementation, security headers, content security policies, vulnerability remediation, and privacy compliance.

14. Analytics and measurement: Assess analytics implementation, Google Search Console setup, conversion tracking, user behavior monitoring, and tag management.

15. Implementation plan: Provide prioritized recommendations, quick wins, implementation roadmap, resource requirements, and measurement plan.

For each issue, provide EXTREMELY SPECIFIC details, HIGHLY ACTIONABLE recommendations, severity levels (high/medium/low), priority ranking (1-5), and detailed estimated impact. Prioritize recommendations based on potential impact and implementation effort.

YOUR ANALYSIS SHOULD BE EXTRAORDINARILY COMPREHENSIVE - far more detailed than a typical SEO audit. Include extensive technical analysis, content evaluation, competitive insights, and page-by-page breakdown with specific issues and fixes.

Each section should contain MAXIMUM DETAIL - do not summarize or abbreviate your findings. For every issue found, provide extensive context, impact assessment, and step-by-step remediation instructions.

CRITICALLY IMPORTANT: You MUST include SPECIFIC EVIDENCE that you actually crawled the site:
1. Include EXACT URLs of at least 20-25 pages you analyzed
2. Quote ACTUAL meta tags, headings, and content from these pages
3. Provide SPECIFIC content issues found on individual pages (word count, keyword usage, etc.)
4. Include DETAILED page-specific recommendations
5. Reference REAL competitors in the same industry

IMPORTANT: Your response must be VALID JSON only. Do not include any explanatory text, markdown formatting, or code blocks. The response should parse correctly with JSON.parse().

MAKE THIS THE MOST DETAILED AND VALUABLE SEO AUDIT POSSIBLE - INCLUDE EVERYTHING AN SEO EXPERT WOULD WANT TO KNOW.`;

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

export async function getGeminiSEOAduit(siteUrl: string, crawlData: any): Promise<any> {
  if (!GEMINI_API_KEY) {
    console.error('Gemini API key not set. Using fallback analysis.');
    return {
      htmlContent: `<h2>SEO Analysis for ${siteUrl}</h2><p>Unable to perform AI-powered analysis: API key not configured.</p>`,
      timestamp: new Date().toISOString(),
      error: 'API key not configured'
    };
  }

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
      
      // Add the full data (limited to 8000 chars to avoid token limits)
      crawlDataForPrompt += '\n\nFull crawl data (truncated):\n' + 
        JSON.stringify(crawlData, null, 2).slice(0, 8000);
      
      console.log('Successfully created crawler data summary for Gemini');
    } catch (error) {
      console.error('Error processing crawl data:', error);
      crawlDataForPrompt = 'Error processing crawl data: ' + error.message;
    }
  }
  
  console.log(`Prompt length: ${BASE_PROMPT.length + siteUrl.length + crawlDataForPrompt.length} characters`);
  console.log('Crawl summary:', crawlSummary);
  
  // Compose the prompt with site URL and crawl data summary
  const prompt = `${BASE_PROMPT}\n\nTarget site: ${siteUrl}\n\nCrawl data summary:\n${crawlDataForPrompt}`;

  try {
    // Set a timeout of 10 minutes (600000ms) for the Gemini API call
    console.log('Sending request to Gemini API...');
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          { role: 'user', parts: [{ text: prompt }] }
        ]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 600000 // 10 minute timeout
      }
    );
    
    // Get the text response from Gemini
    let text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log(`Gemini API call completed for ${siteUrl}. Response length: ${text.length} characters`);
    console.log(`First 100 characters of response: ${text.substring(0, 100)}...`);
    
    // Try to parse the response as JSON first (since our prompt asks for JSON)
    try {
      // Fix common JSON issues
      const fixedText = fixMalformedJson(text);
      const jsonData = JSON.parse(fixedText);
      console.log('Successfully parsed Gemini response as JSON');
      
      // Return both the parsed JSON and the HTML content
      return {
        data: jsonData,
        htmlContent: `<pre>${JSON.stringify(jsonData, null, 2)}</pre>`,
        timestamp: new Date().toISOString(),
        crawlSummary
      };
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.log('Returning raw HTML content instead');
      
      // Return the HTML content directly
      return {
        htmlContent: text,
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
    
    // Return an error object that can be displayed to the user
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
