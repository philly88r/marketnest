/**
 * SEO Crawler using Playwright
 * 
 * This module provides functionality to crawl websites for SEO analysis
 * using Playwright for accurate rendering and data extraction.
 */

require('dotenv').config();
const { chromium } = require('playwright');
const cheerio = require('cheerio');
const url = require('url');
const path = require('path');
const fs = require('fs');

// Maximum number of pages to crawl per website
const MAX_PAGES = 15;

// Browser executable path for Windows (if needed)
const CHROME_PATH = process.env.CHROME_PATH || null;

// Create a browser cache directory if it doesn't exist
const BROWSER_CACHE_DIR = path.join(__dirname, '..', '.browser-cache');
if (!fs.existsSync(BROWSER_CACHE_DIR)) {
  fs.mkdirSync(BROWSER_CACHE_DIR, { recursive: true });
}

// Don't automatically install browsers on module load as it can cause issues
// Instead, we'll check and install when needed in the crawlWebsiteHandler
let browsersChecked = false;

/**
 * Crawl a website and gather SEO-relevant data
 * @param {string} targetUrl - The URL to start crawling from
 * @param {object} options - Crawling options
 * @param {boolean} options.includeScreenshot - Whether to include screenshots
 * @param {boolean} options.verifyData - Whether to verify data integrity
 * @param {boolean} options.multiPage - Whether to crawl multiple pages
 * @param {number} options.maxPages - Maximum number of pages to crawl
 * @returns {Promise<object>} - Comprehensive SEO data from the crawl
 */
async function crawlWebsite(targetUrl, options = {}) {
  // Set default options
  const {
    includeScreenshot = false,
    verifyData = false,
    multiPage = false,
    maxPages = MAX_PAGES
  } = options;
  
  console.log(`Crawl options: includeScreenshot=${includeScreenshot}, verifyData=${verifyData}, multiPage=${multiPage}, maxPages=${maxPages}`);
  
  // Use global.MAX_PAGES if it's been set, otherwise use the constant
  const effectiveMaxPages = global.MAX_PAGES || maxPages;
  console.log(`Starting SEO crawl of ${targetUrl}`);
  
  let browser;
  try {
    // Try to launch browser with more robust error handling
    // First try with minimal options
    try {
      console.log('Attempting to launch browser with minimal options');
      browser = await chromium.launch({ headless: true });
    } catch (minimalError) {
      console.error('Failed to launch with minimal options:', minimalError);
      
      // Try with more specific options
      const launchOptions = { 
        headless: true,
        executablePath: CHROME_PATH,
        userDataDir: BROWSER_CACHE_DIR,
        // Add these options to help with common issues
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      };
      
      console.log('Launching browser with fallback options:', JSON.stringify(launchOptions, null, 2));
      browser = await chromium.launch(launchOptions);
    }
  } catch (error) {
    console.error('All browser launch attempts failed:', error);
    throw new Error(`Failed to launch browser: ${error.message}`);
  }
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });
  
  // Store crawled pages and their data
  const crawledPages = new Map();
  const pagesToCrawl = [targetUrl];
  
  // Only crawl multiple pages if multiPage is enabled
  const maxPagesToCrawl = multiPage ? effectiveMaxPages : 1;
  console.log(`Will crawl up to ${maxPagesToCrawl} pages`);
  
  // Track verification data if requested
  const verificationData = {
    startTime: new Date().toISOString(),
    pagesAttempted: 0,
    pagesSuccessful: 0,
    pagesFailed: 0,
    totalBytes: 0,
    hasScreenshots: includeScreenshot
  };
  const baseUrlObj = new URL(targetUrl);
  const baseUrl = baseUrlObj.origin;
  
  try {
    // Crawl pages until we reach the limit or run out of pages
    while (pagesToCrawl.length > 0 && crawledPages.size < MAX_PAGES) {
      const currentUrl = pagesToCrawl.shift();
      
      // Skip if already crawled
      if (crawledPages.has(currentUrl)) {
        continue;
      }
      
      console.log(`Crawling page ${crawledPages.size + 1}/${MAX_PAGES}: ${currentUrl}`);
      
      try {
        // Navigate to the page with more robust handling
        const page = await context.newPage();
        
        // Enable request interception to handle potential redirects and errors
        await page.route('**/*', route => {
          console.log(`Request: ${route.request().url()}`);
          return route.continue();
        });
        
        console.log(`Attempting to navigate to ${currentUrl} with extended timeout...`);
        const response = await page.goto(currentUrl, { 
          waitUntil: 'networkidle', 
          timeout: 60000 // Extended timeout for slow sites
        });
        
        // More detailed response validation
        if (!response) {
          console.error(`No response received for ${currentUrl}`);
          crawledPages.set(currentUrl, { 
            error: 'No response', 
            url: currentUrl,
            timestamp: new Date().toISOString(),
            html: await page.content() // Capture whatever content we did get
          });
          await page.close();
          continue;
        }
        
        if (!response.ok()) {
          console.error(`Failed to load ${currentUrl}: ${response.status()}`);
          // Still capture the HTML even if status code indicates error
          const errorHtml = await page.content();
          crawledPages.set(currentUrl, { 
            error: `HTTP ${response.status()}`, 
            statusText: response.statusText(),
            url: currentUrl,
            html: errorHtml,
            timestamp: new Date().toISOString()
          });
          await page.close();
          continue;
        }
        
        // Verify we actually got HTML content
        const contentType = response.headers()['content-type'] || '';
        if (!contentType.includes('text/html')) {
          console.warn(`Warning: Response for ${currentUrl} is not HTML (${contentType})`);
        }
        
        // Extract page data with screenshot if enabled
        const pageData = await extractPageData(page, currentUrl, { includeScreenshot });
        crawledPages.set(currentUrl, pageData);
        
        // Log success with content length
        console.log(`Successfully extracted data from ${currentUrl}: ${pageData.html?.length || 0} bytes of HTML`);
        
        // Find links to other pages on the same domain
        if (pageData.links) {
          for (const link of pageData.links.internal) {
            if (!crawledPages.has(link) && !pagesToCrawl.includes(link) && crawledPages.size < MAX_PAGES) {
              pagesToCrawl.push(link);
            }
          }
        }
        
        await page.close();
      } catch (error) {
        console.error(`Error crawling ${currentUrl}:`, error);
        crawledPages.set(currentUrl, { error: error.message });
      }
    }
    
    // Compile the overall SEO report with verification data
    console.log(`Crawl completed. Pages attempted: ${crawledPages.size}`);
    
    // Log detailed crawl results for debugging
    const crawlSummary = {
      totalPages: crawledPages.size,
      successfulPages: Array.from(crawledPages.values()).filter(page => !page.error).length,
      failedPages: Array.from(crawledPages.values()).filter(page => page.error).length,
      urls: Array.from(crawledPages.keys())
    };
    console.log('Crawl summary:', crawlSummary);
    
    // Check if we have any successful pages
    if (crawlSummary.successfulPages === 0) {
      console.error('WARNING: No pages were successfully crawled!');
    }
    
    const seoReport = compileReport(crawledPages, targetUrl);
    
    // Add verification data to the report
    seoReport.crawlVerification = {
      timestamp: new Date().toISOString(),
      pagesAttempted: crawledPages.size,
      pagesSuccessful: crawlSummary.successfulPages,
      pagesFailed: crawlSummary.failedPages,
      crawledUrls: Array.from(crawledPages.keys())
    };
    
    return seoReport;
    
  } finally {
    await browser.close();
    console.log(`Completed SEO crawl of ${targetUrl}, analyzed ${crawledPages.size} pages`);
  }
}

