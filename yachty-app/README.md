# Yacht Management System

A comprehensive web application for managing yacht maintenance operations, including client management, invoicing, equipment tracking, receipt processing, and an AI-powered chat assistant.

## Features

- **Client & Boat Management**: Track multiple clients and their vessels
- **Equipment Inventory**: Hierarchical equipment tracking with parts management
- **Time Tracking**: Record work sessions with billable hours
- **Invoicing**: Generate professional invoices with Stripe payment integration
- **Receipt Processing**: AI-powered receipt analysis and expense categorization
- **Chat Assistant**: Conversational interface powered by Claude AI
- **Mobile-First Design**: Optimized for mobile devices with PWA capabilities
- **Magic Link Authentication**: Passwordless login via email

## Tech Stack

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Magic Links)
- **File Storage**: Microsoft OneDrive
- **Payment Processing**: Stripe
- **AI**: Anthropic Claude API
- **Styling**: Tailwind CSS
- **Hosting**: Vercel (recommended)

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account (free tier available)
- An Anthropic API account
- A Stripe account
- A Microsoft Azure account (for OneDrive API)

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd yachty-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to find your credentials
3. In the SQL Editor, run the schema from `lib/supabase/schema.sql`

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Anthropic API
ANTHROPIC_API_KEY=your_anthropic_api_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# OneDrive Configuration
ONEDRIVE_CLIENT_ID=your_onedrive_client_id
ONEDRIVE_CLIENT_SECRET=your_onedrive_client_secret
ONEDRIVE_TENANT_ID=your_onedrive_tenant_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Set Up Authentication

In your Supabase project:

1. Go to Authentication > URL Configuration
2. Add `http://localhost:3000/auth/callback` to Redirect URLs
3. Configure your email templates (optional)

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The database schema includes the following main tables:

- **clients**: Client information and billing settings
- **boats**: Vessel records linked to clients
- **equipment**: Hierarchical equipment inventory
- **parts**: Parts catalog with specifications
- **work_sessions**: Time tracking records
- **work_items**: Task management
- **expenses**: Receipt records and expenses
- **invoices**: Invoice generation and tracking
- **chat_messages**: AI assistant conversation history
- **maintenance_records**: Equipment maintenance tracking

See `lib/supabase/schema.sql` for the complete schema.

## Project Structure

```
yachty-app/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   ├── auth/                 # Authentication pages
│   ├── clients/              # Client management
│   ├── chat/                 # Chat interface
│   ├── invoices/             # Invoice management
│   └── page.tsx              # Dashboard
├── components/               # React components
│   ├── ui/                   # Reusable UI components
│   ├── chat/                 # Chat components
│   ├── clients/              # Client components
│   └── ...
├── lib/                      # Utility libraries
│   ├── supabase/             # Supabase configuration
│   ├── stripe/               # Stripe integration
│   ├── onedrive/             # OneDrive integration
│   └── anthropic/            # AI integration
├── middleware.ts             # Authentication middleware
└── package.json
```

## Development Roadmap

### Phase 1: Foundation ✅
- [x] Next.js setup with TypeScript
- [x] Supabase integration
- [x] Magic link authentication
- [x] Mobile-first UI scaffolding

### Phase 2: Core Features (In Progress)
- [ ] Client and boat CRUD operations
- [ ] Equipment inventory management
- [ ] Time tracking functionality
- [ ] Basic chat interface

### Phase 3: AI Integration
- [ ] Chat assistant with Claude
- [ ] Receipt processing
- [ ] Parts research capability
- [ ] Client onboarding workflow

### Phase 4: Invoicing
- [ ] Invoice generation
- [ ] Stripe payment integration
- [ ] PDF export
- [ ] Email notifications

### Phase 5: Advanced Features
- [ ] Maintenance tracking
- [ ] Work scheduling
- [ ] Reporting and analytics
- [ ] PWA functionality

## Mobile-First Design

This application is designed mobile-first with:

- Touch-friendly UI elements (44x44px minimum tap targets)
- Responsive layouts for all screen sizes
- Fixed mobile navigation bar
- Progressive Web App capabilities
- Optimized for one-handed use

## API Integrations

### Anthropic Claude
- Used for chat assistant functionality
- Receipt image analysis
- Natural language queries

### Stripe
- Payment link generation
- Webhook integration for payment status
- Automatic invoice updates

### Microsoft OneDrive
- File storage for receipts, invoices, and manuals
- Automatic folder structure creation
- Secure file access

## Security

- Row Level Security (RLS) enabled on all Supabase tables
- Environment variables for sensitive data
- Webhook signature verification
- CORS configuration
- Rate limiting on API routes

## Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables in Production

Make sure to add all environment variables from `.env.example` to your deployment platform.

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

Private - All Rights Reserved

## Support

For issues or questions, please refer to the PRD document (`yachty-prd.md`) for detailed specifications.

---

Built with Next.js, Supabase, and Claude AI
