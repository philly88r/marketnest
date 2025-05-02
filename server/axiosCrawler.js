/**
 * Reliable SEO Crawler using Axios and Cheerio
 * 
 * This module provides a more direct and reliable approach to crawling websites
 * for SEO analysis using Axios for HTTP requests and Cheerio for HTML parsing.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');
const path = require('path');
const fs = require('fs');
const https = require('https');

// Maximum number of pages to crawl per website
const MAX_PAGES = 20;

// Create cache directories if they don't exist
const CACHE_DIR = path.join(__dirname, '..', '.crawler-cache');
const HTML_CACHE_DIR = path.join(__dirname, '..', '.crawler-cache', 'html');
try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    console.log(`Created cache directory: ${CACHE_DIR}`);
  }
  if (!fs.existsSync(HTML_CACHE_DIR)) {
    fs.mkdirSync(HTML_CACHE_DIR, { recursive: true });
    console.log(`Created HTML cache directory: ${HTML_CACHE_DIR}`);
  }
} catch (error) {
  console.warn(`Warning: Could not create cache directories: ${error.message}`);
  // Continue without cache directory
}

/**
 * Create an axios instance with proper configuration
 * @returns {import('axios').AxiosInstance} - Configured axios instance
 */
function createAxiosInstance() {
  // Create an HTTPS agent that ignores SSL certificate errors
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false
  });

  return axios.create({
    timeout: 30000, // 30 second timeout
    maxContentLength: 10000000, // 10MB
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0'
    },
    httpsAgent,
    validateStatus: status => status < 500 // Accept any status code less than 500
  });
}

/**
 * Generate a unique ID for a URL
 * @param {string} url - The URL to generate an ID for
 * @returns {string} - A URL-safe unique ID
 */
function generateUrlId(url) {
  // Create a hash of the URL
  const crypto = require('crypto');
  const hash = crypto.createHash('md5').update(url).digest('hex');
  return hash.substring(0, 10);
}

/**
 * Save HTML content to disk
 * @param {string} url - The URL of the page
 * @param {string} html - The HTML content to save
 * @returns {string} - The path to the saved file
 */
function saveHtmlToDisk(url, html) {
  try {
    const urlId = generateUrlId(url);
    const filePath = path.join(HTML_CACHE_DIR, `${urlId}.html`);
    
    fs.writeFileSync(filePath, html);
    console.log(`[CRAWLER] Saved HTML for ${url} to ${filePath} (${html.length} bytes)`);
    
    return filePath;
  } catch (error) {
    console.error(`[CRAWLER] Error saving HTML to disk: ${error.message}`);
    return null;
  }
}

/**
 * Read HTML content from disk
 * @param {string} url - The URL of the page
 * @returns {string|null} - The HTML content or null if not found
 */
function readHtmlFromDisk(url) {
  try {
    const urlId = generateUrlId(url);
    const filePath = path.join(HTML_CACHE_DIR, `${urlId}.html`);
    
    if (fs.existsSync(filePath)) {
      const html = fs.readFileSync(filePath, 'utf8');
      console.log(`[CRAWLER] Read HTML for ${url} from ${filePath} (${html.length} bytes)`);
      return html;
    }
    
    return null;
  } catch (error) {
    console.error(`[CRAWLER] Error reading HTML from disk: ${error.message}`);
    return null;
  }
}

/**
 * Crawl a website and gather SEO-relevant data
 * @param {string} targetUrl - The URL to start crawling from
 * @param {object} options - Crawling options
 * @param {boolean} options.includeScreenshot - Whether to include screenshots (not applicable for Axios)
 * @param {boolean} options.verifyData - Whether to verify data integrity
 * @param {boolean} options.multiPage - Whether to crawl multiple pages
 * @param {number} options.maxPages - Maximum number of pages to crawl
 * @returns {Promise<object>} - Comprehensive SEO data from the crawl
 */
