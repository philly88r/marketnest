const express = require('express');
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const dotenv = require('dotenv');
const router = express.Router();

// Load environment variables
dotenv.config();

// Create JWT client for authentication
const createJwtClient = () => {
  try {
    return new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });
  } catch (error) {
    console.error('Error creating JWT client:', error);
    console.error('Service account email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.error('Private key available:', !!process.env.GOOGLE_PRIVATE_KEY);
    throw new Error('Failed to authenticate with Google Search Console API');
  }
};

// Database connection for client lookup
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get overall Search Console data
router.post('/', async (req, res) => {
  try {
    console.log('Received request for Search Console data:', req.body);
    const { siteUrl, clientId, startDate, endDate, limit = 50 } = req.body;
    
    if (!siteUrl && !clientId) {
      console.error('No siteUrl or clientId provided in request');
      return res.status(400).json({ error: 'siteUrl or clientId is required' });
    }
    
    // Special logging for Liberty Beans Coffee
    if (clientId === 'client-liberty-beans' || (siteUrl && siteUrl.includes('libertybeanscoffee.com'))) {
      console.log('===== LIBERTY BEANS COFFEE: SEARCH CONSOLE REQUEST =====');
      console.log(`LIBERTY BEANS CLIENT ID: ${clientId}`);
      console.log(`LIBERTY BEANS SITE URL: ${siteUrl}`);
      console.log(`LIBERTY BEANS DATE RANGE: ${startDate} to ${endDate}`);
      console.log('=================================================');
    } else {
      console.log(`Fetching Search Console data for site: ${siteUrl}`);
      console.log(`Date range: ${startDate} to ${endDate}`);
    }
    
    let websiteUrl = siteUrl;
    
    // If clientId is provided but no siteUrl, look up the client's website URL
    if (clientId && !websiteUrl) {
      console.log(`Looking up website URL for client: ${clientId}`);
      const { data, error } = await supabase
        .from('clients')
        .select('website_url')
        .eq('id', clientId)
        .single();
        
      if (error || !data?.website_url) {
        console.error('Error fetching client website URL:', error || 'No website URL found');
        return res.status(400).json({ error: 'Client website URL not found' });
      }
      
      websiteUrl = data.website_url;
      console.log(`Found website URL: ${websiteUrl}`);
    }
    
    console.log('Using website URL:', websiteUrl);
    
    if (!websiteUrl || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const jwtClient = createJwtClient();
    const searchConsoleClient = google.webmasters({
      version: 'v3',
      auth: jwtClient
    });

    // Query for overall site metrics
    console.log('Querying Search Console API for overall site metrics...');
    console.log('Query parameters:', { siteUrl: websiteUrl, startDate, endDate });
    
    let siteData;
    try {
      siteData = await searchConsoleClient.searchanalytics.query({
        siteUrl: websiteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: [],
          rowLimit: 1
        }
      });
      console.log('Successfully received overall site metrics');
      
      // Special handling for Liberty Beans Coffee
      if (clientId === 'client-liberty-beans' || websiteUrl.includes('libertybeanscoffee.com')) {
        console.log('===== LIBERTY BEANS COFFEE: SEARCH CONSOLE RESPONSE =====');
        console.log('Response data:', JSON.stringify(siteData.data, null, 2));
        console.log('=================================================');
      }
      
      // Don't return data yet, continue with other queries
    } catch (error) {
      console.error('Error querying Search Console API for overall site metrics:', error);
      throw error;
    }

    // Query for device breakdown
    const deviceData = await searchConsoleClient.searchanalytics.query({
      siteUrl: websiteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['device'],
        rowLimit: 3
      }
    });

    // Query for country breakdown
    const countryData = await searchConsoleClient.searchanalytics.query({
      siteUrl: websiteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['country'],
        rowLimit: 10
      }
    });
    
    // Query for top pages
    const pagesData = await searchConsoleClient.searchanalytics.query({
      siteUrl: websiteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 20 // Show more pages
      }
    });
    
    // Query for top queries
    const queriesData = await searchConsoleClient.searchanalytics.query({
      siteUrl: websiteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 20 // Show more queries
      }
    });

    // Process and format the response
    const response = {
      clicks: 0,
      impressions: 0,
      ctr: 0,
      position: 0,
      devices: [],
      countries: [],
      pages: [],
      queries: []
    };

    // Process overall metrics
    if (siteData.data.rows && siteData.data.rows.length > 0) {
      const row = siteData.data.rows[0];
      response.clicks = row.clicks;
      response.impressions = row.impressions;
      response.ctr = row.ctr;
      response.position = row.position;
    }

    // Process device data
    if (deviceData.data.rows && deviceData.data.rows.length > 0) {
      response.devices = deviceData.data.rows.map(row => ({
        device: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position
      }));
    }

    // Process country data
    if (countryData.data.rows && countryData.data.rows.length > 0) {
      response.countries = countryData.data.rows.map(row => ({
        country: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position
      }));
    }
    
    // Process pages data
    if (pagesData.data.rows && pagesData.data.rows.length > 0) {
      response.pages = pagesData.data.rows.map(row => ({
        page: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position
      }));
    }
    
    // Process queries data
    if (queriesData.data.rows && queriesData.data.rows.length > 0) {
      response.queries = queriesData.data.rows.map(row => ({
        query: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position
      }));
    }

    console.log('Sending response to client:', response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching Search Console data:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ error: 'Failed to fetch Search Console data', message: error.message });
  }
});

