#!/usr/bin/env node

const { readFileSync } = require('fs');
const { join } = require('path');
const https = require('https');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

// Extract project reference from URL
const projectRef = supabaseUrl.match(/https:\/\/(.+?)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project reference from Supabase URL');
  process.exit(1);
}

console.log('🚀 Setting up Yacht Management System Database\n');
console.log(`📍 Project: ${projectRef}`);
console.log(`🌐 URL: ${supabaseUrl}\n`);

// Read the schema file
const schemaPath = join(__dirname, '../lib/supabase/schema.sql');
const schema = readFileSync(schemaPath, 'utf-8');

console.log('📄 Schema file loaded successfully');
console.log(`📊 Size: ${(schema.length / 1024).toFixed(2)} KB\n`);

console.log('=' .repeat(60));
console.log('⚠️  MANUAL SETUP REQUIRED');
console.log('='.repeat(60));
console.log('\nTo set up the database, please follow these steps:\n');
console.log('1. Go to: https://supabase.com/dashboard/project/' + projectRef);
console.log('2. Navigate to: SQL Editor (left sidebar)');
console.log('3. Click "New Query"');
console.log('4. Copy the contents of: lib/supabase/schema.sql');
console.log('5. Paste into the SQL Editor');
console.log('6. Click "Run" or press Cmd/Ctrl + Enter');
console.log('7. Wait for execution to complete\n');
console.log('='.repeat(60));
console.log('\nAlternatively, run this SQL directly:\n');
console.log('File location: ' + schemaPath);
console.log('\n📝 The schema creates the following tables:');
console.log('   • clients - Client information');
console.log('   • boats - Vessel records');
console.log('   • equipment - Equipment inventory');
console.log('   • parts - Parts catalog');
console.log('   • pending_parts - Parts verification queue');
console.log('   • part_match_options - Part match options');
console.log('   • equipment_manuals - Manual storage metadata');
console.log('   • maintenance_records - Maintenance tracking');
console.log('   • expenses - Receipt and expense records');
console.log('   • work_sessions - Time tracking');
console.log('   • work_items - Task management');
console.log('   • work_item_conflicts - Scheduling conflicts');
console.log('   • invoices - Invoice generation');
console.log('   • invoice_line_items - Invoice details');
console.log('   • notification_log - Notification tracking');
console.log('   • pending_approvals - Approval queue');
console.log('   • chat_sessions - Chat conversation groups');
console.log('   • chat_messages - Chat message history');
console.log('   • agent_memories - AI assistant memory\n');

console.log('After running the schema, execute:');
console.log('  npm run verify-db\n');
