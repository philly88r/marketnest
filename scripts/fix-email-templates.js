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

async function fixEmailTemplates() {
  const client = await pool.connect();
  try {
    console.log('Checking email_templates table structure...');
    
    // Check table columns
    const columnsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'email_templates'
      ORDER BY ordinal_position;
    `);
    
    console.log('Email templates table columns:');
    columnsResult.rows.forEach(col => console.log(`- ${col.column_name} (${col.data_type})`));
    
    // Check for missing required columns
    const requiredColumns = ['id', 'client_id', 'title', 'subject', 'content', 'created_at', 'status'];
    const missingColumns = requiredColumns.filter(col => 
      !columnsResult.rows.some(dbCol => dbCol.column_name === col)
    );
    
    if (missingColumns.length > 0) {
      console.log(`\nWARNING: Missing required columns: ${missingColumns.join(', ')}`);
      
      // Add missing columns
      for (const col of missingColumns) {
        console.log(`Adding missing column: ${col}`);
        let dataType = 'text';
        if (col === 'created_at') dataType = 'timestamp with time zone';
        
        await client.query(`
          ALTER TABLE email_templates 
          ADD COLUMN IF NOT EXISTS ${col} ${dataType};
        `);
      }
      console.log('Added missing columns');
    }
    
    // Check for templates with missing required fields
    console.log('\nChecking for templates with missing required fields...');
    const templatesResult = await client.query(`
      SELECT * FROM email_templates 
      ORDER BY created_at DESC;
    `);
    
    console.log(`Found ${templatesResult.rows.length} email templates`);
    
    let fixedCount = 0;
    for (const template of templatesResult.rows) {
      let needsUpdate = false;
      const updates = {};
      
      // Check for missing required fields
      for (const field of requiredColumns) {
        if (template[field] === null || template[field] === undefined) {
          needsUpdate = true;
          
          // Set default values for missing fields
          switch (field) {
            case 'status':
              updates[field] = 'draft';
              break;
            case 'title':
              updates[field] = template.subject || 'Untitled Email';
              break;
            case 'subject':
              updates[field] = template.title || 'No Subject';
              break;
            case 'created_at':
              updates[field] = new Date();
              break;
            default:
              updates[field] = '';
          }
        }
      }
      
      // Update template if needed
      if (needsUpdate) {
        console.log(`Fixing template ${template.id} - Missing fields: ${Object.keys(updates).join(', ')}`);
        
        const setClause = Object.entries(updates)
          .map(([key, value]) => `${key} = $${Object.keys(updates).indexOf(key) + 1}`)
          .join(', ');
        
        await client.query(`
          UPDATE email_templates 
          SET ${setClause}
          WHERE id = $${Object.keys(updates).length + 1}
        `, [...Object.values(updates), template.id]);
        
        fixedCount++;
      }
    }
    
    console.log(`\nFixed ${fixedCount} templates with missing required fields`);
    
    // Verify client IDs exist in clients table
    console.log('\nVerifying client IDs in clients table...');
    const clientIds = [...new Set(templatesResult.rows.map(t => t.client_id))].filter(Boolean);
    
    for (const clientId of clientIds) {
      const clientResult = await client.query(`
        SELECT id, name FROM clients WHERE id = $1
      `, [clientId]);
      
      if (clientResult.rows.length === 0) {
        console.log(`WARNING: Client ID ${clientId} does not exist in clients table!`);
        console.log('Creating placeholder client record...');
        
        await client.query(`
          INSERT INTO clients (id, name, status)
          VALUES ($1, $2, 'active')
        `, [clientId, `Client ${clientId}`]);
        
        console.log(`Created placeholder client for ${clientId}`);
      }
    }
    
    console.log('\nEmail templates check and fix completed');
    
  } catch (err) {
    console.error('Database error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

fixEmailTemplates().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
