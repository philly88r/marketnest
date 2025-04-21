const express = require('express');
const axios = require('axios');
const cors = require('cors');
const router = express.Router();

/**
 * Proxy endpoint to fetch website data for SEO analysis
 * This avoids CORS issues when fetching from the browser
 */
router.get('/fetch', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    console.log(`Fetching SEO data for: ${url}`);
    
    // Set a user agent to avoid being blocked
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000, // 10 second timeout
      maxContentLength: 5000000 // Limit response size to 5MB
    });
    
    // Return the HTML content and headers
    res.json({
      html: response.data,
      headers: response.headers,
      status: response.status
    });
  } catch (error) {
    console.error('Error in SEO proxy:', error.message);
    
    // Send a more detailed error response
    res.status(500).json({
      error: 'Failed to fetch website data',
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      url: req.query.url
    });
  }
});

module.exports = router;