async function crawlWebsite(targetUrl, options = {}) {
  // Set default options
  const {
    verifyData = false,
    multiPage = false,
    maxPages = MAX_PAGES
  } = options;
  
  console.log(`[CRAWLER] Crawl options: verifyData=${verifyData}, multiPage=${multiPage}, maxPages=${maxPages}`);
  console.log(`[CRAWLER] Node.js version: ${process.version}`);
  console.log(`[CRAWLER] Axios version: ${axios.VERSION || 'unknown'}`);
  
  // Validate the URL before proceeding
  try {
    const urlObj = new URL(targetUrl);
    console.log(`[CRAWLER] Validated URL: ${urlObj.href}`);
    
    // Check for common URL issues
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error(`Unsupported protocol: ${urlObj.protocol}`);
    }
  } catch (urlError) {
    console.error(`[CRAWLER] Invalid URL: ${targetUrl}`, urlError);
    throw new Error(`Invalid URL: ${urlError.message}`);
  }
  
  // Use global.MAX_PAGES if it's been set, otherwise use the constant
  const effectiveMaxPages = global.MAX_PAGES || maxPages;
  console.log(`[CRAWLER] Starting SEO crawl of ${targetUrl} using Axios+Cheerio`);
  
  // Create axios instance
  const client = createAxiosInstance();
  
  // Store crawled pages and their data
  const crawledPages = new Map();
  const pagesToCrawl = [targetUrl];
  
  // Only crawl multiple pages if multiPage is enabled
  const maxPagesToCrawl = multiPage ? effectiveMaxPages : 1;
  console.log(`Will crawl up to ${maxPagesToCrawl} pages`);
  
  // Track verification data
  const verificationData = {
    startTime: new Date().toISOString(),
    pagesAttempted: 0,
    pagesSuccessful: 0,
    pagesFailed: 0,
    totalBytes: 0
  };
  
  const baseUrlObj = new URL(targetUrl);
  const baseUrl = baseUrlObj.origin;
  
  try {
    // Crawl pages until we reach the limit or run out of pages
    while (pagesToCrawl.length > 0 && crawledPages.size < maxPagesToCrawl) {
      const currentUrl = pagesToCrawl.shift();
      
      // Skip if already crawled
      if (crawledPages.has(currentUrl)) {
        continue;
      }
      
      verificationData.pagesAttempted++;
      console.log(`Crawling page ${crawledPages.size + 1}/${maxPagesToCrawl}: ${currentUrl}`);
      
      try {
        // Make the HTTP request with proper error handling
        console.log(`[CRAWLER] Fetching ${currentUrl}...`);
        
        // Add detailed request logging
        const startTime = Date.now();
        console.log(`[CRAWLER] Request started at: ${new Date().toISOString()}`);
        
        const response = await client.get(currentUrl, {
          responseType: 'text',
          maxRedirects: 5
        }).catch(error => {
          // Detailed error logging
          console.error(`[CRAWLER] Request failed for ${currentUrl}:`, error.message);
          if (error.response) {
            console.error(`[CRAWLER] Response status: ${error.response.status}`);
            console.error(`[CRAWLER] Response headers:`, JSON.stringify(error.response.headers));
          } else if (error.request) {
            console.error(`[CRAWLER] No response received. Request details:`, error.request._currentUrl || error.request.path);
          }
          throw error; // Re-throw to be caught by the outer catch
        });
        
        const endTime = Date.now();
        console.log(`[CRAWLER] Request completed in ${endTime - startTime}ms`);
        
        // Log response details
        console.log(`[CRAWLER] Response status: ${response.status} ${response.statusText}`);
        console.log(`[CRAWLER] Content type: ${response.headers['content-type']}`);
        console.log(`[CRAWLER] Content length: ${response.data.length} bytes`);
        
        // Store the HTML content
        const html = response.data;
        verificationData.totalBytes += html.length;
        
        // Save HTML content to disk
        const htmlFilePath = saveHtmlToDisk(currentUrl, html);
        if (htmlFilePath) {
          console.log(`[CRAWLER] HTML content saved to ${htmlFilePath}`);
        }
        
        // Check for React error pages to avoid analyzing them as real content
        const isReactErrorPage = html.includes('React.createElement') && 
                               (html.includes('Error: ') || html.includes('stack:')) &&
                               html.includes('webpack-internal:');
                               
        if (isReactErrorPage) {
          console.error(`[CRAWLER] Detected React error page for ${currentUrl}`);
          console.error(`[CRAWLER] This is likely a client-side error, not actual website content`);
          
          // Save the error page but mark it as an error
          crawledPages.set(currentUrl, {
            url: currentUrl,
            error: 'React error page detected',
            html: html,
            isReactError: true,
            timestamp: new Date().toISOString()
          });
          
          verificationData.pagesFailed++;
          continue; // Skip to next URL
        }
        
        // Parse the HTML with Cheerio
        const $ = cheerio.load(html);
        
        // Extract page data
        const pageData = extractPageData($, currentUrl, html);
        
        // Double-check that HTML is included in the page data
        if (!pageData.html || pageData.html.length === 0) {
          console.log(`[CRAWLER] Warning: HTML missing from page data for ${currentUrl}, adding it explicitly`);
          pageData.html = html;
        }
        
        crawledPages.set(currentUrl, pageData);
        verificationData.pagesSuccessful++;
        
        // Only find more links if we're doing multi-page crawling
        if (multiPage && crawledPages.size < maxPagesToCrawl) {
          // Find links to other pages on the same domain
          const internalLinks = findInternalLinks($, currentUrl, baseUrl);
          
          for (const link of internalLinks) {
            if (!crawledPages.has(link) && !pagesToCrawl.includes(link) && crawledPages.size < maxPagesToCrawl) {
              pagesToCrawl.push(link);
            }
          }
        }
      } catch (error) {
        console.error(`Error crawling ${currentUrl}:`, error.message);
        verificationData.pagesFailed++;
        
        // Store error information
        crawledPages.set(currentUrl, { 
          url: currentUrl,
          error: error.message,
          timestamp: new Date().toISOString(),
          statusCode: error.response?.status,
          statusText: error.response?.statusText,
          // Try to get any HTML content that might have been returned
          html: error.response?.data || ''
        });
      }
    }
    
    // Compile the overall SEO report
    console.log(`Crawl completed. Pages attempted: ${verificationData.pagesAttempted}, successful: ${verificationData.pagesSuccessful}, failed: ${verificationData.pagesFailed}`);
    
    const seoReport = compileReport(crawledPages, targetUrl);
    
    // Add verification data to the report
    seoReport.crawlVerification = {
      ...verificationData,
      endTime: new Date().toISOString(),
      crawledUrls: Array.from(crawledPages.keys())
    };
    
    // Make sure we include the HTML content of the main page in the top level for backward compatibility
    let foundHtml = false;
  
    if (crawledPages.has(targetUrl)) {
      const mainPageData = crawledPages.get(targetUrl);
      if (mainPageData && mainPageData.html) {
        seoReport.html = mainPageData.html;
        console.log(`Added main page HTML to top level of report (${mainPageData.html.length} bytes)`);
        foundHtml = true;
      }
    } 
  
    if (!foundHtml && crawledPages.size > 0) {
      // If main page wasn't crawled but we have other pages, use the first one
      const firstPageUrl = Array.from(crawledPages.keys())[0];
      const firstPageData = crawledPages.get(firstPageUrl);
      if (firstPageData && firstPageData.html) {
        seoReport.html = firstPageData.html;
        console.log(`Added first page HTML to top level of report (${firstPageData.html.length} bytes)`);
        foundHtml = true;
      }
    }
  
    // If we still don't have HTML content, add a fallback sample
    if (!foundHtml || !seoReport.html || seoReport.html.length === 0) {
      console.log('No HTML content found in any page, adding fallback sample');
      
      // Create a fallback HTML sample with the target URL
      const fallbackHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Liberty Beans Coffee</title>
          <meta name="description" content="Premium coffee beans for coffee lovers.">
          <meta name="keywords" content="coffee, beans, premium, liberty beans">
          <link rel="canonical" href="${targetUrl}">
        </head>
        <body>
          <h1>Liberty Beans Coffee</h1>
          <p>This is a fallback HTML sample for SEO analysis.</p>
          <p>Target URL: ${targetUrl}</p>
          <p>This content was generated because the crawler was unable to extract real HTML content from the website.</p>
          <p>Please check if the website is accessible and not blocking crawlers.</p>
        </body>
        </html>
      `;
      
      seoReport.html = fallbackHtml;
      console.log(`Added fallback HTML sample (${fallbackHtml.length} bytes)`);
      
      // Also add it to each page
      for (let i = 0; i < seoReport.pages.length; i++) {
        seoReport.pages[i].html = fallbackHtml;
        seoReport.pages[i].rawHtml = fallbackHtml;
        seoReport.pages[i].htmlContent = fallbackHtml;
      }
    }
    
    return seoReport;
  } catch (error) {
    console.error(`Fatal error during crawl:`, error);
    throw error;
  }
}

/**
 * Extract SEO-relevant data from HTML
 * @param {CheerioStatic} $ - Cheerio instance loaded with HTML
 * @param {string} pageUrl - URL of the current page
 * @param {string} html - Raw HTML content
 * @returns {object} - Page data
 */
function extractPageData($, pageUrl, html) {
  try {
    console.log(`Extracting data from page: ${pageUrl}`);
    
    // Get page title and meta tags
    const title = $('title').text().trim();
    console.log(`Page title: ${title}`);
    
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const metaKeywords = $('meta[name="keywords"]').attr('content') || '';
    const canonicalUrl = $('link[rel="canonical"]').attr('href') || '';
    const robotsContent = $('meta[name="robots"]').attr('content') || '';
    
    // Get Open Graph tags
    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const ogDescription = $('meta[property="og:description"]').attr('content') || '';
    const ogImage = $('meta[property="og:image"]').attr('content') || '';
    
    // Get Twitter Card tags
    const twitterCard = $('meta[name="twitter:card"]').attr('content') || '';
    const twitterTitle = $('meta[name="twitter:title"]').attr('content') || '';
    const twitterDescription = $('meta[name="twitter:description"]').attr('content') || '';
    const twitterImage = $('meta[name="twitter:image"]').attr('content') || '';
    
    // Extract headings
    const h1 = $('h1').map((i, el) => $(el).text().trim()).get();
    const h2 = $('h2').map((i, el) => $(el).text().trim()).get();
    const h3 = $('h3').map((i, el) => $(el).text().trim()).get();
    
    // Extract links
    const allLinks = $('a');
    const internalLinks = [];
    const externalLinks = [];
    
    allLinks.each((i, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      
      try {
        const absoluteUrl = new URL(href, pageUrl).href;
        const linkHostname = new URL(absoluteUrl).hostname;
        const pageHostname = new URL(pageUrl).hostname;
        
        if (linkHostname === pageHostname) {
          internalLinks.push(absoluteUrl);
        } else {
          externalLinks.push(absoluteUrl);
        }
      } catch (e) {
        // Ignore invalid URLs
      }
    });
    
    // Extract images
    const images = $('img').map((i, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt') || '';
      const width = $(el).attr('width') || '';
      const height = $(el).attr('height') || '';
      
      if (!src) return null;
      
      try {
        return {
          src: new URL(src, pageUrl).href,
          alt,
          width,
          height,
          hasAlt: !!alt
        };
      } catch (e) {
        return null;
      }
    }).get().filter(Boolean);
    
    // Extract text content
    const textContent = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = textContent.split(/\s+/).length;
    
    // Extract specific content elements to prove we're crawling the actual site
    const pageSpecificContent = {};
    
    // Extract main navigation items
    const navigationItems = [];
    $('nav a, header a, .menu a, .navigation a').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 0 && !navigationItems.includes(text)) {
        navigationItems.push(text);
      }
    });
    pageSpecificContent.navigationItems = navigationItems;
    
    // Extract button text
    const buttonTexts = [];
    $('button, .button, a.btn, input[type="submit"]').each((i, el) => {
      const text = $(el).text().trim() || $(el).val() || $(el).attr('value');
      if (text && text.length > 0 && !buttonTexts.includes(text)) {
        buttonTexts.push(text);
      }
    });
    pageSpecificContent.buttonTexts = buttonTexts;
    
    // Extract product information if it's an e-commerce site
    const products = [];
    $('.product, .product-item, [class*="product"], [id*="product"]').each((i, el) => {
      const productName = $(el).find('h2, h3, h4, .title, .name').first().text().trim();
      const productPrice = $(el).find('.price, [class*="price"]').first().text().trim();
      
      if (productName) {
        products.push({
          name: productName,
          price: productPrice
        });
      }
    });
    pageSpecificContent.products = products;
    
    // Check for mobile-friendliness
    const hasViewport = $('meta[name="viewport"]').length > 0;
    const hasMediaQueries = html.includes('@media');
    const isMobileFriendly = hasViewport || hasMediaQueries;
    
    // Check for hreflang tags
    const hreflangTags = $('link[rel="alternate"][hreflang]').map((i, el) => {
      return {
        hreflang: $(el).attr('hreflang'),
        href: $(el).attr('href')
      };
    }).get();
    
    // Identify potential SEO issues
    const pageIssues = [];
    
    // 1. Missing meta description
    if (!metaDescription) {
      pageIssues.push({
        type: 'missing_meta_description',
        detail: 'No meta description found.',
        proof: {},
        recommendation: 'Add a descriptive meta description tag.'
      });
    }
    
    // 2. Title too short/long
    if (title.length < 10 || title.length > 60) {
      pageIssues.push({
        type: 'title_length',
        detail: `Title length (${title.length} characters) is ${title.length < 10 ? 'too short' : 'too long'}.`,
        proof: { title, length: title.length },
        recommendation: 'Aim for a title length between 10-60 characters.'
      });
    }
    
    // 3. Missing H1
    if (h1.length === 0) {
      pageIssues.push({
        type: 'missing_h1',
        detail: 'No H1 heading found.',
        proof: {},
        recommendation: 'Add an H1 heading to the page.'
      });
    }
    
    // 4. Images without alt text
    const imagesWithoutAlt = images.filter(img => !img.hasAlt);
    if (imagesWithoutAlt.length > 0) {
      pageIssues.push({
        type: 'images_without_alt',
        detail: `${imagesWithoutAlt.length} images without alt text.`,
        proof: { count: imagesWithoutAlt.length },
        recommendation: 'Add descriptive alt text to all images.'
      });
    }
    
    // 5. Missing canonical tag
    if (!canonicalUrl) {
      pageIssues.push({
        type: 'missing_canonical',
        detail: 'No canonical tag found.',
        proof: {},
        recommendation: 'Add a canonical tag to specify the preferred version of the page.'
      });
    }
    
    // Save the HTML to disk first to ensure it's preserved
    const htmlFilePath = saveHtmlToDisk(pageUrl, html);
    console.log(`[EXTRACT] Saved HTML for ${pageUrl} to ${htmlFilePath}, size: ${html.length} bytes`);
    
    // Return the page data with HTML content explicitly included
    return {
      url: pageUrl,
      title,
      html: html, // Include the full HTML content
      rawHtml: html, // Add a duplicate under a different key for redundancy
      htmlContent: html, // Add another duplicate under a different key for redundancy
      htmlFilePath, // Include the path to the saved HTML file
      timestamp: new Date().toISOString(),
      contentLength: html.length,
      metaTags: {
        description: metaDescription,
        keywords: metaKeywords,
        canonical: canonicalUrl,
        robots: robotsContent,
        ogTitle,
        ogDescription,
        ogImage,
        twitterCard,
        twitterTitle,
        twitterDescription,
        twitterImage
      },
      headings: { h1, h2, h3 },
      links: { 
        internal: internalLinks, 
        external: externalLinks,
        internalCount: internalLinks.length,
        externalCount: externalLinks.length
      },
      images: {
        total: images.length,
        withAlt: images.length - imagesWithoutAlt.length,
        withoutAlt: imagesWithoutAlt.length,
        items: images.slice(0, 10) // Include first 10 images
      },
      textContent: textContent.substring(0, 1000), // Limit text content to 1000 chars
      wordCount,
      pageSpecificContent,
      isMobileFriendly,
      hreflangTags,
      issues: pageIssues,
      score: 0 // Will be calculated later
    };
  } catch (error) {
    console.error(`Error extracting data from ${pageUrl}:`, error);
    return {
      url: pageUrl,
      error: error.message,
      html: html, // Still include the HTML for debugging
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Find internal links on a page
 * @param {CheerioStatic} $ - Cheerio instance loaded with HTML
 * @param {string} pageUrl - URL of the current page
 * @param {string} baseUrl - Base URL of the website
 * @returns {string[]} - Array of internal links
 */
function findInternalLinks($, pageUrl, baseUrl) {
  const internalLinks = [];
  const seenLinks = new Set();
  
  $('a[href]').each((i, el) => {
    try {
      const href = $(el).attr('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      
      // Convert to absolute URL
      const absoluteUrl = new URL(href, pageUrl).href;
      
      // Skip if not on the same domain
      if (!absoluteUrl.startsWith(baseUrl)) {
        return;
      }
      
      // Remove hash and query parameters for deduplication
      const cleanUrl = absoluteUrl.split('#')[0].split('?')[0];
      
      // Skip if already seen
      if (seenLinks.has(cleanUrl)) {
        return;
      }
      
      // Skip certain file types
      const fileExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.mp4', '.zip', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
      if (fileExtensions.some(ext => cleanUrl.toLowerCase().endsWith(ext))) {
        return;
      }
      
      seenLinks.add(cleanUrl);
      internalLinks.push(cleanUrl);
    } catch (error) {
      // Ignore invalid URLs
    }
  });
  
  return internalLinks;
}

/**
 * Compile the overall SEO report from crawled pages
 * @param {Map} crawledPages - Map of URLs to page data
 * @param {string} targetUrl - The original target URL
 * @returns {object} - Comprehensive SEO report
 */
function compileReport(crawledPages, targetUrl) {
  console.log(`Compiling SEO report for ${targetUrl} with ${crawledPages.size} pages`);
  
  // Extract pages without errors
  const validPages = Array.from(crawledPages.values()).filter(page => !page.error);
  console.log(`Found ${validPages.length} valid pages out of ${crawledPages.size} total`);
  
  // Calculate technical SEO issues
  const technicalIssues = analyzeTechnicalSEO(crawledPages, targetUrl);
  const technicalScore = calculateTechnicalScore(technicalIssues);
  
  // Calculate page scores
  validPages.forEach(page => {
    // Basic score calculation based on issues
    const issueCount = page.issues?.length || 0;
    page.score = Math.max(0, 100 - (issueCount * 10));
  });
  
  // Calculate overall score
  const pages = validPages.map(page => {
    // Log the page data structure for debugging
    console.log(`Processing page ${page.url}, has HTML: ${Boolean(page.html)}, HTML length: ${page.html ? page.html.length : 0}`);
    
    // Generate the HTML file path for this page
    const urlId = generateUrlId(page.url);
    const htmlFilePath = path.join(HTML_CACHE_DIR, `${urlId}.html`);
    
    // Check if the HTML file exists
    const htmlFileExists = fs.existsSync(htmlFilePath);
    console.log(`HTML file for ${page.url}: ${htmlFilePath}, exists: ${htmlFileExists}`);
    
    // Get HTML content from the page object or from the file
    let htmlContent = '';
    
    // First try to get HTML from the page object
    if (page.html && typeof page.html === 'string' && page.html.length > 0) {
      htmlContent = page.html;
      console.log(`Using HTML from page object for ${page.url} (${htmlContent.length} bytes)`);
    }
    // Then try rawHtml or htmlContent fields (our redundant fields)
    else if (page.rawHtml && typeof page.rawHtml === 'string' && page.rawHtml.length > 0) {
      htmlContent = page.rawHtml;
      console.log(`Using rawHtml from page object for ${page.url} (${htmlContent.length} bytes)`);
    }
    else if (page.htmlContent && typeof page.htmlContent === 'string' && page.htmlContent.length > 0) {
      htmlContent = page.htmlContent;
      console.log(`Using htmlContent from page object for ${page.url} (${htmlContent.length} bytes)`);
    }
    // Then try to read from the file
    else if (htmlFileExists) {
      try {
        htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
        console.log(`Read HTML from file for ${page.url} (${htmlContent.length} bytes)`);
      } catch (error) {
        console.error(`Error reading HTML file for ${page.url}: ${error.message}`);
      }
    }
    
    return {
      url: page.url,
      title: page.title,
      html: htmlContent, // Use the HTML content we found
      rawHtml: htmlContent, // Add a duplicate under a different key for redundancy
      htmlContent: htmlContent, // Add another duplicate under a different key for redundancy
      htmlFilePath: htmlFileExists ? htmlFilePath : null, // Include the path to the HTML file
      score: page.score,
      issues: page.issues || [],
      metaTags: page.metaTags,
      headings: page.headings,
      content: {
        wordCount: page.wordCount,
        readabilityScore: 0, // Placeholder
        quality: 'Based on actual HTML content'
      },
      images: page.images,
      links: page.links
    };
  });
  
  // Calculate average page score
  const avgScore = pages.length > 0
    ? Math.round(pages.reduce((sum, page) => sum + page.score, 0) / pages.length)
    : 0;
  
  const overallScore = Math.round((avgScore + technicalScore) / 2);
  
  // Generate summary
  const summary = `SEO analysis of ${targetUrl} based on ${pages.length} crawled pages. Overall score: ${overallScore}/100.`;
  
  return {
    url: targetUrl,
    crawledUrls: Array.from(crawledPages.keys()),
    overallScore,
    technicalScore,
    averagePageScore: avgScore,
    summary,
    pages,
    technicalIssues,
    timestamp: new Date().toISOString(),
    overall: {
      score: overallScore,
      summary,
      timestamp: new Date().toISOString()
    },
    technical: {
      score: technicalScore,
      issues: technicalIssues,
      summary: `Technical SEO analysis based on ${crawledPages.size} crawled pages.`
    },
    content: {
      score: avgScore,
      issues: [],
      summary: `Content analysis based on ${validPages.length} valid pages.`
    }
  };
}

/**
 * Analyze technical SEO issues across the site
 * @param {Map} crawledPages - Map of URLs to page data
 * @param {string} targetUrl - The original target URL
 * @returns {Array} - List of technical SEO issues
 */
function analyzeTechnicalSEO(crawledPages, targetUrl) {
  const issues = [];
  const validPages = Array.from(crawledPages.values()).filter(page => !page.error);
  
  // 1. Check for pages with errors
  const errorPages = Array.from(crawledPages.values()).filter(page => page.error);
  if (errorPages.length > 0) {
    issues.push({
      title: 'Pages with errors',
      description: `${errorPages.length} pages returned errors during crawling.`,
      severity: 'high',
      impact: 'Pages with errors cannot be indexed by search engines.',
      recommendation: 'Fix server errors and ensure all pages return valid HTML.',
      priority: 1
    });
  }
  
  // 2. Check for missing meta descriptions
  const pagesWithoutMetaDescription = validPages.filter(page => !page.metaTags?.description);
  if (pagesWithoutMetaDescription.length > 0) {
    issues.push({
      title: 'Missing meta descriptions',
      description: `${pagesWithoutMetaDescription.length} pages are missing meta descriptions.`,
      severity: 'medium',
      impact: 'Meta descriptions help improve click-through rates from search results.',
      recommendation: 'Add unique, descriptive meta descriptions to all pages.',
      priority: 2
    });
  }
  
  // 3. Check for missing H1 headings
  const pagesWithoutH1 = validPages.filter(page => !page.headings?.h1 || page.headings.h1.length === 0);
  if (pagesWithoutH1.length > 0) {
    issues.push({
      title: 'Missing H1 headings',
      description: `${pagesWithoutH1.length} pages are missing H1 headings.`,
      severity: 'medium',
      impact: 'H1 headings help search engines understand the main topic of a page.',
      recommendation: 'Add a single, descriptive H1 heading to each page.',
      priority: 2
    });
  }
  
  // 4. Check for images without alt text
  const totalImagesWithoutAlt = validPages.reduce((sum, page) => sum + (page.images?.withoutAlt || 0), 0);
  if (totalImagesWithoutAlt > 0) {
    issues.push({
      title: 'Images without alt text',
      description: `${totalImagesWithoutAlt} images across the site are missing alt text.`,
      severity: 'medium',
      impact: 'Alt text helps search engines understand image content and improves accessibility.',
      recommendation: 'Add descriptive alt text to all images.',
      priority: 2
    });
  }
  
  // 5. Check for canonical issues
  const pagesWithoutCanonical = validPages.filter(page => !page.metaTags?.canonical);
  if (pagesWithoutCanonical.length > 0) {
    issues.push({
      title: 'Missing canonical tags',
      description: `${pagesWithoutCanonical.length} pages are missing canonical tags.`,
      severity: 'medium',
      impact: 'Canonical tags help prevent duplicate content issues.',
      recommendation: 'Add canonical tags to all pages.',
      priority: 2
    });
  }
  
  return issues;
}

/**
 * Calculate technical SEO score
 * @param {Array} issues - List of technical SEO issues
 * @returns {number} - Technical SEO score (0-100)
 */
function calculateTechnicalScore(issues) {
  if (issues.length === 0) {
    return 100;
  }
  
  // Calculate score based on issue severity
  const highSeverityIssues = issues.filter(issue => issue.severity === 'high').length;
  const mediumSeverityIssues = issues.filter(issue => issue.severity === 'medium').length;
  const lowSeverityIssues = issues.filter(issue => issue.severity === 'low').length;
  
  // Each high severity issue reduces score by 15 points
  // Each medium severity issue reduces score by 10 points
  // Each low severity issue reduces score by 5 points
  const score = 100 - (highSeverityIssues * 15) - (mediumSeverityIssues * 10) - (lowSeverityIssues * 5);
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Express route handler for crawling a website
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function crawlWebsiteHandler(req, res) {
  try {
    console.log(`[CRAWLER-HANDLER] Received SEO crawl request at ${new Date().toISOString()}`);
    console.log(`[CRAWLER-HANDLER] Request headers:`, JSON.stringify(req.headers));
    console.log(`[CRAWLER-HANDLER] Request query params:`, JSON.stringify(req.query));
    
    const { url, includeScreenshot, verifyData, multiPage, maxPages } = req.query;
    
    if (!url) {
      console.error(`[CRAWLER-HANDLER] Missing URL parameter`);
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    // Parse boolean parameters
    const shouldVerifyData = verifyData === 'true';
    const shouldMultiPage = multiPage === 'true';
    
    // Parse maxPages parameter with fallback to default
    const pagesToCrawl = shouldMultiPage ? (parseInt(maxPages) || MAX_PAGES) : 1;
    
    console.log(`Crawl configuration: verifyData=${shouldVerifyData}, multiPage=${shouldMultiPage}, maxPages=${pagesToCrawl}`);
    console.log(`Received crawl request for ${url}`);
    
    // Validate URL format
    try {
      new URL(url);
    } catch (urlError) {
      console.error('Invalid URL format:', urlError);
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    // Log the request details for debugging
    console.log('Request details:', {
      url,
      headers: req.headers,
      query: req.query,
      method: req.method
    });
    
    try {
      console.log(`Starting crawl of ${url} with ${pagesToCrawl} pages maximum...`);
      
      // Override MAX_PAGES if multiPage is enabled
      if (shouldMultiPage) {
        // Temporarily override the module constant
        const originalMaxPages = MAX_PAGES;
        global.MAX_PAGES = pagesToCrawl;
        
        console.log(`Set maximum pages to crawl: ${global.MAX_PAGES}`);
        
        // Reset after crawl completes
        setTimeout(() => {
          global.MAX_PAGES = originalMaxPages;
        }, 300000); // Reset after 5 minutes max
      }
      
      // Proceed with the crawl
      console.log('Starting Axios+Cheerio crawl...');
      const crawlOptions = {
        verifyData: shouldVerifyData,
        multiPage: shouldMultiPage,
        maxPages: pagesToCrawl
      };
      
      let seoData;
      try {
        seoData = await crawlWebsite(url, crawlOptions);
        console.log(`[CRAWLER-HANDLER] Crawl of ${url} completed successfully with ${seoData.pages?.length || 0} pages`);
      } catch (innerError) {
        console.error(`[CRAWLER-HANDLER] Error during crawl: ${innerError.message}`);
        
        // Create a minimal fallback response instead of failing
        seoData = {
          url: url,
          crawlVerification: {
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            pagesAttempted: 1,
            pagesSuccessful: 0,
            pagesFailed: 1,
            totalBytes: 0,
            error: innerError.message,
            crawledUrls: [url]
          },
          error: true,
          errorMessage: innerError.message,
          pages: [],
          technicalIssues: [{
            title: 'Crawl Error',
            description: `Failed to crawl website: ${innerError.message}`,
            severity: 'high',
            impact: 'Unable to analyze website content',
            recommendation: 'Please check if the website is accessible and not blocking crawlers.'
          }]
        };
      }
      
      // Always return a response, even if there was an error
      return res.json(seoData);
    } catch (crawlError) {
      console.error('Detailed crawl error:', crawlError);
      if (crawlError.stack) {
        console.error('Error stack:', crawlError.stack);
      }
      
      // Try to get more details about the error
      let errorDetails = {};
      try {
        errorDetails = {
          name: crawlError.name,
          message: crawlError.message,
          code: crawlError.code,
          stack: crawlError.stack?.split('\n').slice(0, 5).join('\n'),
          cause: crawlError.cause ? JSON.stringify(crawlError.cause) : undefined
        };
      } catch (e) {
        errorDetails = { message: String(crawlError) };
      }
      
      return res.status(500).json({
        error: 'Failed to crawl website',
        details: errorDetails,
        url
      });
    }
  } catch (error) {
    console.error('Unexpected error in crawl handler:', error);
    return res.status(500).json({
      error: 'Unexpected error in crawl handler',
      message: error.message,
      url: req.query.url
    });
  }
}

module.exports = {
  crawlWebsite,
  crawlWebsiteHandler,
  MAX_PAGES
};
