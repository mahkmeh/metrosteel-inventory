export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      batch_inventory: {
        Row: {
          available_kg: number | null
          batch_id: string
          created_at: string
          id: string
          last_updated: string
          location_id: string
          quantity_kg: number
          reserved_kg: number
          total_value: number | null
          unit_cost_per_kg: number | null
        }
        Insert: {
          available_kg?: number | null
          batch_id: string
          created_at?: string
          id?: string
          last_updated?: string
          location_id: string
          quantity_kg?: number
          reserved_kg?: number
          total_value?: number | null
          unit_cost_per_kg?: number | null
        }
        Update: {
          available_kg?: number | null
          batch_id?: string
          created_at?: string
          id?: string
          last_updated?: string
          location_id?: string
          quantity_kg?: number
          reserved_kg?: number
          total_value?: number | null
          unit_cost_per_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_inventory_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_inventory_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          available_weight_kg: number
          batch_code: string
          compliance_status: string | null
          created_at: string
          expiry_date: string | null
          heat_number: string | null
          id: string
          make: string | null
          manufactured_date: string | null
          notes: string | null
          purchase_order_id: string | null
          quality_grade: string
          received_date: string | null
          reserved_weight_kg: number
          sku_id: string
          status: string
          supplier_id: string | null
          total_weight_kg: number
          updated_at: string
        }
        Insert: {
          available_weight_kg?: number
          batch_code: string
          compliance_status?: string | null
          created_at?: string
          expiry_date?: string | null
          heat_number?: string | null
          id?: string
          make?: string | null
          manufactured_date?: string | null
          notes?: string | null
          purchase_order_id?: string | null
          quality_grade?: string
          received_date?: string | null
          reserved_weight_kg?: number
          sku_id: string
          status?: string
          supplier_id?: string | null
          total_weight_kg?: number
          updated_at?: string
        }
        Update: {
          available_weight_kg?: number
          batch_code?: string
          compliance_status?: string | null
          created_at?: string
          expiry_date?: string | null
          heat_number?: string | null
          id?: string
          make?: string | null
          manufactured_date?: string | null
          notes?: string | null
          purchase_order_id?: string | null
          quality_grade?: string
          received_date?: string | null
          reserved_weight_kg?: number
          sku_id?: string
          status?: string
          supplier_id?: string | null
          total_weight_kg?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "material_valuation_summary"
            referencedColumns: ["material_id"]
          },
          {
            foreignKeyName: "batches_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          credit_days: number | null
          credit_limit: number | null
          email: string | null
          gst_number: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          credit_days?: number | null
          credit_limit?: number | null
          email?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          credit_days?: number | null
          credit_limit?: number | null
          email?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          available_quantity: number | null
          created_at: string
          id: string
          last_updated: string
          location_id: string
          material_id: string
          quality_grade: string
          quantity: number
          reserved_quantity: number
          total_value: number | null
          unit_cost: number | null
        }
        Insert: {
          available_quantity?: number | null
          created_at?: string
          id?: string
          last_updated?: string
          location_id: string
          material_id: string
          quality_grade?: string
          quantity?: number
          reserved_quantity?: number
          total_value?: number | null
          unit_cost?: number | null
        }
        Update: {
          available_quantity?: number | null
          created_at?: string
          id?: string
          last_updated?: string
          location_id?: string
          material_id?: string
          quality_grade?: string
          quantity?: number
          reserved_quantity?: number
          total_value?: number | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "material_valuation_summary"
            referencedColumns: ["material_id"]
          },
          {
            foreignKeyName: "inventory_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      job_work_transformations: {
        Row: {
          actual_output_weight_kg: number | null
          actual_return_date: string | null
          contractor_id: string
          created_at: string
          expected_output_weight_kg: number
          expected_return_date: string | null
          id: string
          input_batch_id: string
          input_sku_id: string
          input_weight_kg: number
          job_work_number: string
          output_batch_id: string | null
          output_sku_id: string
          process_description: string | null
          process_type: string
          processing_cost_per_kg: number | null
          sent_date: string
          status: string
          total_processing_cost: number | null
          updated_at: string
        }
        Insert: {
          actual_output_weight_kg?: number | null
          actual_return_date?: string | null
          contractor_id: string
          created_at?: string
          expected_output_weight_kg: number
          expected_return_date?: string | null
          id?: string
          input_batch_id: string
          input_sku_id: string
          input_weight_kg: number
          job_work_number: string
          output_batch_id?: string | null
          output_sku_id: string
          process_description?: string | null
          process_type: string
          processing_cost_per_kg?: number | null
          sent_date: string
          status?: string
          total_processing_cost?: number | null
          updated_at?: string
        }
        Update: {
          actual_output_weight_kg?: number | null
          actual_return_date?: string | null
          contractor_id?: string
          created_at?: string
          expected_output_weight_kg?: number
          expected_return_date?: string | null
          id?: string
          input_batch_id?: string
          input_sku_id?: string
          input_weight_kg?: number
          job_work_number?: string
          output_batch_id?: string | null
          output_sku_id?: string
          process_description?: string | null
          process_type?: string
          processing_cost_per_kg?: number | null
          sent_date?: string
          status?: string
          total_processing_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_work_transformations_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_work_transformations_input_batch_id_fkey"
            columns: ["input_batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_work_transformations_input_sku_id_fkey"
            columns: ["input_sku_id"]
            isOneToOne: false
            referencedRelation: "material_valuation_summary"
            referencedColumns: ["material_id"]
          },
          {
            foreignKeyName: "job_work_transformations_input_sku_id_fkey"
            columns: ["input_sku_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_work_transformations_output_batch_id_fkey"
            columns: ["output_batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_work_transformations_output_sku_id_fkey"
            columns: ["output_sku_id"]
            isOneToOne: false
            referencedRelation: "material_valuation_summary"
            referencedColumns: ["material_id"]
          },
          {
            foreignKeyName: "job_work_transformations_output_sku_id_fkey"
            columns: ["output_sku_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          bar_shape: string | null
          base_price: number | null
          batch_no: string | null
          batch_weight: number | null
          category: string
          created_at: string
          description: string | null
          diameter: number | null
          finish: string | null
          grade: string
          heat_number: string | null
          id: string
          is_active: boolean
          length: number | null
          make: string | null
          name: string
          no_of_sheets: number | null
          pipe_type: string | null
          size_description: string | null
          sku: string
          thickness: number | null
          unit: string
          updated_at: string
          width: number | null
        }
        Insert: {
          bar_shape?: string | null
          base_price?: number | null
          batch_no?: string | null
          batch_weight?: number | null
          category: string
          created_at?: string
          description?: string | null
          diameter?: number | null
          finish?: string | null
          grade: string
          heat_number?: string | null
          id?: string
          is_active?: boolean
          length?: number | null
          make?: string | null
          name: string
          no_of_sheets?: number | null
          pipe_type?: string | null
          size_description?: string | null
          sku: string
          thickness?: number | null
          unit?: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          bar_shape?: string | null
          base_price?: number | null
          batch_no?: string | null
          batch_weight?: number | null
          category?: string
          created_at?: string
          description?: string | null
          diameter?: number | null
          finish?: string | null
          grade?: string
          heat_number?: string | null
          id?: string
          is_active?: boolean
          length?: number | null
          make?: string | null
          name?: string
          no_of_sheets?: number | null
          pipe_type?: string | null
          size_description?: string | null
          sku?: string
          thickness?: number | null
          unit?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: []
      }
      payables: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          original_amount: number
          outstanding_amount: number
          paid_amount: number
          purchase_invoice_id: string
          status: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          original_amount?: number
          outstanding_amount?: number
          paid_amount?: number
          purchase_invoice_id: string
          status?: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          original_amount?: number
          outstanding_amount?: number
          paid_amount?: number
          purchase_invoice_id?: string
          status?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payables_invoice"
            columns: ["purchase_invoice_id"]
            isOneToOne: false
            referencedRelation: "purchase_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_payables_supplier"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_invoices: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          purchase_order_id: string
          received_date: string | null
          status: string
          subtotal_amount: number
          supplier_id: string
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          notes?: string | null
          purchase_order_id: string
          received_date?: string | null
          status?: string
          subtotal_amount?: number
          supplier_id: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          purchase_order_id?: string
          received_date?: string | null
          status?: string
          subtotal_amount?: number
          supplier_id?: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_purchase_invoices_purchase_order"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_purchase_invoices_supplier"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          batch_id: string | null
          created_at: string
          id: string
          line_total: number
          linked_sales_order_id: string | null
          material_id: string
          notes: string | null
          order_type: string
          purchase_order_id: string
          quantity: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          batch_id?: string | null
          created_at?: string
          id?: string
          line_total?: number
          linked_sales_order_id?: string | null
          material_id: string
          notes?: string | null
          order_type?: string
          purchase_order_id: string
          quantity?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          batch_id?: string | null
          created_at?: string
          id?: string
          line_total?: number
          linked_sales_order_id?: string | null
          material_id?: string
          notes?: string | null
          order_type?: string
          purchase_order_id?: string
          quantity?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_purchase_order_items_batch_id"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          expected_delivery: string | null
          id: string
          notes: string | null
          order_date: string
          po_number: string
          status: string
          supplier_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number: string
          status?: string
          supplier_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number?: string
          status?: string
          supplier_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_return_items: {
        Row: {
          batch_id: string | null
          created_at: string
          id: string
          line_total: number
          material_id: string
          notes: string | null
          purchase_return_id: string
          quantity_returned: number
          return_reason: string | null
          unit_price: number
        }
        Insert: {
          batch_id?: string | null
          created_at?: string
          id?: string
          line_total?: number
          material_id: string
          notes?: string | null
          purchase_return_id: string
          quantity_returned?: number
          return_reason?: string | null
          unit_price?: number
        }
        Update: {
          batch_id?: string | null
          created_at?: string
          id?: string
          line_total?: number
          material_id?: string
          notes?: string | null
          purchase_return_id?: string
          quantity_returned?: number
          return_reason?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_purchase_return_items_batch"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_purchase_return_items_material"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "material_valuation_summary"
            referencedColumns: ["material_id"]
          },
          {
            foreignKeyName: "fk_purchase_return_items_material"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_purchase_return_items_return"
            columns: ["purchase_return_id"]
            isOneToOne: false
            referencedRelation: "purchase_returns"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_returns: {
        Row: {
          created_at: string
          credit_note_date: string | null
          credit_note_number: string | null
          id: string
          notes: string | null
          purchase_invoice_id: string
          purchase_order_id: string
          return_date: string
          return_number: string
          return_reason: string | null
          status: string
          supplier_id: string
          total_return_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          credit_note_date?: string | null
          credit_note_number?: string | null
          id?: string
          notes?: string | null
          purchase_invoice_id: string
          purchase_order_id: string
          return_date?: string
          return_number: string
          return_reason?: string | null
          status?: string
          supplier_id: string
          total_return_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          credit_note_date?: string | null
          credit_note_number?: string | null
          id?: string
          notes?: string | null
          purchase_invoice_id?: string
          purchase_order_id?: string
          return_date?: string
          return_number?: string
          return_reason?: string | null
          status?: string
          supplier_id?: string
          total_return_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_purchase_returns_invoice"
            columns: ["purchase_invoice_id"]
            isOneToOne: false
            referencedRelation: "purchase_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_purchase_returns_purchase_order"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_purchase_returns_supplier"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_items: {
        Row: {
          created_at: string
          id: string
          line_total: number
          material_id: string
          notes: string | null
          quantity: number
          quotation_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          line_total: number
          material_id: string
          notes?: string | null
          quantity: number
          quotation_id: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number
          material_id?: string
          notes?: string | null
          quantity?: number
          quotation_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "material_valuation_summary"
            referencedColumns: ["material_id"]
          },
          {
            foreignKeyName: "quotation_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_reminders: {
        Row: {
          created_at: string
          id: string
          method: string
          notes: string | null
          quotation_id: string
          reminder_type: string
          sent_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          method: string
          notes?: string | null
          quotation_id: string
          reminder_type: string
          sent_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          method?: string
          notes?: string | null
          quotation_id?: string
          reminder_type?: string
          sent_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_reminders_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          company_address: string | null
          company_email: string | null
          company_name: string | null
          company_phone: string | null
          concerned_person: string | null
          created_at: string
          customer_id: string
          customer_need: string | null
          freight_charges: number | null
          grand_total: number
          handling_charges: number | null
          id: string
          packing_charges: number | null
          payment_terms: string | null
          quotation_number: string
          requirement_source: string | null
          status: string
          tax_amount: number
          terms_conditions: string | null
          total_amount: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          company_address?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          concerned_person?: string | null
          created_at?: string
          customer_id: string
          customer_need?: string | null
          freight_charges?: number | null
          grand_total?: number
          handling_charges?: number | null
          id?: string
          packing_charges?: number | null
          payment_terms?: string | null
          quotation_number: string
          requirement_source?: string | null
          status?: string
          tax_amount?: number
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          company_address?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          concerned_person?: string | null
          created_at?: string
          customer_id?: string
          customer_need?: string | null
          freight_charges?: number | null
          grand_total?: number
          handling_charges?: number | null
          id?: string
          packing_charges?: number | null
          payment_terms?: string | null
          quotation_number?: string
          requirement_source?: string | null
          status?: string
          tax_amount?: number
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      receivables: {
        Row: {
          created_at: string
          customer_id: string
          due_date: string | null
          id: string
          notes: string | null
          original_amount: number
          outstanding_amount: number
          paid_amount: number
          sales_invoice_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          due_date?: string | null
          id?: string
          notes?: string | null
          original_amount?: number
          outstanding_amount?: number
          paid_amount?: number
          sales_invoice_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          original_amount?: number
          outstanding_amount?: number
          paid_amount?: number
          sales_invoice_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      sales_invoices: {
        Row: {
          created_at: string
          customer_id: string
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          sales_order_id: string
          status: string
          subtotal_amount: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          notes?: string | null
          sales_order_id: string
          status?: string
          subtotal_amount?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          sales_order_id?: string
          status?: string
          subtotal_amount?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      sales_order_items: {
        Row: {
          created_at: string
          id: string
          line_total: number
          material_id: string
          notes: string | null
          quantity: number
          quotation_item_id: string | null
          sales_order_id: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          line_total?: number
          material_id: string
          notes?: string | null
          quantity?: number
          quotation_item_id?: string | null
          sales_order_id: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number
          material_id?: string
          notes?: string | null
          quantity?: number
          quotation_item_id?: string | null
          sales_order_id?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      sales_orders: {
        Row: {
          created_at: string
          customer_id: string
          delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          quotation_id: string | null
          so_number: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          quotation_id?: string | null
          so_number: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          quotation_id?: string | null
          so_number?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_returns: {
        Row: {
          created_at: string
          credit_note_date: string | null
          credit_note_number: string | null
          customer_id: string
          id: string
          notes: string | null
          return_date: string
          return_number: string
          return_reason: string | null
          sales_invoice_id: string
          sales_order_id: string
          status: string
          total_return_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          credit_note_date?: string | null
          credit_note_number?: string | null
          customer_id: string
          id?: string
          notes?: string | null
          return_date?: string
          return_number: string
          return_reason?: string | null
          sales_invoice_id: string
          sales_order_id: string
          status?: string
          total_return_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          credit_note_date?: string | null
          credit_note_number?: string | null
          customer_id?: string
          id?: string
          notes?: string | null
          return_date?: string
          return_number?: string
          return_reason?: string | null
          sales_invoice_id?: string
          sales_order_id?: string
          status?: string
          total_return_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          gst_number: string | null
          id: string
          is_active: boolean
          name: string
          payment_terms: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean
          name: string
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean
          name?: string
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          batch_id: string | null
          created_at: string
          id: string
          location_id: string
          material_id: string
          notes: string | null
          quality_grade: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          transformation_id: string | null
          unit_cost: number | null
          weight_kg: number | null
        }
        Insert: {
          batch_id?: string | null
          created_at?: string
          id?: string
          location_id: string
          material_id: string
          notes?: string | null
          quality_grade?: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          transformation_id?: string | null
          unit_cost?: number | null
          weight_kg?: number | null
        }
        Update: {
          batch_id?: string | null
          created_at?: string
          id?: string
          location_id?: string
          material_id?: string
          notes?: string | null
          quality_grade?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          transformation_id?: string | null
          unit_cost?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "material_valuation_summary"
            referencedColumns: ["material_id"]
          },
          {
            foreignKeyName: "transactions_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_transformation_id_fkey"
            columns: ["transformation_id"]
            isOneToOne: false
            referencedRelation: "job_work_transformations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      inventory_valuation: {
        Row: {
          available_quantity: number | null
          calculated_avg_cost: number | null
          category: string | null
          grade: string | null
          id: string | null
          last_updated: string | null
          location_id: string | null
          location_name: string | null
          material_id: string | null
          material_name: string | null
          quality_grade: string | null
          quantity: number | null
          reserved_quantity: number | null
          sku: string | null
          total_value: number | null
          weighted_avg_cost: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "material_valuation_summary"
            referencedColumns: ["material_id"]
          },
          {
            foreignKeyName: "inventory_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_valuation_summary: {
        Row: {
          overall_avg_cost: number | null
          total_inventory_value: number | null
          total_materials: number | null
          total_quantity: number | null
        }
        Relationships: []
      }
      material_valuation_summary: {
        Row: {
          category: string | null
          grade: string | null
          material_id: string | null
          material_name: string | null
          sku: string | null
          total_quantity: number | null
          total_value: number | null
          weighted_avg_cost: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_batch_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_po_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_sku: {
        Args: {
          p_grade: string
          p_category: string
          p_thickness?: number
          p_width?: number
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