/**
 * Extract SEO-relevant data from a page
 * @param {Page} page - Playwright page object
 * @param {string} pageUrl - URL of the current page
 * @param {object} options - Options for data extraction
 * @param {boolean} options.includeScreenshot - Whether to include a screenshot
 * @returns {Promise<object>} - Page data
 */
async function extractPageData(page, pageUrl, options = {}) {
  const { includeScreenshot = false } = options;
  try {
    console.log(`Extracting data from page: ${pageUrl}`);
    
    // Get page title and meta tags
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    const metaDescription = await page.$eval('meta[name="description"]', el => el.content).catch(() => {
      console.log('No meta description found');
      return '';
    });
    
    const metaKeywords = await page.$eval('meta[name="keywords"]', el => el.content).catch(() => {
      console.log('No meta keywords found');
      return '';
    });
    
    // Get page content with verification
    console.log('Getting page content...');
    const content = await page.content();
    
    // Verify we got actual HTML content
    if (!content || content.length < 100) {
      console.error(`Warning: Received suspiciously small HTML content (${content?.length || 0} bytes) for ${pageUrl}`);
      // Take a screenshot for verification
      try {
        await page.screenshot({ path: `error-${Date.now()}.png` });
        console.log('Captured error screenshot');
      } catch (screenshotError) {
        console.error('Failed to capture error screenshot:', screenshotError);
      }
    }
    
    console.log(`Received HTML content: ${content?.length || 0} bytes`);
    const $ = cheerio.load(content || '<html><body>Empty content</body></html>');
    
    // Capture screenshot if enabled
    let screenshot = null;
    if (includeScreenshot) {
      try {
        console.log(`Capturing screenshot for ${pageUrl}...`);
        // Take full-page screenshot and convert to base64
        const screenshotBuffer = await page.screenshot({ 
          fullPage: true,
          type: 'jpeg',
          quality: 80 // Lower quality for smaller size
        });
        screenshot = screenshotBuffer.toString('base64');
        console.log(`Screenshot captured: ${screenshot.length} bytes`);
      } catch (screenshotError) {
        console.error('Failed to capture screenshot:', screenshotError);
      }
    }
    
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
          price: productPrice || 'N/A'
        });
      }
    });
    pageSpecificContent.products = products;
    
    // Extract form fields
    const formFields = [];
    $('form input[name], form select[name], form textarea[name]').each((i, el) => {
      const fieldName = $(el).attr('name');
      const fieldType = $(el).attr('type') || $(el).prop('tagName').toLowerCase();
      const fieldLabel = $(`label[for="${$(el).attr('id')}"]`).text().trim() || '';
      if (fieldName && !formFields.some(f => f.name === fieldName)) {
        formFields.push({
          name: fieldName,
          type: fieldType,
          label: fieldLabel
        });
      }
    });
    pageSpecificContent.formFields = formFields;
    
    // Extract footer content
    const footerContent = $('footer').text().trim().substring(0, 200);
    pageSpecificContent.footerContent = footerContent;
    
    // Extract social media links
    const socialLinks = [];
    $('a[href*="facebook.com"], a[href*="twitter.com"], a[href*="instagram.com"], a[href*="linkedin.com"], a[href*="pinterest.com"], a[href*="youtube.com"]').each((i, el) => {
      const platform = $(el).attr('href').match(/([a-z]+)\.com/)[1];
      if (platform && !socialLinks.includes(platform)) {
        socialLinks.push(platform);
      }
    });
    pageSpecificContent.socialLinks = socialLinks;
  
    // Extract headings
    const h1 = $('h1').map((i, el) => $(el).text().trim()).get();
    const h2 = $('h2').map((i, el) => $(el).text().trim()).get();
    const h3 = $('h3').map((i, el) => $(el).text().trim()).get();
    
    // Extract links
    const baseUrlObj = new URL(pageUrl);
    const baseUrl = baseUrlObj.origin;
    const allLinks = $('a[href]').map((i, el) => $(el).attr('href')).get();
    
    const internalLinks = [];
    const externalLinks = [];
  
    for (const link of allLinks) {
      try {
        // Skip empty links, anchors, javascript, mailto, tel
        if (!link || link.startsWith('#') || link.startsWith('javascript:') || link.startsWith('mailto:') || link.startsWith('tel:')) {
          continue;
        }
        
        let absoluteUrl;
        
        // Handle relative URLs
        if (link.startsWith('/')) {
          absoluteUrl = `${baseUrl}${link}`;
        } else if (!link.startsWith('http')) {
          // Handle other relative paths
          const pageUrlObj = new URL(pageUrl);
          const pagePath = pageUrlObj.pathname;
          const pageDir = pagePath.substring(0, pagePath.lastIndexOf('/') + 1);
          absoluteUrl = `${baseUrl}${pageDir}${link}`;
        } else {
          absoluteUrl = link;
        }
        
        // Check if internal or external
        const linkUrlObj = new URL(absoluteUrl);
        if (linkUrlObj.origin === baseUrl) {
          if (!internalLinks.includes(absoluteUrl)) {
            internalLinks.push(absoluteUrl);
          }
        } else {
          if (!externalLinks.includes(absoluteUrl)) {
            externalLinks.push(absoluteUrl);
          }
        }
      } catch (error) {
        // Skip invalid links
        continue;
      }
    }
  
    // Extract images
    const images = $('img').map((i, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt') || '';
      return { src, alt };
    }).get();
    
    // Extract meta tags
    const metaTags = $('meta').map((i, el) => {
      const name = $(el).attr('name') || $(el).attr('property') || '';
      const content = $(el).attr('content') || '';
      return { name, content };
    }).get().filter(tag => tag.name && tag.content);
    
    // Extract canonical URL
    const canonical = $('link[rel="canonical"]').attr('href') || '';
    
    // Extract structured data
    const structuredData = [];
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const json = JSON.parse($(el).html());
        structuredData.push(json);
      } catch (e) {
        // Skip invalid JSON
      }
    });
    
    // Check for mobile friendliness
    const viewport = $('meta[name="viewport"]').attr('content') || '';
    const isMobileFriendly = viewport.includes('width=device-width');
    
    // Check for hreflang tags
    const hreflangTags = $('link[rel="alternate"][hreflang]').map((i, el) => {
      const hreflang = $(el).attr('hreflang');
      const href = $(el).attr('href');
      return { hreflang, href };
    }).get();
    
    // Analyze page content
    const textContent = $('body').text().trim();
    const wordCount = textContent.split(/\\s+/).length;
    
        // --- Enhanced Issue Detection with Proof ---
    const pageIssues = [];

    // 1. Missing/duplicate/multiple H1s
    if (h1.length === 0) {
      pageIssues.push({
        type: 'missing_h1',
        detail: 'No H1 heading found on the page.',
        proof: {},
        recommendation: 'Add a descriptive H1 heading that includes your primary keyword.'
      });
    } else if (h1.length > 1) {
      pageIssues.push({
        type: 'multiple_h1',
        detail: `Multiple H1 headings found (${h1.length}).`,
        proof: { h1s: h1 },
        recommendation: 'Use only one H1 heading per page for clarity.'
      });
    }

    // 2. Missing meta description or too short/long
    if (!metaDescription) {
      pageIssues.push({
        type: 'missing_meta_description',
        detail: 'No meta description found.',
        proof: {},
        recommendation: 'Add a compelling meta description (120-158 characters).'
      });
    } else if (metaDescription.length < 50) {
      pageIssues.push({
        type: 'short_meta_description',
        detail: `Meta description too short (${metaDescription.length} characters).`,
        proof: { metaDescription },
        recommendation: 'Expand the meta description to 120-158 characters.'
      });
    } else if (metaDescription.length > 160) {
      pageIssues.push({
        type: 'long_meta_description',
        detail: `Meta description too long (${metaDescription.length} characters).`,
        proof: { metaDescription },
        recommendation: 'Shorten the meta description to 120-158 characters.'
      });
    }

    // 3. Images missing alt text
    const imagesMissingAlt = images.filter(img => !img.alt);
    for (const img of imagesMissingAlt) {
      pageIssues.push({
        type: 'missing_alt',
        detail: `Image missing alt text: ${img.src}`,
        proof: { src: img.src },
        recommendation: 'Add descriptive alt text to this image.'
      });
    }

    // 4. Buttons/links with no descriptive text
    $('a, button').each((i, el) => {
      const text = $(el).text().trim();
      if (!text) {
        const tag = $(el).prop('tagName').toLowerCase();
        const href = $(el).attr('href') || '';
        pageIssues.push({
          type: 'no_text',
          detail: `${tag.toUpperCase()} has no descriptive text.` + (href ? ` (href: ${href})` : ''),
          proof: { tag, href },
          recommendation: `Add descriptive text to this ${tag}.`
        });
      }
    });

    // 5. Missing canonical tag
    if (!canonical) {
      pageIssues.push({
        type: 'missing_canonical',
        detail: 'No canonical tag found.',
        proof: {},
        recommendation: 'Add a canonical tag to specify the preferred version of the page.'
      });
    }

    // 6. Check for broken links (HEAD request for 404/500)
    // NOTE: This is async, so in real code you would want to await all checks. Here, we just mark for later.
    // (You may want to implement this as a separate async step if needed)
    // Example stub:
    // for (const link of internalLinks.concat(externalLinks)) {
    //   // TODO: Perform HEAD request and push issue if broken
    // }

    // Return the page data
    return {
      url: pageUrl,
      title,
      html: content, // Include the full HTML content
      timestamp: new Date().toISOString(),
      metaTags: {
        description: metaDescription,
        keywords: metaKeywords,
        canonical: canonical,
        robots: $('meta[name="robots"]').attr('content') || '',
        ogTitle: $('meta[property="og:title"]').attr('content') || '',
        ogDescription: $('meta[property="og:description"]').attr('content') || '',
        ogImage: $('meta[property="og:image"]').attr('content') || '',
        twitterCard: $('meta[name="twitter:card"]').attr('content') || '',
        twitterTitle: $('meta[name="twitter:title"]').attr('content') || '',
        twitterDescription: $('meta[name="twitter:description"]').attr('content') || '',
        twitterImage: $('meta[name="twitter:image"]').attr('content') || ''
      },
      headings: { h1, h2, h3 },
      links: { internal: internalLinks, external: externalLinks },
      images,
      metaTags,
      canonical,
      structuredData,
      isMobileFriendly,
      hreflangTags,
      wordCount,
      textContent: textContent.substring(0, 1000), 
      pageSpecificContent, 
      issues: pageIssues,
      score: 0, 
      contentLength: content?.length || 0,
      screenshot: screenshot // Include screenshot if captured
    };

  } catch (error) {
    console.error(`Error extracting data from ${pageUrl}:`, error);
    return {
      url: pageUrl,
      error: error.message,
      title: '',
      headings: { h1: [], h2: [], h3: [] },
      links: { internal: [], external: [] }
    };
  }
}

