# Yacht Management System - Product Requirements Document

**Version:** 1.0  
**Last Updated:** October 22, 2025  
**Status:** Draft

---

## 1. Executive Summary

A personal web application for managing yacht maintenance operations, including client management, invoicing, equipment tracking, receipt processing, and an AI-powered chat assistant that helps navigate operational data and automate workflows.

---

## 2. Key Updates & Enhancements

**Latest Changes (October 22, 2025):**

1. **Mobile-First Design Mandate**
   - All features designed for mobile screens first
   - Mandatory testing on physical devices
   - PWA capabilities for app-like experience

2. **Authentication**
   - Magic link (passwordless) authentication only via Supabase

3. **Advanced Parts Research System**
   - New `parts-research` skill for finding complete parts catalogs
   - Batch import capability for entire equipment catalogs
   - Confidence scoring for part matches with detailed reasoning
   - Dynamic hierarchy tree UI for user adjustment before storage
   - Notification system for pending parts verification

4. **Client Onboarding Skill**
   - Conversational workflow for new client setup
   - Automated tax rate research by jurisdiction
   - OneDrive folder structure auto-creation
   - Client-specific rates and payment terms configuration

5. **Enhanced Receipt Processing**
   - Dedicated confidence calculation algorithm (not agent discretion)
   - Auto-approve threshold: ≥0.95 confidence
   - Manual review queue for uncertain extractions
   - Side-by-side image vs. extracted data comparison

6. **Database Management**
   - Agent can update any entity with user approval
   - Audit trail for all agent-initiated changes
   - Explicit confirmation required for all modifications

7. **Expanded Client Configuration**
   - Per-client hourly rates
   - Per-client tax rates with jurisdiction tracking
   - Configurable payment terms

8. **Work Estimation Enhancements**
   - Range estimates (min-max hours) supported
   - Historical data analysis for estimate suggestions
   - Requires 10+ similar work items before suggesting estimates

9. **Maintenance Tracking**
   - Complete maintenance records system
   - Links maintenance to work sessions
   - Tracks equipment hours/readings at service time
   - Parts replacement tracking

10. **Notification & Approval System**
    - Centralized pending items dashboard
    - Priority-based sorting of items needing review
    - Multiple notification types (receipts, parts, database updates)
    - Mobile-optimized review interface

11. **Payment Notifications**
    - Stripe-configured email notifications for payments
    - Automatic invoice status updates via webhooks
    - Notification log for audit trail

---

## 3. Product Overview

### 3.1 Purpose
Streamline yacht management operations through automated receipt processing, intelligent equipment tracking, conversational data access, and integrated invoicing with payment capabilities.

### 3.2 Target User
Single yacht manager handling multiple client vessels with needs for:
- Time tracking and work documentation
- Parts inventory management
- Invoice generation and payment collection
- Quick access to equipment specifications and manuals
- Tax and expense tracking

---

## 4. Technical Stack

### 4.1 Infrastructure Requirements
- **Database:** Supabase (Free Tier)
  - PostgreSQL database with Row Level Security
  - Real-time subscriptions for chat
  - Authentication
  - Storage for structured data only

- **File Storage:** Microsoft OneDrive
  - Receipt images
  - Equipment manuals (PDFs)
  - Invoice documents
  - Client-specific photos

- **Hosting:** Free-tier options
  - Primary: Vercel (recommended for Next.js)
  - Alternatives: Netlify, Railway, Render
  - Consider: Static site + serverless functions

- **Payment Processing:** Stripe
  - Payment Links or Checkout Sessions
  - Webhook integration for payment confirmation

- **AI Services:** Anthropic API
  - Claude Sonnet 4.5 (primary assistant)
  - Claude Haiku 4.5 (quick lookups, classification)

### 4.2 Frontend Framework
- **Recommended:** Next.js 14+ (App Router)
  - Server-side rendering capabilities
  - API routes for serverless functions
  - Optimized for Vercel deployment
  - TypeScript for type safety

### 4.3 Key Dependencies
- `@supabase/supabase-js` - Database client
- `@anthropic-ai/sdk` - AI integration
- `stripe` - Payment processing
- `@microsoft/microsoft-graph-client` - OneDrive integration
- `react-pdf` or `pdf-lib` - PDF generation for invoices
- `zod` - Runtime validation
- `date-fns` - Date manipulation

---

## 5. Core Features

### 5.1 Client & Boat Management

#### 5.1.1 Client Records
**Database Schema: `clients`**
```sql
- id (uuid, primary key)
- name (text, required)
- email (text)
- phone (text)
- billing_address (jsonb)
- hourly_rate (numeric, default 0)
- payment_terms (text, default 'Net 30')
- tax_rate (numeric, default 0)
- tax_jurisdiction (text)
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 5.1.2 Boat Records
**Database Schema: `boats`**
```sql
- id (uuid, primary key)
- client_id (uuid, foreign key -> clients)
- name (text, required, unique)
- make (text)
- model (text)
- year (integer)
- length (numeric)
- onedrive_folder_id (text) - Link to OneDrive folder
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

**Requirements:**
- Each boat must be associated with one client
- Boat names must be unique for AI agent lookup
- OneDrive folder automatically created per boat

---

### 5.2 Equipment Inventory System

#### 5.2.1 Equipment Hierarchy
**Database Schema: `equipment`**
```sql
- id (uuid, primary key)
- boat_id (uuid, foreign key -> boats)
- parent_equipment_id (uuid, foreign key -> equipment, nullable)
- name (text, required) - e.g., "Main Engine", "Oil Filter"
- category (text) - e.g., "Engine", "Electronics", "Plumbing"
- manufacturer (text)
- model (text)
- serial_number (text)
- installation_date (date)
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 5.2.2 Parts & Components
**Database Schema: `parts`**
```sql
- id (uuid, primary key)
- equipment_id (uuid, foreign key -> equipment)
- part_name (text, required) - e.g., "Oil Filter", "Impeller"
- part_number (text)
- manufacturer (text)
- supplier (text)
- last_price (numeric)
- replacement_interval (text) - e.g., "100 hours", "Annual"
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 5.2.3a Pending Parts Verification
**Database Schema: `pending_parts`**
```sql
- id (uuid, primary key)
- equipment_id (uuid, foreign key -> equipment)
- proposed_path (jsonb) - Equipment hierarchy path [{parent: "Main Engine", child: "Oil Filter"}]
- part_name (text)
- status (text, default 'pending') - "pending" | "approved" | "rejected"
- created_by (text) - "agent_research" | "catalog_import" | "user_request"
- created_at (timestamp)
- resolved_at (timestamp)
- resolution_notes (text)
```

**Database Schema: `part_match_options`**
```sql
- id (uuid, primary key)
- pending_part_id (uuid, foreign key -> pending_parts)
- part_number (text)
- description (text)
- manufacturer (text)
- supplier (text)
- price (numeric)
- confidence_score (numeric) - 0-1 scale
- reasoning (text) - Explanation of why this match was suggested
- source_url (text) - Where this information was found
- rank (integer) - 1 = best match, 2 = second best, etc.
- specifications (jsonb) - Technical specs if available
- created_at (timestamp)
```

