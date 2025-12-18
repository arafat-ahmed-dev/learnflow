# 🚨 URGENT: Database Setup Required

## Issues Fixed:

✅ **AI Model**: Changed to `gemini-1.5-flash-latest` (correct model name)

## ⚠️ Still Need To Fix:

❌ **Database Tables**: Missing tables causing errors

---

## 🗄️ Create Database Tables (Choose One Method):

### Method 1: Supabase Dashboard (EASIEST)

1. **Go to**: https://supabase.com/dashboard/project/jlrkjmiatalkvbbrpqwj
2. **Click**: "SQL Editor" (left sidebar)
3. **Click**: "New query"
4. **Copy & Paste**: All content from `scripts/001_create_tables.sql`
5. **Click**: "Run"

### Method 2: Copy-Paste This SQL

```sql
-- Create playlists table to store YouTube playlist information
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  playlist_url TEXT NOT NULL,
  playlist_id TEXT NOT NULL,
  title TEXT NOT NULL,
  total_videos INTEGER NOT NULL DEFAULT 0,
  total_duration_seconds INTEGER NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create routines table to store AI-generated study routines
CREATE TABLE IF NOT EXISTS routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  videos_per_day INTEGER NOT NULL DEFAULT 1,
  target_completion_date DATE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create videos table to store individual video information
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table to store daily learning tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for playlists
CREATE POLICY "Users can view their own playlists" ON playlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own playlists" ON playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own playlists" ON playlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own playlists" ON playlists FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for routines
CREATE POLICY "Users can view their own routines" ON routines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own routines" ON routines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own routines" ON routines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own routines" ON routines FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for videos
CREATE POLICY "Users can view videos from their playlists" ON videos FOR SELECT
  USING (EXISTS (SELECT 1 FROM playlists WHERE playlists.id = videos.playlist_id AND playlists.user_id = auth.uid()));
CREATE POLICY "Users can insert videos to their playlists" ON videos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM playlists WHERE playlists.id = videos.playlist_id AND playlists.user_id = auth.uid()));
CREATE POLICY "Users can delete videos from their playlists" ON videos FOR DELETE
  USING (EXISTS (SELECT 1 FROM playlists WHERE playlists.id = videos.playlist_id AND playlists.user_id = auth.uid()));

-- RLS Policies for tasks
CREATE POLICY "Users can view their own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);
```

---

## ✅ After Running SQL:

1. **Refresh** your browser tab with the app
2. **Try creating** a routine again
3. **Both errors should be fixed!**

---

## 📝 What This Creates:

- **playlists**: Stores YouTube playlist info
- **routines**: Stores learning schedules
- **videos**: Individual video data
- **tasks**: Daily learning tasks
- **Security policies**: Users only see their own data
