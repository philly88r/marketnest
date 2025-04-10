const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase credentials
const supabaseUrl = 'https://dvuiiloynbrtdrabtzsg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dWlpbG95bmJydGRyYWJ0enNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDM1MDksImV4cCI6MjA1OTg3OTUwOX0.aef4QCYboLzhyw8im1pGZe7v0tweAnQ3haN1T0mVLmE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('Setting up database tables for client portal...');

  try {
    // Create client_users table
    const { error: usersError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'client_users',
      columns: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        company TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `
    });

    if (usersError) throw usersError;
    console.log('✅ client_users table created');

    // Create channels table
    const { error: channelsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'channels',
      columns: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `
    });

    if (channelsError) throw channelsError;
    console.log('✅ channels table created');

    // Create messages table
    const { error: messagesError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'messages',
      columns: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        channel TEXT NOT NULL,
        content TEXT,
        attachments TEXT[],
        sender_name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `
    });

    if (messagesError) throw messagesError;
    console.log('✅ messages table created');

    // Insert default channels
    const defaultChannels = [
      { name: 'general', description: 'General discussion and announcements' },
      { name: 'project-updates', description: 'Updates on ongoing projects' },
      { name: 'file-sharing', description: 'Share files and documents' }
    ];

    for (const channel of defaultChannels) {
      const { error } = await supabase
        .from('channels')
        .upsert(channel, { onConflict: 'name' });
      
      if (error) {
        console.error(`Error inserting channel ${channel.name}:`, error);
      } else {
        console.log(`✅ Channel ${channel.name} created or updated`);
      }
    }

    // Create storage bucket for attachments
    const { error: bucketError } = await supabase.storage.createBucket('attachments', {
      public: true
    });

    if (bucketError && !bucketError.message.includes('already exists')) {
      throw bucketError;
    }
    console.log('✅ attachments storage bucket created');

    console.log('Database setup complete! ✨');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase();
