# Yacht Management System - Setup Guide

## Current Status

### ✅ Completed

1. **Database Schema** (`lib/supabase/schema.sql`)
   - 19 tables designed per PRD
   - Complete with indexes, triggers, and foreign keys
   - Ready to execute in Supabase Dashboard

2. **Type Definitions** (`lib/supabase/database.types.ts`)
   - Complete TypeScript types for all tables
   - Row, Insert, and Update types for type-safe operations

3. **Integration Clients**
   - **Anthropic AI** (`lib/anthropic/client.ts`)
     - Sonnet 4.5 and Haiku 4.5 configurations
     - Chat completions with streaming
     - Vision API for receipt processing
   - **Stripe** (`lib/stripe/client.ts`)
     - Payment links and intents
     - Webhook verification
   - **OneDrive** (`lib/onedrive/client.ts`)
     - Folder structure management
     - File upload/download

4. **Utilities**
   - Formatting helpers (`lib/utils/format.ts`)
   - Validation schemas (`lib/utils/validation.ts`)
   - Constants and configurations (`lib/utils/constants.ts`)

5. **API Routes**
   - `/api/clients` - Client CRUD operations
   - `/api/clients/[id]` - Individual client operations
   - `/api/boats` - Boat management with OneDrive integration
   - `/api/chat` - AI chat functionality

6. **UI Components** (Mobile-First)
   - Button component with variants and sizes
   - Card components (Card, CardHeader, CardContent, etc.)
   - Input component with labels and error states
   - All components have 44px+ touch targets for mobile

7. **PWA Support**
   - Manifest.json configured
   - Mobile app-like experience
   - Shortcuts for quick actions

### ⏳ Pending

1. **Database Execution**
   - SQL schema must be run in Supabase Dashboard
   - URL: https://supabase.com/dashboard/project/dwyetqelutmvwplpjnml/editor/sql
   - File: `lib/supabase/schema.sql` or `setup-schema.sql` (root)

2. **Additional API Routes** (Phase 2)
   - Work sessions, expenses, equipment
   - Receipt processing
   - Invoice generation
   - Parts research

3. **UI Pages** (Phase 2)
   - Client management pages
   - Boat detail pages
   - Chat interface
   - Invoice pages

4. **Row Level Security (RLS)**
   - Supabase RLS policies need to be configured
   - Single-user authentication setup

## Next Steps

### 1. Execute Database Schema

```bash
# Option 1: Manual (Recommended)
1. Go to: https://supabase.com/dashboard/project/dwyetqelutmvwplpjnml/editor/sql
2. Open new query
3. Copy contents of lib/supabase/schema.sql
4. Run query
5. Verify: npm run db:verify

# Option 2: Using Supabase CLI (if installed)
supabase db push
```

### 2. Verify Environment Variables

All required env variables are set:
- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_KEY
- ✅ ANTHROPIC_API_KEY
- ✅ STRIPE_SECRET_KEY
- ✅ ONEDRIVE_CLIENT_ID
- ✅ ONEDRIVE_CLIENT_SECRET
- ✅ ONEDRIVE_TENANT_ID

### 3. Test the Application

```bash
# Start development server
npm run dev

# Open browser
http://localhost:3000
```

### 4. Create First User

1. Go to `/auth/login`
2. Enter email address
3. Check email for magic link
4. Click link to authenticate

## Architecture Overview

```
yachty-app/
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── page.tsx          # Dashboard
│   └── layout.tsx        # Root layout
├── components/
│   └── ui/               # Reusable UI components
├── lib/
│   ├── anthropic/        # AI client
│   ├── onedrive/         # File storage
│   ├── stripe/           # Payment processing
│   ├── supabase/         # Database client & types
│   └── utils/            # Utilities & helpers
├── public/               # Static assets
└── scripts/              # Database setup scripts
```

## Development Guidelines

### Mobile-First Design
- All features designed for mobile screens first
- Touch targets minimum 44x44px
- Test on physical devices
- Progressive Web App capabilities

### Type Safety
- Use TypeScript throughout
- Import types from `database.types.ts`
- Validate with Zod schemas before database operations

### Authentication
- Magic link only (per PRD)
- Single user system
- Middleware handles auth checks

### API Standards
- All routes require authentication
- Use Zod validation
- Return consistent error format
- Log errors appropriately

## Testing Checklist

- [ ] Database schema executed successfully
- [ ] Can log in with magic link
- [ ] Dashboard loads with user info
- [ ] Can create a client
- [ ] Can create a boat (with OneDrive folder)
- [ ] Chat interface functional
- [ ] Mobile responsive on real device
- [ ] PWA installable on mobile

## Troubleshooting

### Database Connection Issues
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Check Supabase project is not paused
- Run `npm run db:verify` to check tables

### OneDrive Integration Issues
- Verify Azure app registration
- Check client ID, secret, and tenant ID
- Ensure correct permissions granted

### Stripe Issues
- Use test mode keys for development
- Configure webhook endpoints in Stripe dashboard
- Test with Stripe CLI for local development

## Resources

- [PRD Document](../yachty-prd.md)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Stripe API Docs](https://stripe.com/docs/api)
