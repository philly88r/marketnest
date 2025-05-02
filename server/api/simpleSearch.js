const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

// Debug route to verify the router is working
router.get('/test', (req, res) => {
  res.json({ status: 'ok', message: 'Simple search API is accessible' });
});

/**
 * Simple search implementation that uses direct HTTP requests
 * This is more reliable than browser automation for basic searches
 */
router.post('/search', async (req, res) => {
  const { keyword } = req.body;
  
  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' });
  }
  
  try {
    console.log(`Starting simple search for keyword: ${keyword}`);
    
    // Use a direct HTTP request to Bing with proper headers
    const searchResults = await searchBingDirect(keyword);
    
    if (!searchResults || searchResults.length === 0) {
      return res.status(404).json({ 
        error: 'No search results found.',
        competitors: [] 
      });
    }
    
    console.log(`Found ${searchResults.length} real results:`);
    searchResults.forEach((result, i) => {
      console.log(`${i+1}. ${result.title} (${result.url})`);
    });
    
    // Limit to top 3 competitors
    const competitors = searchResults.slice(0, 3).map(result => ({
      ...result,
      strengths: [],
      weaknesses: []
    }));
    
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
 * Search Bing using direct HTTP requests
 * @param {string} keyword - The keyword to search for
 * @returns {Promise<Array>} - Array of search results
 */
async function searchBingDirect(keyword) {
  try {
    // Encode the keyword for the URL
    const encodedKeyword = encodeURIComponent(keyword);
    
    // Set up headers to appear as a regular browser
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Not.A/Brand";v="8", "Chromium";v="123"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1'
    };
    
    // Make the request to Bing
    console.log(`Making direct request to Bing for: ${keyword}`);
    const response = await axios.get(`https://www.bing.com/search?q=${encodedKeyword}`, {
      headers,
      timeout: 10000
    });
    
    // Parse the HTML response
    const $ = cheerio.load(response.data);
    const results = [];
    
    // Extract search results using various selectors
    $('#b_results .b_algo, .b_algo, li.b_algo').each((i, element) => {
      // Find title and URL
      const titleElement = $(element).find('h2 a, .b_title a');
      const title = titleElement.text().trim();
      const url = titleElement.attr('href');
      
      // Skip ads, sponsored results, and non-http URLs
      if (
        title && 
        url && 
        url.startsWith('http') && 
        !url.includes('bing.com') && 
        !title.includes('Ad') && 
        !title.includes('Sponsored')
      ) {
        results.push({
          title,
          url,
          position: results.length + 1
        });
        
        // Stop after finding enough results
        if (results.length >= 5) {
          return false; // Break the each loop
        }
      }
    });
    
    return results;
  } catch (error) {
    console.error('Error in direct Bing search:', error);
    throw error;
  }
}

module.exports = router;
