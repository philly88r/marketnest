const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const competitorAnalysisRoutes = require('./api/competitorAnalysis');
const competitorSearchRoutes = require('./api/competitorSearch');
const simpleSearchRoutes = require('./api/simpleSearch');
const seoAuditRoutes = require('./api/seoAudit');
const searchConsoleRoutes = require('./api/searchConsole');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for larger HTML content
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/competitor-analysis', competitorAnalysisRoutes);
app.use('/api/competitor-search', competitorSearchRoutes); // Direct Selenium search endpoint
app.use('/api/simple-search', simpleSearchRoutes); // New simple HTTP-based search endpoint
app.use('/api/seo-audit', seoAuditRoutes);
app.use('/api/search-console', searchConsoleRoutes); // Google Search Console API

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check request received');
  res.json({ status: 'ok', message: 'Server is running' });
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  console.log('API health check request received');
  res.json({ status: 'ok', message: 'API server is running', timestamp: new Date().toISOString() });
});

// Test endpoint for competitor analysis
app.get('/api/test-competitor', (req, res) => {
  res.json({ status: 'ok', message: 'Competitor analysis API is accessible' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
