import { z } from 'zod'

// Email validation - allow empty strings or null for optional fields
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .or(z.literal(''))
  .or(z.null())
  .optional()
  .transform(val => (val === '' || val === null ? null : val))

// Phone validation - more lenient, allow any reasonable phone format
export const phoneSchema = z
  .string()
  .min(1)
  .or(z.literal(''))
  .or(z.null())
  .optional()
  .transform(val => (val === '' || val === null ? null : val))

// Client validation
export const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: emailSchema,
  phone: phoneSchema,
  billing_address: z.any().optional().nullable(),
  hourly_rate: z.number().min(0, 'Hourly rate must be positive').default(0),
  payment_terms: z.string().default('Net 30'),
  tax_rate: z.number().min(0).max(1, 'Tax rate must be between 0 and 1').default(0),
  tax_jurisdiction: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

// Boat validation
export const boatSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  name: z.string().min(1, 'Boat name is required'),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  length: z.number().positive('Length must be positive').optional(),
  onedrive_folder_id: z.string().optional(),
  notes: z.string().optional(),
})

// Work session validation
export const workSessionSchema = z.object({
  boat_id: z.string().uuid('Invalid boat ID'),
  client_id: z.string().uuid('Invalid client ID'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  start_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Invalid time format'),
  end_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Invalid time format'),
  description: z.string().optional(),
  billable: z.boolean().default(true),
  hourly_rate: z.number().min(0).optional(),
})

// Work item validation
export const workItemSchema = z.object({
  boat_id: z.string().uuid('Invalid boat ID'),
  client_id: z.string().uuid('Invalid client ID'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'on_hold']).default('pending'),
  estimated_hours: z.number().positive().optional(),
  estimate_min_hours: z.number().positive().optional(),
  estimate_max_hours: z.number().positive().optional(),
  deadline: z.string().optional(),
})

// Expense validation
export const expenseSchema = z.object({
  boat_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
  expense_type: z.enum(['client_billable', 'business_expense']),
  vendor: z.string().min(1, 'Vendor is required'),
  amount: z.number().positive('Amount must be positive'),
  tax_amount: z.number().min(0).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  po_number: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
})

// Equipment validation
export const equipmentSchema = z.object({
  boat_id: z.string().uuid('Invalid boat ID'),
  parent_equipment_id: z.string().uuid().optional(),
  name: z.string().min(1, 'Equipment name is required'),
  category: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  installation_date: z.string().optional(),
  notes: z.string().optional(),
})

// Parts validation
export const partSchema = z.object({
  equipment_id: z.string().uuid('Invalid equipment ID'),
  part_name: z.string().min(1, 'Part name is required'),
  part_number: z.string().optional(),
  manufacturer: z.string().optional(),
  supplier: z.string().optional(),
  last_price: z.number().min(0).optional(),
  replacement_interval: z.string().optional(),
  notes: z.string().optional(),
})

// Invoice validation
export const invoiceSchema = z.object({
  invoice_number: z.string().min(1, 'Invoice number is required'),
  client_id: z.string().uuid('Invalid client ID'),
  boat_id: z.string().uuid().optional(),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
  subtotal: z.number().min(0, 'Subtotal must be non-negative'),
  tax_rate: z.number().min(0).max(1).optional(),
  tax_amount: z.number().min(0).optional(),
  total_amount: z.number().min(0, 'Total must be non-negative'),
  notes: z.string().optional(),
  payment_terms: z.string().optional(),
})

// Chat message validation
export const chatMessageSchema = z.object({
  session_id: z.string().uuid('Invalid session ID'),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, 'Message content is required'),
  active_boat_id: z.string().uuid().optional(),
  active_client_id: z.string().uuid().optional(),
  attachments: z.any().optional(),
})

/**
 * Calculate receipt confidence score based on PRD specification
 * This is a deterministic algorithm, not agent discretion
 */
export function calculateReceiptConfidence({
  has_clear_date,
  has_clear_amount,
  has_vendor_name,
  has_po_or_boat_name,
  has_line_items,
  has_handwritten_text,
  image_quality,
  has_ambiguity,
}: {
  has_clear_date: boolean
  has_clear_amount: boolean
  has_vendor_name: boolean
  has_po_or_boat_name: boolean
  has_line_items: boolean
  has_handwritten_text: boolean
  image_quality: 'excellent' | 'good' | 'fair' | 'poor'
  has_ambiguity: boolean
}): number {
  let confidence = 0

  // Additions per PRD
  if (has_clear_date) confidence += 0.25
  if (has_clear_amount) confidence += 0.25
  if (has_vendor_name) confidence += 0.15
  if (has_po_or_boat_name) confidence += 0.20
  if (has_line_items) confidence += 0.15

  // Deductions per PRD
  if (has_handwritten_text) confidence -= 0.20
  if (image_quality === 'poor') confidence -= 0.15
  else if (image_quality === 'fair') confidence -= 0.08
  if (has_ambiguity) confidence -= 0.25

  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, confidence))
}

/**
 * Validate if confidence score meets auto-approve threshold
 * Per PRD: Auto-approve threshold is ≥0.95
 */
export function shouldAutoApproveReceipt(confidenceScore: number): boolean {
  return confidenceScore >= 0.95
}
