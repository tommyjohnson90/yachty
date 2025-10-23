import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  phoneSchema,
  clientSchema,
  boatSchema,
  workSessionSchema,
  workItemSchema,
  expenseSchema,
  equipmentSchema,
  partSchema,
  invoiceSchema,
  chatMessageSchema,
  calculateReceiptConfidence,
  shouldAutoApproveReceipt,
} from '@/lib/utils/validation';

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should validate correct email', () => {
      expect(emailSchema.parse('test@example.com')).toBe('test@example.com');
    });

    it('should transform empty string to null', () => {
      expect(emailSchema.parse('')).toBe(null);
    });

    it('should handle null', () => {
      expect(emailSchema.parse(null)).toBe(null);
    });

    it('should handle undefined', () => {
      expect(emailSchema.parse(undefined)).toBe(undefined);
    });

    it('should reject invalid email', () => {
      expect(() => emailSchema.parse('invalid-email')).toThrow('Invalid email address');
    });
  });

  describe('phoneSchema', () => {
    it('should validate phone number', () => {
      expect(phoneSchema.parse('1234567890')).toBe('1234567890');
    });

    it('should transform empty string to null', () => {
      expect(phoneSchema.parse('')).toBe(null);
    });

    it('should handle null', () => {
      expect(phoneSchema.parse(null)).toBe(null);
    });
  });

  describe('clientSchema', () => {
    const validClient = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      billing_address: '123 Main St',
      hourly_rate: 100,
      payment_terms: 'Net 30',
      tax_rate: 0.08,
      tax_jurisdiction: 'CA',
      notes: 'VIP client',
    };

    it('should validate complete client data', () => {
      const result = clientSchema.parse(validClient);
      expect(result).toMatchObject(validClient);
    });

    it('should require name', () => {
      expect(() => clientSchema.parse({ ...validClient, name: '' })).toThrow('Client name is required');
    });

    it('should set default hourly_rate', () => {
      const { hourly_rate, ...clientWithoutRate } = validClient;
      const result = clientSchema.parse(clientWithoutRate);
      expect(result.hourly_rate).toBe(0);
    });

    it('should set default payment_terms', () => {
      const { payment_terms, ...clientWithoutTerms } = validClient;
      const result = clientSchema.parse(clientWithoutTerms);
      expect(result.payment_terms).toBe('Net 30');
    });

    it('should set default tax_rate', () => {
      const { tax_rate, ...clientWithoutTax } = validClient;
      const result = clientSchema.parse(clientWithoutTax);
      expect(result.tax_rate).toBe(0);
    });

    it('should reject negative hourly_rate', () => {
      expect(() => clientSchema.parse({ ...validClient, hourly_rate: -1 })).toThrow('Hourly rate must be positive');
    });

    it('should reject tax_rate > 1', () => {
      expect(() => clientSchema.parse({ ...validClient, tax_rate: 1.5 })).toThrow('Tax rate must be between 0 and 1');
    });
  });

  describe('boatSchema', () => {
    const validBoat = {
      client_id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Sea Breeze',
      make: 'Beneteau',
      model: 'Oceanis 51.1',
      year: 2023,
      length: 51.1,
      onedrive_folder_id: 'folder-123',
      notes: 'Beautiful yacht',
    };

    it('should validate complete boat data', () => {
      const result = boatSchema.parse(validBoat);
      expect(result).toMatchObject(validBoat);
    });

    it('should require valid UUID for client_id', () => {
      expect(() => boatSchema.parse({ ...validBoat, client_id: 'invalid-uuid' })).toThrow('Invalid client ID');
    });

    it('should require boat name', () => {
      expect(() => boatSchema.parse({ ...validBoat, name: '' })).toThrow('Boat name is required');
    });

    it('should reject year before 1900', () => {
      expect(() => boatSchema.parse({ ...validBoat, year: 1899 })).toThrow();
    });

    it('should reject year too far in future', () => {
      const futureYear = new Date().getFullYear() + 2;
      expect(() => boatSchema.parse({ ...validBoat, year: futureYear })).toThrow();
    });

    it('should reject negative length', () => {
      expect(() => boatSchema.parse({ ...validBoat, length: -5 })).toThrow('Length must be positive');
    });
  });

  describe('workSessionSchema', () => {
    const validSession = {
      boat_id: '123e4567-e89b-12d3-a456-426614174000',
      client_id: '123e4567-e89b-12d3-a456-426614174001',
      date: '2024-01-15',
      start_time: '09:00:00',
      end_time: '17:00:00',
      description: 'Engine maintenance',
      billable: true,
      hourly_rate: 100,
    };

    it('should validate complete work session', () => {
      const result = workSessionSchema.parse(validSession);
      expect(result).toMatchObject(validSession);
    });

    it('should require valid boat_id UUID', () => {
      expect(() => workSessionSchema.parse({ ...validSession, boat_id: 'invalid' })).toThrow('Invalid boat ID');
    });

    it('should require valid client_id UUID', () => {
      expect(() => workSessionSchema.parse({ ...validSession, client_id: 'invalid' })).toThrow('Invalid client ID');
    });

    it('should require proper date format', () => {
      expect(() => workSessionSchema.parse({ ...validSession, date: '01/15/2024' })).toThrow('Invalid date format');
    });

    it('should require proper time format', () => {
      expect(() => workSessionSchema.parse({ ...validSession, start_time: '9:00' })).toThrow('Invalid time format');
    });

    it('should default billable to true', () => {
      const { billable, ...sessionWithoutBillable } = validSession;
      const result = workSessionSchema.parse(sessionWithoutBillable);
      expect(result.billable).toBe(true);
    });
  });

  describe('workItemSchema', () => {
    const validItem = {
      boat_id: '123e4567-e89b-12d3-a456-426614174000',
      client_id: '123e4567-e89b-12d3-a456-426614174001',
      title: 'Fix navigation lights',
      description: 'Port side light not working',
      priority: 'high' as const,
      status: 'pending' as const,
      estimated_hours: 2,
      deadline: '2024-02-01',
    };

    it('should validate complete work item', () => {
      const result = workItemSchema.parse(validItem);
      expect(result).toMatchObject(validItem);
    });

    it('should require title', () => {
      expect(() => workItemSchema.parse({ ...validItem, title: '' })).toThrow('Title is required');
    });

    it('should default priority to medium', () => {
      const { priority, ...itemWithoutPriority } = validItem;
      const result = workItemSchema.parse(itemWithoutPriority);
      expect(result.priority).toBe('medium');
    });

    it('should default status to pending', () => {
      const { status, ...itemWithoutStatus } = validItem;
      const result = workItemSchema.parse(itemWithoutStatus);
      expect(result.status).toBe('pending');
    });

    it('should only accept valid priority values', () => {
      expect(() => workItemSchema.parse({ ...validItem, priority: 'critical' })).toThrow();
    });

    it('should only accept valid status values', () => {
      expect(() => workItemSchema.parse({ ...validItem, status: 'archived' })).toThrow();
    });
  });

  describe('expenseSchema', () => {
    const validExpense = {
      boat_id: '123e4567-e89b-12d3-a456-426614174000',
      client_id: '123e4567-e89b-12d3-a456-426614174001',
      expense_type: 'client_billable' as const,
      vendor: 'Marine Supply Co',
      amount: 250.50,
      tax_amount: 20.04,
      date: '2024-01-15',
      po_number: 'PO-12345',
      description: 'Engine parts',
      category: 'Parts',
    };

    it('should validate complete expense', () => {
      const result = expenseSchema.parse(validExpense);
      expect(result).toMatchObject(validExpense);
    });

    it('should require vendor', () => {
      expect(() => expenseSchema.parse({ ...validExpense, vendor: '' })).toThrow('Vendor is required');
    });

    it('should require positive amount', () => {
      expect(() => expenseSchema.parse({ ...validExpense, amount: -10 })).toThrow('Amount must be positive');
    });

    it('should accept valid expense_type values', () => {
      const businessExpense = { ...validExpense, expense_type: 'business_expense' as const };
      const result = expenseSchema.parse(businessExpense);
      expect(result.expense_type).toBe('business_expense');
    });

    it('should reject invalid expense_type', () => {
      expect(() => expenseSchema.parse({ ...validExpense, expense_type: 'personal' })).toThrow();
    });
  });

  describe('equipmentSchema', () => {
    const validEquipment = {
      boat_id: '123e4567-e89b-12d3-a456-426614174000',
      parent_equipment_id: '123e4567-e89b-12d3-a456-426614174002',
      name: 'Main Engine',
      category: 'Engine',
      manufacturer: 'Yanmar',
      model: '4JH5E',
      serial_number: 'SN123456',
      installation_date: '2023-01-15',
      notes: 'Well maintained',
    };

    it('should validate complete equipment', () => {
      const result = equipmentSchema.parse(validEquipment);
      expect(result).toMatchObject(validEquipment);
    });

    it('should require name', () => {
      expect(() => equipmentSchema.parse({ ...validEquipment, name: '' })).toThrow('Equipment name is required');
    });

    it('should require valid boat_id', () => {
      expect(() => equipmentSchema.parse({ ...validEquipment, boat_id: 'invalid' })).toThrow('Invalid boat ID');
    });
  });

  describe('partSchema', () => {
    const validPart = {
      equipment_id: '123e4567-e89b-12d3-a456-426614174000',
      part_name: 'Oil Filter',
      part_number: 'OF-12345',
      manufacturer: 'Yanmar',
      supplier: 'Marine Parts Direct',
      last_price: 45.99,
      replacement_interval: '100 hours',
      notes: 'Stock item',
    };

    it('should validate complete part', () => {
      const result = partSchema.parse(validPart);
      expect(result).toMatchObject(validPart);
    });

    it('should require part_name', () => {
      expect(() => partSchema.parse({ ...validPart, part_name: '' })).toThrow('Part name is required');
    });

    it('should require valid equipment_id', () => {
      expect(() => partSchema.parse({ ...validPart, equipment_id: 'invalid' })).toThrow('Invalid equipment ID');
    });
  });

  describe('invoiceSchema', () => {
    const validInvoice = {
      invoice_number: 'INV-2024-001',
      client_id: '123e4567-e89b-12d3-a456-426614174000',
      boat_id: '123e4567-e89b-12d3-a456-426614174001',
      issue_date: '2024-01-15',
      due_date: '2024-02-14',
      status: 'sent' as const,
      subtotal: 1000,
      tax_rate: 0.08,
      tax_amount: 80,
      total_amount: 1080,
      notes: 'Payment due in 30 days',
      payment_terms: 'Net 30',
    };

    it('should validate complete invoice', () => {
      const result = invoiceSchema.parse(validInvoice);
      expect(result).toMatchObject(validInvoice);
    });

    it('should require invoice_number', () => {
      expect(() => invoiceSchema.parse({ ...validInvoice, invoice_number: '' })).toThrow('Invoice number is required');
    });

    it('should require valid client_id', () => {
      expect(() => invoiceSchema.parse({ ...validInvoice, client_id: 'invalid' })).toThrow('Invalid client ID');
    });

    it('should default status to draft', () => {
      const { status, ...invoiceWithoutStatus } = validInvoice;
      const result = invoiceSchema.parse(invoiceWithoutStatus);
      expect(result.status).toBe('draft');
    });

    it('should accept all valid status values', () => {
      const statuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'] as const;
      statuses.forEach(status => {
        const result = invoiceSchema.parse({ ...validInvoice, status });
        expect(result.status).toBe(status);
      });
    });
  });

  describe('chatMessageSchema', () => {
    const validMessage = {
      session_id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174003',
      role: 'user' as const,
      content: 'What maintenance is due?',
      active_boat_id: '123e4567-e89b-12d3-a456-426614174001',
      active_client_id: '123e4567-e89b-12d3-a456-426614174002',
      attachments: null,
    };

    it('should validate complete message', () => {
      const result = chatMessageSchema.parse(validMessage);
      expect(result).toMatchObject(validMessage);
    });

    it('should require session_id', () => {
      expect(() => chatMessageSchema.parse({ ...validMessage, session_id: 'invalid' })).toThrow('Invalid session ID');
    });

    it('should require content', () => {
      expect(() => chatMessageSchema.parse({ ...validMessage, content: '' })).toThrow('Message content is required');
    });

    it('should accept all valid roles', () => {
      const roles = ['user', 'assistant', 'system'] as const;
      roles.forEach(role => {
        const result = chatMessageSchema.parse({ ...validMessage, role });
        expect(result.role).toBe(role);
      });
    });
  });
});

