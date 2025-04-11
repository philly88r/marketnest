# Supabase Setup Guide for MarketNest Client Portal

This guide will walk you through setting up your Supabase project for the MarketNest client portal, including database tables, storage buckets, and authentication.

## 1. Database Setup

1. Log in to your Supabase dashboard at [https://app.supabase.io/](https://app.supabase.io/)
2. Select your project
3. Go to the SQL Editor
4. Copy and paste the contents of `setup-database.sql` into the SQL editor
5. Click "Run" to execute the SQL script

## 2. Storage Bucket Setup

1. In your Supabase dashboard, navigate to "Storage" in the left sidebar
2. Create a new bucket called `client-files`
3. Set the bucket privacy to "Private" (not public)
4. Configure bucket policies:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects FOR INSERT 
TO authenticated USING (
  bucket_id = 'client-files' AND 
  (auth.jwt() ->> 'role' = 'admin' OR 
   (storage.foldername(name))[1] = auth.jwt() ->> 'client_id')
);

-- Allow users to view their own files
CREATE POLICY "Allow users to view their own files" 
ON storage.objects FOR SELECT 
TO authenticated USING (
  bucket_id = 'client-files' AND 
  (auth.jwt() ->> 'role' = 'admin' OR 
   (storage.foldername(name))[1] = auth.jwt() ->> 'client_id')
);

-- Allow users to update their own files
CREATE POLICY "Allow users to update their own files" 
ON storage.objects FOR UPDATE 
TO authenticated USING (
  bucket_id = 'client-files' AND 
  (auth.jwt() ->> 'role' = 'admin' OR 
   (storage.foldername(name))[1] = auth.jwt() ->> 'client_id')
);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete their own files" 
ON storage.objects FOR DELETE 
TO authenticated USING (
  bucket_id = 'client-files' AND 
  (auth.jwt() ->> 'role' = 'admin' OR 
   (storage.foldername(name))[1] = auth.jwt() ->> 'client_id')
);
```

## 3. Authentication Setup

### Create Admin User

1. Go to "Authentication" → "Users" in the Supabase dashboard
2. Click "Invite user" and enter your admin email
3. Set a secure password
4. After the user is created, click on the user and go to "Edit"
5. In the metadata section, add:
```json
{
  "role": "admin"
}
```

### Set Up Client Authentication

For client authentication, we'll use the existing client usernames and passwords from the database. We need to create a custom login function:

1. Go to the SQL Editor
2. Run the following SQL:

```sql
-- Create a function for client login
CREATE OR REPLACE FUNCTION client_login(client_username TEXT, client_password TEXT)
RETURNS json AS $$
DECLARE
  client_record clients;
  token_lifetime INTEGER := 60 * 60 * 24 * 7; -- 1 week in seconds
  result json;
BEGIN
  -- Find the client
  SELECT * INTO client_record
  FROM clients
  WHERE username = client_username AND password = client_password;
  
  -- If client exists, generate a JWT token
  IF client_record.id IS NOT NULL THEN
    result := json_build_object(
      'access_token', extensions.sign_jwt(
        json_build_object(
          'role', 'client',
          'client_id', client_record.id,
          'exp', extract(epoch from now())::integer + token_lifetime
        ),
        current_setting('app.jwt_secret')
      ),
      'client', json_build_object(
        'id', client_record.id,
        'name', client_record.name,
        'username', client_record.username
      )
    );
    RETURN result;
  ELSE
    RETURN json_build_object('error', 'Invalid username or password');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function for admin login (using Supabase Auth)
CREATE OR REPLACE FUNCTION check_admin_role()
RETURNS boolean AS $$
BEGIN
  RETURN auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 4. API Integration

Update your `supabaseClient.ts` file to include the custom client login function:

```typescript
// Add this function to your supabaseClient.ts
export const clientLogin = async (username: string, password: string) => {
  const { data, error } = await supabase
    .rpc('client_login', { client_username: username, client_password: password });
    
  if (error) {
    throw error;
  }
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  // Store the token in local storage
  localStorage.setItem('client-token', data.access_token);
  localStorage.setItem('client-data', JSON.stringify(data.client));
  
  return data.client;
};

// Add this function to check if user is logged in as a client
export const isClientLoggedIn = () => {
  return localStorage.getItem('client-token') !== null;
};

// Add this function to get the current client data
export const getCurrentClient = () => {
  const clientData = localStorage.getItem('client-data');
  return clientData ? JSON.parse(clientData) : null;
};

// Add this function to logout a client
export const clientLogout = () => {
  localStorage.removeItem('client-token');
  localStorage.removeItem('client-data');
};
```

## 5. Environment Variables

Make sure your `.env` file contains the following variables:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 6. Security Considerations

1. In a production environment, never store passwords in plain text. Use proper password hashing.
2. Consider implementing rate limiting for login attempts.
3. Set up proper CORS policies in your Supabase project settings.
4. Regularly audit your RLS policies to ensure they're working as expected.

## 7. Testing Your Setup

1. After completing the setup, test client login using the sample data provided.
2. Test file uploads and downloads to ensure storage permissions are working correctly.
3. Test creating, reading, updating, and deleting data in all tables to verify RLS policies.
