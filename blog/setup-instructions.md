# Supabase Setup Instructions

Follow these steps to set up your experiments site with Supabase:

## 1. Create a Supabase Account

1. Go to https://supabase.com
2. Sign up for a free account
3. Create a new project

## 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings > API**
2. Copy the **Project URL** and **anon/public key**
3. Open `supabase-config.js` and replace:
   - `YOUR_SUPABASE_URL` with your Project URL
   - `YOUR_SUPABASE_ANON_KEY` with your anon key

## 3. Create the Database Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste this SQL:

```sql
-- Create posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  thumbnail TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('external', 'content')),
  external_link TEXT,
  content TEXT,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow authenticated users to read all posts
CREATE POLICY "Allow authenticated users to read posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert their own posts
CREATE POLICY "Allow authenticated users to insert posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own posts
CREATE POLICY "Allow users to update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Allow users to delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow anonymous users to read posts (for public blog)
CREATE POLICY "Allow anonymous users to read posts"
  ON posts FOR SELECT
  TO anon
  USING (true);
```

4. Click **Run** to execute the SQL

## 4. Create Storage Bucket for Images

1. In your Supabase dashboard, go to **Storage**
2. Click **New bucket**
3. Name it `lab-thumbnails`
4. Make it **Public** (so images can be viewed on the blog)
5. Click **Create bucket**

6. Set up storage policies by going to **Policies** tab:
   - Add a policy to allow authenticated users to upload
   - Add a policy to allow public read access

Or run this SQL in the SQL Editor:

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'lab-thumbnails');

-- Allow public access to images
CREATE POLICY "Allow public access to images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'lab-thumbnails');

-- Allow users to delete their uploaded images
CREATE POLICY "Allow authenticated users to delete images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'lab-thumbnails');
```

## 5. Create Your Admin User

1. In your Supabase dashboard, go to **Authentication > Users**
2. Click **Add user**
3. Choose **Create new user**
4. Enter your email and create a password
5. Click **Create user**

## 6. Test Your Site

1. Open `index.html` in a web browser
2. Sign in with the email and password you created
3. Add a test post
4. Open `blog.html` to see the public experiments view

## Notes

- The admin page (`index.html`) requires authentication
- The experiments page (`blog.html`) is public and shows all posts
- URLs don't require `http://` - they'll be automatically added
- Images can be uploaded or linked via URL
- All data is stored in Supabase
- Posts can be edited or deleted from the admin panel

## Troubleshooting

If you encounter CORS errors:
1. Make sure you're serving the files through a web server (not just `file://`)
2. You can use a simple local server: `python -m http.server 8000`
3. Then access via `http://localhost:8000/index.html`

If authentication doesn't work:
1. Verify your Supabase credentials in `supabase-config.js`
2. Check that you created the user in Supabase Authentication
3. Make sure the user's email is confirmed (you can manually confirm in Supabase dashboard)
