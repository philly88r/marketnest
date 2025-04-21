// Simple script to test database connection
const { testDatabaseConnection, testTableRead, testTableWrite } = require('./databaseTest');

async function runTests() {
  console.log('=== Starting Database Tests ===');
  
  // Test basic connection
  console.log('\n1. Testing Database Connection:');
  const connectionResult = await testDatabaseConnection();
  console.log('Connection Test Result:', connectionResult);
  
  // Test reading from tables
  const tablesToRead = ['clients', 'client_projects', 'client_project_tasks', 'client_checklist_items'];
  console.log('\n2. Testing Read Access to Tables:');
  
  for (const table of tablesToRead) {
    console.log(`\nTesting read access to ${table}:`);
    const readResult = await testTableRead(table);
    console.log(`Read Test Result for ${table}:`, readResult);
  }
  
  // Test writing to client_projects table
  console.log('\n3. Testing Write Access to client_projects:');
  const writeResult = await testTableWrite('client_projects');
  console.log('Write Test Result:', writeResult);
  
  console.log('\n=== Database Tests Completed ===');
}

runTests().catch(error => {
  console.error('Error running tests:', error);
});
