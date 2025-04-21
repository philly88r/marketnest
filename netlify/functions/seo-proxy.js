const axios = require('axios');

exports.handler = async function(event, context) {
  try {
    // Get the URL from the query parameters
    const url = event.queryStringParameters.url;
    
    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'URL parameter is required' })
      };
    }
    
    console.log(`Netlify Function: Fetching SEO data for: ${url}`);
    
    // Set a user agent to avoid being blocked
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000, // 10 second timeout
      maxContentLength: 5000000, // Limit response size to 5MB
      responseType: 'text' // Ensure we get the raw HTML as text
    });
    
    // Return the HTML content directly
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*'
      },
      body: response.data
    };
  } catch (error) {
    console.error('Error in SEO proxy:', error.message);
    
    // Send a more detailed error response
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch website data',
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        url: event.queryStringParameters.url
      })
    };
  }
};
