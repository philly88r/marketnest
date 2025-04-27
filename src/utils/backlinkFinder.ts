import axios from 'axios';
import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import { getGeminiSEOAduit } from './geminiAudit';

/**
 * Find backlinks to a target domain using search engine queries
 * This uses a technique similar to what SEO tools use, but implemented directly
 */
/**
 * Find backlinks using Playwright for search and Gemini for analysis
 */
export async function findBacklinksWithGemini(targetDomain: string, maxResults: number = 50): Promise<any> {
  console.log(`Finding backlinks with Gemini for domain: ${targetDomain}`);
  
  // Remove protocol and www if present
  const cleanDomain = targetDomain.replace(/^(https?:\/\/)?(?:www\.)?/, '');
  
  // Create a prompt for Gemini to find backlinks
  const prompt = `Find backlinks for the website ${cleanDomain}. Analyze the website's backlink profile, including:
  1. Top referring domains
  2. Domain authority of linking sites
  3. Anchor text distribution
  4. Follow vs nofollow links
  5. Quality assessment of backlinks`;
  
  try {
    // Use Gemini to analyze backlinks
    const geminiResponse = await getGeminiSEOAduit(targetDomain, { customPrompt: prompt });
    
    // Return the Gemini analysis
    return {
      analysis: geminiResponse,
      targetDomain: cleanDomain,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error using Gemini for backlink analysis:`, error);
    // Fall back to manual search if Gemini fails
    return { error: 'Gemini analysis failed', manualResults: await findBacklinks(targetDomain, maxResults) };
  }
}

/**
 * Find backlinks to a target domain using search engine queries and Playwright
 */
export async function findBacklinks(targetDomain: string, maxResults: number = 50): Promise<any[]> {
  console.log(`Finding backlinks for domain: ${targetDomain}`);
  
  // Remove protocol and www if present
  const cleanDomain = targetDomain.replace(/^(https?:\/\/)?(www\.)?/, '');
  
  // Create search queries that will find pages linking to the target domain
  const searchQueries = [
    `link:${cleanDomain}`,
    `inurl:${cleanDomain}`,
    `"${cleanDomain}"`,
    `site:*.*/* "${cleanDomain}"`,
  ];
  
  const backlinks: any[] = [];
  const processedUrls = new Set<string>();
  
  // Process each search query
  for (const query of searchQueries) {
    if (backlinks.length >= maxResults) break;
    
    try {
      // Use a proxy service or direct API if you have access
      // For demo, we'll use a simplified approach
      const searchResults = await performSearch(query, 10);
      
      // Process each search result
      for (const result of searchResults) {
        if (backlinks.length >= maxResults) break;
        
        const url = result.url;
        
        // Skip if we've already processed this URL
        if (processedUrls.has(url)) continue;
        processedUrls.add(url);
        
        // Skip if the URL is from the target domain itself
        if (url.includes(cleanDomain)) continue;
        
        try {
          // Check if the page actually links to the target domain
          const hasBacklink = await checkForBacklink(url, cleanDomain);
          
          if (hasBacklink) {
            // Get page title and other metadata
            const metadata = await getPageMetadata(url);
            
            backlinks.push({
              url: url,
              title: metadata.title || url,
              description: metadata.description || '',
              anchorText: metadata.anchorText || '',
              sourceAuthority: estimateDomainAuthority(url),
              discovered: new Date().toISOString()
            });
            
            console.log(`Found backlink: ${url}`);
          }
        } catch (error) {
          console.error(`Error checking backlink for ${url}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error performing search for query "${query}":`, error);
    }
  }
  
  return backlinks;
}

/**
 * Perform a search query and return results using Playwright
 */
async function performSearch(query: string, limit: number): Promise<any[]> {
  console.log(`Performing search for: ${query}`);
  
  const results: any[] = [];
  
  // Launch a headless browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Go to Bing (less restrictive than Google for scraping)
    await page.goto('https://www.bing.com/');
    
    // Type the search query and submit
    await page.fill('input[name="q"]', query);
    await page.press('input[name="q"]', 'Enter');
    
    // Wait for results to load
    await page.waitForSelector('.b_algo');
    
    // Extract search results
    const searchResults = await page.$$eval('.b_algo', (elements, maxResults) => {
      return elements.slice(0, maxResults).map(el => {
        const titleEl = el.querySelector('h2 a');
        const urlEl = el.querySelector('cite');
        const snippetEl = el.querySelector('.b_caption p');
        
        return {
          title: titleEl ? titleEl.textContent : '',
          url: titleEl ? titleEl.getAttribute('href') : '',
          snippet: snippetEl ? snippetEl.textContent : ''
        };
      });
    }, limit);
    
    results.push(...searchResults);
  } catch (error) {
    console.error('Error during search:', error);
  } finally {
    await browser.close();
  }
  
  return results;
}

/**
 * Check if a page contains a link to the target domain
 */
async function checkForBacklink(url: string, targetDomain: string): Promise<boolean> {
  try {
    console.log(`Checking for backlinks on: ${url}`);
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Check all links on the page
    let found = false;
    let anchorText = '';
    
    $('a').each((i, element) => {
      const href = $(element).attr('href');
      if (href && href.includes(targetDomain)) {
        found = true;
        anchorText = $(element).text().trim();
        return false; // Break the loop
      }
    });
    
    return found;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return false;
  }
}

/**
 * Get metadata from a page
 */
async function getPageMetadata(url: string): Promise<any> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    return {
      title: $('title').text().trim(),
      description: $('meta[name="description"]').attr('content') || '',
      anchorText: '' // This would be populated when checking for backlinks
    };
  } catch (error) {
    console.error(`Error fetching metadata for ${url}:`, error);
    return {};
  }
}

/**
 * Estimate domain authority based on various factors
 * This is a simplified version - real SEO tools use complex algorithms
 */
function estimateDomainAuthority(url: string): number {
  // Extract domain from URL
  const domain = new URL(url).hostname;
  
  // This is a placeholder. In production, you would:
  // 1. Check domain age
  // 2. Check number of indexed pages
  // 3. Check social signals
  // 4. Check other backlinks to this domain
  
  // For demo, return a random score between 10-90
  return Math.floor(Math.random() * 80) + 10;
}
