# LearnFlow - Complete Setup Guide

This guide will walk you through setting up LearnFlow locally step-by-step.

## What You'll Need

- A computer with Node.js 18 or newer installed
- A free Supabase account
- About 15 minutes

## Step-by-Step Setup

### 1. Download the Project

If you downloaded this as a ZIP file from v0:
```bash
# Extract the ZIP and navigate to the folder
cd learnflow
```

If you have it in a Git repository:
```bash
git clone <your-repo-url>
cd learnflow
```

### 2. Install Node.js Packages

Open your terminal in the project folder and run:

```bash
npm install
```

This will install all required dependencies (Next.js, React, Supabase, etc.). It might take 1-2 minutes.

### 3. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up or log in
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: LearnFlow (or any name you like)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to you
4. Click **"Create new project"**
5. Wait 1-2 minutes for Supabase to set up your database

### 4. Get Your Supabase Credentials

Once your project is ready:

1. In your Supabase dashboard, click on **⚙️ Project Settings** (bottom left)
2. Click on **API** in the left sidebar
3. You'll see two important values:
   - **Project URL** - looks like `https://xxxxx.supabase.co`
   - **anon public** key - a long string starting with `eyJ...`
4. Keep this tab open, you'll need these values

### 5. Configure Environment Variables

1. In your project folder, find the file `.env.local.example`
2. Make a copy and rename it to `.env.local` (remove the `.example`)
3. Open `.env.local` in a text editor
4. Replace the placeholder values:

```bash
# Replace with your actual Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Replace with your actual Supabase anon key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# This can stay as is for local development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

5. Save the file

### 6. Set Up the Database

You need to create the database tables. There are two ways to do this:

#### Option A: Using Supabase Dashboard (Easier)

1. Go back to your Supabase dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **"New Query"**
4. Open the file `scripts/001_create_tables.sql` from your project
5. Copy ALL the SQL code from that file
6. Paste it into the Supabase SQL Editor
7. Click **"Run"** (or press Cmd/Ctrl + Enter)
8. You should see "Success. No rows returned" - that's good!

#### Option B: Using Terminal (For Developers)

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login (opens browser for authentication)
supabase login

# Link your project (get project-ref from Supabase dashboard URL)
supabase link --project-ref your-project-ref

# Push the database schema
supabase db push
```

### 7. Verify Database Setup

To make sure everything worked:

1. In Supabase dashboard, click **Table Editor**
2. You should see 4 tables:
   - `playlists`
   - `videos`
   - `routines`
   - `tasks`

If you see these, you're all set!

### 8. Start the Development Server

Back in your terminal, run:

```bash
npm run dev
```

You should see:
```
 ▲ Next.js 15.x.x
 - Local:        http://localhost:3000
```

### 9. Open the App

1. Open your web browser
2. Go to [http://localhost:3000](http://localhost:3000)
3. You should see the LearnFlow landing page!

### 10. Create Your Account

1. Click **"Get Started"** or **"Sign Up"**
2. Enter your email and password
3. Check your email inbox for a confirmation email from Supabase
4. Click the confirmation link
5. Go back to [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
6. Sign in with your email and password
7. You'll be redirected to the dashboard!

## Testing the App

### Add Your First Playlist

1. From the dashboard, click **"Add New Playlist"**
2. Go to YouTube and copy a playlist URL (e.g., `https://youtube.com/playlist?list=PLxxx...`)
3. Paste it in the input field
4. Click **"Fetch Playlist"**
5. Wait a few seconds while it loads all videos
6. You should see the playlist details with video count and total duration

### Create a Learning Routine

1. After fetching the playlist, you'll see options:
   - **Videos per day**: Set how many videos you want to watch daily
   - **Target date**: Choose when you want to finish
   - **Let AI decide**: Have AI optimize the pace
2. Click **"Generate Routine"**
3. Your personalized schedule will be created!

### Track Your Progress

1. From the dashboard, you'll see **"Today's Tasks"**
2. Watch a video, then click the checkbox to mark it complete
3. Your progress updates automatically
4. Build your streak by completing tasks daily!

## Common Issues & Solutions

### "Failed to fetch" Error When Signing Up/In

**Problem**: Supabase can't connect

**Solutions**:
- Double-check your `.env.local` file has the correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Make sure you're using the **anon/public key**, NOT the service_role key
- Restart your development server: Stop it (Ctrl+C) and run `npm run dev` again
- Check that your Supabase project is not paused (free tier projects pause after inactivity)

### Email Confirmation Not Received

**Solutions**:
- Check your spam/junk folder
- In Supabase dashboard: **Authentication** → **Settings** → you can disable email confirmation for development
- Or use a different email address

### Playlist Not Loading All Videos

**Problem**: Only shows 100 videos instead of all videos

**Solutions**:
- Wait a bit longer - large playlists can take 10-15 seconds
- Check the browser console (F12) for error messages
- Some videos might be private/deleted and are automatically skipped
- Try a different playlist to test

### Port 3000 Already in Use

**Problem**: Another app is using port 3000

**Solution**:
```bash
# Use a different port
npm run dev -- -p 3001
```
Then go to `http://localhost:3001`

### Database Tables Missing

**Problem**: SQL script didn't run properly

**Solution**:
1. Go to Supabase → SQL Editor
2. Run this to check tables:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
3. If tables are missing, re-run the `001_create_tables.sql` script

## Project Structure Explained

```
learnflow/
├── app/                    # Next.js App Router
│   ├── api/               # Backend API endpoints
│   │   ├── youtube/      # YouTube playlist fetching
│   │   ├── routines/     # Routine management
│   │   └── tasks/        # Task tracking
│   ├── auth/             # Login & signup pages
│   ├── dashboard/        # Main app dashboard
│   └── page.tsx          # Landing page
├── components/           # Reusable React components
├── lib/                  # Utilities and helpers
│   └── supabase/        # Supabase client setup
├── scripts/             # Database migration scripts
├── .env.local           # YOUR environment variables (DO NOT COMMIT)
├── .env.local.example   # Template for environment variables
└── README.md            # Main documentation
```

## Next Steps

Now that you have LearnFlow running:

1. **Try different playlists** - Add various YouTube courses
2. **Experiment with routines** - Test different learning paces
3. **Build your streak** - Complete tasks daily
4. **Customize the app** - Edit the code to make it your own!

## Need Help?

- Check the [main README.md](README.md) for more detailed technical information
- Look at the code comments in the files
- Search for similar issues in the repository
- The Supabase documentation is excellent: [supabase.com/docs](https://supabase.com/docs)

## Deploying to Production

When you're ready to deploy:

1. Push your code to GitHub (don't commit `.env.local`!)
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add your environment variables in Vercel's dashboard
5. Deploy!

Your app will be live at a public URL and automatically deployed on every push.

---

**Congratulations! 🎉** You now have LearnFlow running locally. Happy learning!