// Get top pages from Search Console
router.post('/pages', async (req, res) => {
  try {
    const { siteUrl, clientId, startDate, endDate, rowLimit = 10 } = req.body;
    let websiteUrl = siteUrl;
    
    // If clientId is provided but no siteUrl, look up the client's website URL
    if (clientId && !websiteUrl) {
      const { data, error } = await supabase
        .from('clients')
        .select('website_url')
        .eq('id', clientId)
        .single();
        
      if (error || !data?.website_url) {
        return res.status(400).json({ error: 'Client website URL not found' });
      }
      
      websiteUrl = data.website_url;
    }
    
    if (!websiteUrl || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const jwtClient = createJwtClient();
    const searchConsoleClient = google.webmasters({
      version: 'v3',
      auth: jwtClient
    });

    // Query for top pages
    const pagesData = await searchConsoleClient.searchanalytics.query({
      siteUrl: websiteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 50 // Increased to show more pages
      }
    });

    // Process and format the response
    const pages = [];

    if (pagesData.data.rows && pagesData.data.rows.length > 0) {
      pagesData.data.rows.forEach(row => {
        pages.push({
          page: row.keys[0],
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position
        });
      });
    }

    res.json({ pages });
  } catch (error) {
    console.error('Error fetching top pages:', error);
    res.status(500).json({ error: 'Failed to fetch top pages from Search Console' });
  }
});

// Get top queries from Search Console
router.post('/queries', async (req, res) => {
  try {
    const { siteUrl, clientId, startDate, endDate, rowLimit = 10 } = req.body;
    let websiteUrl = siteUrl;
    
    // If clientId is provided but no siteUrl, look up the client's website URL
    if (clientId && !websiteUrl) {
      const { data, error } = await supabase
        .from('clients')
        .select('website_url')
        .eq('id', clientId)
        .single();
        
      if (error || !data?.website_url) {
        return res.status(400).json({ error: 'Client website URL not found' });
      }
      
      websiteUrl = data.website_url;
    }
    
    if (!websiteUrl || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const jwtClient = createJwtClient();
    const searchConsoleClient = google.webmasters({
      version: 'v3',
      auth: jwtClient
    });

    // Query for top queries
    const queriesData = await searchConsoleClient.searchanalytics.query({
      siteUrl: websiteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 50 // Increased to show more keywords
      }
    });

    // Process and format the response
    const queries = [];

    if (queriesData.data.rows && queriesData.data.rows.length > 0) {
      queriesData.data.rows.forEach(row => {
        queries.push({
          query: row.keys[0],
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position
        });
      });
    }

    res.json({ queries });
  } catch (error) {
    console.error('Error fetching top queries:', error);
    res.status(500).json({ error: 'Failed to fetch top queries from Search Console' });
  }
});

module.exports = router;
