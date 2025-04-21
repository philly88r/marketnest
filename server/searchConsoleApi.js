require('dotenv').config();
const { searchconsole } = require('@googleapis/searchconsole');
const { GoogleAuth } = require('google-auth-library');

// Create authentication client
const auth = new GoogleAuth({
  credentials: {
    client_email: process.env.SEARCH_CONSOLE_CLIENT_EMAIL,
    private_key: process.env.SEARCH_CONSOLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});

// Create Search Console client
const searchConsoleClient = searchconsole({
  version: 'v1',
  auth,
});

/**
 * Get overall Search Console data
 */
async function getSearchConsoleData(req, res) {
  try {
    const { siteUrl, startDate, endDate } = req.body;

    if (!siteUrl || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get overall metrics
    const response = await searchConsoleClient.searchanalytics.query({
      siteUrl,
      startDate,
      endDate,
    });

    // Get top pages
    const pagesResponse = await searchConsoleClient.searchanalytics.query({
      siteUrl,
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit: 10,
    });

    // Get top queries
    const queriesResponse = await searchConsoleClient.searchanalytics.query({
      siteUrl,
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: 10,
    });

    // Get device breakdown
    const devicesResponse = await searchConsoleClient.searchanalytics.query({
      siteUrl,
      startDate,
      endDate,
      dimensions: ['device'],
    });

    // Get country breakdown
    const countriesResponse = await searchConsoleClient.searchanalytics.query({
      siteUrl,
      startDate,
      endDate,
      dimensions: ['country'],
      rowLimit: 10,
    });

    // Format the response
    const result = {
      clicks: response.data.rows?.[0]?.clicks || 0,
      impressions: response.data.rows?.[0]?.impressions || 0,
      ctr: response.data.rows?.[0]?.ctr || 0,
      position: response.data.rows?.[0]?.position || 0,
      pages: pagesResponse.data.rows?.map(row => ({
        page: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
      })) || [],
      queries: queriesResponse.data.rows?.map(row => ({
        query: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
      })) || [],
      devices: devicesResponse.data.rows?.map(row => ({
        device: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
      })) || [],
      countries: countriesResponse.data.rows?.map(row => ({
        country: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
      })) || [],
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching Search Console data:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get top pages from Search Console
 */
async function getTopPages(req, res) {
  try {
    const { siteUrl, startDate, endDate, rowLimit = 10 } = req.body;

    if (!siteUrl || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const response = await searchConsoleClient.searchanalytics.query({
      siteUrl,
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit,
    });

    const pages = response.data.rows?.map(row => ({
      page: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    })) || [];

    res.json({ pages });
  } catch (error) {
    console.error('Error fetching top pages:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get top queries from Search Console
 */
async function getTopQueries(req, res) {
  try {
    const { siteUrl, startDate, endDate, rowLimit = 10 } = req.body;

    if (!siteUrl || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const response = await searchConsoleClient.searchanalytics.query({
      siteUrl,
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit,
    });

    const queries = response.data.rows?.map(row => ({
      query: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    })) || [];

    res.json({ queries });
  } catch (error) {
    console.error('Error fetching top queries:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getSearchConsoleData,
  getTopPages,
  getTopQueries,
};
