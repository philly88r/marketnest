const { chromium } = require('playwright');

/**
 * Search DuckDuckGo for a keyword and return top results
 * This is more reliable than Google for automated searches
 */
async function searchDuckDuckGo(keyword) {
  let browser = null;
  
  try {
    console.log(`Searching DuckDuckGo for keyword: ${keyword}`);
    
    // Launch browser in headless mode for production use
    browser = await chromium.launch({
      headless: true, // Use headless mode for production
      slowMo: 50, // Slow down operations to avoid detection
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1920,1080'
      ]
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      hasTouch: false,
      locale: 'en-US',
      timezoneId: 'America/New_York'
    });
    
    const page = await context.newPage();
    
    // Intercept and modify the navigator.webdriver property
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
    
    console.log('Navigating to DuckDuckGo...');
    // Go to DuckDuckGo
    await page.goto('https://duckduckgo.com/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'duckduckgo-after-nav.png' });
    console.log('Screenshot saved as duckduckgo-after-nav.png');

    // Type keyword and search
    console.log(`Searching for keyword: ${keyword}`);
    await page.fill('input[name="q"]', keyword);
    await page.screenshot({ path: 'duckduckgo-after-fill.png' });
    await page.press('input[name="q"]', 'Enter');
    await page.screenshot({ path: 'duckduckgo-after-press.png' });

    // Wait for results to load with multiple possible selectors
    console.log('Waiting for search results...');
    try {
      await page.waitForSelector('.result, .web-result, .nrn-react-div', { timeout: 10000 });
      console.log('Results selector appeared.');
    } catch (e) {
      console.error('Timeout waiting for results selector:', e);
      await page.screenshot({ path: 'duckduckgo-waitforselector-timeout.png' });
    }
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'duckduckgo-after-results-wait.png' });

    // Log how many elements each selector finds
    const selectorCounts = await page.evaluate(() => {
      const selectors = ['.result', '.web-result', '.nrn-react-div'];
      const counts = {};
      for (const sel of selectors) {
        counts[sel] = document.querySelectorAll(sel).length;
      }
      return counts;
    });
    console.log('Selector counts:', selectorCounts);
    
    // Extract top organic results with more robust selectors
    const results = await page.evaluate(() => {
      const organicResults = [];
      
      // Try multiple possible selectors for search results
      const selectors = [
        '.result', // Traditional DuckDuckGo result
        '.web-result', // Another possible container
        '.nrn-react-div' // Another possible container
      ];
      
      let resultElements = [];
      
      // Try each selector until we find results
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements && elements.length > 0) {
          resultElements = Array.from(elements);
          break;
        }
      }
      
      // Process each result
      for (let i = 0; i < Math.min(10, resultElements.length); i++) {
        const result = resultElements[i];
        if (!result) continue;
        
        // Try multiple possible selectors for titles and links
        const titleSelectors = [
          '.result__title', 
          '.result__a', 
          'h2', 
          'a[data-testid="result-title-a"]'
        ];
        
        const linkSelectors = [
          '.result__url', 
          '.result__extras__url', 
          'a[href]', 
          'a[data-testid="result-title-a"]'
        ];
        
        let title = '';
        let url = '';
        
        // Find title
        for (const selector of titleSelectors) {
          const element = result.querySelector(selector);
          if (element && element.innerText) {
            title = element.innerText.trim();
            break;
          }
        }
        
        // Find link
        for (const selector of linkSelectors) {
          const element = result.querySelector(selector);
          if (element && element.href && element.href.startsWith('http')) {
            url = element.href;
            break;
          }
        }
        
        // If we found both title and link, add to results
        if (title && url && !title.includes('Ad') && !title.includes('Sponsored')) {
          // Skip DuckDuckGo pages
          if (url.includes('duckduckgo.com')) continue;
          
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
    
    console.log(`Found ${results.length} real results from DuckDuckGo:`);
    results.forEach((result, i) => {
      console.log(`${i+1}. ${result.title} (${result.url})`);
    });
    
    return results;
  } catch (error) {
    console.error('Error searching DuckDuckGo:', error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Export the search function
module.exports = { searchDuckDuckGo };

