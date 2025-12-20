# Supabase Setup Guide

Follow these steps to connect your DecorSense Gifts & Surprises website to Supabase.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: DecorSense Gifts (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project to initialize (2-3 minutes)

## Step 2: Run Database Migrations

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire content of `db/01_schema.sql` and paste it
4. Click **Run** (or press Ctrl+Enter)
5. Wait for success message
6. Create a new query
7. Copy the entire content of `db/02_seed.sql` and paste it
8. Click **Run**
9. Wait for success message

## Step 3: Create Storage Buckets

1. Go to **Storage** (left sidebar)
2. Click **Create a new bucket**
3. Create bucket named: `product-images`
   - Make it **Public** (toggle ON)
   - Click **Create bucket**
4. Create another bucket named: `gallery`
   - Make it **Public** (toggle ON)
   - Click **Create bucket**

## Step 4: Set Up Authentication

1. Go to **Authentication** → **Providers** (left sidebar)
2. Enable **Email** provider (should be enabled by default)
3. (Optional) Configure email templates if needed

## Step 5: Add Admin Email

1. Go to **Table Editor** (left sidebar)
2. Select the `admins` table
3. Click **Insert row**
4. Enter your email address in the `email` field
5. Click **Save**

**Important**: Only emails in this table can access the admin dashboard!

## Step 6: Get API Keys

1. Go to **Settings** → **API** (left sidebar)
2. You'll see:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 7: Configure Environment Variables

1. In your project root, create a file named `.env.local`
2. Add the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

3. Replace the values with your actual keys from Step 6
4. **Important**: Never commit `.env.local` to git!

## Step 8: Test the Connection

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000` - you should see the website
3. Visit `http://localhost:3000/admin/login` - log in with your admin email
4. You should be able to access the admin dashboard

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` file
- Make sure there are no extra spaces or quotes
- Restart your dev server after changing `.env.local`

### "Row Level Security policy violation"
- Make sure you ran `db/01_schema.sql` completely
- Check that RLS policies were created

### Can't log in to admin
- Make sure your email is in the `admins` table
- Check Authentication → Users to see if your user exists
- Try signing up first at `/admin/login` if you haven't created an account yet

### Images not uploading
- Verify `product-images` bucket exists and is public
- Check Storage → Policies to ensure uploads are allowed
- Make sure you're logged in as admin

## Next Steps

Once connected:
- ✅ Test creating a product in admin
- ✅ Upload product images
- ✅ Test real-time updates (change something in admin, see it update on frontend)
- ✅ Verify all categories and products from seed file are showing

## Security Notes

- **Never** commit `.env.local` to version control
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS - only use server-side
- Keep your service role key secret
- Regularly rotate your API keys in Supabase dashboard



