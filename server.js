require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const googleAuthHandler = require('./src/api/googleAuthHandler');
const seoProxy = require('./server/seoProxy');
const searchConsoleApi = require('./server/searchConsoleApi');
const aiContentGenerator = require('./server/aiContentGenerator');
const context7Integration = require('./server/context7Integration');
const browserUseIntegration = require('./server/browserUseIntegration');
const geminiImageGenerator = require('./server/geminiImageGenerator');
// Import both crawlers to allow switching between them
const axiosCrawler = require('./server/axiosCrawler');
const playwrightCrawler = require('./server/playwrightCrawler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:3002',
    'https://marketnest.org',
    'https://www.marketnest.org'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// API routes
app.use('/api', googleAuthHandler);

// Health check endpoint for SEO service
app.get('/api/seo/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'SEO service is running' });
});

// SEO Crawler routes - must be defined BEFORE the general seoProxy
// Use Playwright crawler as the default crawler
app.get('/api/seo/crawl', playwrightCrawler.crawlWebsiteHandler);

// Keep the Axios crawler as a fallback option
app.get('/api/seo/crawl-axios', axiosCrawler.crawlWebsiteHandler);

// General SEO proxy for other SEO routes
app.use('/api/seo', seoProxy);

// Search Console API routes
app.post('/api/search-console', searchConsoleApi.getSearchConsoleData);
app.post('/api/search-console/pages', searchConsoleApi.getTopPages);
app.post('/api/search-console/queries', searchConsoleApi.getTopQueries);

// AI Content Generation route
app.post('/api/generate-content', aiContentGenerator.generateContent);

// Context7 MCP Integration routes
app.post('/api/context7/documentation', context7Integration.getContext7Documentation);
app.post('/api/context7/code-examples', context7Integration.getContext7CodeExamples);

// Browser Use Integration routes
app.post('/api/browser-use/research', browserUseIntegration.startWebResearch);
app.get('/api/browser-use/research/:taskId/status', browserUseIntegration.checkWebResearchStatus);
app.get('/api/browser-use/research/:taskId/results', browserUseIntegration.getWebResearchResults);
app.post('/api/browser-use/generate-content', browserUseIntegration.generateContentWithWebResearch);

// Gemini Image Generation route
app.post('/api/generate-image', geminiImageGenerator.handleImageGeneration);

// SEO Audit Prompt endpoint
app.get('/api/seo/audit-prompt', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const promptPath = path.join(__dirname, 'prompt.json');
    
    if (fs.existsSync(promptPath)) {
      // Read the file as plain text and set the content type explicitly
      const promptContent = fs.readFileSync(promptPath, 'utf8');
      res.setHeader('Content-Type', 'text/plain');
      res.send(promptContent);
    } else {
      res.status(404).send('Prompt file not found');
    }
  } catch (error) {
    console.error('Error reading prompt file:', error);
    res.status(500).send('Error reading prompt file');
  }
});

// SEO Crawler routes are defined above

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
