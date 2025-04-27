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
    throw new Error('Gemini API key not set.');
  }

  console.log(`Starting Gemini API call for ${siteUrl}...`);
  
  // Prepare crawl data for the prompt
  let crawlDataForPrompt = '';
  
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
      
      // Create a summary of the HTML content
      crawlDataForPrompt = `
Page Title: ${title}
Meta Description: ${metaDescription}
H1 Headings: ${h1s.join(', ')}
Sample H2 Headings: ${h2s.join(', ')}
Total Word Count: ${$('body').text().split(/\s+/).length}
Images: ${$('img').length} (${$('img[alt]').length} with alt text)
Links: ${$('a').length}
`;
      
      console.log('Successfully extracted key SEO data from HTML for Gemini');
    } catch (error) {
      console.error('Error extracting data from HTML:', error);
      crawlDataForPrompt = 'Error extracting data from HTML. Raw HTML content is too large to include.';
    }
  } else {
    // It's an object, stringify it
    try {
      crawlDataForPrompt = JSON.stringify(crawlData).slice(0, 8000);
    } catch (error) {
      console.error('Error stringifying crawl data:', error);
      crawlDataForPrompt = 'Error converting crawl data to string format.';
    }
  }
  
  console.log(`Prompt length: ${BASE_PROMPT.length + siteUrl.length + crawlDataForPrompt.length} characters`);
  
  // Compose the prompt with site URL and crawl data summary
  const prompt = `${BASE_PROMPT}\n\nTarget site: ${siteUrl}\n\nCrawl data summary:\n${crawlDataForPrompt}`;

  try {
    // Set a timeout of 2 minutes (120000ms) for the Gemini API call
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
    // Gemini returns a string, so parse it as JSON
    let text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log(`Gemini API call completed for ${siteUrl}. Response length: ${text.length} characters`);
    console.log(`First 100 characters of response: ${text.substring(0, 100)}...`);
    
    // Strip markdown formatting if present (```json and ```) 
    if (text.startsWith('```')) {
      console.log('Detected markdown code block, stripping formatting...');
      // Remove opening ```json or ``` and closing ```
      text = text.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '');
      console.log(`After stripping markdown, first 100 characters: ${text.substring(0, 100)}...`);
    }
    
    try {
      // First attempt: standard JSON parse
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Initial JSON parse error:', parseError);
      console.log('Attempting to fix malformed JSON...');
      
      try {
        // Second attempt: Try to fix common JSON issues
        const fixedJson = fixMalformedJson(text);
        console.log('Fixed JSON, attempting to parse again...');
        return JSON.parse(fixedJson);
      } catch (fixedParseError) {
        console.error('Failed to parse fixed JSON:', fixedParseError);
        
        // Third attempt: Use a more lenient JSON parser (Function constructor approach)
        try {
          console.log('Attempting to use lenient parsing...');
          // This is a last resort approach that can handle some malformed JSON
          // It's less secure but we're only parsing AI-generated content
          const sanitizedText = text
            .replace(/\n/g, '')
            .replace(/\r/g, '')
            .replace(/\t/g, '')
            .replace(/\\'/g, "'");
          
          // Use Function constructor to evaluate the JSON (with safety precautions)
          const result = new Function('return ' + sanitizedText)();
          console.log('Successfully parsed using lenient method');
          return result;
        } catch (lenientParseError) {
          console.error('All parsing methods failed:', lenientParseError);
          
          // Return the raw text as a structured object for display
          return {
            error: 'Failed to parse JSON from Gemini response after multiple attempts',
            errorDetails: parseError.message,
            rawTextPreview: text.substring(0, 1000) + '...',
            rawTextLength: text.length,
            errorPosition: (parseError as SyntaxError).message
          };
        }
      }
    }
  } catch (err: any) {
    console.error(`Gemini audit call failed for ${siteUrl}:`, err?.response?.data || err);
    console.error('Error details:', JSON.stringify(err?.response?.data || err, null, 2));
    throw err;
  }
}
