// Auto-generated types for Yacht Management System
// Based on schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          billing_address: Json | null
          hourly_rate: number
          payment_terms: string
          tax_rate: number
          tax_jurisdiction: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          billing_address?: Json | null
          hourly_rate?: number
          payment_terms?: string
          tax_rate?: number
          tax_jurisdiction?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          billing_address?: Json | null
          hourly_rate?: number
          payment_terms?: string
          tax_rate?: number
          tax_jurisdiction?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      boats: {
        Row: {
          id: string
          client_id: string
          name: string
          make: string | null
          model: string | null
          year: number | null
          length: number | null
          onedrive_folder_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          make?: string | null
          model?: string | null
          year?: number | null
          length?: number | null
          onedrive_folder_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          make?: string | null
          model?: string | null
          year?: number | null
          length?: number | null
          onedrive_folder_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      equipment: {
        Row: {
          id: string
          boat_id: string
          parent_equipment_id: string | null
          name: string
          category: string | null
          manufacturer: string | null
          model: string | null
          serial_number: string | null
          installation_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          boat_id: string
          parent_equipment_id?: string | null
          name: string
          category?: string | null
          manufacturer?: string | null
          model?: string | null
          serial_number?: string | null
          installation_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          boat_id?: string
          parent_equipment_id?: string | null
          name?: string
          category?: string | null
          manufacturer?: string | null
          model?: string | null
          serial_number?: string | null
          installation_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      parts: {
        Row: {
          id: string
          equipment_id: string
          part_name: string
          part_number: string | null
          manufacturer: string | null
          supplier: string | null
          last_price: number | null
          replacement_interval: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          equipment_id: string
          part_name: string
          part_number?: string | null
          manufacturer?: string | null
          supplier?: string | null
          last_price?: number | null
          replacement_interval?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          equipment_id?: string
          part_name?: string
          part_number?: string | null
          manufacturer?: string | null
          supplier?: string | null
          last_price?: number | null
          replacement_interval?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pending_parts: {
        Row: {
          id: string
          equipment_id: string | null
          proposed_path: Json | null
          part_name: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_by: string | null
          created_at: string
          resolved_at: string | null
          resolution_notes: string | null
        }
        Insert: {
          id?: string
          equipment_id?: string | null
          proposed_path?: Json | null
          part_name?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_by?: string | null
          created_at?: string
          resolved_at?: string | null
          resolution_notes?: string | null
        }
        Update: {
          id?: string
          equipment_id?: string | null
          proposed_path?: Json | null
          part_name?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_by?: string | null
          created_at?: string
          resolved_at?: string | null
          resolution_notes?: string | null
        }
      }
      part_match_options: {
        Row: {
          id: string
          pending_part_id: string
          part_number: string | null
          description: string | null
          manufacturer: string | null
          supplier: string | null
          price: number | null
          confidence_score: number | null
          reasoning: string | null
          source_url: string | null
          rank: number | null
          specifications: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          pending_part_id: string
          part_number?: string | null
          description?: string | null
          manufacturer?: string | null
          supplier?: string | null
          price?: number | null
          confidence_score?: number | null
          reasoning?: string | null
          source_url?: string | null
          rank?: number | null
          specifications?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          pending_part_id?: string
          part_number?: string | null
          description?: string | null
          manufacturer?: string | null
          supplier?: string | null
          price?: number | null
          confidence_score?: number | null
          reasoning?: string | null
          source_url?: string | null
          rank?: number | null
          specifications?: Json | null
          created_at?: string
        }
      }
      equipment_manuals: {
        Row: {
          id: string
          equipment_id: string
          title: string | null
          onedrive_file_id: string | null
          onedrive_file_path: string | null
          file_url: string | null
          verified_by_user: boolean
          source: string | null
          created_at: string
        }
        Insert: {
          id?: string
          equipment_id: string
          title?: string | null
          onedrive_file_id?: string | null
          onedrive_file_path?: string | null
          file_url?: string | null
          verified_by_user?: boolean
          source?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          equipment_id?: string
          title?: string | null
          onedrive_file_id?: string | null
          onedrive_file_path?: string | null
          file_url?: string | null
          verified_by_user?: boolean
          source?: string | null
          created_at?: string
        }
      }
      maintenance_records: {
        Row: {
          id: string
          equipment_id: string
          work_session_id: string | null
          maintenance_type: 'routine' | 'repair' | 'inspection' | 'replacement' | null
          description: string | null
          parts_replaced: Json | null
          performed_date: string
          next_due_date: string | null
          hours_at_maintenance: number | null
          cost: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          equipment_id: string
          work_session_id?: string | null
          maintenance_type?: 'routine' | 'repair' | 'inspection' | 'replacement' | null
          description?: string | null
          parts_replaced?: Json | null
          performed_date: string
          next_due_date?: string | null
          hours_at_maintenance?: number | null
          cost?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          equipment_id?: string
          work_session_id?: string | null
          maintenance_type?: 'routine' | 'repair' | 'inspection' | 'replacement' | null
          description?: string | null
          parts_replaced?: Json | null
          performed_date?: string
          next_due_date?: string | null
          hours_at_maintenance?: number | null
          cost?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          boat_id: string | null
          client_id: string | null
          expense_type: 'client_billable' | 'business_expense' | null
          vendor: string | null
          amount: number
          tax_amount: number | null
          date: string
          po_number: string | null
          description: string | null
          category: string | null
          receipt_onedrive_id: string | null
          receipt_url: string | null
          confidence_score: number | null
          verification_status: 'pending' | 'verified' | 'rejected'
          ai_extracted_data: Json | null
          verified_at: string | null
          verification_notes: string | null
          billed_to_client: boolean
          invoice_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          boat_id?: string | null
          client_id?: string | null
          expense_type?: 'client_billable' | 'business_expense' | null
          vendor?: string | null
          amount: number
          tax_amount?: number | null
          date: string
          po_number?: string | null
          description?: string | null
          category?: string | null
          receipt_onedrive_id?: string | null
          receipt_url?: string | null
          confidence_score?: number | null
          verification_status?: 'pending' | 'verified' | 'rejected'
          ai_extracted_data?: Json | null
          verified_at?: string | null
          verification_notes?: string | null
          billed_to_client?: boolean
          invoice_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          boat_id?: string | null
          client_id?: string | null
          expense_type?: 'client_billable' | 'business_expense' | null
          vendor?: string | null
          amount?: number
          tax_amount?: number | null
          date?: string
          po_number?: string | null
          description?: string | null
          category?: string | null
          receipt_onedrive_id?: string | null
          receipt_url?: string | null
          confidence_score?: number | null
          verification_status?: 'pending' | 'verified' | 'rejected'
          ai_extracted_data?: Json | null
          verified_at?: string | null
          verification_notes?: string | null
          billed_to_client?: boolean
          invoice_id?: string | null
          created_at?: string
        }
      }
      work_sessions: {
        Row: {
          id: string
          boat_id: string
          client_id: string
          date: string
          start_time: string
          end_time: string
          duration_hours: number
          description: string | null
          billable: boolean
          hourly_rate: number | null
          billed_to_client: boolean
          invoice_id: string | null
          chat_message_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          boat_id: string
          client_id: string
          date: string
          start_time: string
          end_time: string
          description?: string | null
          billable?: boolean
          hourly_rate?: number | null
          billed_to_client?: boolean
          invoice_id?: string | null
          chat_message_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          boat_id?: string
          client_id?: string
          date?: string
          start_time?: string
          end_time?: string
          description?: string | null
          billable?: boolean
          hourly_rate?: number | null
          billed_to_client?: boolean
          invoice_id?: string | null
          chat_message_id?: string | null
          created_at?: string
        }
      }
      work_items: {
        Row: {
          id: string
          boat_id: string
          client_id: string
          title: string
          description: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'pending' | 'in_progress' | 'completed' | 'on_hold'
          estimated_hours: number | null
          estimate_min_hours: number | null
          estimate_max_hours: number | null
          actual_hours: number | null
          has_estimate: boolean
          estimate_amount: number | null
          deadline: string | null
          created_from_chat: boolean
          chat_message_id: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          boat_id: string
          client_id: string
          title: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed' | 'on_hold'
          estimated_hours?: number | null
          estimate_min_hours?: number | null
          estimate_max_hours?: number | null
          actual_hours?: number | null
          has_estimate?: boolean
          estimate_amount?: number | null
          deadline?: string | null
          created_from_chat?: boolean
          chat_message_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          boat_id?: string
          client_id?: string
          title?: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed' | 'on_hold'
          estimated_hours?: number | null
          estimate_min_hours?: number | null
          estimate_max_hours?: number | null
          actual_hours?: number | null
          has_estimate?: boolean
          estimate_amount?: number | null
          deadline?: string | null
          created_from_chat?: boolean
          chat_message_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      work_item_conflicts: {
        Row: {
          id: string
          work_item_id: string
          conflicting_item_id: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          work_item_id: string
          conflicting_item_id: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          work_item_id?: string
          conflicting_item_id?: string
          reason?: string | null
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          client_id: string
          boat_id: string | null
          issue_date: string
          due_date: string
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          subtotal: number
          tax_rate: number | null
          tax_amount: number | null
          total_amount: number
          notes: string | null
          payment_terms: string | null
          stripe_payment_link: string | null
          stripe_payment_intent_id: string | null
          paid_at: string | null
          onedrive_file_id: string | null
          created_at: string
          sent_at: string | null
        }
        Insert: {
          id?: string
          invoice_number: string
          client_id: string
          boat_id?: string | null
          issue_date: string
          due_date: string
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          subtotal: number
          tax_rate?: number | null
          tax_amount?: number | null
          total_amount: number
          notes?: string | null
          payment_terms?: string | null
          stripe_payment_link?: string | null
          stripe_payment_intent_id?: string | null
          paid_at?: string | null
          onedrive_file_id?: string | null
          created_at?: string
          sent_at?: string | null
        }
        Update: {
          id?: string
          invoice_number?: string
          client_id?: string
          boat_id?: string | null
          issue_date?: string
          due_date?: string
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          subtotal?: number
          tax_rate?: number | null
          tax_amount?: number | null
          total_amount?: number
          notes?: string | null
          payment_terms?: string | null
          stripe_payment_link?: string | null
          stripe_payment_intent_id?: string | null
          paid_at?: string | null
          onedrive_file_id?: string | null
          created_at?: string
          sent_at?: string | null
        }
      }
      invoice_line_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          amount: number
          item_type: 'labor' | 'parts' | 'expense' | 'other' | null
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity?: number
          unit_price: number
          amount: number
          item_type?: 'labor' | 'parts' | 'expense' | 'other' | null
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          amount?: number
          item_type?: 'labor' | 'parts' | 'expense' | 'other' | null
          reference_id?: string | null
          created_at?: string
        }
      }
      notification_log: {
        Row: {
          id: string
          notification_type: string | null
          invoice_id: string | null
          recipient_email: string | null
          sent_at: string | null
          delivery_status: 'sent' | 'delivered' | 'failed' | 'bounced' | null
          provider: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          notification_type?: string | null
          invoice_id?: string | null
          recipient_email?: string | null
          sent_at?: string | null
          delivery_status?: 'sent' | 'delivered' | 'failed' | 'bounced' | null
          provider?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          notification_type?: string | null
          invoice_id?: string | null
          recipient_email?: string | null
          sent_at?: string | null
          delivery_status?: 'sent' | 'delivered' | 'failed' | 'bounced' | null
          provider?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      pending_approvals: {
        Row: {
          id: string
          approval_type: 'receipt' | 'part' | 'database_update' | 'catalog_import' | null
          entity_id: string | null
          status: 'pending' | 'approved' | 'rejected' | 'expired'
          priority: number | null
          created_at: string
          expires_at: string | null
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          id?: string
          approval_type?: 'receipt' | 'part' | 'database_update' | 'catalog_import' | null
          entity_id?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'expired'
          priority?: number | null
          created_at?: string
          expires_at?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          id?: string
          approval_type?: 'receipt' | 'part' | 'database_update' | 'catalog_import' | null
          entity_id?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'expired'
          priority?: number | null
          created_at?: string
          expires_at?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          title: string | null
          created_at: string
          last_message_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          created_at?: string
          last_message_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          created_at?: string
          last_message_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          user_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          active_boat_id: string | null
          active_client_id: string | null
          attachments: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          active_boat_id?: string | null
          active_client_id?: string | null
          attachments?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          active_boat_id?: string | null
          active_client_id?: string | null
          attachments?: Json | null
          created_at?: string
        }
      }
      agent_memories: {
        Row: {
          id: string
          memory_type: 'preference' | 'fact' | 'procedure' | 'note' | null
          entity_type: 'client' | 'boat' | 'equipment' | 'general' | null
          entity_id: string | null
          content: string
          context: string | null
          confidence: number | null
          last_used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          memory_type?: 'preference' | 'fact' | 'procedure' | 'note' | null
          entity_type?: 'client' | 'boat' | 'equipment' | 'general' | null
          entity_id?: string | null
          content: string
          context?: string | null
          confidence?: number | null
          last_used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          memory_type?: 'preference' | 'fact' | 'procedure' | 'note' | null
          entity_type?: 'client' | 'boat' | 'equipment' | 'general' | null
          entity_id?: string | null
          content?: string
          context?: string | null
          confidence?: number | null
          last_used_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
