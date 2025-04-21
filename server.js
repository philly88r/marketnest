require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const googleAuthHandler = require('./src/api/googleAuthHandler');
const seoProxy = require('./server/seoProxy');
const searchConsoleApi = require('./server/searchConsoleApi');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', googleAuthHandler);
app.use('/api/seo', seoProxy);

// Search Console API routes
app.post('/api/search-console', searchConsoleApi.getSearchConsoleData);
app.post('/api/search-console/pages', searchConsoleApi.getTopPages);
app.post('/api/search-console/queries', searchConsoleApi.getTopQueries);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
