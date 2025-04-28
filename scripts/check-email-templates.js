const { Pool } = require('pg');
const fs = require('fs');

// Database connection configuration
const pool = new Pool({
  user: 'postgres',
  host: 'db.dvuiiloynbrtdrabtzsg.supabase.co',
  database: 'postgres',
  password: 'Yitbos88',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function queryDatabase() {
  const client = await pool.connect();
  try {
    // Check if email_templates table exists
    console.log('Checking if email_templates table exists...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Tables in database:');
    tablesResult.rows.forEach(row => console.log(`- ${row.table_name}`));
    
    // Check if email_templates table has any records
    console.log('\nChecking email_templates records...');
    const templatesResult = await client.query(`
      SELECT * FROM email_templates 
      ORDER BY created_at DESC 
      LIMIT 10;
    `);
    
    console.log(`\nFound ${templatesResult.rows.length} email templates:`);
    
    if (templatesResult.rows.length > 0) {
      // Save results to a file
      const outputPath = './email-templates-data.json';
      fs.writeFileSync(outputPath, JSON.stringify(templatesResult.rows, null, 2));
      console.log(`Results saved to ${outputPath}`);
      
      // Display template IDs and client IDs
      templatesResult.rows.forEach(template => {
        console.log(`- Template ID: ${template.id}, Client ID: ${template.client_id}, Title: ${template.title}, Status: ${template.status}`);
      });
      
      // Check clients table to verify client IDs exist
      console.log('\nVerifying client IDs in clients table...');
      const clientIds = [...new Set(templatesResult.rows.map(t => t.client_id))];
      
      for (const clientId of clientIds) {
        const clientResult = await client.query(`
          SELECT id, name FROM clients WHERE id = $1
        `, [clientId]);
        
        if (clientResult.rows.length > 0) {
          console.log(`- Client ID ${clientId} exists: ${clientResult.rows[0].name}`);
        } else {
          console.log(`- WARNING: Client ID ${clientId} does not exist in clients table!`);
        }
      }
      
      // Check user authentication setup
      console.log('\nChecking user authentication setup...');
      const authResult = await client.query(`
        SELECT id, email, role FROM auth.users LIMIT 5;
      `);
      
      console.log(`Found ${authResult.rows.length} users in auth.users table`);
      
      // Check if clients have user_id field
      console.log('\nChecking if clients have user_id field...');
      const clientsColumns = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clients';
      `);
      
      const hasUserIdColumn = clientsColumns.rows.some(col => col.column_name === 'user_id');
      console.log(`clients table ${hasUserIdColumn ? 'has' : 'does NOT have'} user_id column`);
      
      if (hasUserIdColumn) {
        const clientsWithUsers = await client.query(`
          SELECT id, name, user_id FROM clients WHERE user_id IS NOT NULL LIMIT 5;
        `);
        console.log(`Found ${clientsWithUsers.rows.length} clients with user_id values`);
      }
    } else {
      console.log('No email templates found in the database.');
    }
    
  } catch (err) {
    console.error('Database query error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

queryDatabase().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
