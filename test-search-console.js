// Test script to verify Google Search Console API credentials
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const dotenv = require('dotenv');

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

// Test function to query Search Console API
const testSearchConsoleAPI = async () => {
  try {
    console.log('Testing Google Search Console API credentials...');
    console.log('Service account email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    
    // Create JWT client
    console.log('Creating JWT client...');
    const jwtClient = createJwtClient();
    console.log('JWT client created successfully');
    
    // Initialize Search Console client
    console.log('Initializing Search Console client...');
    const webmasters = google.webmasters({
      version: 'v3',
      auth: jwtClient
    });
    console.log('Search Console client initialized');
    
    // List sites to verify access
    console.log('Listing sites to verify access...');
    const siteList = await webmasters.sites.list();
    console.log('Sites list retrieved successfully');
    
    // Print the list of sites
    console.log('Sites available:');
    if (siteList.data.siteEntry && siteList.data.siteEntry.length > 0) {
      siteList.data.siteEntry.forEach(site => {
        console.log(`- ${site.siteUrl} (Permission level: ${site.permissionLevel})`);
      });
    } else {
      console.log('No sites found or no permission to access sites');
    }
    
    // Test a simple query for the first site (if available)
    if (siteList.data.siteEntry && siteList.data.siteEntry.length > 0) {
      const testSite = siteList.data.siteEntry[0].siteUrl;
      console.log(`\nTesting query for site: ${testSite}`);
      
      // Get today's date and 30 days ago for the query
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const formattedStartDate = startDate.toISOString().split('T')[0];
      
      console.log(`Query date range: ${formattedStartDate} to ${endDate}`);
      
      // Query for overall site metrics
      const siteData = await webmasters.searchanalytics.query({
        siteUrl: testSite,
        requestBody: {
          startDate: formattedStartDate,
          endDate,
          dimensions: [],
          rowLimit: 1
        }
      });
      
      console.log('Query successful!');
      console.log('Data received:', JSON.stringify(siteData.data, null, 2));
    }
    
    console.log('\nAPI credentials are working correctly!');
  } catch (error) {
    console.error('Error testing Search Console API:', error);
    if (error.response) {
      console.error('API response error:', error.response.data);
    }
  }
};

// Run the test
testSearchConsoleAPI();