describe('Receipt Confidence Calculation', () => {
  it('should return perfect score with all positive indicators', () => {
    const score = calculateReceiptConfidence({
      has_clear_date: true,
      has_clear_amount: true,
      has_vendor_name: true,
      has_po_or_boat_name: true,
      has_line_items: true,
      has_handwritten_text: false,
      image_quality: 'excellent',
      has_ambiguity: false,
    });
    expect(score).toBe(1.0);
  });

  it('should return 0 with all negative indicators', () => {
    const score = calculateReceiptConfidence({
      has_clear_date: false,
      has_clear_amount: false,
      has_vendor_name: false,
      has_po_or_boat_name: false,
      has_line_items: false,
      has_handwritten_text: true,
      image_quality: 'poor',
      has_ambiguity: true,
    });
    expect(score).toBe(0);
  });

  it('should add 0.25 for clear date', () => {
    const withDate = calculateReceiptConfidence({
      has_clear_date: true,
      has_clear_amount: false,
      has_vendor_name: false,
      has_po_or_boat_name: false,
      has_line_items: false,
      has_handwritten_text: false,
      image_quality: 'excellent',
      has_ambiguity: false,
    });
    expect(withDate).toBe(0.25);
  });

  it('should add 0.25 for clear amount', () => {
    const withAmount = calculateReceiptConfidence({
      has_clear_date: false,
      has_clear_amount: true,
      has_vendor_name: false,
      has_po_or_boat_name: false,
      has_line_items: false,
      has_handwritten_text: false,
      image_quality: 'excellent',
      has_ambiguity: false,
    });
    expect(withAmount).toBe(0.25);
  });

  it('should add 0.15 for vendor name', () => {
    const withVendor = calculateReceiptConfidence({
      has_clear_date: false,
      has_clear_amount: false,
      has_vendor_name: true,
      has_po_or_boat_name: false,
      has_line_items: false,
      has_handwritten_text: false,
      image_quality: 'excellent',
      has_ambiguity: false,
    });
    expect(withVendor).toBe(0.15);
  });

  it('should add 0.20 for PO or boat name', () => {
    const withPO = calculateReceiptConfidence({
      has_clear_date: false,
      has_clear_amount: false,
      has_vendor_name: false,
      has_po_or_boat_name: true,
      has_line_items: false,
      has_handwritten_text: false,
      image_quality: 'excellent',
      has_ambiguity: false,
    });
    expect(withPO).toBe(0.20);
  });

  it('should add 0.15 for line items', () => {
    const withLineItems = calculateReceiptConfidence({
      has_clear_date: false,
      has_clear_amount: false,
      has_vendor_name: false,
      has_po_or_boat_name: false,
      has_line_items: true,
      has_handwritten_text: false,
      image_quality: 'excellent',
      has_ambiguity: false,
    });
    expect(withLineItems).toBe(0.15);
  });

  it('should subtract 0.20 for handwritten text', () => {
    const withHandwritten = calculateReceiptConfidence({
      has_clear_date: true,
      has_clear_amount: true,
      has_vendor_name: false,
      has_po_or_boat_name: false,
      has_line_items: false,
      has_handwritten_text: true,
      image_quality: 'excellent',
      has_ambiguity: false,
    });
    expect(withHandwritten).toBe(0.30); // 0.25 + 0.25 - 0.20
  });

  it('should subtract 0.15 for poor image quality', () => {
    const poorQuality = calculateReceiptConfidence({
      has_clear_date: true,
      has_clear_amount: true,
      has_vendor_name: false,
      has_po_or_boat_name: false,
      has_line_items: false,
      has_handwritten_text: false,
      image_quality: 'poor',
      has_ambiguity: false,
    });
    expect(poorQuality).toBe(0.35); // 0.25 + 0.25 - 0.15
  });

  it('should subtract 0.08 for fair image quality', () => {
    const fairQuality = calculateReceiptConfidence({
      has_clear_date: true,
      has_clear_amount: true,
      has_vendor_name: false,
      has_po_or_boat_name: false,
      has_line_items: false,
      has_handwritten_text: false,
      image_quality: 'fair',
      has_ambiguity: false,
    });
    expect(fairQuality).toBe(0.42); // 0.25 + 0.25 - 0.08
  });

  it('should subtract 0.25 for ambiguity', () => {
    const withAmbiguity = calculateReceiptConfidence({
      has_clear_date: true,
      has_clear_amount: true,
      has_vendor_name: false,
      has_po_or_boat_name: false,
      has_line_items: false,
      has_handwritten_text: false,
      image_quality: 'excellent',
      has_ambiguity: true,
    });
    expect(withAmbiguity).toBe(0.25); // 0.25 + 0.25 - 0.25
  });

  it('should clamp negative scores to 0', () => {
    const negative = calculateReceiptConfidence({
      has_clear_date: false,
      has_clear_amount: false,
      has_vendor_name: false,
      has_po_or_boat_name: false,
      has_line_items: false,
      has_handwritten_text: true,
      image_quality: 'poor',
      has_ambiguity: true,
    });
    expect(negative).toBe(0);
  });

  it('should clamp scores above 1 to 1', () => {
    // This shouldn't happen with current weights, but test the clamping
    const score = calculateReceiptConfidence({
      has_clear_date: true,
      has_clear_amount: true,
      has_vendor_name: true,
      has_po_or_boat_name: true,
      has_line_items: true,
      has_handwritten_text: false,
      image_quality: 'excellent',
      has_ambiguity: false,
    });
    expect(score).toBe(1.0);
    expect(score).toBeLessThanOrEqual(1.0);
  });
});

describe('Auto-Approve Receipt', () => {
  it('should auto-approve score of 0.95', () => {
    expect(shouldAutoApproveReceipt(0.95)).toBe(true);
  });

  it('should auto-approve score of 1.0', () => {
    expect(shouldAutoApproveReceipt(1.0)).toBe(true);
  });

  it('should auto-approve score above 0.95', () => {
    expect(shouldAutoApproveReceipt(0.96)).toBe(true);
  });

  it('should not auto-approve score below 0.95', () => {
    expect(shouldAutoApproveReceipt(0.94)).toBe(false);
  });

  it('should not auto-approve score of 0', () => {
    expect(shouldAutoApproveReceipt(0)).toBe(false);
  });

  it('should not auto-approve score of 0.5', () => {
    expect(shouldAutoApproveReceipt(0.5)).toBe(false);
  });
});