/**
 * Compile the overall SEO report from crawled pages
 * @param {Map} crawledPages - Map of URLs to page data
 * @param {string} targetUrl - The original target URL
 * @returns {object} - Comprehensive SEO report
 */
function compileReport(crawledPages, targetUrl) {
  console.log(`Compiling report for ${targetUrl} with ${crawledPages.size} crawled pages`);
  
  // Extract and log specific content from pages to prove we crawled them
  const siteSpecificContent = {
    navigationItems: new Set(),
    buttonTexts: new Set(),
    products: [],
    formFields: [],
    socialLinks: new Set(),
    pageUrls: []
  };
  
  // Collect specific content from all pages
  crawledPages.forEach((data, url) => {
    if (data.pageSpecificContent) {
      // Add navigation items
      if (data.pageSpecificContent.navigationItems) {
        data.pageSpecificContent.navigationItems.forEach(item => siteSpecificContent.navigationItems.add(item));
      }
      
      // Add button texts
      if (data.pageSpecificContent.buttonTexts) {
        data.pageSpecificContent.buttonTexts.forEach(text => siteSpecificContent.buttonTexts.add(text));
      }
      
      // Add products
      if (data.pageSpecificContent.products && data.pageSpecificContent.products.length > 0) {
        siteSpecificContent.products.push(...data.pageSpecificContent.products);
      }
      
      // Add form fields
      if (data.pageSpecificContent.formFields && data.pageSpecificContent.formFields.length > 0) {
        siteSpecificContent.formFields.push(...data.pageSpecificContent.formFields);
      }
      
      // Add social links
      if (data.pageSpecificContent.socialLinks) {
        data.pageSpecificContent.socialLinks.forEach(link => siteSpecificContent.socialLinks.add(link));
      }
    }
    
    // Add page URL
    siteSpecificContent.pageUrls.push(url);
  });
  
  // Convert Sets to Arrays
  siteSpecificContent.navigationItems = Array.from(siteSpecificContent.navigationItems);
  siteSpecificContent.buttonTexts = Array.from(siteSpecificContent.buttonTexts);
  siteSpecificContent.socialLinks = Array.from(siteSpecificContent.socialLinks);
  
  // Log the site-specific content
  console.log('Site-specific content found:', JSON.stringify(siteSpecificContent, null, 2));
  
  const pages = Array.from(crawledPages.entries()).map(([url, data]) => {
    // Skip pages with errors
    if (data.error) {
      return {
        url,
        title: 'Error',
        score: 0,
        issues: [{
          title: 'Page Error',
          description: `Failed to crawl this page: ${data.error}`,
          severity: 'high',
          impact: 'This page is not accessible, which affects user experience and SEO.',
          recommendation: 'Investigate and fix the page loading issue.'
        }],
        extracted: {}
      };
    }

    // Use the enhanced pageIssues array from extractPageData for actionable, proof-based issues
    const issues = (data.pageIssues || []).map(issue => ({
      type: issue.type,
      detail: issue.detail,
      proof: issue.proof,
      recommendation: issue.recommendation
    }));

    // Calculate a simple score based on number/severity of issues
    let score = 100;
    for (const issue of issues) {
      if (issue.type === 'missing_h1' || issue.type === 'missing_meta_description') score -= 10;
      else if (issue.type === 'multiple_h1' || issue.type === 'missing_canonical') score -= 3;
      else if (issue.type === 'short_meta_description' || issue.type === 'long_meta_description') score -= 2;
      else if (issue.type === 'missing_alt') score -= 2;
      else if (issue.type === 'no_text') score -= 2;
    }
    score = Math.max(0, Math.min(100, score));

    // Return all extracted data and issues for this page
    return {
      url,
      title: data.title || 'No Title',
      metaDescription: data.metaDescription,
      metaKeywords: data.metaKeywords,
      headings: data.headings,
      links: data.links,
      images: data.images,
      metaTags: data.metaTags,
      canonical: data.canonical,
      structuredData: data.structuredData,
      isMobileFriendly: data.isMobileFriendly,
      hreflangTags: data.hreflangTags,
      wordCount: data.wordCount,
      textContent: data.textContent,
      pageSpecificContent: data.pageSpecificContent,
      issues,
      score
    };
  });
  
  // Analyze technical SEO issues
  const technicalIssues = analyzeTechnicalSEO(crawledPages, targetUrl);
  const technicalScore = calculateTechnicalScore(technicalIssues);
  
  // Calculate overall score
  const validPages = pages.filter(page => page.score > 0);
  const avgScore = validPages.length > 0
    ? Math.round(validPages.reduce((sum, page) => sum + page.score, 0) / validPages.length)
    : 0;
  
  const overallScore = Math.round((avgScore + technicalScore) / 2);
  
  // Generate summary
  const summary = generateSummary(pages, technicalIssues, targetUrl);
  
  // Add site-specific content to the report to prove we crawled the site
  return {
    url: targetUrl,
    overallScore,
    technicalScore,
    averagePageScore: avgScore,
    summary,
    pages,
    technicalIssues,
    crawlDate: new Date().toISOString(),
    siteSpecificContent, // Add the specific content we extracted to prove we crawled the site
    crawledUrls: siteSpecificContent.pageUrls // List of all URLs we crawled
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
  
  // Check HTTPS
  const isHttps = targetUrl.startsWith('https://');
  if (!isHttps) {
    issues.push({
      title: 'Not Using HTTPS',
      description: 'The website is not using HTTPS encryption.',
      severity: 'high',
      impact: 'HTTPS is a ranking factor and important for security and user trust.',
      recommendation: 'Implement HTTPS across the entire website.'
    });
  }
  
  // Check for pages with errors
  const errorPages = Array.from(crawledPages.entries())
    .filter(([url, data]) => data.error)
    .map(([url]) => url);
  
  if (errorPages.length > 0) {
    issues.push({
      title: 'Pages With Errors',
      description: `${errorPages.length} pages returned errors during crawling.`,
      severity: 'high',
      impact: 'Pages with errors can negatively impact user experience and SEO.',
      recommendation: 'Investigate and fix the errors on these pages.'
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
  let score = 100;
  
  for (const issue of issues) {
    if (issue.severity === 'high') {
      score -= 20;
    } else if (issue.severity === 'medium') {
      score -= 10;
    } else if (issue.severity === 'low') {
      score -= 5;
    }
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate a summary of the SEO audit
 * @param {Array} pages - List of pages analyzed
 * @param {Array} technicalIssues - List of technical SEO issues
 * @param {string} targetUrl - The original target URL
 * @returns {string} - Summary of the SEO audit
 */
function generateSummary(pages, technicalIssues, targetUrl) {
  const domain = new URL(targetUrl).hostname;
  const validPages = pages.filter(page => page.score > 0);
  const avgScore = validPages.length > 0
    ? Math.round(validPages.reduce((sum, page) => sum + page.score, 0) / validPages.length)
    : 0;
  
  const highSeverityIssues = [
    ...technicalIssues.filter(issue => issue.severity === 'high'),
    ...pages.flatMap(page => page.issues?.filter(issue => issue.severity === 'high') || [])
  ];
  
  const mediumSeverityIssues = [
    ...technicalIssues.filter(issue => issue.severity === 'medium'),
    ...pages.flatMap(page => page.issues?.filter(issue => issue.severity === 'medium') || [])
  ];
  
  let summary = `SEO audit of ${domain} analyzed ${pages.length} pages with an average score of ${avgScore}/100. `;
  
  if (highSeverityIssues.length > 0) {
    summary += `Found ${highSeverityIssues.length} critical issues that need immediate attention. `;
  }
  
  if (mediumSeverityIssues.length > 0) {
    summary += `Identified ${mediumSeverityIssues.length} moderate issues that should be addressed. `;
  }
  
  // Add top recommendations
  const allIssues = [
    ...highSeverityIssues,
    ...mediumSeverityIssues,
    ...technicalIssues.filter(issue => issue.severity === 'low'),
    ...pages.flatMap(page => page.issues?.filter(issue => issue.severity === 'low') || [])
  ];
  
  if (allIssues.length > 0) {
    const topIssues = allIssues
      .slice(0, 3)
      .map(issue => issue.title)
      .join(', ');
    
    summary += `Top priorities include addressing: ${topIssues}.`;
  } else {
    summary += 'The website is performing well in terms of SEO, with no significant issues found.';
  }
  
  return summary;
}

/**
 * Express route handler for crawling a website
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function crawlWebsiteHandler(req, res) {
  try {
    const { url, includeScreenshot, verifyData, multiPage, maxPages } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    // Parse boolean parameters
    const shouldIncludeScreenshot = includeScreenshot === 'true';
    const shouldVerifyData = verifyData === 'true';
    const shouldMultiPage = multiPage === 'true';
    
    // Parse maxPages parameter with fallback to default
    const pagesToCrawl = shouldMultiPage ? (parseInt(maxPages) || MAX_PAGES) : 1;
    
    console.log(`Crawl configuration: includeScreenshot=${shouldIncludeScreenshot}, verifyData=${shouldVerifyData}, multiPage=${shouldMultiPage}, maxPages=${pagesToCrawl}`);
    
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
    
    // Check and install browsers if needed (only once per server instance)
    if (!browsersChecked) {
      try {
        console.log('Checking Playwright browsers before crawling...');
        const browsersInstalled = await checkPlaywrightBrowsers();
        if (!browsersInstalled) {
          console.log('Installing Playwright browsers...');
          await installPlaywrightBrowsersIfNeeded();
        }
        browsersChecked = true;
      } catch (browserError) {
        console.error('Browser check/install error:', browserError);
        console.error('Browser error details:', JSON.stringify(browserError, null, 2));
        // Continue anyway - we'll try to use system browser
      }
    }
    
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
      
      // Try a simple browser test first to diagnose issues
      try {
        console.log('Performing browser test before full crawl...');
        const browser = await chromium.launch({ headless: true });
        await browser.close();
        console.log('Browser launched successfully for test');
      } catch (testError) {
        console.error('Browser test failed:', testError);
        console.error('This indicates a problem with Playwright or the browser environment');
      }
      
      // Proceed with the actual crawl
      console.log('Now attempting the actual crawl with options...');
      try {
        // Pass all the options to the crawlWebsite function
        const crawlOptions = {
          includeScreenshot: shouldIncludeScreenshot,
          verifyData: shouldVerifyData,
          multiPage: shouldMultiPage,
          maxPages: pagesToCrawl
        };
        
        console.log('Crawl options:', crawlOptions);
        const seoData = await crawlWebsite(url, crawlOptions);
        console.log(`Crawl of ${url} completed successfully with ${seoData.pages?.length || 0} pages`);
        return res.json(seoData);
      } catch (playwrightError) {
        console.error('Playwright crawl failed, trying fallback method:', playwrightError.message);
        
        // Fallback to a simpler HTTP request-based crawl
        console.log('Attempting fallback crawl with HTTP requests...');
        // Even in fallback mode, respect the multiPage setting
        const fallbackData = await fallbackCrawlWebsite(url, { multiPage: shouldMultiPage, maxPages: pagesToCrawl });
        console.log('Fallback crawl completed');
        return res.json(fallbackData);
      }
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
      } catch (detailsError) {
        console.error('Error getting error details:', detailsError);
      }
      
      console.error('Error details:', JSON.stringify(errorDetails, null, 2));
      
      return res.status(500).json({ 
        error: 'Failed to crawl website', 
        message: crawlError.message,
        details: errorDetails,
        stack: process.env.NODE_ENV === 'development' ? crawlError.stack : undefined
      });
    }
  } catch (error) {
    console.error('Error in crawl handler:', error);
    return res.status(500).json({ error: 'Failed to crawl website: ' + error.message });
  }
}

/**
 * Check if Playwright browsers are installed
 * @returns {Promise<boolean>} - Whether browsers are installed
 */
async function checkPlaywrightBrowsers() {
  try {
    // Simple test launch to check if browsers are installed
    const browser = await chromium.launch({ headless: true });
    await browser.close();
    return true;
  } catch (error) {
    console.error('Playwright browser check failed:', error);
    return false;
  }
}

/**
 * Install Playwright browsers if needed
 * @returns {Promise<void>}
 */
async function installPlaywrightBrowsersIfNeeded() {
  try {
    const browsersInstalled = await checkPlaywrightBrowsers();
    if (!browsersInstalled) {
      console.log('Playwright browsers not installed. Attempting to install...');
      // This is a simplified approach - in production, you'd want to use the Playwright CLI
      // or a more robust installation method
      const { execSync } = require('child_process');
      execSync('npx playwright install chromium', { stdio: 'inherit' });
      console.log('Playwright browsers installed successfully');
    } else {
      console.log('Playwright browsers already installed');
    }
  } catch (error) {
    console.error('Failed to install Playwright browsers:', error);
    throw new Error(`Failed to install Playwright browsers: ${error.message}`);
  }
}

/**
 * Fallback crawl implementation using simple HTTP requests
 * This is used when Playwright crawling fails
 * @param {string} targetUrl - The URL to crawl
 * @returns {Promise<object>} - Basic SEO data
 */
async function fallbackCrawlWebsite(targetUrl) {
  console.log(`Starting fallback crawl of ${targetUrl}`);
  
  // Use axios for HTTP requests
  const axios = require('axios');
  const cheerio = require('cheerio');
  const { URL } = require('url');
  
  try {
    // Fetch the main page
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 30000,
      maxContentLength: 10000000
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Extract basic SEO data
    const title = $('title').text();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const h1s = $('h1').map((i, el) => $(el).text().trim()).get();
    const h2s = $('h2').map((i, el) => $(el).text().trim()).get();
    const h3s = $('h3').map((i, el) => $(el).text().trim()).get();
    
    // Count images and check for alt text
    const images = $('img');
    const imagesWithAlt = $('img[alt]');
    
    // Extract links
    const links = $('a[href]');
    const internalLinks = [];
    const externalLinks = [];
    
    const baseUrl = new URL(targetUrl).origin;
    
    links.each((i, link) => {
      const href = $(link).attr('href');
      if (!href) return;
      
      try {
        const url = new URL(href, baseUrl);
        if (url.origin === baseUrl) {
          internalLinks.push(url.href);
        } else {
          externalLinks.push(url.href);
        }
      } catch (e) {
        // Invalid URL, skip
      }
    });
    
    // Check for common SEO issues
    const issues = [];
    
    if (!title) {
      issues.push({
        title: 'Missing page title',
        description: 'The page does not have a title tag',
        severity: 'high',
        impact: 'Search engines use the title tag as a primary ranking factor',
        recommendation: 'Add a descriptive title tag to the page'
      });
    } else if (title.length < 10) {
      issues.push({
        title: 'Title tag too short',
        description: `The page title is only ${title.length} characters long`,
        severity: 'medium',
        impact: 'Short titles may not adequately describe page content to search engines',
        recommendation: 'Create a more descriptive title between 50-60 characters'
      });
    } else if (title.length > 60) {
      issues.push({
        title: 'Title tag too long',
        description: `The page title is ${title.length} characters long`,
        severity: 'low',
        impact: 'Long titles may be truncated in search results',
        recommendation: 'Shorten the title to 50-60 characters'
      });
    }
    
    if (!metaDescription) {
      issues.push({
        title: 'Missing meta description',
        description: 'The page does not have a meta description',
        severity: 'medium',
        impact: 'Meta descriptions help improve click-through rates from search results',
        recommendation: 'Add a compelling meta description between 120-158 characters'
      });
    }
    
    if (h1s.length === 0) {
      issues.push({
        title: 'Missing H1 heading',
        description: 'The page does not have an H1 heading',
        severity: 'medium',
        impact: 'H1 headings help search engines understand page content',
        recommendation: 'Add a descriptive H1 heading that includes your primary keyword'
      });
    } else if (h1s.length > 1) {
      issues.push({
        title: 'Multiple H1 headings',
        description: `The page has ${h1s.length} H1 headings`,
        severity: 'low',
        impact: 'Multiple H1s can dilute the importance of your main heading',
        recommendation: 'Use only one H1 heading per page'
      });
    }
    
    if (images.length > 0 && imagesWithAlt.length < images.length) {
      issues.push({
        title: 'Images missing alt text',
        description: `${images.length - imagesWithAlt.length} out of ${images.length} images are missing alt text`,
        severity: 'medium',
        impact: 'Alt text helps search engines understand image content and improves accessibility',
        recommendation: 'Add descriptive alt text to all images'
      });
    }
    
    // Create a basic report structure
    return {
      url: targetUrl,
      crawledUrls: [targetUrl],
      pages: [{
        url: targetUrl,
        title,
        metaTags: {
          title,
          description: metaDescription,
          keywords: $('meta[name="keywords"]').attr('content') || ''
        },
        headings: {
          h1: h1s,
          h2: h2s,
          h3: h3s
        },
        images: {
          total: images.length,
          withAlt: imagesWithAlt.length,
          withoutAlt: images.length - imagesWithAlt.length
        },
        links: {
          internal: {
            count: internalLinks.length,
            urls: internalLinks.slice(0, 20) // Limit to 20 links
          },
          external: {
            count: externalLinks.length,
            urls: externalLinks.slice(0, 20) // Limit to 20 links
          }
        },
        contentWordCount: $('body').text().split(/\s+/).length
      }],
      technical: {
        score: issues.length > 5 ? 60 : issues.length > 2 ? 75 : 90,
        issues: issues,
        summary: 'Basic technical SEO analysis (fallback mode)'
      },
      content: {
        score: 70,
        issues: [],
        summary: 'Basic content analysis (fallback mode)'
      },
      onPage: {
        score: 70,
        issues: [],
        summary: 'Basic on-page SEO analysis (fallback mode)'
      },
      performance: {
        score: 70,
        issues: [],
        summary: 'Performance analysis not available in fallback mode'
      },
      overall: {
        score: 70,
        summary: 'This is a basic SEO analysis performed in fallback mode due to browser issues.',
        timestamp: new Date().toISOString()
      },
      _meta: {
        crawlMode: 'fallback',
        generatedAt: new Date().toISOString(),
        notice: 'This report was generated using the fallback crawler due to issues with the full browser-based crawler.'
      }
    };
  } catch (error) {
    console.error('Fallback crawl failed:', error);
    
    // Return a minimal report structure with the error
    return {
      url: targetUrl,
      crawledUrls: [targetUrl],
      pages: [],
      technical: {
        score: 0,
        issues: [{
          title: 'Crawl failed',
          description: `Failed to crawl the website: ${error.message}`,
          severity: 'high',
          impact: 'Unable to analyze the website',
          recommendation: 'Check if the website is accessible and try again'
        }],
        summary: 'Crawl failed'
      },
      overall: {
        score: 0,
        summary: `Failed to crawl the website: ${error.message}`,
        timestamp: new Date().toISOString()
      },
      _meta: {
        crawlMode: 'fallback_error',
        error: error.message,
        generatedAt: new Date().toISOString()
      }
    };
  }
}

module.exports = {
  crawlWebsite,
  crawlWebsiteHandler,
  checkPlaywrightBrowsers,
  installPlaywrightBrowsersIfNeeded,
  fallbackCrawlWebsite
};
