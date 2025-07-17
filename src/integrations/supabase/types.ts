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
      purchase_order_items: {
        Row: {
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
        Relationships: []
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
          unit_cost: number | null
        }
        Insert: {
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
          unit_cost?: number | null
        }
        Update: {
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
          unit_cost?: number | null
        }
        Relationships: [
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
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
