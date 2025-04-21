const { createClient } = require('@supabase/supabase-js');

// Use the same Supabase connection details as in the application
const supabase = createClient(
  'https://dvuiiloynbrtdrabtzsg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dWlpbG95bmJydGRyYWJ0enNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDM1MDksImV4cCI6MjA1OTg3OTUwOX0.aef4QCYboLzhyw8im1pGZe7v0tweAnQ3haN1T0mVLmE'
);

async function checkClientAuth() {
  console.log('Checking client authentication setup...');
  
  // Check Liberty Beans Coffee
  console.log('\n--- CHECKING LIBERTY BEANS COFFEE ---');
  const { data: libertyBeans, error: libertyError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', 'client-liberty-beans')
    .single();
  
  if (libertyError) {
    console.error('Error fetching Liberty Beans Coffee:', libertyError);
  } else {
    console.log('Liberty Beans Coffee client record:');
    console.log(libertyBeans);
    console.log('user_id:', libertyBeans.user_id);
    console.log('username (email for auth):', libertyBeans.username);
  }
  
  // Check Client-004
  console.log('\n--- CHECKING CLIENT-004 ---');
  const { data: client004, error: client004Error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', 'client-004')
    .single();
  
  if (client004Error) {
    console.error('Error fetching Client-004:', client004Error);
  } else {
    console.log('Client-004 record:');
    console.log(client004);
    console.log('user_id:', client004.user_id);
    console.log('username (email for auth):', client004.username);
  }
  
  // Check if the user_id for Client-004 exists in Supabase Auth
  // Note: This requires admin access which we don't have in this script
  // We can only check if the client record has a user_id set
  
  console.log('\n--- AUTHENTICATION ANALYSIS ---');
  if (libertyBeans && client004) {
    if (libertyBeans.user_id && !client004.user_id) {
      console.log('ISSUE DETECTED: Liberty Beans has a user_id but Client-004 does not.');
      console.log('Solution: Client-004 needs to be associated with a Supabase Auth user.');
    } else if (libertyBeans.user_id && client004.user_id) {
      console.log('Both clients have user_id values set:');
      console.log('- Liberty Beans user_id:', libertyBeans.user_id);
      console.log('- Client-004 user_id:', client004.user_id);
      console.log('If Client-004 login is not working, the issue may be with the Supabase Auth user account.');
    }
  }
}

// Run the check
checkClientAuth()
  .then(() => {
    console.log('\nCheck completed.');
  })
  .catch(error => {
    console.error('Error during check:', error);
  });