**Verification Workflow:**
1. Agent finds parts through research or catalog import
2. Creates pending_part with proposed equipment hierarchy
3. Creates part_match_options for each possibility with confidence scores
4. User receives notification of pending parts
5. User reviews options in UI showing:
   - Side-by-side comparison of options
   - Confidence scores with reasoning
   - Dynamic hierarchy tree for adjustment
6. User selects match or rejects all
7. Approved parts added to database at specified location
8. Rejected parts archived for reference

---

#### 5.2.3 Equipment Manuals
**Storage:** OneDrive (per boat folder)
**Database Schema: `equipment_manuals`**
```sql
- id (uuid, primary key)
- equipment_id (uuid, foreign key -> equipment)
- title (text)
- onedrive_file_id (text)
- onedrive_file_path (text)
- file_url (text) - Temporary access URL
- verified_by_user (boolean, default false)
- source (text) - "user_uploaded" | "web_search" | "manufacturer"
- created_at (timestamp)
```

**Equipment Storage:**
- PDFs stored in OneDrive under boat-specific folders
- Metadata in Supabase for searchability
- AI agent can reference manuals during troubleshooting
- User must verify web-sourced manuals before saving

#### 5.2.4 Maintenance Records
**Database Schema: `maintenance_records`**
```sql
- id (uuid, primary key)
- equipment_id (uuid, foreign key -> equipment)
- work_session_id (uuid, foreign key -> work_sessions, nullable)
- maintenance_type (text) - "routine" | "repair" | "inspection" | "replacement"
- description (text)
- parts_replaced (jsonb) - Array of part IDs used
- performed_date (date, required)
- next_due_date (date)
- hours_at_maintenance (numeric) - Engine hours or similar meter reading
- cost (numeric)
- notes (text)
- created_at (timestamp)
```

**Requirements:**
- Links maintenance activities to work sessions for tracking
- Records equipment state at time of maintenance (hours, readings)
- Tracks which parts were replaced
- Schedules future maintenance based on intervals
- Agent can suggest maintenance based on hours/dates

---

### 5.3 Receipt Processing & Expense Tracking

#### 5.3.1 Receipt Upload Flow
1. User uploads photo to chat interface
2. Claude Haiku 4.5 analyzes image:
   - Identifies if document is a receipt
   - Extracts: Date, vendor, amount, line items, PO number
   - Determines if handwritten boat name or PO present
3. System prompts for missing information if needed
4. Receipt stored in OneDrive
5. Expense record created in database

#### 5.3.2 Expense Categories
**Database Schema: `expenses`**
```sql
- id (uuid, primary key)
- boat_id (uuid, foreign key -> boats, nullable)
- client_id (uuid, foreign key -> clients, nullable)
- expense_type (text) - "client_billable" | "business_expense"
- vendor (text)
- amount (numeric, required)
- tax_amount (numeric)
- date (date, required)
- po_number (text)
- description (text)
- category (text) - "parts", "fuel", "supplies", "services", etc.
- receipt_onedrive_id (text)
- receipt_url (text)
- confidence_score (numeric) - 0-1 scale from AI processing
- verification_status (text, default 'pending') - "pending" | "verified" | "rejected"
- ai_extracted_data (jsonb) - Raw extraction for review
- verified_at (timestamp)
- verification_notes (text)
- billed_to_client (boolean, default false)
- invoice_id (uuid, foreign key -> invoices, nullable)
- created_at (timestamp)
```

**Processing Rules:**
- **Client Billable:** Must have boat_id or client_id
  - PO number or handwritten boat name required
  - Linked to specific client for invoicing
- **Business Expense:** No client association
  - Stored for tax purposes
  - Categorized for reporting

**Confidence Scoring:**
All receipts are analyzed by a dedicated confidence calculation function (not agent discretion):
- Clear date format: +0.25
- Amount clearly visible: +0.25
- Vendor name identified: +0.15
- PO/boat name visible: +0.20
- Line items parsed: +0.15
- Deductions for: handwriting (-0.20), poor quality (-0.15), ambiguity (-0.25)

**Verification Workflow:**
- Confidence ≥ 0.95: Auto-approve and record immediately
- Confidence < 0.95: Create pending expense for manual review
- Agent ALWAYS asks for verification if confidence < 1.0
- User can view pending receipts queue via chat or UI
- Pending expenses show extracted data vs. image side-by-side

---

### 5.4 Time Tracking

#### 5.4.1 Work Sessions
**Database Schema: `work_sessions`**
```sql
- id (uuid, primary key)
- boat_id (uuid, foreign key -> boats)
- client_id (uuid, foreign key -> clients)
- date (date, required)
- start_time (time, required)
- end_time (time, required)
- duration_hours (numeric, computed)
- description (text)
- billable (boolean, default true)
- hourly_rate (numeric)
- billed_to_client (boolean, default false)
- invoice_id (uuid, foreign key -> invoices, nullable)
- created_at (timestamp)
- chat_message_id (text) - Reference to conversation
```

**Chat-Based Time Recording:**
1. User mentions work performed in chat
2. Agent identifies time-tracking opportunity
3. Agent asks: "Would you like me to record this work?"
4. Agent prompts for:
   - Date (defaults to today)
   - Start time
   - End time
   - Brief description (optional, can use chat context)
5. Work session created automatically

**Requirements:**
- Agent should detect work-related conversations
- Non-intrusive time tracking prompts
- Ability to edit/delete sessions via chat
- Automatic linking to active boat context

---

### 5.5 Work Management

#### 5.5.1 Worklists & Tasks
**Database Schema: `work_items`**
```sql
- id (uuid, primary key)
- boat_id (uuid, foreign key -> boats)
- client_id (uuid, foreign key -> clients)
- title (text, required)
- description (text)
- priority (text) - "low" | "medium" | "high" | "urgent"
- status (text) - "pending" | "in_progress" | "completed" | "on_hold"
- estimated_hours (numeric) - Single estimate for simple cases
- estimate_min_hours (numeric) - Range estimate minimum
- estimate_max_hours (numeric) - Range estimate maximum
- actual_hours (numeric)
- has_estimate (boolean, default false)
- estimate_amount (numeric)
- deadline (date)
- created_from_chat (boolean, default false)
- chat_message_id (text)
- created_at (timestamp)
- completed_at (timestamp)
```

**Database Schema: `work_item_conflicts`**
```sql
- id (uuid, primary key)
- work_item_id (uuid, foreign key -> work_items)
- conflicting_item_id (uuid, foreign key -> work_items)
- reason (text)
- created_at (timestamp)
```

**Chat-Based Work Management:**
- Agent creates work items from conversation context
- Automatically identifies:
  - Work scope
  - Estimated time/cost
  - Dependencies and conflicts with other work
  - Suggested deadlines
- Proactively warns about scheduling conflicts
- Tracks work items by boat and priority

---

### 5.6 Notification & Verification System

