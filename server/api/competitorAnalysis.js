const express = require('express');
const { chromium } = require('playwright'); // Keep for website data fetching
const { searchBingWithSelenium } = require('./seleniumBingSearch');
const router = express.Router();

/**
 * Search for competitors for a given keyword
 */
router.post('/search', async (req, res) => {
  const { keyword } = req.body;
  
  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' });
  }
  
  try {
    console.log(`Starting search for keyword: ${keyword}`);
    
    // Use ONLY real Bing search results with Selenium (more reliable)
    const competitors = await searchBingWithSelenium(keyword);
    console.log('Selenium Bing competitors:', competitors);
    
    // If no real results, return an error (never use placeholders)
    if (!competitors || competitors.length === 0) {
      return res.status(404).json({ error: 'No real competitors found for this keyword.', competitors: [] });
    }
    
    console.log(`Found ${competitors.length} real competitors:`);
    competitors.forEach((comp, index) => {
      console.log(`${index + 1}. ${comp.title} (${comp.url})`);
    });
    
    // If we couldn't find any competitors, return a helpful error
    if (competitors.length === 0) {
      return res.status(404).json({ 
        error: 'No search results found. The search engine may be blocking the automated search.',
        competitors: [] 
      });
    }
    
    // Limit to top 3 real competitors only - NO PLACEHOLDERS
    if (competitors.length > 3) {
      competitors = competitors.slice(0, 3);
    }
    
    // Return only the real search results we found - NEVER use placeholders
    res.json({ competitors });
  } catch (error) {
    console.error('Error searching for competitors:', error);
    res.status(500).json({ 
      error: `Error searching for competitors: ${error.message}`,
      competitors: []
    });
  }
});

/**
 * Fetch website data for SEO analysis
 */
