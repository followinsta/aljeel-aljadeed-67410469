export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          is_approved: boolean | null
          location: string | null
          rating: number | null
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          location?: string | null
          rating?: number | null
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          location?: string | null
          rating?: number | null
        }
        Relationships: []
      }
      investor_fees: {
        Row: {
          amount: number | null
          created_at: string
          fee_type: string
          id: string
          investor_id: string
          is_paid: boolean
          paid_at: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          fee_type: string
          id?: string
          investor_id: string
          is_paid?: boolean
          paid_at?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          fee_type?: string
          id?: string
          investor_id?: string
          is_paid?: boolean
          paid_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_fees_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_profit_history: {
        Row: {
          created_at: string
          cumulative_profit: number
          id: string
          investor_id: string
          profit_amount: number
          profit_date: string
        }
        Insert: {
          created_at?: string
          cumulative_profit?: number
          id?: string
          investor_id: string
          profit_amount: number
          profit_date: string
        }
        Update: {
          created_at?: string
          cumulative_profit?: number
          id?: string
          investor_id?: string
          profit_amount?: number
          profit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_profit_history_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      investors: {
        Row: {
          auto_enable_withdraw_after_24h: boolean
          bank_account_number: string | null
          bank_name: string | null
          created_at: string
          daily_profit: number
          email: string | null
          full_name: string
          iban: string | null
          id: string
          is_active: boolean
          linked_customer_id: string | null
          notes: string | null
          notification_bar_enabled: boolean
          notification_bar_text: string | null
          password_hash: string | null
          phone: string | null
          subscription_amount: number
          subscription_duration_days: number
          subscription_duration_months: number
          subscription_start_date: string
          total_accumulated_profit: number
          updated_at: string
          withdraw_action_button_enabled: boolean
          withdraw_action_button_text: string | null
          withdraw_action_button_url: string | null
          withdraw_button_enabled: boolean
          withdraw_button_text: string | null
        }
        Insert: {
          auto_enable_withdraw_after_24h?: boolean
          bank_account_number?: string | null
          bank_name?: string | null
          created_at?: string
          daily_profit?: number
          email?: string | null
          full_name: string
          iban?: string | null
          id?: string
          is_active?: boolean
          linked_customer_id?: string | null
          notes?: string | null
          notification_bar_enabled?: boolean
          notification_bar_text?: string | null
          password_hash?: string | null
          phone?: string | null
          subscription_amount?: number
          subscription_duration_days?: number
          subscription_duration_months?: number
          subscription_start_date?: string
          total_accumulated_profit?: number
          updated_at?: string
          withdraw_action_button_enabled?: boolean
          withdraw_action_button_text?: string | null
          withdraw_action_button_url?: string | null
          withdraw_button_enabled?: boolean
          withdraw_button_text?: string | null
        }
        Update: {
          auto_enable_withdraw_after_24h?: boolean
          bank_account_number?: string | null
          bank_name?: string | null
          created_at?: string
          daily_profit?: number
          email?: string | null
          full_name?: string
          iban?: string | null
          id?: string
          is_active?: boolean
          linked_customer_id?: string | null
          notes?: string | null
          notification_bar_enabled?: boolean
          notification_bar_text?: string | null
          password_hash?: string | null
          phone?: string | null
          subscription_amount?: number
          subscription_duration_days?: number
          subscription_duration_months?: number
          subscription_start_date?: string
          total_accumulated_profit?: number
          updated_at?: string
          withdraw_action_button_enabled?: boolean
          withdraw_action_button_text?: string | null
          withdraw_action_button_url?: string | null
          withdraw_button_enabled?: boolean
          withdraw_button_text?: string | null
        }
        Relationships: []
      }
      packages: {
        Row: {
          created_at: string
          currency: string
          daily_profit: number
          description: string | null
          id: string
          image_url: string | null
          investment_amount: number
          investment_period_days: number | null
          is_active: boolean | null
          is_business: boolean | null
          is_featured: boolean | null
          name: string | null
          package_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          daily_profit: number
          description?: string | null
          id?: string
          image_url?: string | null
          investment_amount: number
          investment_period_days?: number | null
          is_active?: boolean | null
          is_business?: boolean | null
          is_featured?: boolean | null
          name?: string | null
          package_number: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          daily_profit?: number
          description?: string | null
          id?: string
          image_url?: string | null
          investment_amount?: number
          investment_period_days?: number | null
          is_active?: boolean | null
          is_business?: boolean | null
          is_featured?: boolean | null
          name?: string | null
          package_number?: number
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_holder_name: string | null
          account_number: string | null
          bank_name: string | null
          created_at: string
          custom_field_1_label: string | null
          custom_field_1_value: string | null
          custom_field_2_label: string | null
          custom_field_2_value: string | null
          custom_field_3_label: string | null
          custom_field_3_value: string | null
          custom_field_4_label: string | null
          custom_field_4_value: string | null
          display_name: string | null
          iban: string | null
          id: string
          is_active: boolean | null
          method_type: string
          note: string | null
          telegram_link: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          account_holder_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string
          custom_field_1_label?: string | null
          custom_field_1_value?: string | null
          custom_field_2_label?: string | null
          custom_field_2_value?: string | null
          custom_field_3_label?: string | null
          custom_field_3_value?: string | null
          custom_field_4_label?: string | null
          custom_field_4_value?: string | null
          display_name?: string | null
          iban?: string | null
          id?: string
          is_active?: boolean | null
          method_type: string
          note?: string | null
          telegram_link?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          account_holder_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string
          custom_field_1_label?: string | null
          custom_field_1_value?: string | null
          custom_field_2_label?: string | null
          custom_field_2_value?: string | null
          custom_field_3_label?: string | null
          custom_field_3_value?: string | null
          custom_field_4_label?: string | null
          custom_field_4_value?: string | null
          display_name?: string | null
          iban?: string | null
          id?: string
          is_active?: boolean | null
          method_type?: string
          note?: string | null
          telegram_link?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      payment_receipts: {
        Row: {
          admin_notes: string | null
          created_at: string
          currency: string | null
          customer_id: string | null
          email: string | null
          full_name: string
          id: string
          package_amount: number | null
          package_id: string | null
          package_name: string | null
          payment_method: string | null
          phone: string | null
          receipt_image_url: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          email?: string | null
          full_name: string
          id?: string
          package_amount?: number | null
          package_id?: string | null
          package_name?: string | null
          payment_method?: string | null
          phone?: string | null
          receipt_image_url: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          email?: string | null
          full_name?: string
          id?: string
          package_amount?: number | null
          package_id?: string | null
          package_name?: string | null
          payment_method?: string | null
          phone?: string | null
          receipt_image_url?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          customer_id: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      subscription_requests: {
        Row: {
          created_at: string
          customer_id: string | null
          email: string | null
          full_name: string
          id: string
          notes: string | null
          package_amount: number | null
          package_id: string | null
          package_name: string | null
          phone: string | null
          processed_at: string | null
          processed_by: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          package_amount?: number | null
          package_id?: string | null
          package_name?: string | null
          phone?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          package_amount?: number | null
          package_id?: string | null
          package_name?: string | null
          phone?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_requests_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_email: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