#### 5.6.1 Pending Items Dashboard
Users need visibility into items requiring their review and approval. The system provides multiple access points:

**Access Methods:**
- Chat command: "Show me pending items" or "What needs my review?"
- UI badge indicator with count of pending items
- Mobile-optimized review interface
- Priority sorting (high confidence items first)

**Notification Types:**
1. **Pending Receipts** (confidence < 0.95)
   - Shows extracted data vs. original image
   - Displays confidence score breakdown
   - Quick approve/edit/reject actions

2. **Pending Parts** (from research or catalog import)
   - Multiple match options with confidence scores
   - Reasoning for each match
   - Dynamic hierarchy tree for adjustment
   - Batch approval for catalog imports

3. **Database Update Approvals**
   - Shows current vs. proposed values
   - Displays reason for change
   - One-click approve/reject

**Database Schema: `pending_approvals`**
```sql
- id (uuid, primary key)
- approval_type (text) - "receipt" | "part" | "database_update" | "catalog_import"
- entity_id (uuid) - References the pending item
- status (text, default 'pending') - "pending" | "approved" | "rejected" | "expired"
- priority (integer) - Higher = more urgent
- created_at (timestamp)
- expires_at (timestamp) - Optional auto-expire for low-priority items
- resolved_at (timestamp)
- resolved_by (text) - "user" | "auto_approved"
```

**Priority Calculation:**
- Receipts with amounts >$1000: High priority
- Parts for active work items: High priority
- Database updates affecting invoices: High priority
- Catalog imports: Medium priority
- Low confidence matches: Lower priority

---

### 5.7 Invoicing System

#### 5.7.1 Invoice Generation
**Database Schema: `invoices`**
```sql
- id (uuid, primary key)
- invoice_number (text, unique, required)
- client_id (uuid, foreign key -> clients)
- boat_id (uuid, foreign key -> boats, nullable)
- issue_date (date, required)
- due_date (date, required)
- status (text) - "draft" | "sent" | "paid" | "overdue" | "cancelled"
- subtotal (numeric, required)
- tax_rate (numeric)
- tax_amount (numeric)
- total_amount (numeric, required)
- notes (text)
- payment_terms (text)
- stripe_payment_link (text)
- stripe_payment_intent_id (text)
- paid_at (timestamp)
- onedrive_file_id (text) - PDF invoice
- created_at (timestamp)
- sent_at (timestamp)
```

**Database Schema: `invoice_line_items`**
```sql
- id (uuid, primary key)
- invoice_id (uuid, foreign key -> invoices)
- description (text, required)
- quantity (numeric, default 1)
- unit_price (numeric, required)
- amount (numeric, required)
- item_type (text) - "labor" | "parts" | "expense" | "other"
- reference_id (uuid) - Links to work_sessions or expenses
- created_at (timestamp)
```

#### 5.7.2 Invoice Features
**Formatting:**
- Professional PDF generation
- Company logo/branding
- Client & boat information
- Itemized breakdown:
  - Labor hours with descriptions
  - Parts with part numbers
  - Expenses with receipt references
  - Subtotal, tax, total
- Payment terms and due date
- Stripe "Pay Now" button/link

**Payment Integration:**
- Generate Stripe Payment Link on invoice creation
- Embed in PDF and email
- Webhook listeners for payment status updates
- Automatic status update to "paid" on successful payment
- Email notification on payment received

**Invoice Storage:**
- PDF saved to OneDrive (client-specific folder)
- Reference stored in Supabase
- Accessible via chat interface

#### 5.7.3 Payment Notifications
**Database Schema: `notification_log`**
```sql
- id (uuid, primary key)
- notification_type (text) - "payment_received" | "payment_failed" | "invoice_sent" | "overdue_reminder"
- invoice_id (uuid, foreign key -> invoices, nullable)
- recipient_email (text)
- sent_at (timestamp)
- delivery_status (text) - "sent" | "delivered" | "failed" | "bounced"
- provider (text) - "stripe" | "system"
- metadata (jsonb)
- created_at (timestamp)
```

**Configuration:**
- Stripe configured to send payment confirmation emails automatically
- Webhook updates invoice status and logs notification
- Future: Can expand for custom notification preferences

---

### 5.8 AI Chat Assistant

#### 5.8.1 Chat Interface
**Database Schema: `chat_messages`**
```sql
- id (uuid, primary key)
- session_id (uuid) - Groups related messages
- role (text) - "user" | "assistant" | "system"
- content (text, required)
- active_boat_id (uuid, foreign key -> boats, nullable)
- active_client_id (uuid, foreign key -> clients, nullable)
- attachments (jsonb) - File references
- created_at (timestamp)
```

**Database Schema: `chat_sessions`**
```sql
- id (uuid, primary key)
- title (text) - Auto-generated summary
- created_at (timestamp)
- last_message_at (timestamp)
```

#### 5.8.2 AI Models Usage
**Claude Sonnet 4.5 (Primary):**
- Complex queries and conversations
- Troubleshooting and diagnostics
- Work planning and scheduling
- Invoice creation and review
- Natural language data queries
- Parts catalog research

**Claude Haiku 4.5 (Fast Operations):**
- Receipt image analysis
- Quick part number lookups
- Simple data retrieval
- Classification tasks
- Confidence score calculations

#### 5.8.3 Claude Skills System
Custom skills for efficient data navigation:

**Skill: `yacht-data-navigator`**
- Query clients, boats, equipment, parts
- Search across all entities
- Context-aware suggestions
- Relationship mapping (boat -> equipment -> parts)

**Skill: `equipment-diagnostics`**
- Access equipment manuals
- Cross-reference symptoms with documentation
- Part number identification
- Maintenance schedule recommendations

**Skill: `invoice-manager`**
- Gather billable items (time, expenses)
- Calculate totals
- Generate invoice drafts
- Send invoices via chat command

**Skill: `work-tracker`**
- Time entry automation
- Work item creation
- Schedule management
- Conflict detection

**Skill: `receipt-processor`**
- Image analysis
- Data extraction
- Expense categorization
- Client/boat association

**Skill: `parts-research`**
- Search web for parts catalogs and technical manuals
- Extract complete part listings from catalogs
- Present findings with source links and confidence scores
- Parse catalog data (part numbers, descriptions, specifications, pricing)
- Identify parent-child part relationships from catalogs
- Upon user approval, batch-populate database with catalog parts
- Download and store verified manuals to OneDrive
- Link researched parts to correct equipment hierarchy

**Skill: `client-onboarding`**
- Conversational new client setup workflow
- Collect all required client information (name, contact, billing address)
- Create client record in database
- Set up initial boat(s) for the client
- Configure client-specific settings (hourly rates, payment terms, tax rate)
- Create OneDrive folder structure for client
- Confirm all information before finalizing
- Generate welcome summary with next steps

#### 5.8.4 Chat Capabilities

**Information Retrieval:**
- "What oil filter does MINX need?"
  - Searches boat named MINX
  - Finds main engine equipment
  - Returns oil filter part number if stored
  - Searches web if not found, asks for verification before storing

