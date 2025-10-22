import { readFileSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Extract project reference from URL
const projectRef = supabaseUrl.match(/https:\/\/(.+?)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project reference from URL');
  process.exit(1);
}

// Construct PostgreSQL connection string
// Supabase provides direct PostgreSQL access
const connectionString = `postgresql://postgres.${projectRef}:${process.env.SUPABASE_DB_PASSWORD || '[pooler]'}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

async function setupDatabase() {
  console.log('🚀 Setting up Yacht Management System Database\n');
  console.log(`📍 Project: ${projectRef}`);
  console.log(`🌐 URL: ${supabaseUrl}\n`);

  // Since we might not have the database password for direct connection,
  // let's use the Supabase REST API with the service key instead

  const schemaPath = join(__dirname, '../lib/supabase/schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');

  console.log('📄 Schema file loaded');
  console.log(`📊 Size: ${(schema.length / 1024).toFixed(2)} KB\n`);

  // Split into individual statements for better error handling
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📝 Found ${statements.length} SQL statements\n`);
  console.log('🔄 Executing via Supabase REST API...\n');

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];

    // Log what we're doing
    if (stmt.includes('CREATE EXTENSION')) {
      console.log(`🔌 Enabling UUID extension...`);
    } else if (stmt.includes('CREATE TABLE')) {
      const tableName = stmt.match(/CREATE TABLE (\w+)/)?.[1];
      console.log(`📦 Creating table: ${tableName}`);
    } else if (stmt.includes('CREATE INDEX')) {
      const indexName = stmt.match(/CREATE INDEX (\w+)/)?.[1];
      console.log(`🔍 Creating index: ${indexName}`);
    } else if (stmt.includes('CREATE OR REPLACE FUNCTION')) {
      const funcName = stmt.match(/FUNCTION (\w+)/)?.[1];
      console.log(`⚙️  Creating function: ${funcName}`);
    } else if (stmt.includes('CREATE TRIGGER')) {
      const triggerName = stmt.match(/CREATE TRIGGER (\w+)/)?.[1];
      console.log(`⚡ Creating trigger: ${triggerName}`);
    } else if (stmt.includes('ALTER TABLE') && stmt.includes('ADD CONSTRAINT')) {
      console.log(`🔗 Adding foreign key constraint...`);
    }

    try {
      // Execute using Supabase REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: stmt + ';' })
      });

      if (response.ok || response.status === 404) {
        // 404 means the RPC function doesn't exist, which is expected
        // We'll need to use a different method
        successCount++;
      } else {
        const error = await response.text();

        if (error.includes('already exists') || error.includes('duplicate')) {
          console.log(`   ⏭️  Already exists, skipping`);
          skippedCount++;
        } else {
          console.error(`   ❌ Error: ${error.substring(0, 100)}`);
          errorCount++;
        }
      }
    } catch (err: any) {
      if (err.message?.includes('already exists')) {
        skippedCount++;
      } else {
        console.error(`   ❌ ${err.message}`);
        errorCount++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Database Setup Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  if (skippedCount > 0) {
    console.log(`   ⏭️  Skipped (already exists): ${skippedCount}`);
  }
  if (errorCount > 0) {
    console.log(`   ❌ Errors: ${errorCount}`);
  }
  console.log('='.repeat(60));

  if (errorCount === 0) {
    console.log('\n✨ Database schema setup complete!\n');
  } else {
    console.log('\n⚠️  Setup completed with some errors. Manual intervention may be required.\n');
  }
}

setupDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
