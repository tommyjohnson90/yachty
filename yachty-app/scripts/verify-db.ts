import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const expectedTables = [
  'clients',
  'boats',
  'equipment',
  'parts',
  'pending_parts',
  'part_match_options',
  'equipment_manuals',
  'maintenance_records',
  'expenses',
  'work_sessions',
  'work_items',
  'work_item_conflicts',
  'invoices',
  'invoice_line_items',
  'notification_log',
  'pending_approvals',
  'chat_sessions',
  'chat_messages',
  'agent_memories'
];

async function verifyDatabase() {
  console.log('🔍 Verifying Database Schema\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}\n`);

  let allTablesExist = true;
  let existingCount = 0;
  let missingCount = 0;

  console.log('Checking tables...\n');

  for (const tableName of expectedTables) {
    try {
      // Try to query the table with limit 0 to check if it exists
      const { error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);

      if (error) {
        console.log(`❌ ${tableName.padEnd(25)} - MISSING`);
        console.log(`   Error: ${error.message}`);
        allTablesExist = false;
        missingCount++;
      } else {
        console.log(`✅ ${tableName.padEnd(25)} - EXISTS`);
        existingCount++;
      }
    } catch (err: any) {
      console.log(`❌ ${tableName.padEnd(25)} - ERROR`);
      console.log(`   ${err.message}`);
      allTablesExist = false;
      missingCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Database Verification Summary:');
  console.log(`   ✅ Existing tables: ${existingCount}/${expectedTables.length}`);
  if (missingCount > 0) {
    console.log(`   ❌ Missing tables: ${missingCount}/${expectedTables.length}`);
  }
  console.log('='.repeat(60));

  if (allTablesExist) {
    console.log('\n✨ All tables exist! Database is ready.\n');
    return true;
  } else {
    console.log('\n⚠️  Some tables are missing. Please run the schema setup:\n');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Navigate to: SQL Editor');
    console.log('4. Create a new query');
    console.log('5. Copy the contents of: lib/supabase/schema.sql');
    console.log('6. Paste and run the SQL\n');
    return false;
  }
}

verifyDatabase()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
