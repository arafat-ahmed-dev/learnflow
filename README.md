# LearnFlow - YouTube Playlist Learning Tracker

Transform YouTube playlists into structured learning routines with AI-powered scheduling and daily task tracking.

## Features

- **YouTube Playlist Import** - Paste any YouTube playlist URL to fetch all videos
- **AI Routine Generation** - Get personalized study schedules based on your pace
- **Progress Tracking** - Check off videos as you complete them
- **Daily Reminders** - Browser notifications to keep you on track
- **Smart Analytics** - Track your streak, completion rate, and learning progress

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS v4
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui
- **AI**: Vercel AI SDK (optional for advanced features)

## Local Development Setup

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd learnflow
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 3: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up (takes 1-2 minutes)
3. Go to **Project Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the `anon` key)

### Step 4: Configure Environment Variables

1. Copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and fill in your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
   ```

### Step 5: Set Up Database Tables

The database tables need to be created in your Supabase project. You have two options:

#### Option A: Use the Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `scripts/001_create_tables.sql`
5. Paste into the SQL editor and click **Run**

#### Option B: Use the Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (you'll need your project reference from dashboard)
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Step 6: Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 7: Create Your First Account

1. Click **Sign Up** on the homepage
2. Enter your email and password
3. Check your email for the confirmation link
4. After confirming, log in and start adding playlists!

## Usage

### Adding a YouTube Playlist

1. Go to YouTube and find a playlist you want to learn from
2. Copy the playlist URL (e.g., `https://youtube.com/playlist?list=PLxxx...`)
3. In LearnFlow, click **"Add New Playlist"**
4. Paste the URL and click **"Fetch Playlist"**
5. Review the playlist details (video count, total duration, etc.)

### Creating a Learning Routine

1. After fetching a playlist, you'll see preference options:
   - **Videos per day**: How many videos you want to watch daily
   - **Target completion date**: When you want to finish the course
   - **Let AI decide**: AI will optimize the pace for you
2. Click **"Generate Routine"**
3. AI will create a day-by-day schedule for you

### Tracking Your Progress

1. Go to your **Dashboard** to see today's tasks
2. Click the checkbox next to each video as you complete it
3. Your progress, streak, and stats update automatically
4. Get daily reminders to stay on track

## Project Structure

```
learnflow/
├── app/                        # Next.js app directory
│   ├── api/                   # API routes
│   │   ├── youtube/          # YouTube playlist fetching
│   │   ├── routines/         # Routine generation & management
│   │   └── tasks/            # Task completion tracking
│   ├── auth/                 # Authentication pages
│   ├── dashboard/            # Main dashboard & new playlist wizard
│   └── page.tsx              # Landing page
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── playlist-*.tsx        # Playlist-related components
│   ├── routine-*.tsx         # Routine components
│   └── today-tasks.tsx       # Daily task list
├── lib/                      # Utility functions
│   ├── supabase/            # Supabase client configuration
│   └── types.ts             # TypeScript type definitions
└── scripts/                  # Database scripts
    └── 001_create_tables.sql # Initial schema
```

## Database Schema

- **playlists**: Stores YouTube playlist metadata
- **videos**: Individual videos from playlists
- **routines**: User-created learning schedules
- **tasks**: Daily tasks generated from routines

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Troubleshooting

### "Failed to fetch" Error on Login/Signup

- Check that your `.env.local` file has the correct Supabase URL and anon key
- Make sure you're using the **anon/public** key, not the service role key
- Verify your Supabase project is active (not paused)

### YouTube Playlist Not Fetching All Videos

- Some playlists may have private/unavailable videos that are skipped
- Very large playlists (500+) may take 10-15 seconds to load completely
- Check the browser console for any errors

### Email Confirmation Not Working

- Check your spam folder
- In Supabase dashboard, go to **Authentication** → **Email Templates** to customize
- For development, you can disable email confirmation in **Authentication** → **Settings**

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add your environment variables in Vercel project settings
4. Deploy!

The app will automatically use Vercel's edge network for fast global performance.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you encounter any issues, please open an issue on GitHub or contact support.

---

Built with ❤️ using Next.js, Supabase, and Vercel
```

```json file="" isHidden
