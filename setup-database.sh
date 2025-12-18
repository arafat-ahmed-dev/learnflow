#!/bin/bash

# Database Setup Script for LearnFlow
# This script helps set up the required database tables in Supabase

echo "🚀 LearnFlow Database Setup"
echo "=========================="
echo ""

echo "To set up your database tables in Supabase:"
echo ""
echo "1. Go to your Supabase project dashboard:"
echo "   https://supabase.com/dashboard/project/jlrkjmiatalkvbbrpqwj"
echo ""
echo "2. Navigate to 'SQL Editor' in the left sidebar"
echo ""
echo "3. Click 'New Query' and copy-paste the contents of:"
echo "   scripts/001_create_tables.sql"
echo ""
echo "4. Click 'Run' to execute the SQL"
echo ""
echo "Alternative: Use Supabase CLI"
echo "1. Install Supabase CLI: npm install -g supabase"
echo "2. Login: supabase login"
echo "3. Link project: supabase link --project-ref jlrkjmiatalkvbbrpqwj"
echo "4. Run migrations: supabase db push"
echo ""
echo "After setting up the database, restart your dev server:"
echo "npm run dev"