- "Show me all work for Boat X this month"
  - Queries work_sessions and work_items
  - Provides summary with hours and status

- "What's my schedule this week?"
  - Lists active work items with deadlines
  - Identifies conflicts
  - Suggests priorities

**Action Execution:**
- "Record 3 hours of work on MINX today from 9am to noon"
  - Creates work_session entry
  - Prompts for description if needed

- "Create invoice for Client X"
  - Gathers unbilled work sessions and expenses
  - Generates invoice preview
  - Requests approval before finalizing

- "Send the invoice"
  - Generates PDF
  - Creates Stripe payment link
  - Marks as sent
  - Confirms action

**Document Processing:**
- User uploads receipt photo
  - Agent analyzes and categorizes
  - Calculates confidence score using dedicated function
  - Auto-approves if ≥0.95, otherwise prompts for verification
  - Saves to OneDrive and database

- User uploads equipment manual
  - Asks which equipment it's for
  - Saves to OneDrive
  - Links to equipment record

**Parts Research & Catalog Import:**
- "Find me parts for the Yanmar 6LY3-ETP engine on MINX"
  - Agent searches web for parts catalogs
  - Identifies manufacturer catalogs, aftermarket options
  - Downloads catalog PDFs if available
  - Extracts all relevant parts with specifications
  - Creates pending_parts records with proposed hierarchy
  - Presents findings: "Found 47 parts in Yanmar official catalog"
  - User reviews and approves batch import
  - Parts added to equipment inventory with relationships

- "What oil filter does MINX need?"
  - If stored: Returns part number immediately
  - If not stored but multiple matches found:
    - Presents ranked options with confidence scores
    - Shows reasoning for each match
    - Displays proposed hierarchy as editable tree
    - User selects preferred option
    - Agent stores to database

**Client Onboarding:**
- "Add a new client"
  - Agent initiates conversational workflow
  - Collects: Name, email, phone, billing address
  - Asks about hourly rate and payment terms
  - Researches and suggests tax rate for jurisdiction
  - Confirms all information
  - Creates client record
  - Sets up OneDrive folder structure
  - Offers to add first boat immediately

**Database Management:**
- Agent can update any entity with user approval
- "Change the hourly rate for Client X to $125"
  - Agent confirms current rate
  - Shows what will change
  - Requests explicit approval
  - Makes update
  - Confirms completion
- Maintains audit trail of agent-initiated changes

**Contextual Awareness:**
- Maintains active boat/client context during conversation
- Remembers recent topics for natural follow-up
- Uses conversation history to infer intent

#### 5.8.5 Memory System

**Short-Term Memory (Session-Based):**
- Stored in chat_messages table
- Last 20-30 messages kept in context
- Includes active boat/client context
- Cleared when user starts new session

**Long-Term Memory (Knowledge Base):**
**Database Schema: `agent_memories`**
```sql
- id (uuid, primary key)
- memory_type (text) - "preference" | "fact" | "procedure" | "note"
- entity_type (text) - "client" | "boat" | "equipment" | "general"
- entity_id (uuid, nullable)
- content (text, required)
- context (text) - When/how this was learned
- confidence (numeric) - 0-1 scale
- last_used_at (timestamp)
- created_at (timestamp)
```

**Memory Examples:**
- User preferences: "I prefer to invoice monthly"
- Client-specific: "Client X always wants itemized receipts"
- Boat-specific: "MINX's generator has been temperamental"
- Procedural: "Always check oil pressure after engine work"

**Memory Management:**
- Agent automatically saves important information
- User can explicitly tell agent to remember something
- Memories retrieved based on current context
- Low-confidence memories can be corrected

---

### 5.9 Integration Requirements

#### 5.9.1 OneDrive Integration
**Folder Structure:**
```
/Yacht Management/
  /Clients/
    /[Client Name]/
      /[Boat Name]/
        /Receipts/
          /YYYY-MM/
        /Invoices/
        /Manuals/
        /Photos/
```

**Required Permissions:**
- Files.ReadWrite.All (or Files.ReadWrite.AppFolder)
- Offline access for background operations

**Operations:**
- Upload receipts with automatic organization
- Store generated invoice PDFs
- Save equipment manuals
- Retrieve files for agent reference

#### 5.9.2 Stripe Integration
**Configuration:**
- Webhook endpoint for payment events
- Payment Links for simple checkout
- Metadata to link payments to invoices

**Webhook Events:**
- `payment_intent.succeeded` -> Update invoice status
- `payment_intent.payment_failed` -> Notify user
- `charge.refunded` -> Update invoice record

**Security:**
- Verify webhook signatures
- Store API keys in environment variables
- Use restricted API keys

#### 5.9.3 Anthropic API Integration
**Rate Limiting:**
- Implement token counting
- Queue system for multiple simultaneous requests
- Graceful degradation if quota exceeded

**Prompt Management:**
- System prompts stored in codebase
- Dynamic context injection from database
- Skill definitions loaded per request

**Error Handling:**
- Retry logic for transient failures
- Fallback to Haiku if Sonnet unavailable
- User-friendly error messages

---

## 6. User Interface

### 6.1 Design Approach

**Mobile-First Development:**
- ALL features must be designed for mobile screens first
- Desktop is enhancement, not primary target
- Mandatory mobile testing at every development stage
- Touch-friendly UI elements (minimum 44x44px tap targets)
- Optimized for one-handed use where possible
- Progressive Web App (PWA) capabilities for app-like experience

**Testing Requirements:**
- Test on physical iOS and Android devices
- Multiple screen sizes (small phones to tablets)
- Both portrait and landscape orientations
- Touch gestures (swipe, pinch, long-press)
- Performance on slower mobile networks
- Offline capability for core features

### 6.2 Core Views

#### 6.2.1 Dashboard (Home)
- Quick stats: Active work items, pending invoices, this week's hours
- Recent activity feed
- Quick access buttons: New Chat, Create Invoice, View Schedule

#### 6.2.2 Chat Interface (Primary)
- Full-screen conversational UI
- File upload area (drag-drop or click)
- Message history with timestamps
- Active context indicator (current boat/client)
- Quick actions sidebar:
  - Switch boat context
  - View related work items
  - Access equipment list

#### 6.2.3 Clients & Boats
- List view with search/filter
- Card layout showing:
  - Client name, contact info
  - Associated boats
  - Outstanding invoices
  - Active work items

#### 6.2.4 Equipment Inventory
- Hierarchical tree view by boat
- Search across all equipment
- Quick filters: By boat, by category, needs maintenance
- Equipment detail modal:
  - Specs and notes
  - Associated parts
  - Linked manuals
  - Maintenance history

#### 6.2.5 Invoices
- Filterable list: All, Draft, Sent, Paid, Overdue
- Invoice preview with PDF download
- Payment status indicators
- Quick actions: Send, Mark Paid, Edit, Duplicate

#### 6.2.6 Work Schedule
- Calendar view with work items and deadlines
- Filter by boat/client
- Conflict warnings highlighted
- Drag-and-drop rescheduling

