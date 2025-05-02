const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

/**
 * Search Bing using Selenium WebDriver and return top results
 * Selenium often has better success with avoiding anti-bot detection
 */
async function searchBingWithSelenium(keyword) {
  let driver = null;
  
  try {
    console.log('====== STARTING SELENIUM BING SEARCH ======');
    console.log(`Searching Bing for keyword: ${keyword}`);
    
    // Set up Chrome options with anti-detection measures
    const options = new chrome.Options();
    
    // Add arguments to avoid detection
    options.addArguments(
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-infobars',
      '--disable-dev-shm-usage',
      '--disable-browser-side-navigation',
      '--disable-gpu',
      '--window-size=1920,1080'
    );
    
    // Set user preferences to avoid detection
    options.setUserPreferences({
      'credentials_enable_service': false,
      'profile.password_manager_enabled': false,
      'profile.default_content_setting_values.notifications': 2
    });
    
    // Set user agent to appear as a regular browser
    options.addArguments('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
    
    // Build the WebDriver with our options
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    // Set implicit wait time
    await driver.manage().setTimeouts({ implicit: 10000 });
    
    // Navigate to Bing
    console.log('Navigating to Bing...');
    await driver.get('https://www.bing.com/');
    
    // Take screenshot of Bing homepage
    await takeScreenshot(driver, 'bing-homepage.png');
    
    // Find the search box and enter the keyword
    console.log(`Searching for keyword: ${keyword}`);
    const searchBox = await driver.findElement(By.name('q'));
    await searchBox.sendKeys(keyword);
    await takeScreenshot(driver, 'bing-after-fill.png');
    
    // Add a small delay to appear more human-like
    await driver.sleep(Math.floor(Math.random() * 500) + 500);
    
    // Press Enter to search
    await searchBox.sendKeys(Key.RETURN);
    
    // Wait for search results to load
    console.log('Waiting for search results...');
    try {
      await driver.wait(until.elementsLocated(By.css('#b_results .b_algo, .b_algo')), 10000);
      console.log('Results selector appeared.');
    } catch (e) {
      console.error('Timeout waiting for results selector:', e);
      await takeScreenshot(driver, 'bing-waitforselector-timeout.png');
    }
    
    // Take screenshot of search results
    await takeScreenshot(driver, 'bing-search-results.png');
    
    // Extract search results
    const results = await driver.executeScript(() => {
      const organicResults = [];
      
      // Get all result elements
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
    console.error('Error searching Bing with Selenium:', error);
    console.error('Error stack:', error.stack);
    console.error('====== SELENIUM SEARCH FAILED ======');
    
    // Check if we have a specific error related to ChromeDriver
    if (error.message && error.message.includes('chromedriver')) {
      console.error('ChromeDriver error detected. Make sure ChromeDriver is installed and in your PATH.');
    }
    
    // Check if we have a specific error related to Selenium
    if (error.message && error.message.includes('selenium')) {
      console.error('Selenium WebDriver error detected. Check your Selenium installation.');
    }
    
    return [];
  } finally {
    // Always quit the driver to clean up resources
    if (driver) {
      await driver.quit();
    }
  }
}

/**
 * Helper function to take screenshots
 */
async function takeScreenshot(driver, filename) {
  try {
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync(filename, screenshot, 'base64');
    console.log(`Screenshot saved as ${filename}`);
  } catch (error) {
    console.error(`Error taking screenshot ${filename}:`, error);
  }
}

// Export the search function
module.exports = { searchBingWithSelenium };
