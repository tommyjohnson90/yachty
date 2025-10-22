// Application constants

// Invoice status colors
export const INVOICE_STATUS_COLORS = {
  draft: 'gray',
  sent: 'blue',
  paid: 'green',
  overdue: 'red',
  cancelled: 'gray',
} as const

// Work item priority colors
export const PRIORITY_COLORS = {
  low: 'gray',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
} as const

// Work item status colors
export const STATUS_COLORS = {
  pending: 'gray',
  in_progress: 'blue',
  completed: 'green',
  on_hold: 'yellow',
} as const

// Confidence score thresholds per PRD
export const CONFIDENCE_THRESHOLDS = {
  AUTO_APPROVE: 0.95, // ≥0.95 = auto-approve
  NEEDS_REVIEW: 0.95, // <0.95 = manual review
} as const

// Default values
export const DEFAULTS = {
  PAYMENT_TERMS: 'Net 30',
  HOURLY_RATE: 0,
  TAX_RATE: 0,
  WORK_PRIORITY: 'medium',
  WORK_STATUS: 'pending',
} as const

// File size limits
export const FILE_LIMITS = {
  RECEIPT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MANUAL_MAX_SIZE: 50 * 1024 * 1024, // 50MB
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
} as const

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  RECEIPTS: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  MANUALS: ['application/pdf'],
  IMAGES: ['image/jpeg', 'image/png', 'image/webp'],
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

// Time ranges
export const TIME_RANGES = {
  TODAY: 'today',
  THIS_WEEK: 'this_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_YEAR: 'this_year',
  CUSTOM: 'custom',
} as const

// Maintenance types
export const MAINTENANCE_TYPES = {
  ROUTINE: 'routine',
  REPAIR: 'repair',
  INSPECTION: 'inspection',
  REPLACEMENT: 'replacement',
} as const

// Expense categories
export const EXPENSE_CATEGORIES = [
  'parts',
  'fuel',
  'supplies',
  'services',
  'dockage',
  'insurance',
  'registration',
  'other',
] as const

// Equipment categories
export const EQUIPMENT_CATEGORIES = [
  'Engine',
  'Electronics',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Safety',
  'Navigation',
  'Communication',
  'Rigging',
  'Other',
] as const

// Invoice generation
export const INVOICE = {
  NUMBER_PREFIX: 'INV-',
  NUMBER_LENGTH: 6,
  DEFAULT_DUE_DAYS: 30,
} as const

// Chat settings
export const CHAT = {
  MAX_MESSAGE_LENGTH: 4000,
  MAX_HISTORY_MESSAGES: 30,
  TYPING_INDICATOR_DELAY: 500,
} as const

// Mobile breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const

// PWA settings
export const PWA = {
  NAME: 'Yacht Management',
  SHORT_NAME: 'YachtMgmt',
  DESCRIPTION: 'Manage yacht maintenance, clients, and invoicing',
  THEME_COLOR: '#2563eb',
  BACKGROUND_COLOR: '#ffffff',
} as const