router.post('/fetch-website', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  let browser = null;
  
  try {
    console.log(`Fetching website data for: ${url}`);
    
    // Launch browser with more realistic settings
    browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
      hasTouch: false
    });
    
    // Set a longer timeout for navigation
    context.setDefaultTimeout(30000);
    
    const page = await context.newPage();
    
    // Intercept and modify the navigator.webdriver property
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
    
    console.log(`Navigating to ${url}...`);
    // Go to the URL with a timeout and fallback
    let navigationSuccessful = false;
    try {
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000
      });
      navigationSuccessful = true;
    } catch (e) {
      console.log(`Navigation timeout, trying with domcontentloaded: ${e.message}`);
      try {
        await page.goto(url, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000
        });
        navigationSuccessful = true;
      } catch (e2) {
        console.log(`Second navigation attempt failed: ${e2.message}`);
        // Take a screenshot for debugging
        await page.screenshot({ path: `failed-navigation-${new Date().getTime()}.png` });
      }
    }
    
    if (!navigationSuccessful) {
      return res.status(500).json({ 
        error: 'Failed to load the website',
        websiteData: {
          url,
          technical: {
            ssl: url.startsWith('https'),
            robotsTxt: false,
            sitemap: false,
            mobileFriendly: false
          }
        }
      });
    }
    
    // Wait a bit to make sure the page is fully loaded
    await page.waitForTimeout(2000);
    
    console.log('Taking screenshot of the page...');
    // Take a screenshot for debugging
    await page.screenshot({ path: `website-${new URL(url).hostname.replace(/[^a-z0-9]/gi, '-')}.png` });
    
    console.log('Extracting website data...');
    // Extract website data with error handling
    const websiteData = await page.evaluate(() => {
      try {
        // Get meta tags
        const metaTags = {};
        document.querySelectorAll('meta').forEach(meta => {
          try {
            const name = meta.getAttribute('name') || meta.getAttribute('property');
            const content = meta.getAttribute('content');
            if (name && content) {
              metaTags[name] = content;
            }
          } catch (e) {
            // Skip this meta tag if there's an error
          }
        });
        
        // Get headings safely
        const getTextContent = (elements) => {
          return Array.from(elements || []).map(el => {
            try { return el.innerText || el.textContent || ''; }
            catch (e) { return ''; }
          }).filter(text => text.trim().length > 0);
        };
        
        const h1s = getTextContent(document.querySelectorAll('h1'));
        const h2s = getTextContent(document.querySelectorAll('h2'));
        const h3s = getTextContent(document.querySelectorAll('h3'));
        
        // Get images safely
        const images = [];
        try {
          document.querySelectorAll('img').forEach(img => {
            try {
              images.push({
                src: img.src || '',
                alt: img.alt || '',
                hasAlt: !!img.alt
              });
            } catch (e) {
              // Skip this image if there's an error
            }
          });
        } catch (e) {
          // Continue if there's an error with all images
        }
        
        // Get links safely
        const links = [];
        try {
          document.querySelectorAll('a').forEach(a => {
            try {
              const href = a.href || '';
              const hostname = window.location.hostname;
              links.push({
                href,
                text: a.innerText || a.textContent || '',
                isExternal: href.startsWith('http') && !href.includes(hostname)
              });
            } catch (e) {
              // Skip this link if there's an error
            }
          });
        } catch (e) {
          // Continue if there's an error with all links
        }
        
        // Get text content safely
        let textContent = '';
        try {
          textContent = document.body.innerText || document.body.textContent || '';
        } catch (e) {
          // Use an empty string if there's an error
        }
        
        return {
          url: window.location.href,
          html: document.documentElement.outerHTML || '',
          title: document.title || '',
          description: metaTags['description'] || '',
          headings: { h1s, h2s, h3s },
          images,
          links,
          textContent,
          wordCount: (textContent.match(/\S+/g) || []).length
        };
      } catch (e) {
        // Return minimal data if there's an error
        return {
          url: window.location.href,
          html: '',
          title: document.title || '',
          description: '',
          headings: { h1s: [], h2s: [], h3s: [] },
          images: [],
          links: [],
          textContent: '',
          wordCount: 0
        };
      }
    });
    
    console.log('Checking technical aspects...');
    
    // Check for SSL
    const ssl = url.startsWith('https');
    
    // Check for robots.txt
    let hasRobotsTxt = false;
    try {
      console.log('Checking robots.txt...');
      const robotsUrl = new URL('/robots.txt', url).href;
      const robotsPage = await context.newPage();
      const robotsResponse = await robotsPage.goto(robotsUrl, { timeout: 10000 });
      hasRobotsTxt = robotsResponse && robotsResponse.status() === 200;
      await robotsPage.close();
    } catch (e) {
      console.log('Error checking robots.txt:', e.message);
      // Ignore errors checking robots.txt
    }
    
    // Check for sitemap
    let hasSitemap = false;
    try {
      console.log('Checking sitemap.xml...');
      const sitemapUrl = new URL('/sitemap.xml', url).href;
      const sitemapPage = await context.newPage();
      const sitemapResponse = await sitemapPage.goto(sitemapUrl, { timeout: 10000 });
      hasSitemap = sitemapResponse && sitemapResponse.status() === 200;
      await sitemapPage.close();
    } catch (e) {
      console.log('Error checking sitemap.xml:', e.message);
      // Ignore errors checking sitemap
    }
    
    // Check mobile friendliness
    let isMobileFriendly = false;
    try {
      console.log('Checking mobile friendliness...');
      const mobilePage = await context.newPage();
      await mobilePage.setViewportSize({ width: 375, height: 667 });
      await mobilePage.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });
      
      isMobileFriendly = await mobilePage.evaluate(() => {
        // Check for viewport meta tag
        const hasViewport = !!document.querySelector('meta[name="viewport"]');
        
        // Check if there's horizontal scrolling
        const pageWidth = document.documentElement.scrollWidth;
        const viewportWidth = window.innerWidth;
        const hasHorizontalScroll = pageWidth > viewportWidth;
        
        // Check for tap targets that are too small
        const smallTapTargets = Array.from(document.querySelectorAll('a, button')).filter(el => {
          const rect = el.getBoundingClientRect();
          return (rect.width < 40 || rect.height < 40);
        }).length;
        
        return hasViewport && !hasHorizontalScroll && (smallTapTargets < 5);
      });
      
      await mobilePage.close();
    } catch (e) {
      console.log('Error checking mobile friendliness:', e.message);
      // Default to false if there's an error
    }
    
    // Add technical checks to the response
    websiteData.technical = {
      ssl,
      robotsTxt: hasRobotsTxt,
      sitemap: hasSitemap,
      mobileFriendly: isMobileFriendly
    };
    
    console.log('Website data extraction complete');
    res.json({ websiteData });
  } catch (error) {
    console.error('Error fetching website data:', error);
    res.status(500).json({ error: 'Failed to fetch website data' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

module.exports = router;
