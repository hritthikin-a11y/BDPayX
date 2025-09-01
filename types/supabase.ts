export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_bank_accounts: {
        Row: {
          account_name: string
          account_number: string | null
          bank_address: string | null
          bank_name: string | null
          bank_type: Database["public"]["Enums"]["bank_type"]
          branch_name: string | null
          created_at: string | null
          currency: Database["public"]["Enums"]["currency_type"]
          daily_limit: number | null
          id: string
          ifsc_code: string | null
          is_active: boolean | null
          mobile_number: string | null
          monthly_limit: number | null
          routing_number: string | null
          swift_code: string | null
          updated_at: string | null
          upi_id: string | null
          zipcode: string | null
        }
        Insert: {
          account_name: string
          account_number?: string | null
          bank_address?: string | null
          bank_name?: string | null
          bank_type: Database["public"]["Enums"]["bank_type"]
          branch_name?: string | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          daily_limit?: number | null
          id?: string
          ifsc_code?: string | null
          is_active?: boolean | null
          mobile_number?: string | null
          monthly_limit?: number | null
          routing_number?: string | null
          swift_code?: string | null
          updated_at?: string | null
          upi_id?: string | null
          zipcode?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string | null
          bank_address?: string | null
          bank_name?: string | null
          bank_type?: Database["public"]["Enums"]["bank_type"]
          branch_name?: string | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          daily_limit?: number | null
          id?: string
          ifsc_code?: string | null
          is_active?: boolean | null
          mobile_number?: string | null
          monthly_limit?: number | null
          routing_number?: string | null
          swift_code?: string | null
          updated_at?: string | null
          upi_id?: string | null
          zipcode?: string | null
        }
        Relationships: []
      }
      deposit_requests: {
        Row: {
          admin_bank_account_id: string
          admin_notes: string | null
          amount: number
          created_at: string | null
          currency: Database["public"]["Enums"]["currency_type"]
          id: string
          screenshot_url: string | null
          sender_name: string
          status: Database["public"]["Enums"]["transaction_status"] | null
          transaction_id: string
          transaction_ref: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_bank_account_id: string
          admin_notes?: string | null
          amount: number
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          id?: string
          screenshot_url?: string | null
          sender_name: string
          status?: Database["public"]["Enums"]["transaction_status"] | null
          transaction_id: string
          transaction_ref: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_bank_account_id?: string
          admin_notes?: string | null
          amount?: number
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          id?: string
          screenshot_url?: string | null
          sender_name?: string
          status?: Database["public"]["Enums"]["transaction_status"] | null
          transaction_id?: string
          transaction_ref?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposit_requests_admin_bank_account_id_fkey"
            columns: ["admin_bank_account_id"]
            isOneToOne: false
            referencedRelation: "admin_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposit_requests_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          created_at: string | null
          from_currency: Database["public"]["Enums"]["currency_type"]
          id: string
          is_active: boolean | null
          rate: number
          to_currency: Database["public"]["Enums"]["currency_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_currency: Database["public"]["Enums"]["currency_type"]
          id?: string
          is_active?: boolean | null
          rate: number
          to_currency: Database["public"]["Enums"]["currency_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_currency?: Database["public"]["Enums"]["currency_type"]
          id?: string
          is_active?: boolean | null
          rate?: number
          to_currency?: Database["public"]["Enums"]["currency_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      exchange_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          exchange_rate: number
          from_amount: number
          from_currency: Database["public"]["Enums"]["currency_type"]
          id: string
          status: Database["public"]["Enums"]["transaction_status"] | null
          to_amount: number
          to_currency: Database["public"]["Enums"]["currency_type"]
          transaction_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          exchange_rate: number
          from_amount: number
          from_currency: Database["public"]["Enums"]["currency_type"]
          id?: string
          status?: Database["public"]["Enums"]["transaction_status"] | null
          to_amount: number
          to_currency: Database["public"]["Enums"]["currency_type"]
          transaction_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          exchange_rate?: number
          from_amount?: number
          from_currency?: Database["public"]["Enums"]["currency_type"]
          id?: string
          status?: Database["public"]["Enums"]["transaction_status"] | null
          to_amount?: number
          to_currency?: Database["public"]["Enums"]["currency_type"]
          transaction_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exchange_requests_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          admin_bank_account_id: string | null
          admin_notes: string | null
          amount: number
          bank_account_id: string | null
          converted_amount: number | null
          created_at: string | null
          currency: Database["public"]["Enums"]["currency_type"]
          exchange_rate: number | null
          from_currency: Database["public"]["Enums"]["currency_type"] | null
          id: string
          processed_at: string | null
          reference_number: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          to_currency: Database["public"]["Enums"]["currency_type"] | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_bank_account_id?: string | null
          admin_notes?: string | null
          amount: number
          bank_account_id?: string | null
          converted_amount?: number | null
          created_at?: string | null
          currency: Database["public"]["Enums"]["currency_type"]
          exchange_rate?: number | null
          from_currency?: Database["public"]["Enums"]["currency_type"] | null
          id?: string
          processed_at?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          to_currency?: Database["public"]["Enums"]["currency_type"] | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_bank_account_id?: string | null
          admin_notes?: string | null
          amount?: number
          bank_account_id?: string | null
          converted_amount?: number | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          exchange_rate?: number | null
          from_currency?: Database["public"]["Enums"]["currency_type"] | null
          id?: string
          processed_at?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          to_currency?: Database["public"]["Enums"]["currency_type"] | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_admin_bank_account_id_fkey"
            columns: ["admin_bank_account_id"]
            isOneToOne: false
            referencedRelation: "admin_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "user_bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bank_accounts: {
        Row: {
          account_name: string
          account_number: string | null
          bank_address: string | null
          bank_name: string | null
          bank_type: Database["public"]["Enums"]["bank_type"]
          branch_name: string | null
          created_at: string | null
          currency: Database["public"]["Enums"]["currency_type"]
          id: string
          ifsc_code: string | null
          is_active: boolean | null
          is_verified: boolean | null
          mobile_number: string | null
          routing_number: string | null
          swift_code: string | null
          updated_at: string | null
          upi_id: string | null
          user_id: string
          zipcode: string | null
        }
        Insert: {
          account_name: string
          account_number?: string | null
          bank_address?: string | null
          bank_name?: string | null
          bank_type?: Database["public"]["Enums"]["bank_type"]
          branch_name?: string | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          id?: string
          ifsc_code?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          mobile_number?: string | null
          routing_number?: string | null
          swift_code?: string | null
          updated_at?: string | null
          upi_id?: string | null
          user_id: string
          zipcode?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string | null
          bank_address?: string | null
          bank_name?: string | null
          bank_type?: Database["public"]["Enums"]["bank_type"]
          branch_name?: string | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          id?: string
          ifsc_code?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          mobile_number?: string | null
          routing_number?: string | null
          swift_code?: string | null
          updated_at?: string | null
          upi_id?: string | null
          user_id?: string
          zipcode?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          daily_deposit_limit: number | null
          daily_withdrawal_limit: number | null
          full_name: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          kyc_status: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          daily_deposit_limit?: number | null
          daily_withdrawal_limit?: number | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          kyc_status?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          daily_deposit_limit?: number | null
          daily_withdrawal_limit?: number | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          kyc_status?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          bdt_balance: number | null
          created_at: string | null
          id: string
          inr_balance: number | null
          is_active: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bdt_balance?: number | null
          created_at?: string | null
          id?: string
          inr_balance?: number | null
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bdt_balance?: number | null
          created_at?: string | null
          id?: string
          inr_balance?: number | null
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          bank_account_id: string
          created_at: string | null
          currency: Database["public"]["Enums"]["currency_type"]
          id: string
          status: Database["public"]["Enums"]["transaction_status"] | null
          transaction_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          bank_account_id: string
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          id?: string
          status?: Database["public"]["Enums"]["transaction_status"] | null
          transaction_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          bank_account_id?: string
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          id?: string
          status?: Database["public"]["Enums"]["transaction_status"] | null
          transaction_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "user_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawal_requests_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_latest_exchange_rate: {
        Args: {
          p_from_currency: Database["public"]["Enums"]["currency_type"]
          p_to_currency: Database["public"]["Enums"]["currency_type"]
        }
        Returns: number
      }
      update_exchange_rate: {
        Args: {
          p_from_currency: Database["public"]["Enums"]["currency_type"]
          p_new_rate: number
          p_to_currency: Database["public"]["Enums"]["currency_type"]
        }
        Returns: undefined
      }
    }
    Enums: {
      bank_type: "BKASH" | "NAGAD" | "ROCKET" | "BANK" | "UPI"
      currency_type: "BDT" | "INR"
      transaction_status:
        | "PENDING"
        | "SUCCESS"
        | "FAILED"
        | "CANCELLED"
        | "REJECTED"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      bank_type: ["BKASH", "NAGAD", "ROCKET", "BANK", "UPI"],
      currency_type: ["BDT", "INR"],
      transaction_status: [
        "PENDING",
        "SUCCESS",
        "FAILED",
        "CANCELLED",
        "REJECTED",
      ],
    },
  },
} as const

