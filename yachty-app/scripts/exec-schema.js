#!/usr/bin/env node

const { Client } = require('pg');
const { readFileSync } = require('fs');
const { join } = require('path');

const supabaseUrl = process.env.SUPABASE_URL;

if (!supabaseUrl) {
  console.error('❌ Missing SUPABASE_URL environment variable');
  process.exit(1);
}

// Extract project reference
const projectRef = supabaseUrl.match(/https:\/\/(.+?)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project reference from URL');
  process.exit(1);
}

console.log('🚀 Yacht Management System - Database Setup\n');
console.log(`📍 Project: ${projectRef}`);
console.log(`🌐 URL: ${supabaseUrl}\n`);

// Since we don't have direct database access without password,
// we need to use the Supabase Dashboard SQL Editor
// Let's output the instructions and prepare the SQL

const schemaPath = join(__dirname, '../lib/supabase/schema.sql');
const schema = readFileSync(schemaPath, 'utf-8');

console.log('📄 Schema file: lib/supabase/schema.sql');
console.log(`📊 Size: ${(schema.length / 1024).toFixed(2)} KB`);
console.log(`📝 Statements: ~${schema.split(';').filter(s => s.trim().length > 10).length}\n`);

console.log('=' .repeat(70));
console.log('                     SETUP INSTRUCTIONS');
console.log('='.repeat(70));
console.log('\n🔧 To set up the database schema, follow these steps:\n');
console.log('1. Open your browser and go to:');
console.log(`   https://supabase.com/dashboard/project/${projectRef}/editor/sql\n`);
console.log('2. Click "New Query" button\n');
console.log('3. Copy the entire contents of the schema file:');
console.log(`   ${schemaPath}\n`);
console.log('4. Paste it into the SQL Editor\n');
console.log('5. Click the "Run" button (or press Cmd/Ctrl + Enter)\n');
console.log('6. Wait for execution to complete (should take 5-10 seconds)\n');
console.log('7. Verify by running: npm run db:verify\n');
console.log('='.repeat(70));

console.log('\n📋 Tables that will be created:\n');

const tables = [
  ['clients', 'Client information and billing'],
  ['boats', 'Vessel records'],
  ['equipment', 'Equipment inventory (hierarchical)'],
  ['parts', 'Parts catalog'],
  ['pending_parts', 'Parts pending verification'],
  ['part_match_options', 'Part matching options'],
  ['equipment_manuals', 'Manual storage metadata'],
  ['maintenance_records', 'Maintenance history'],
  ['expenses', 'Receipt and expense records'],
  ['work_sessions', 'Time tracking'],
  ['work_items', 'Task management'],
  ['work_item_conflicts', 'Scheduling conflicts'],
  ['invoices', 'Invoice generation'],
  ['invoice_line_items', 'Invoice line items'],
  ['notification_log', 'Notification tracking'],
  ['pending_approvals', 'Approval queue'],
  ['chat_sessions', 'Chat conversation groups'],
  ['chat_messages', 'Chat history'],
  ['agent_memories', 'AI assistant memory']
];

tables.forEach(([name, desc]) => {
  console.log(`   • ${name.padEnd(22)} - ${desc}`);
});

console.log('\n' + '='.repeat(70));
console.log('\n💡 TIP: You can also use the Supabase CLI if you have it configured:');
console.log('   supabase db push\n');

// Try to open the browser automatically
console.log('🌐 Attempting to open browser...\n');
const url = `https://supabase.com/dashboard/project/${projectRef}/editor/sql`;

// Try different methods to open browser
try {
  const { exec } = require('child_process');
  const command = process.platform === 'darwin' ? 'open' :
                  process.platform === 'win32' ? 'start' : 'xdg-open';

  exec(`${command} "${url}"`, (error) => {
    if (error) {
      console.log('⚠️  Could not open browser automatically.');
      console.log(`   Please manually navigate to: ${url}\n`);
    } else {
      console.log('✅ Browser opened! Follow the instructions above.\n');
    }
  });
} catch (e) {
  console.log(`⚠️  Could not open browser. Please navigate to: ${url}\n`);
}

console.log('Press any key to exit...');
