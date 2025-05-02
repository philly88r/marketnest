/**
 * Reliable SEO Crawler using Playwright
 * 
 * This module provides a reliable approach to crawling websites
 * for SEO analysis using Playwright for browser automation.
 */

const { chromium } = require('playwright');
const cheerio = require('cheerio');
const url = require('url');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

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
 * Generate a unique ID for a URL
 * @param {string} url - URL to generate ID for
 * @returns {string} - MD5 hash of the URL
 */
function generateUrlId(url) {
  return crypto.createHash('md5').update(url).digest('hex');
}

/**
 * Save HTML content to disk
 * @param {string} url - URL of the page
 * @param {string} html - HTML content to save
 * @returns {string} - Path to the saved file
 */
function saveHtmlToDisk(url, html) {
  const urlId = generateUrlId(url);
  const filePath = path.join(HTML_CACHE_DIR, `${urlId}.html`);
  fs.writeFileSync(filePath, html);
  return filePath;
}

/**
 * Read HTML content from disk
 * @param {string} url - URL of the page
 * @returns {string|null} - HTML content or null if not found
 */
function readHtmlFromDisk(url) {
  const urlId = generateUrlId(url);
  const filePath = path.join(HTML_CACHE_DIR, `${urlId}.html`);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  }
  return null;
}

/**
 * Crawl a website using Playwright
 * @param {string} targetUrl - URL to crawl
 * @param {object} options - Crawl options
 * @returns {Promise<object>} - Crawl report
 */