#### 6.2.7 Reports (Simple)
- Time summary by boat/client/date range
- Expense summary by category
- Revenue by client
- Export to CSV

### 6.3 Mobile Responsiveness
- Chat interface optimized for mobile
- Photo upload from camera
- Quick time entry
- Invoice viewing and sending
- Responsive tables and cards

---

## 7. Security & Privacy

### 7.1 Authentication
- Supabase Auth with Magic Link (passwordless)
- Email-based authentication only
- Single user account (personal use)
- Session persistence across devices
- Automatic token refresh

### 7.2 Data Security
- Row Level Security (RLS) on all Supabase tables
- User ID check in all RLS policies
- API keys stored in environment variables
- OneDrive tokens encrypted at rest

### 7.3 API Security
- Rate limiting on all endpoints
- Request validation with Zod schemas
- Webhook signature verification
- CORS configuration for known origins only

### 7.4 Data Backup
- Supabase automatic backups (free tier: 7 days)
- OneDrive files protected by Microsoft's infrastructure
- Consider: Weekly manual export of critical data

---

## 8. Deployment Strategy

### 8.1 Hosting Options

**Option 1: Vercel (Recommended)**
- Free tier: Generous limits for personal use
- Excellent Next.js support
- Automatic deployments from Git
- Serverless functions for API routes
- Environment variable management

**Option 2: Netlify**
- Free tier with similar capabilities
- Edge functions for API routes
- Form handling built-in

**Option 3: Railway**
- Free tier with 500 hours/month
- Better for apps needing persistent servers
- Docker deployment option

### 8.2 Environment Variables
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
ONEDRIVE_CLIENT_ID=
ONEDRIVE_CLIENT_SECRET=
ONEDRIVE_TENANT_ID=
```

### 8.3 Database Migrations
- Use Supabase migrations for schema changes
- Version control all migration files
- Test migrations in dev environment first

### 8.4 Continuous Deployment
- Git repository (GitHub/GitLab)
- Automatic deployments on main branch push
- Preview deployments for feature branches

---

## 9. AI Agent Implementation Details

### 9.1 System Prompt Structure
```
You are a yacht management assistant helping manage multiple client vessels.

Current Context:
- Active Boat: {boat_name} (ID: {boat_id})
- Active Client: {client_name}
- Recent Work: {summary}

Available Tools:
- search_boats: Find boats by name or client
- search_equipment: Find equipment and parts
- search_manuals: Find equipment documentation
- create_work_session: Record time worked
- create_invoice: Generate invoice from unbilled items
- process_receipt: Analyze and categorize uploaded receipts
- add_work_item: Create a new task
- search_web: Find part numbers or technical info online
- research_parts_catalog: Deep research for complete parts catalogs and manuals
- onboard_new_client: Conversational workflow for adding new clients
- update_database: Make approved changes to any database entity
- verify_part_match: Present part options with confidence scores for user selection

Your capabilities:
1. Natural language queries about boats, equipment, parts
2. Time tracking and work scheduling
3. Invoice generation and management
4. Receipt processing and expense tracking (with confidence scoring)
5. Equipment diagnostics using manuals and web searches
6. Deep parts research: finding complete catalogs and technical documentation
7. Client onboarding with conversational data collection
8. Database management with user approval for all changes
9. Parts catalog population after verification
10. Proactive suggestions for maintenance and work prioritization

Communication style:
- Professional but conversational
- Proactive in suggesting actions
- Ask clarifying questions when needed
- ALWAYS confirm before making changes to data
- ALWAYS ask for verification when confidence is below 100%
- Provide context and reasoning for recommendations
- Show confidence scores for uncertain classifications or matches
- Present equipment hierarchy as dynamic tree for user adjustment

