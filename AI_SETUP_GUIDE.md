# AI Setup Guide - Using Google Gemini

## ✅ AI Configuration Complete

Your app is now configured to use Google Gemini directly (bypassing Vercel AI Gateway).

### Changes Made:

- ✅ Installed `@ai-sdk/google` package
- ✅ Updated code to use Google provider directly
- ✅ API key is configured in `.env.local`

## 🗄️ Database Setup Required

You're getting a database error because the tables don't exist yet. Choose one option:

### Option 1: Supabase Dashboard (Recommended)

1. Go to [your Supabase dashboard](https://supabase.com/dashboard/project/jlrkjmiatalkvbbrpqwj)
2. Click "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy the contents of `scripts/001_create_tables.sql`
5. Paste and click "Run"

### Option 2: Supabase CLI

```bash
npm install -g supabase
supabase login
supabase link --project-ref jlrkjmiatalkvbbrpqwj
supabase db push
```

### Alternative: Vercel AI Gateway

If you prefer using Vercel's AI Gateway:

1. Go to [Vercel AI Gateway API Keys](https://vercel.com/dashboard/ai/api-keys)
2. Create a new API key
3. Update your `.env.local` file:
   ```
   AI_GATEWAY_API_KEY=your-actual-api-key-here
   ```
4. Update the route to use `"openai/gpt-4o-mini"` instead of `"google/gemini-1.5-flash"`

### Option 3: Use Vercel CLI (Alternative to Option 1)

If you have your project deployed on Vercel:

1. Run `npx vercel link` to link your project
2. Run `npx vercel env pull` to fetch environment variables
3. This will automatically configure the AI Gateway token

## Fallback Behavior

I've updated your code to include a fallback mechanism. If the AI fails to generate a schedule, it will create a basic schedule without AI assistance, so your app won't crash.

## Testing

After setting up the API key:

1. Restart your development server (`npm run dev` or `yarn dev`)
2. Try creating a new routine
3. Check the console for any remaining errors

## Why Gemini?

- **Free tier**: Gemini offers a generous free tier with 15 requests per minute
- **Cost-effective**: Generally more affordable than OpenAI for higher usage
- **Good performance**: Gemini 1.5 Flash offers excellent speed and quality
- **No credit card required**: You can start using it immediately

## Important Notes

- Keep your API keys secure and never commit them to version control
- The `.env.local` file is already in `.gitignore` by default in Next.js projects
- Make sure to add the same environment variable to your production deployment on Vercel
- Gemini API keys are free to create and use within the quota limits
