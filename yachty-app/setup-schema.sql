-- Yacht Management System Database Schema
-- Based on PRD v1.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  billing_address JSONB,
  hourly_rate NUMERIC DEFAULT 0,
  payment_terms TEXT DEFAULT 'Net 30',
  tax_rate NUMERIC DEFAULT 0,
  tax_jurisdiction TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Boats table
CREATE TABLE boats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL UNIQUE,
  make TEXT,
  model TEXT,
  year INTEGER,
  length NUMERIC,
  onedrive_folder_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment table (hierarchical structure)
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boat_id UUID NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
  parent_equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  installation_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parts table
CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  part_name TEXT NOT NULL,
  part_number TEXT,
  manufacturer TEXT,
  supplier TEXT,
  last_price NUMERIC,
  replacement_interval TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pending parts verification table
CREATE TABLE pending_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  proposed_path JSONB,
  part_name TEXT,
  status TEXT DEFAULT 'pending',
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Part match options table
CREATE TABLE part_match_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pending_part_id UUID NOT NULL REFERENCES pending_parts(id) ON DELETE CASCADE,
  part_number TEXT,
  description TEXT,
  manufacturer TEXT,
  supplier TEXT,
  price NUMERIC,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reasoning TEXT,
  source_url TEXT,
  rank INTEGER,
  specifications JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment manuals table
CREATE TABLE equipment_manuals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  title TEXT,
  onedrive_file_id TEXT,
  onedrive_file_path TEXT,
  file_url TEXT,
  verified_by_user BOOLEAN DEFAULT false,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance records table
CREATE TABLE maintenance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  work_session_id UUID,
  maintenance_type TEXT CHECK (maintenance_type IN ('routine', 'repair', 'inspection', 'replacement')),
  description TEXT,
  parts_replaced JSONB,
  performed_date DATE NOT NULL,
  next_due_date DATE,
  hours_at_maintenance NUMERIC,
  cost NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boat_id UUID REFERENCES boats(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  expense_type TEXT CHECK (expense_type IN ('client_billable', 'business_expense')),
  vendor TEXT,
  amount NUMERIC NOT NULL,
  tax_amount NUMERIC,
  date DATE NOT NULL,
  po_number TEXT,
  description TEXT,
  category TEXT,
  receipt_onedrive_id TEXT,
  receipt_url TEXT,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  ai_extracted_data JSONB,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  billed_to_client BOOLEAN DEFAULT false,
  invoice_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work sessions table
CREATE TABLE work_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boat_id UUID NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours NUMERIC GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (end_time - start_time)) / 3600
  ) STORED,
  description TEXT,
  billable BOOLEAN DEFAULT true,
  hourly_rate NUMERIC,
  billed_to_client BOOLEAN DEFAULT false,
  invoice_id UUID,
  chat_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work items table
CREATE TABLE work_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boat_id UUID NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'on_hold')),
  estimated_hours NUMERIC,
  estimate_min_hours NUMERIC,
  estimate_max_hours NUMERIC,
  actual_hours NUMERIC,
  has_estimate BOOLEAN DEFAULT false,
  estimate_amount NUMERIC,
  deadline DATE,
  created_from_chat BOOLEAN DEFAULT false,
  chat_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Work item conflicts table
CREATE TABLE work_item_conflicts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_item_id UUID NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
  conflicting_item_id UUID NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  boat_id UUID REFERENCES boats(id) ON DELETE SET NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  subtotal NUMERIC NOT NULL,
  tax_rate NUMERIC,
  tax_amount NUMERIC,
  total_amount NUMERIC NOT NULL,
  notes TEXT,
  payment_terms TEXT,
  stripe_payment_link TEXT,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  onedrive_file_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Invoice line items table
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  amount NUMERIC NOT NULL,
  item_type TEXT CHECK (item_type IN ('labor', 'parts', 'expense', 'other')),
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification log table
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_type TEXT,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  recipient_email TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivery_status TEXT CHECK (delivery_status IN ('sent', 'delivered', 'failed', 'bounced')),
  provider TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pending approvals table
CREATE TABLE pending_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  approval_type TEXT CHECK (approval_type IN ('receipt', 'part', 'database_update', 'catalog_import')),
  entity_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  priority INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by TEXT
);

-- Chat sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  active_boat_id UUID REFERENCES boats(id) ON DELETE SET NULL,
  active_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent memories table
CREATE TABLE agent_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memory_type TEXT CHECK (memory_type IN ('preference', 'fact', 'procedure', 'note')),
  entity_type TEXT CHECK (entity_type IN ('client', 'boat', 'equipment', 'general')),
  entity_id UUID,
  content TEXT NOT NULL,
  context TEXT,
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key for maintenance_records to work_sessions
ALTER TABLE maintenance_records
  ADD CONSTRAINT fk_work_session
  FOREIGN KEY (work_session_id)
  REFERENCES work_sessions(id)
  ON DELETE SET NULL;

-- Add foreign key for expenses to invoices
ALTER TABLE expenses
  ADD CONSTRAINT fk_invoice
  FOREIGN KEY (invoice_id)
  REFERENCES invoices(id)
  ON DELETE SET NULL;

-- Add foreign key for work_sessions to invoices
ALTER TABLE work_sessions
  ADD CONSTRAINT fk_invoice
  FOREIGN KEY (invoice_id)
  REFERENCES invoices(id)
  ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_boats_client_id ON boats(client_id);
CREATE INDEX idx_equipment_boat_id ON equipment(boat_id);
CREATE INDEX idx_equipment_parent_id ON equipment(parent_equipment_id);
CREATE INDEX idx_parts_equipment_id ON parts(equipment_id);
CREATE INDEX idx_expenses_boat_id ON expenses(boat_id);
CREATE INDEX idx_expenses_client_id ON expenses(client_id);
CREATE INDEX idx_work_sessions_boat_id ON work_sessions(boat_id);
CREATE INDEX idx_work_sessions_client_id ON work_sessions(client_id);
CREATE INDEX idx_work_items_boat_id ON work_items(boat_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_pending_approvals_status ON pending_approvals(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_boats_updated_at BEFORE UPDATE ON boats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parts_updated_at BEFORE UPDATE ON parts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