Critical Rules:
- NEVER auto-record receipts or parts without user approval unless confidence is 100%
- ALWAYS display confidence scores with uncertain data
- ALWAYS show the intended database path (parent hierarchy) before storing parts
- ALWAYS request approval before batch-populating parts from catalogs
- For parts with multiple matches, present ALL options with confidence scores and reasoning
```

### 9.2 Tool/Function Definitions

Each skill is implemented as a set of callable functions:

**Example: `search_equipment` function**
```typescript
{
  name: "search_equipment",
  description: "Search for equipment and parts across all boats or within a specific boat",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Natural language search query (e.g., 'oil filter', 'main engine')"
      },
      boat_id: {
        type: "string",
        description: "Optional: Limit search to specific boat",
        optional: true
      },
      include_parts: {
        type: "boolean",
        description: "Include associated parts in results",
        default: true
      }
    },
    required: ["query"]
  }
}
```

**New: `research_parts_catalog` function**
```typescript
{
  name: "research_parts_catalog",
  description: "Deep web research for parts catalogs and technical manuals for specific equipment",
  parameters: {
    type: "object",
    properties: {
      equipment_name: {
        type: "string",
        description: "Equipment name/model (e.g., 'Yanmar 6LY3-ETP')"
      },
      manufacturer: {
        type: "string",
        description: "Manufacturer name if known"
      },
      search_type: {
        type: "string",
        enum: ["parts_catalog", "technical_manual", "both"],
        description: "Type of documentation to search for"
      },
      boat_id: {
        type: "string",
        description: "Boat ID for context and storage location"
      }
    },
    required: ["equipment_name", "search_type", "boat_id"]
  }
}
```

**New: `create_pending_parts` function**
```typescript
{
  name: "create_pending_parts",
  description: "Create pending parts with multiple match options for user verification",
  parameters: {
    type: "object",
    properties: {
      equipment_id: {
        type: "string",
        description: "Equipment these parts belong to"
      },
      proposed_path: {
        type: "array",
        description: "Hierarchy path as array of parent-child relationships",
        items: {
          type: "object",
          properties: {
            parent: { type: "string" },
            child: { type: "string" }
          }
        }
      },
      part_options: {
        type: "array",
        description: "Array of possible part matches with confidence scores",
        items: {
          type: "object",
          properties: {
            part_number: { type: "string" },
            description: { type: "string" },
            manufacturer: { type: "string" },
            confidence_score: { type: "number" },
            reasoning: { type: "string" },
            source_url: { type: "string" },
            specifications: { type: "object" }
          }
        }
      }
    },
    required: ["equipment_id", "proposed_path", "part_options"]
  }
}
```

**New: `onboard_client` function**
```typescript
{
  name: "onboard_client",
  description: "Create new client with all required information and setup",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      billing_address: {
        type: "object",
        properties: {
          street: { type: "string" },
          city: { type: "string" },
          state: { type: "string" },
          zip: { type: "string" },
          country: { type: "string" }
        }
      },
      hourly_rate: { type: "number" },
      payment_terms: { type: "string" },
      tax_rate: { type: "number" },
      tax_jurisdiction: { type: "string" }
    },
    required: ["name"]
  }
}
```

**New: `research_tax_rate` function**
```typescript
{
  name: "research_tax_rate",
  description: "Research current tax rates for a specific jurisdiction",
  parameters: {
    type: "object",
    properties: {
      city: { type: "string" },
      state: { type: "string" },
      country: { type: "string" },
      transaction_type: {
        type: "string",
        enum: ["services", "goods", "mixed"],
        default: "services"
      }
    },
    required: ["state", "country"]
  }
}
```

**New: `update_database_entity` function**
```typescript
{
  name: "update_database_entity",
  description: "Update any database entity after user approval",
  parameters: {
    type: "object",
    properties: {
      entity_type: {
        type: "string",
        enum: ["client", "boat", "equipment", "part", "work_item", "expense", "invoice"],
        description: "Type of entity to update"
      },
      entity_id: {
        type: "string",
        description: "UUID of the entity to update"
      },
      updates: {
        type: "object",
        description: "Fields to update with new values"
      },
      reason: {
        type: "string",
        description: "Reason for the update (for audit trail)"
      }
    },
    required: ["entity_type", "entity_id", "updates", "reason"]
  }
}
```

**New: `calculate_receipt_confidence` function**
```typescript
{
  name: "calculate_receipt_confidence",
  description: "Calculate confidence score for receipt data extraction (not agent discretion)",
  parameters: {
    type: "object",
    properties: {
      has_clear_date: { type: "boolean" },
      has_clear_amount: { type: "boolean" },
      has_vendor_name: { type: "boolean" },
      has_po_or_boat_name: { type: "boolean" },
      has_line_items: { type: "boolean" },
      has_handwritten_text: { type: "boolean" },
      image_quality: {
        type: "string",
        enum: ["excellent", "good", "fair", "poor"]
      },
      has_ambiguity: { type: "boolean" }
    },
    required: ["has_clear_date", "has_clear_amount", "image_quality"]
  }
}
```

**Enhanced: `get_pending_items` function**
```typescript
{
  name: "get_pending_items",
  description: "Get items needing user review (receipts, parts, etc.)",
  parameters: {
    type: "object",
    properties: {
      item_type: {
        type: "string",
        enum: ["receipts", "parts", "all"],
        description: "Type of pending items to retrieve"
      },
      limit: {
        type: "number",
        default: 10,
        description: "Maximum number of items to return"
      }
    },
    required: ["item_type"]
  }
}
```

### 9.3 Context Management Strategy

**Building Context:**
1. System prompt with role and capabilities
2. Active boat/client context
3. Recent chat history (last 20 messages)
4. Relevant memories from agent_memories table
5. Tool results from previous turns

**Context Optimization:**
- Summarize old messages beyond 20-turn window
- Only include relevant equipment/parts data (not entire database)
- Load manuals on-demand when referenced
- Cache frequently accessed data (boat lists, client info)

### 9.4 Multi-Step Workflows

**Example: Creating an Invoice**
1. User: "Create invoice for MINX"
2. Agent uses `search_boats` to confirm MINX
3. Agent uses `get_unbilled_items` to fetch work sessions and expenses
4. Agent presents preview with totals
5. User confirms or requests changes
6. Agent calls `create_invoice` function
7. Agent generates PDF and Stripe link
8. Agent asks: "Would you like me to send this now?"

**Example: Equipment Troubleshooting**
1. User: "MINX's generator won't start"
2. Agent uses `search_equipment` for MINX's generator
3. Agent checks if manual exists with `search_manuals`
4. If manual exists: Retrieves relevant sections
5. If no manual: Uses `search_web` with generator model info
6. Agent asks diagnostic questions based on documentation
7. Agent suggests likely causes and solutions
8. If parts needed: Looks up part numbers
9. Agent offers to create work item for repair

**Example: Parts Catalog Research & Import**
1. User: "I need to build out all the parts for the Yanmar engine on MINX"
2. Agent uses `search_boats` to identify MINX
3. Agent uses `search_equipment` to find "Yanmar" equipment on MINX
4. Agent identifies: "Yanmar 6LY3-ETP Main Engine"
5. Agent uses `research_parts_catalog` with equipment details
6. Agent finds: "Yanmar Marine Diesel Engine Parts Catalog 2024"
7. Agent downloads/scrapes catalog and extracts ~50 parts
8. Agent creates pending_parts batch with proposed hierarchy:
   ```
   Main Engine (Yanmar 6LY3-ETP)
   ├── Filters
   │   ├── Oil Filter (119593-35151)
   │   ├── Fuel Filter (129150-55650)
   │   └── Air Filter (129100-12540)
   ├── Belts
   │   └── V-Belt (104214-77540)
   ├── Cooling System
   │   ├── Impeller (129670-42200)
   │   ├── Thermostat (129470-49801)
   │   └── Heat Exchanger Gasket (...)
   └── ... (remaining 40+ parts)
   ```
9. Agent presents: "I found 47 parts from the official Yanmar catalog. Here's the proposed organization. Would you like to review and import these?"
10. User reviews hierarchy in dynamic tree UI
11. User adjusts if needed and approves
12. Agent batch-inserts all parts with relationships
13. Agent confirms: "Successfully added 47 parts to MINX's Yanmar engine inventory"

**Example: Client Onboarding**
1. User: "Add a new client named Harbor Marine Services"
2. Agent uses `onboard_client` workflow
3. Agent: "Great! Let me gather some information about Harbor Marine Services."
4. Agent asks for: email, phone, billing address
5. Agent: "What hourly rate would you like to set for this client?"
6. User: "$150/hour"
7. Agent: "I see they're located in Seattle, WA. Let me research the current tax rate..."
8. Agent uses `research_tax_rate` for Seattle, WA
9. Agent: "The current sales tax rate in Seattle is 10.35% (state + local). Should I use this for their invoices?"
10. User confirms
11. Agent creates client record and OneDrive folder structure
12. Agent: "Harbor Marine Services has been added successfully! Would you like to add their first boat now?"

---

## 10. Future Enhancements (Out of Scope for V1)

### 10.1 Phase 2 Features
- Mobile app (iOS/Android)
- Customer portal for clients to view invoices and work status
- Automated maintenance reminders based on engine hours
- Multi-user support (crew members)
- Advanced reporting and analytics

### 10.2 Phase 3 Features
- Inventory management for shop parts/supplies
- Integration with marine parts suppliers (API)
- Voice input for time tracking and notes
- Photo-based equipment condition monitoring
- Automated tax report generation

---

## 11. Success Metrics

### 11.1 Efficiency Gains
- Time to create invoice: <5 minutes (vs. 20+ minutes manual)
- Part lookup time: <30 seconds (vs. 10+ minutes searching)
- Receipt processing time: <1 minute per receipt
- Time tracking accuracy: 90%+ of work properly recorded

### 11.2 Data Quality
- Equipment records completeness: 80%+ have part numbers
- Receipt capture rate: 95%+ of receipts processed within 24 hours
- Invoice accuracy: <5% require corrections after generation

### 11.3 User Satisfaction
- Chat assistant usefulness: 8/10+ rating
- System reduces administrative time by 50%+
- Invoice payment time reduced by 30%+

---

## 12. Development Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Supabase setup and schema creation (including new tables)
- [ ] Magic link authentication implementation
- [ ] Basic UI scaffolding (Next.js, mobile-first)
- [ ] OneDrive integration setup
- [ ] Core CRUD operations for clients/boats
- [ ] Client onboarding workflow

### Phase 2: Equipment & Data (Weeks 3-4)
- [ ] Equipment hierarchy implementation
- [ ] Parts database and relationships
- [ ] Pending parts verification system
- [ ] Manual upload and storage system
- [ ] Search functionality across entities
- [ ] Maintenance tracking tables

### Phase 3: Chat Assistant (Weeks 5-7)
- [ ] Chat interface implementation (mobile-optimized)
- [ ] Anthropic API integration
- [ ] Basic skills/tools development
- [ ] Receipt processing with Haiku + confidence scoring
- [ ] Equipment search and diagnostics
- [ ] Database update capability with approval

### Phase 4: Advanced Parts Research (Week 8)
- [ ] Parts catalog research skill
- [ ] Web scraping for catalogs and manuals
- [ ] Batch parts import workflow
- [ ] Part matching with confidence scores
- [ ] Dynamic hierarchy tree UI for verification
- [ ] Pending parts notification system

### Phase 5: Time & Work Management (Week 9)
- [ ] Time tracking via chat
- [ ] Work item creation and management
- [ ] Schedule view and conflict detection
- [ ] Chat-based time entry flows
- [ ] Historical estimate suggestions
- [ ] Maintenance record linking

### Phase 6: Invoicing (Weeks 10-11)
- [ ] Invoice data model and generation
- [ ] PDF creation with formatting
- [ ] Stripe integration for payments
- [ ] Webhook handling for payment updates
- [ ] Notification log implementation
- [ ] Invoice sending via chat
- [ ] Tax rate research integration

### Phase 7: Polish & Deploy (Week 12)
- [ ] Error handling and validation
- [ ] Mobile responsiveness testing (mandatory)
- [ ] Performance optimization
- [ ] User testing and refinement
- [ ] Production deployment
- [ ] Documentation
- [ ] PWA setup for mobile app experience

---

## 13. Risk Assessment

### 13.1 Technical Risks

**Risk: Free tier limitations**
- Supabase: 500MB database, 1GB file storage, 2GB bandwidth
- Mitigation: OneDrive for all file storage, optimize queries, monitor usage

**Risk: API costs (Anthropic)**
- Claude Sonnet 4.5: $3 per million input tokens
- Mitigation: Use Haiku for simple tasks, implement caching, set budget alerts

**Risk: OneDrive API rate limits**
- 10,000 requests per 10 minutes per app
- Mitigation: Cache file metadata, batch operations, implement retry logic

**Risk: Stripe integration complexity**
- Webhook reliability, payment edge cases
- Mitigation: Thorough testing, idempotent webhook handlers, manual override options

### 13.2 Business Risks

**Risk: Data loss**
- Single point of failure
- Mitigation: Regular exports, OneDrive backup, Supabase automatic backups

**Risk: Scaling beyond personal use**
- Architecture may need rework for multiple users
- Mitigation: Design with multi-tenancy in mind (client_id patterns)

### 13.3 User Experience Risks

**Risk: AI hallucinations or errors**
- Incorrect part numbers, bad advice
- Mitigation: Always require user confirmation for critical actions, provide sources

**Risk: Complex UI for mobile**
- Too much functionality for small screens
- Mitigation: Prioritize chat interface for mobile, progressive disclosure

---

## 14. Open Questions & Answers

### 14.1 Hourly Rates ✓ ANSWERED
**Question:** Should different work types have different rates?
**Answer:** Rates are defined per client and stored in the clients table. This allows flexibility for different client agreements while keeping the system simple.

**Implementation:**
```sql
ALTER TABLE clients ADD COLUMN hourly_rate NUMERIC DEFAULT 0;
ALTER TABLE clients ADD COLUMN payment_terms TEXT DEFAULT 'Net 30';
```

### 14.2 Tax Calculations ✓ ANSWERED
**Question:** Fixed tax rate or vary by jurisdiction?
**Answer:** Tax rates vary by jurisdiction and should be researched for accuracy. Stored per client with ability to override per invoice if needed.

**Implementation:**
```sql
ALTER TABLE clients ADD COLUMN tax_rate NUMERIC DEFAULT 0;
ALTER TABLE clients ADD COLUMN tax_jurisdiction TEXT;
```

**Agent Capability:** When setting up new client or creating invoice, agent should research current tax rates for the client's jurisdiction and suggest appropriate rate.

### 14.3 Work Item Estimates ✓ ANSWERED
**Question:** Should agent suggest estimates based on similar past work?
**Answer:** Yes, but only after the agent has an educated baseline to work from. Allow range estimates (e.g., 4-6 hours).

**Implementation:**
```sql
ALTER TABLE work_items ADD COLUMN estimate_min_hours NUMERIC;
ALTER TABLE work_items ADD COLUMN estimate_max_hours NUMERIC;
```

**Agent Logic:**
- After 10+ similar work items exist, agent can suggest estimates
- Queries historical data: `SELECT AVG(actual_hours) FROM work_items WHERE title ILIKE '%similar work%'`
- Presents range: "Based on similar work, this typically takes 4-6 hours"
- User can accept, modify, or skip estimate

### 14.4 Equipment Maintenance Tracking ✓ ANSWERED
**Question:** Track actual maintenance performed?
**Answer:** Yes, track actual maintenance and link to work sessions.

**Implementation:**
Add new table:
```sql
CREATE TABLE maintenance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id),
  work_session_id UUID REFERENCES work_sessions(id),
  maintenance_type TEXT, -- "routine", "repair", "inspection", "replacement"
  description TEXT,
  parts_replaced JSONB, -- Array of part IDs
  performed_date DATE,
  next_due_date DATE,
  hours_at_maintenance NUMERIC, -- Engine hours or similar
  cost NUMERIC,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Agent Capability:** When recording work sessions, agent asks if maintenance was performed and creates linked maintenance record.

