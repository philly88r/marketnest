// Script to update client website URLs for Google Search Console integration
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateClientWebsiteUrls() {
  console.log('Updating client website URLs...');

  // Define the updates to make
  const clientUpdates = [
    { id: 'client-004', name: 'Altare', website_url: 'https://www.joinaltare.com' },
    { id: 'client-002', name: 'ProTech Carpet Care', website_url: 'https://www.protechcarpetcare.com' },
    { id: 'client-003', name: 'STFD Fence', website_url: 'https://www.stfdfence.com' }
  ];

  // Update each client
  for (const client of clientUpdates) {
    const { error } = await supabase
      .from('clients')
      .update({ website_url: client.website_url })
      .eq('id', client.id);

    if (error) {
      console.error(`Error updating ${client.name}:`, error);
    } else {
      console.log(`Updated ${client.name} with website URL: ${client.website_url}`);
    }
  }

  // Verify the updates
  const { data, error } = await supabase
    .from('clients')
    .select('id, name, website_url');

  if (error) {
    console.error('Error fetching updated clients:', error);
  } else {
    console.log('\nCurrent client website URLs:');
    data.forEach(client => {
      console.log(`${client.name}: ${client.website_url || 'No website URL'}`);
    });
  }
}

// Run the update function
updateClientWebsiteUrls()
  .catch(error => console.error('Unhandled error:', error))
  .finally(() => console.log('Script completed'));
