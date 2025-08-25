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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          department: string | null
          division: string | null
          email: string | null
          employee_id: string | null
          full_name: string | null
          id: string
          is_active: boolean
          password: string | null
          role: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          department?: string | null
          division?: string | null
          email?: string | null
          employee_id?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          password?: string | null
          role: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          department?: string | null
          division?: string | null
          email?: string | null
          employee_id?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          password?: string | null
          role?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      requests: {
        Row: {
          admin_feedback: string | null
          approved_by: string | null
          country_name: string | null
          created_at: string
          document_count: number | null
          document_name: string
          file_path: string | null
          id: string
          is_delivered: boolean | null
          receiver_company: string | null
          receiver_department: string | null
          receiver_email: string
          receiver_name: string | null
          receiver_phone: string | null
          requester_id: string
          shipping_vendor: string | null
          status: Database["public"]["Enums"]["request_status"]
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          admin_feedback?: string | null
          approved_by?: string | null
          country_name?: string | null
          created_at?: string
          document_count?: number | null
          document_name: string
          file_path?: string | null
          id?: string
          is_delivered?: boolean | null
          receiver_company?: string | null
          receiver_department?: string | null
          receiver_email: string
          receiver_name?: string | null
          receiver_phone?: string | null
          requester_id: string
          shipping_vendor?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          admin_feedback?: string | null
          approved_by?: string | null
          country_name?: string | null
          created_at?: string
          document_count?: number | null
          document_name?: string
          file_path?: string | null
          id?: string
          is_delivered?: boolean | null
          receiver_company?: string | null
          receiver_department?: string | null
          receiver_email?: string
          receiver_name?: string | null
          receiver_phone?: string | null
          requester_id?: string
          shipping_vendor?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_paths: {
        Row: {
          created_at: string
          id: string
          path_name: string
          path_value: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          path_name: string
          path_value: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          path_name?: string
          path_value?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_user: {
        Args: { target_user_id: string }
        Returns: Json
      }
      approve_request: {
        Args:
          | {
              p_admin_id: string
              p_request_id: string
              p_shipping_vendor: string
              p_tracking_number: string
            }
          | {
              p_admin_id: string
              p_request_id: string
              p_tracking_number: string
            }
        Returns: Json
      }
      can_insert_profile: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      confirm_delivery: {
        Args: { p_receiver_id: string; p_request_id: string }
        Returns: Json
      }
      create_request: {
        Args: {
          p_country_name?: string
          p_document_count?: number
          p_document_name: string
          p_file_path?: string
          p_receiver_company?: string
          p_receiver_department?: string
          p_receiver_email: string
          p_receiver_name?: string
          p_receiver_phone?: string
          p_requester_id?: string
          p_shipping_vendor?: string
        }
        Returns: Json
      }
      force_delete_user_admin: {
        Args: { admin_user_id: string; target_user_id: string }
        Returns: Json
      }
      get_all_requests: {
        Args: Record<PropertyKey, never>
        Returns: {
          admin_feedback: string
          approved_by: string
          country_name: string
          created_at: string
          document_count: number
          document_name: string
          file_path: string
          id: string
          is_delivered: boolean
          receiver_company: string
          receiver_department: string
          receiver_email: string
          receiver_name: string
          receiver_phone: string
          requester_company: string
          requester_department: string
          requester_division: string
          requester_email: string
          requester_employee_id: string
          requester_id: string
          requester_name: string
          shipping_vendor: string
          status: Database["public"]["Enums"]["request_status"]
          tracking_number: string
          updated_at: string
        }[]
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_fa_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_mock_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_mock_user_by_id: {
        Args: { user_id: string }
        Returns: boolean
      }
      test_rejected_status: {
        Args: { p_feedback: string; p_request_id: string }
        Returns: Json
      }
      test_rework_status: {
        Args: { p_feedback: string; p_request_id: string }
        Returns: Json
      }
      update_request: {
        Args: {
          p_country_name?: string
          p_document_count?: number
          p_document_name: string
          p_file_path?: string
          p_receiver_company?: string
          p_receiver_department?: string
          p_receiver_email: string
          p_receiver_name?: string
          p_receiver_phone?: string
          p_request_id: string
          p_shipping_vendor?: string
        }
        Returns: Json
      }
    }
    Enums: {
      request_status:
        | "pending"
        | "approved"
        | "rejected"
        | "rework"
        | "completed"
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
      request_status: [
        "pending",
        "approved",
        "rejected",
        "rework",
        "completed",
      ],
    },
  },
} as const