### 14.5 Multi-Currency Support ✓ ANSWERED
**Question:** All transactions in USD or support multiple currencies?
**Answer:** All transactions in USD only for V1.

### 14.6 Notification Preferences ✓ ANSWERED
**Question:** Email notifications for payment received, overdue invoices?
**Answer:** Email notification for payment received, configured within Stripe. Ensure Supabase is updated when invoice is paid.

**Implementation:**
- Configure Stripe to send receipt emails automatically
- Webhook handler updates invoice status in Supabase
- Optional: Add notification_preferences to user settings for future expansion

```sql
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_type TEXT, -- "payment_received", "payment_failed", etc.
  invoice_id UUID REFERENCES invoices(id),
  sent_at TIMESTAMP,
  delivery_status TEXT
);
```

### 14.7 Receipt Validation ✓ ANSWERED
**Question:** Manual review queue for AI-processed receipts?
**Answer:** Yes, manual review initially with auto-approve based on confidence score. Agent has strict rules to ask if not 100% sure. Confidence score determined by dedicated skill script (not by agent discretion).

**Implementation:**
Add to expenses table:
```sql
ALTER TABLE expenses ADD COLUMN confidence_score NUMERIC; -- 0-1 scale
ALTER TABLE expenses ADD COLUMN verification_status TEXT DEFAULT 'pending'; 
  -- "pending", "verified", "rejected"
ALTER TABLE expenses ADD COLUMN ai_extracted_data JSONB; 
  -- Raw extraction for review
ALTER TABLE expenses ADD COLUMN verified_at TIMESTAMP;
ALTER TABLE expenses ADD COLUMN verification_notes TEXT;
```