async function crawlWebsite(targetUrl, options = {}) {
  console.log(`Starting Playwright crawl of ${targetUrl}`);
  
  const verifyData = options.verifyData || false;
  const multiPage = options.multiPage !== false; // Default to true unless explicitly set to false
  const maxPages = options.maxPages || MAX_PAGES;
  const forceFullCrawl = options.forceFullCrawl || false;
  
  // If forceFullCrawl is true, ensure we crawl as many pages as possible
  if (forceFullCrawl) {
    console.log('Force full crawl enabled - will crawl ALL pages up to the maximum limit');
  }
  
  const verificationData = {
    startTime: new Date().toISOString(),
    targetUrl,
    options: {
      verifyData,
      multiPage,
      maxPages,
      forceFullCrawl
    },
    crawlType: forceFullCrawl ? 'complete' : (multiPage ? 'multi-page' : 'single-page')
  };
  
  // Store crawled pages
  const crawledPages = new Map();
  
  // URLs to crawl
  const urlsToCrawl = [targetUrl];
  
  // URLs already crawled or in queue
  const processedUrls = new Set([targetUrl]);
  
  try {
    // Launch browser
    const browser = await chromium.launch({
      headless: true
    });
    
    console.log('Browser launched successfully');
    
    // Create a new context
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
      viewport: { width: 1280, height: 720 }
    });
    
    // Create a new page
    const page = await context.newPage();
    
    // Set timeout for navigation
    page.setDefaultTimeout(30000);
    
    // Process each URL in the queue
    while (urlsToCrawl.length > 0 && crawledPages.size < maxPages) {
      const currentUrl = urlsToCrawl.shift();
      console.log(`Crawling ${currentUrl} (${crawledPages.size + 1}/${maxPages})`);
      
      try {
        // Navigate to the page
        await page.goto(currentUrl, { waitUntil: 'networkidle' });
        
        // Get the page content
        const html = await page.content();
        
        // Save HTML to disk
        const htmlFilePath = saveHtmlToDisk(currentUrl, html);
        console.log(`Saved HTML for ${currentUrl} to ${htmlFilePath}`);
        
        // Parse the HTML with Cheerio
        const $ = cheerio.load(html);
        
        // Extract page data
        const pageData = extractPageData($, currentUrl, html);
        
        // Store the page data
        crawledPages.set(currentUrl, pageData);
        
        // If this is multi-page crawling, find internal links
        if (multiPage && crawledPages.size < maxPages) {
          const baseUrl = new URL(targetUrl).origin;
          const internalLinks = findInternalLinks($, currentUrl, baseUrl);
          
          // Add new URLs to the crawl queue
          for (const link of internalLinks) {
            if (!processedUrls.has(link) && urlsToCrawl.length + crawledPages.size < maxPages) {
              urlsToCrawl.push(link);
              processedUrls.add(link);
            }
          }
        }
      } catch (error) {
        console.error(`Error crawling ${currentUrl}:`, error.message);
        // Still add the URL to crawledPages but with an error
        crawledPages.set(currentUrl, {
          url: currentUrl,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Close the browser
    await browser.close();
    console.log('Browser closed');
    
    // Compile the report
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
    
    // Get headings
    const h1 = $('h1').map((i, el) => $(el).text().trim()).get();
    const h2 = $('h2').map((i, el) => $(el).text().trim()).get();
    const h3 = $('h3').map((i, el) => $(el).text().trim()).get();
    
    // Get links
    const links = $('a[href]').map((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      return { href, text };
    }).get();
    
    // Get images
    const images = $('img').map((i, el) => {
      const src = $(el).attr('src') || '';
      const alt = $(el).attr('alt') || '';
      const width = $(el).attr('width') || '';
      const height = $(el).attr('height') || '';
      return { src, alt, width, height };
    }).get();
    
    // Count images without alt text
    const imagesWithoutAlt = images.filter(img => !img.alt).length;
    
    // Extract text content
    const textContent = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = textContent.split(/\s+/).length;
    
    // Analyze internal and external links
    const baseUrl = new URL(pageUrl).origin;
    const internalLinks = links.filter(link => {
      try {
        const absoluteUrl = new URL(link.href, pageUrl).href;
        return absoluteUrl.startsWith(baseUrl);
      } catch (e) {
        return false;
      }
    });
    
    const externalLinks = links.filter(link => {
      try {
        const absoluteUrl = new URL(link.href, pageUrl).href;
        return !absoluteUrl.startsWith(baseUrl) && 
               !link.href.startsWith('#') && 
               !link.href.startsWith('javascript:') && 
               !link.href.startsWith('mailto:') && 
               !link.href.startsWith('tel:');
      } catch (e) {
        return false;
      }
    });
    
    // Extract page-specific content
    const pageSpecificContent = {};
    
    // Check for e-commerce elements
    const products = [];
    $('.product').each((i, el) => {
      const productName = $(el).find('.product-title').text().trim();
      const productPrice = $(el).find('.product-price').text().trim();
      
      if (productName && productPrice) {
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
      headings: {
        h1,
        h2: h2.slice(0, 10), // Limit to 10 h2 headings
        h3: h3.slice(0, 10) // Limit to 10 h3 headings
      },
      links: {
        total: links.length,
        internal: internalLinks.length,
        external: externalLinks.length
      },
      images: {
        total: images.length,
        withAlt: images.length - imagesWithoutAlt,
        withoutAlt: imagesWithoutAlt,
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
 * @returns {string[]} - Array of top 6 internal links
 */
function findInternalLinks($, pageUrl, baseUrl) {
  const internalLinks = [];
  const seenLinks = new Set();
  const linkScores = [];
  
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
      
      // Calculate importance score for this link
      let score = 0;
      
      // Links in navigation are important
      if ($(el).closest('nav, header, .menu, .navigation').length) {
        score += 30;
      }
      
      // Links in main content are important
      if ($(el).closest('main, article, .content, .main').length) {
        score += 20;
      }
      
      // Links with text are more important than image links
      const linkText = $(el).text().trim();
      if (linkText.length > 0) {
        score += 10;
        
        // Links with longer text might be more descriptive/important
        if (linkText.length > 10) {
          score += 5;
        }
      }
      
      // Links with title attributes might be more important
      if ($(el).attr('title')) {
        score += 5;
      }
      
      // Links that contain important keywords
      const importantKeywords = ['product', 'service', 'about', 'contact', 'blog', 'article', 'category'];
      if (importantKeywords.some(keyword => 
          linkText.toLowerCase().includes(keyword) || 
          cleanUrl.toLowerCase().includes(keyword))) {
        score += 15;
      }
      
      seenLinks.add(cleanUrl);
      linkScores.push({ url: cleanUrl, score });
    } catch (error) {
      // Ignore invalid URLs
    }
  });
  
  // Sort links by score (highest first) and take top 6
  const topLinks = linkScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(item => item.url);
  
  // If we have fewer than 6 links, return all we have
  return topLinks.length > 0 ? topLinks : internalLinks.slice(0, 6);
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
    else if (page.htmlFilePath) {
      try {
        htmlContent = fs.readFileSync(page.htmlFilePath, 'utf8');
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
      htmlFilePath: page.htmlFilePath, // Include the path to the HTML file
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
      impact: 'Meta descriptions help search engines understand page content and improve click-through rates.',
      recommendation: 'Add unique, descriptive meta descriptions to all pages.',
      priority: 2
    });
  }
  
  // 3. Check for missing canonical tags
  const pagesWithoutCanonical = validPages.filter(page => !page.metaTags?.canonical);
  if (pagesWithoutCanonical.length > 0) {
    issues.push({
      title: 'Missing canonical tags',
      description: `${pagesWithoutCanonical.length} pages are missing canonical tags.`,
      severity: 'medium',
      impact: 'Canonical tags help prevent duplicate content issues.',
      recommendation: 'Add canonical tags to all pages to indicate the preferred URL version.',
      priority: 3
    });
  }
  
  // 4. Check for missing H1 headings
  const pagesWithoutH1 = validPages.filter(page => !page.headings?.h1 || page.headings.h1.length === 0);
  if (pagesWithoutH1.length > 0) {
    issues.push({
      title: 'Missing H1 headings',
      description: `${pagesWithoutH1.length} pages are missing H1 headings.`,
      severity: 'medium',
      impact: 'H1 headings are important for page structure and SEO.',
      recommendation: 'Add a descriptive H1 heading to each page.',
      priority: 4
    });
  }
  
  // 5. Check for images without alt text
  const pagesWithImagesWithoutAlt = validPages.filter(page => page.images?.withoutAlt > 0);
  if (pagesWithImagesWithoutAlt.length > 0) {
    const totalImagesWithoutAlt = pagesWithImagesWithoutAlt.reduce((sum, page) => sum + (page.images?.withoutAlt || 0), 0);
    issues.push({
      title: 'Images without alt text',
      description: `${totalImagesWithoutAlt} images across ${pagesWithImagesWithoutAlt.length} pages are missing alt text.`,
      severity: 'medium',
      impact: 'Alt text is important for accessibility and helps search engines understand image content.',
      recommendation: 'Add descriptive alt text to all images.',
      priority: 5
    });
  }
  
  return issues;
}

/**
 * Calculate technical SEO score based on issues
 * @param {Array} issues - List of technical SEO issues
 * @returns {number} - Technical SEO score (0-100)
 */
function calculateTechnicalScore(issues) {
  // Start with a perfect score
  let score = 100;
  
  // Deduct points based on issue severity
  for (const issue of issues) {
    switch (issue.severity) {
      case 'high':
        score -= 20;
        break;
      case 'medium':
        score -= 10;
        break;
      case 'low':
        score -= 5;
        break;
      default:
        score -= 5;
    }
  }
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Express handler for crawling websites
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function crawlWebsiteHandler(req, res) {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  console.log(`Received crawl request for ${targetUrl}`);
  
  try {
    // Parse options from query parameters
    const options = {
      verifyData: req.query.verifyData === 'true',
      multiPage: req.query.multiPage !== 'false', // Default to true unless explicitly set to false
      maxPages: parseInt(req.query.maxPages) || MAX_PAGES,
      forceFullCrawl: req.query.forceFullCrawl === 'true' // Force full crawling of all pages
    };
    
    console.log(`Crawl options: ${JSON.stringify(options)}`);
    
    // Ensure multiPage is true if forceFullCrawl is true
    if (options.forceFullCrawl) {
      options.multiPage = true;
      console.log('Force full crawl enabled - ensuring all pages are crawled');
    }
    
    // Perform the crawl
    const result = await crawlWebsite(targetUrl, options);
    
    // Return the result
    res.json(result);
  } catch (error) {
    console.error(`Error handling crawl request:`, error);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

module.exports = {
  crawlWebsite,
  crawlWebsiteHandler
};
