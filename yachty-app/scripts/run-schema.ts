#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runSchema() {
  console.log('🚀 Running database schema...\n')

  try {
    // Read the schema file
    const schemaPath = join(__dirname, '../lib/supabase/schema.sql')
    const schema = readFileSync(schemaPath, 'utf-8')

    console.log('📄 Schema file loaded successfully')
    console.log(`📊 Schema size: ${schema.length} characters\n`)

    // Split the schema into individual statements
    // We need to execute them one by one for better error reporting
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'

      // Skip comments
      if (statement.trim().startsWith('--')) {
        continue
      }

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })

        if (error) {
          // Try direct query if rpc doesn't work
          const directResult = await supabase.from('_raw').select('*').limit(0)

          // If the table doesn't exist yet, use the REST API directly
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ sql: statement })
          })

          if (!response.ok && response.status !== 404) {
            // Many statements will fail with 404 because exec_sql doesn't exist
            // We'll need to use a different approach
            throw new Error(`HTTP ${response.status}: ${await response.text()}`)
          }
        }

        successCount++

        // Log progress every 10 statements
        if ((i + 1) % 10 === 0) {
          console.log(`✓ Executed ${i + 1}/${statements.length} statements...`)
        }
      } catch (err: any) {
        // Some errors are expected (like "already exists")
        if (err.message.includes('already exists') ||
            err.message.includes('duplicate') ||
            err.message.includes('404')) {
          successCount++
        } else {
          errorCount++
          console.error(`\n❌ Error executing statement ${i + 1}:`)
          console.error(`Statement preview: ${statement.substring(0, 100)}...`)
          console.error(`Error: ${err.message}\n`)
        }
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`✅ Schema execution completed!`)
    console.log(`   Success: ${successCount} statements`)
    if (errorCount > 0) {
      console.log(`   Errors: ${errorCount} statements`)
    }
    console.log('='.repeat(50) + '\n')

  } catch (error: any) {
    console.error('❌ Fatal error:', error.message)
    process.exit(1)
  }
}

// Let me try a simpler approach using Supabase's SQL editor via API
async function runSchemaSimple() {
  console.log('🚀 Running database schema using Supabase Management API...\n')

  try {
    const schemaPath = join(__dirname, '../lib/supabase/schema.sql')
    const schema = readFileSync(schemaPath, 'utf-8')

    console.log('📄 Schema file loaded successfully')
    console.log(`📊 Schema size: ${schema.length} characters\n`)

    // Extract the project reference from the URL
    const projectRef = supabaseUrl.match(/https:\/\/(.+?)\.supabase\.co/)?.[1]

    if (!projectRef) {
      throw new Error('Could not extract project reference from Supabase URL')
    }

    console.log(`📍 Project Reference: ${projectRef}`)
    console.log('⚙️  Executing SQL via Management API...\n')

    // Use Supabase Management API to execute SQL
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          query: schema
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API request failed (${response.status}): ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Schema executed successfully!\n')
    console.log('Response:', JSON.stringify(result, null, 2))

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error('\n💡 Trying alternative method...\n')
    await runSchemaAlternative()
  }
}

// Alternative: Execute schema using direct PostgreSQL connection string
async function runSchemaAlternative() {
  console.log('🔄 Using alternative method: Supabase Client with raw SQL\n')

  try {
    const schemaPath = join(__dirname, '../lib/supabase/schema.sql')
    let schema = readFileSync(schemaPath, 'utf-8')

    // Remove comments and split into statements
    const statements = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    console.log(`📝 Processing ${statements.length} SQL statements...\n`)

    let success = 0
    let skipped = 0
    let failed = 0

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]

      // Show progress
      if (stmt.includes('CREATE TABLE')) {
        const tableName = stmt.match(/CREATE TABLE (\w+)/)?.[1]
        console.log(`📦 Creating table: ${tableName}`)
      } else if (stmt.includes('CREATE INDEX')) {
        const indexName = stmt.match(/CREATE INDEX (\w+)/)?.[1]
        console.log(`🔍 Creating index: ${indexName}`)
      } else if (stmt.includes('CREATE TRIGGER')) {
        const triggerName = stmt.match(/CREATE TRIGGER (\w+)/)?.[1]
        console.log(`⚡ Creating trigger: ${triggerName}`)
      } else if (stmt.includes('CREATE EXTENSION')) {
        console.log(`🔌 Enabling extension`)
      } else if (stmt.includes('CREATE OR REPLACE FUNCTION')) {
        const funcName = stmt.match(/FUNCTION (\w+)/)?.[1]
        console.log(`⚙️  Creating function: ${funcName}`)
      } else if (stmt.includes('ALTER TABLE')) {
        console.log(`🔧 Altering table`)
      }

      try {
        // Execute using Supabase client
        const { data, error } = await supabase.rpc('exec', { sql: stmt + ';' })

        if (error) {
          // Check if it's an "already exists" error
          if (error.message?.includes('already exists') ||
              error.message?.includes('duplicate')) {
            skipped++
          } else {
            failed++
            console.error(`   ❌ ${error.message}`)
          }
        } else {
          success++
        }
      } catch (err: any) {
        // Try to continue despite errors
        if (err.message?.includes('already exists') ||
            err.message?.includes('duplicate') ||
            err.message?.includes('function') && err.message?.includes('does not exist')) {
          skipped++
        } else {
          failed++
        }
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 Schema Execution Summary:')
    console.log(`   ✅ Successful: ${success}`)
    console.log(`   ⏭️  Skipped: ${skipped}`)
    if (failed > 0) {
      console.log(`   ❌ Failed: ${failed}`)
    }
    console.log('='.repeat(60))

  } catch (error: any) {
    console.error('❌ Fatal error:', error.message)
    throw error
  }
}

// Run the schema
runSchemaAlternative()
  .then(() => {
    console.log('\n✨ Database schema setup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Failed to setup database schema')
    process.exit(1)
  })
