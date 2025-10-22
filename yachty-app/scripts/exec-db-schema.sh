#!/bin/bash

# Yacht Management System - Database Schema Execution Script

set -e

echo "🚀 Yacht Management System - Database Setup"
echo "============================================"
echo ""

# Check environment variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "❌ Error: Missing required environment variables"
  echo "   SUPABASE_URL and SUPABASE_SERVICE_KEY must be set"
  exit 1
fi

# Extract project reference
PROJECT_REF=$(echo "$SUPABASE_URL" | sed -E 's|https://([^.]+)\.supabase\.co|\1|')

echo "📍 Project: $PROJECT_REF"
echo "🌐 URL: $SUPABASE_URL"
echo ""

# Check if schema file exists
SCHEMA_FILE="lib/supabase/schema.sql"

if [ ! -f "$SCHEMA_FILE" ]; then
  echo "❌ Error: Schema file not found at $SCHEMA_FILE"
  exit 1
fi

echo "📄 Schema file: $SCHEMA_FILE"
echo "📊 Size: $(du -h "$SCHEMA_FILE" | cut -f1)"
echo ""

# Try to use Supabase CLI if available
if command -v supabase &> /dev/null; then
  echo "✅ Supabase CLI found! Attempting to execute schema..."
  echo ""

  # Try to run migrations
  if supabase db push 2>&1; then
    echo ""
    echo "✨ Schema executed successfully via Supabase CLI!"
    echo ""
    echo "Verifying database..."
    npm run db:verify
    exit 0
  else
    echo ""
    echo "⚠️  Supabase CLI execution failed. Trying alternative method..."
    echo ""
  fi
fi

# Alternative: Try psql if available
if command -v psql &> /dev/null; then
  echo "✅ PostgreSQL client (psql) found!"
  echo ""

  if [ ! -z "$DATABASE_URL" ]; then
    echo "Executing schema via psql..."
    psql "$DATABASE_URL" -f "$SCHEMA_FILE"

    if [ $? -eq 0 ]; then
      echo ""
      echo "✨ Schema executed successfully via psql!"
      echo ""
      echo "Verifying database..."
      npm run db:verify
      exit 0
    fi
  else
    echo "⚠️  DATABASE_URL not set, cannot use psql"
  fi
fi

# If no CLI tools available, provide manual instructions
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "⚠️  MANUAL SETUP REQUIRED"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Automated execution tools are not available."
echo "Please follow these steps to set up the database:"
echo ""
echo "1. Open your browser and navigate to:"
echo "   https://supabase.com/dashboard/project/$PROJECT_REF/editor/sql"
echo ""
echo "2. Click the 'New Query' button"
echo ""
echo "3. Copy the entire contents of:"
echo "   $PWD/$SCHEMA_FILE"
echo ""
echo "4. Paste into the SQL Editor"
echo ""
echo "5. Click 'Run' (or press Cmd/Ctrl + Enter)"
echo ""
echo "6. Wait for execution to complete (~10 seconds)"
echo ""
echo "7. Verify the setup by running:"
echo "   npm run db:verify"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

# Output the SQL content for easy copying
echo "📋 Schema SQL (copy from here to END OF SQL):"
echo ""
echo "--- START OF SQL ---"
cat "$SCHEMA_FILE"
echo ""
echo "--- END OF SQL ---"
echo ""

exit 1
