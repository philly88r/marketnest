const { chromium } = require('playwright');

/**
 * Search Bing for a keyword and return top results
 * Bing is generally less aggressive with anti-bot measures than Google
 */
async function searchBing(keyword) {
  let browser = null;
  
  try {
    console.log(`Searching Bing for keyword: ${keyword}`);
    
    // Launch browser with enhanced anti-detection settings
    browser = await chromium.launch({
      headless: true,
      slowMo: 50, // Slow down operations to appear more human-like
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1920,1080',
        '--disable-infobars',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--hide-scrollbars',
        '--mute-audio',
        '--disable-notifications',
        '--disable-extensions'
      ]
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      hasTouch: false,
      locale: 'en-US',
      timezoneId: 'America/New_York',
      permissions: ['geolocation'],
      colorScheme: 'light',
      acceptDownloads: true
    });
    
    const page = await context.newPage();
    
    // Add human-like behavior and anti-detection measures
    await page.addInitScript(() => {
      // Override automation flags
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      
      // Override Chrome-specific properties
      window.chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {}
      };
    });
    
    // Navigate to Bing with detailed logging
    console.log('Navigating to Bing...');
    await page.goto('https://www.bing.com/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'bing-homepage.png' });
    
    // Add random mouse movements to appear more human-like
    await page.mouse.move(Math.floor(Math.random() * 500) + 200, Math.floor(Math.random() * 300) + 100);
    await page.waitForTimeout(Math.floor(Math.random() * 500) + 500);
    
    // Type keyword and search
    console.log(`Searching for keyword: ${keyword}`);
    await page.fill('input[name="q"]', keyword);
    await page.screenshot({ path: 'bing-after-fill.png' });
    await page.waitForTimeout(Math.floor(Math.random() * 300) + 200);
    await page.press('input[name="q"]', 'Enter');
    
    // Wait for results to load with multiple possible selectors
    console.log('Waiting for search results...');
    try {
      // Bing's main results container
      await page.waitForSelector('#b_results .b_algo, .b_algo', { timeout: 10000 });
      console.log('Results selector appeared.');
    } catch (e) {
      console.error('Timeout waiting for results selector:', e);
      await page.screenshot({ path: 'bing-waitforselector-timeout.png' });
    }
    
    // Wait a bit to make sure the page is fully loaded
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'bing-search-results.png' });
    
    // Log how many elements each selector finds
    const selectorCounts = await page.evaluate(() => {
      const selectors = ['#b_results .b_algo', '.b_algo', 'li.b_algo'];
      const counts = {};
      for (const sel of selectors) {
        counts[sel] = document.querySelectorAll(sel).length;
      }
      return counts;
    });
    console.log('Selector counts:', selectorCounts);
    
    // Extract top organic results with robust selectors for Bing
    const results = await page.evaluate(() => {
      const organicResults = [];
      
      // Try multiple possible selectors for Bing search results
      const resultElements = Array.from(document.querySelectorAll('#b_results .b_algo, .b_algo, li.b_algo'));
      
      // Process each result
      for (let i = 0; i < Math.min(10, resultElements.length); i++) {
        const result = resultElements[i];
        if (!result) continue;
        
        // Find title and URL in Bing results
        const titleElement = result.querySelector('h2 a, .b_title a');
        const urlElement = titleElement; // In Bing, the title element contains the href
        
        if (titleElement && urlElement) {
          const title = titleElement.innerText.trim();
          const url = urlElement.href;
          
          // Skip Bing pages and non-http URLs
          if (!url || !url.startsWith('http') || url.includes('bing.com')) continue;
          
          // Skip ads or sponsored results
          if (title.includes('Ad') || title.includes('Sponsored') || 
              result.closest('.b_ad') || result.classList.contains('b_ad')) continue;
          
          organicResults.push({
            title,
            url,
            position: organicResults.length + 1,
            strengths: [],
            weaknesses: []
          });
          
          // Stop after finding 3 valid results
          if (organicResults.length >= 3) {
            break;
          }
        }
      }
      
      return organicResults;
    });
    
    console.log(`Found ${results.length} real results from Bing:`);
    results.forEach((result, i) => {
      console.log(`${i+1}. ${result.title} (${result.url})`);
    });
    
    return results;
  } catch (error) {
    console.error('Error searching Bing:', error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Export the search function
module.exports = { searchBing };
