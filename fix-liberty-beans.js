const { Client } = require('pg');

// Connect to the database
const client = new Client({
  connectionString: 'postgresql://postgres:Yitbos88@db.dvuiiloynbrtdrabtzsg.supabase.co:5432/postgres'
});

async function fixLibertyBeansClient() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check if Liberty Beans client exists
    const checkResult = await client.query(`
      SELECT * FROM clients WHERE id = 'client-001'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('Liberty Beans client found, updating to ensure it\'s clickable...');
      
      // Update the Liberty Beans client to ensure all fields are properly formatted
      const updateResult = await client.query(`
        UPDATE clients 
        SET 
          name = 'Liberty Beans Coffee',
          logo = '/client-logos/liberty-beans.png',
          industry = 'Food & Beverage',
          contactname = 'Liberty Beans',
          contactemail = 'jim@libertybeans.com',
          contactphone = '(609) 707-6779',
          activeprojects = 3,
          status = 'active',
          username = 'libertybeans',
          password = 'coffee2025'
        WHERE id = 'client-001'
        RETURNING *
      `);
      
      console.log('Liberty Beans client updated successfully:');
      console.log(JSON.stringify(updateResult.rows[0], null, 2));
    } else {
      console.log('Liberty Beans client not found, creating it...');
      
      // Insert Liberty Beans client if it doesn't exist
      const insertResult = await client.query(`
        INSERT INTO clients (
          id, name, logo, industry, contactname, contactemail, 
          contactphone, activeprojects, status, username, password
        ) VALUES (
          'client-001', 
          'Liberty Beans Coffee', 
          '/client-logos/liberty-beans.png', 
          'Food & Beverage', 
          'Liberty Beans', 
          'jim@libertybeans.com', 
          '(609) 707-6779', 
          3, 
          'active', 
          'libertybeans', 
          'coffee2025'
        )
        RETURNING *
      `);
      
      console.log('Liberty Beans client created successfully:');
      console.log(JSON.stringify(insertResult.rows[0], null, 2));
    }

    // Verify that Liberty Beans client is now in the database
    const verifyResult = await client.query(`
      SELECT * FROM clients WHERE id = 'client-001'
    `);
    
    console.log('\nVerification - Liberty Beans client in database:');
    console.log(JSON.stringify(verifyResult.rows[0], null, 2));

  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await client.end();
    console.log('\nDisconnected from database');
  }
}

fixLibertyBeansClient();
