// Script to test the Google Search Console API integration
const axios = require('axios');

async function testSearchConsoleAPI() {
  console.log('Testing Search Console API...');
  
  try {
    // Test client - using Liberty Beans Coffee
    const clientId = 'client-liberty-beans';
    
    // Calculate date range (last 30 days)
    const endDate = new Date().toISOString().split('T')[0]; // Today in YYYY-MM-DD format
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const formattedStartDate = startDate.toISOString().split('T')[0];
    
    console.log(`Date range: ${formattedStartDate} to ${endDate}`);
    console.log(`Client ID: ${clientId}`);
    
    // Make a request to the Search Console API endpoint
    const response = await axios.post('http://localhost:5000/api/search-console', {
      clientId,
      startDate: formattedStartDate,
      endDate
    });
    
    console.log('Search Console API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('Error testing Search Console API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the test function
testSearchConsoleAPI()
  .catch(error => console.error('Unhandled error:', error))
  .finally(() => console.log('Test completed'));
