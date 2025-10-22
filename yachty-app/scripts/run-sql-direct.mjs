#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'public' }
});

console.log('🚀 Executing Database Schema\n');

const schemaPath = join(__dirname, '../lib/supabase/schema.sql');
const schema = readFileSync(schemaPath, 'utf-8');

// Split into individual statements
const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 10 && !s.startsWith('--'));

console.log(`📝 Executing ${statements.length} SQL statements...\n`);

let success = 0;
let failed = 0;
let skipped = 0;

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];

  // Log what we're doing
  if (stmt.includes('CREATE TABLE')) {
    const tableName = stmt.match(/CREATE TABLE (\w+)/)?.[1];
    process.stdout.write(`📦 Creating table: ${tableName}...`);
  } else if (stmt.includes('CREATE INDEX')) {
    const indexName = stmt.match(/CREATE INDEX (\w+)/)?.[1];
    process.stdout.write(`🔍 Creating index: ${indexName}...`);
  } else if (stmt.includes('CREATE EXTENSION')) {
    process.stdout.write(`🔌 Enabling extension...`);
  } else if (stmt.includes('CREATE OR REPLACE FUNCTION')) {
    const funcName = stmt.match(/FUNCTION (\w+)/)?.[1];
    process.stdout.write(`⚙️  Creating function: ${funcName}...`);
  } else if (stmt.includes('CREATE TRIGGER')) {
    const triggerName = stmt.match(/CREATE TRIGGER (\w+)/)?.[1];
    process.stdout.write(`⚡ Creating trigger: ${triggerName}...`);
  } else if (stmt.includes('ALTER TABLE')) {
    process.stdout.write(`🔧 Altering table...`);
  } else {
    process.stdout.write(`🔨 Executing statement ${i + 1}...`);
  }

  try {
    // Use raw SQL execution via RPC if available, otherwise skip with note
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: stmt + ';'
    });

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42883') {
        // exec_sql function doesn't exist, expected
        console.log(' ⚠️  (needs manual setup)');
        skipped++;
      } else if (error.message?.includes('already exists')) {
        console.log(' ✓ (already exists)');
        skipped++;
      } else {
        console.log(` ❌ ${error.message.substring(0, 50)}`);
        failed++;
      }
    } else {
      console.log(' ✅');
      success++;
    }
  } catch (err) {
    console.log(` ⚠️  ${err.message.substring(0, 50)}`);
    skipped++;
  }
}

console.log('\n' + '='.repeat(60));
console.log(`✅ Success: ${success}`);
console.log(`⏭️  Skipped: ${skipped}`);
console.log(`❌ Failed: ${failed}`);
console.log('='.repeat(60));

if (skipped > 0 && success === 0) {
  console.log('\n⚠️  Direct SQL execution not available via API.');
  console.log('   Please run the schema manually via Supabase Dashboard.\n');
  console.log('SQL file location: lib/supabase/schema.sql\n');
}
