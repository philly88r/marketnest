const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Create a proxy middleware for Google AI APIs
  const googleAIProxy = createProxyMiddleware({
    target: 'https://generativelanguage.googleapis.com',
    changeOrigin: true,
    pathRewrite: {
      '^/api/gemini': '/v1beta',
      '^/api/imagen': '/v1beta'
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add the API key to the query parameters
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      const url = new URL(proxyReq.path, 'https://generativelanguage.googleapis.com');
      url.searchParams.append('key', apiKey);
      proxyReq.path = url.pathname + url.search;
    },
    onProxyRes: (proxyRes, req, res) => {
      // Log successful responses for debugging
      if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 300) {
        console.log(`Successful API call to: ${req.path}`);
      } else {
        console.warn(`API call failed with status: ${proxyRes.statusCode} for path: ${req.path}`);
      }
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.writeHead(500, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify({ 
        error: 'Proxy Error', 
        message: 'There was an error connecting to the Google AI API'
      }));
    }
  });

  // Create a proxy middleware for our backend API
  const backendProxy = createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    onProxyRes: (proxyRes, req, res) => {
      // Log successful responses for debugging
      if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 300) {
        console.log(`Successful backend API call to: ${req.path}`);
      } else {
        console.warn(`Backend API call failed with status: ${proxyRes.statusCode} for path: ${req.path}`);
      }
    },
    onError: (err, req, res) => {
      console.error('Backend proxy error:', err);
      res.writeHead(500, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify({ 
        error: 'Proxy Error', 
        message: 'There was an error connecting to the backend API'
      }));
    }
  });

  // Apply the proxy to all /api/gemini and /api/imagen routes
  app.use('/api/gemini', googleAIProxy);
  app.use('/api/imagen', googleAIProxy);
  
  // Apply the backend proxy to all other API routes
  app.use('/api/search-console', backendProxy);
  app.use('/api/competitor-analysis', backendProxy);
  app.use('/api/competitor-search', backendProxy);
  app.use('/api/simple-search', backendProxy);
  app.use('/api/seo-audit', backendProxy);
};