**Confidence Calculation Skill:**
```typescript
function calculateReceiptConfidence(extractedData) {
  let confidence = 0;
  
  // Clear date format found: +0.25
  // Amount clearly visible: +0.25
  // Vendor name identified: +0.15
  // PO number or boat name visible: +0.20
  // Line items parsed: +0.15
  
  // Deductions:
  // Handwritten text: -0.20
  // Faded/poor quality: -0.15
  // Multiple possible interpretations: -0.25
  
  return Math.min(Math.max(confidence, 0), 1);
}
```

**Auto-Approve Threshold:** ≥ 0.95 confidence

**Pending Review Queue:**
- Accessible via chat: "Show me receipts needing review"
- UI view with side-by-side image and extracted data
- Approve/reject/edit actions

### 14.8 Part Number Verification ✓ ANSWERED
**Question:** How to handle when AI finds multiple possible matches?
**Answer:** Notification system for parts needing verification. User accepts or denies. Agent includes confidence score with each part and brief explanation. Pre-determined database path (parent hierarchy) displayed as dynamic tree with dropdowns for user adjustment.

**Implementation:**
Add new tables:
```sql
CREATE TABLE pending_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id),
  proposed_path JSONB, -- [{parent: "Main Engine", child: "Oil Filter"}]
  status TEXT DEFAULT 'pending', -- "pending", "approved", "rejected"
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolution_notes TEXT
);

CREATE TABLE part_match_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pending_part_id UUID REFERENCES pending_parts(id),
  part_number TEXT,
  description TEXT,
  manufacturer TEXT,
  confidence_score NUMERIC, -- 0-1 scale
  reasoning TEXT, -- Why this match was suggested
  source_url TEXT,
  rank INTEGER, -- 1 = best match
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Agent Workflow for Multiple Matches:**
1. Agent finds 3+ possible parts for "oil filter for Yanmar 6LY3-ETP"
2. Creates pending_part record with proposed hierarchy
3. Creates part_match_options for each possibility
4. Presents to user:
```
I found 3 possible oil filters for your Yanmar 6LY3-ETP:

Proposed location: Main Engine → Yanmar 6LY3-ETP → Filters → Oil Filter
(Click to adjust hierarchy)

1. ⭐ 95% confidence - Yanmar 119593-35151
   Reasoning: Direct OEM part, exact model match in manual
   Source: Yanmar Parts Catalog 2024
   
2. ⭐ 82% confidence - Baldwin BF7949
   Reasoning: Cross-reference match, commonly used alternative
   Source: Baldwin Cross-Reference Guide
   
3. ⭐ 65% confidence - Fleetguard LF3594
   Reasoning: Similar specifications, requires verification
   Source: Fleetguard Marine Catalog

Which would you like to use? (Or "none" to search more)
```

5. User selects option or adjusts hierarchy
6. Part added to database at confirmed location
7. pending_part marked as resolved

**Hierarchy Adjustment UI:**
```
Current path: Main Engine → Filters → Oil Filter
                ↓ adjust ↓
New path: [Dropdown: Main Engine ▼]
          → [Dropdown: Add new... ▼]
          → [Dropdown: Oil Filter ▼]
```

---

## 15. Glossary

- **Boat Context:** The active vessel being discussed in chat
- **Billable Item:** Work session or expense that should be charged to a client
- **Equipment Hierarchy:** Parent-child relationships (e.g., Engine > Oil Filter)
- **PO Number:** Purchase Order number written on receipts for tracking
- **Work Item:** A task or project with deadline and estimate
- **Agent Memory:** Long-term information stored for AI assistant context

---

## Appendix A: Database ERD

```
clients (enhanced: hourly_rate, tax_rate, payment_terms)
  |
  |-- boats (1:N)
        |
        |-- equipment (1:N)
        |     |
        |     |-- parts (1:N)
        |     |-- equipment_manuals (1:N)
        |     |-- equipment (parent) (1:N)
        |     |-- maintenance_records (1:N)
        |     |-- pending_parts (1:N)
        |           |
        |           |-- part_match_options (1:N)
        |
        |-- work_items (1:N) (enhanced: estimate ranges)
        |-- work_sessions (1:N)
        |     |
        |     |-- maintenance_records (1:N)
        |
        |-- expenses (1:N) (enhanced: confidence_score, verification_status)
        |-- invoices (1:N)
              |
              |-- invoice_line_items (1:N)
              |-- notification_log (1:N)

chat_messages
  |
  |-- chat_sessions (N:1)

agent_memories (linked to any entity via entity_type + entity_id)

notification_log (can link to invoices)
```

---

## Appendix B: API Endpoint Structure

```
/api/auth/*                 - Supabase auth passthrough (magic link)
/api/chat                   - Chat message processing
/api/upload                 - File upload handler

/api/clients
  - POST /onboard           - Client onboarding workflow
  - GET /                   - List all clients
  - PATCH /:id              - Update client (with approval)

/api/parts
  - POST /research          - Trigger parts catalog research
  - GET /pending            - Get pending parts needing verification
  - POST /pending/:id/approve - Approve pending part(s)
  - POST /pending/:id/reject  - Reject pending part(s)
  - PATCH /:id/hierarchy    - Adjust part hierarchy

/api/receipts
  - POST /process           - Process receipt image
  - GET /pending            - Get receipts needing verification
  - POST /pending/:id/verify - Verify/edit pending receipt
  - POST /confidence        - Calculate confidence score

/api/invoices
  - POST /generate          - Create new invoice
  - GET /:id/pdf            - Download PDF
  - POST /:id/send          - Send invoice
  - GET /                   - List invoices with filters

/api/stripe
  - POST /webhook           - Payment webhooks (updates invoice + notification log)

/api/onedrive
  - POST /upload            - Upload file
  - GET /download/:fileId   - Get file
  - POST /create-folders    - Create client/boat folder structure

/api/equipment
  - GET /search             - Search equipment
  - POST /manual            - Upload manual
  - GET /:id/maintenance    - Get maintenance history

/api/maintenance
  - POST /                  - Create maintenance record
  - GET /upcoming           - Get upcoming maintenance

/api/work
  - POST /session           - Create work session
  - POST /item              - Create work item
  - GET /estimates          - Get historical data for estimates

/api/tax
  - GET /research           - Research tax rate for jurisdiction
```

---

**Document Status:** Ready for review and refinement

**Next Steps:**
1. Review and refine requirements
2. Prioritize features if needed
3. Validate technical stack choices
4. Begin Phase 1 development
