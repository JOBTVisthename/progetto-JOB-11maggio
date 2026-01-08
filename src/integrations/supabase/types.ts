export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      candidate_profiles: {
        Row: {
          available_start_date: string | null
          birth_date: string | null
          city: string | null
          country: string | null
          created_at: string
          cv_url: string | null
          desired_job_title: string | null
          first_name: string | null
          id: string
          job_search_duration: string | null
          last_name: string | null
          notes: string | null
          profile_image_url: string | null
          province: string | null
          shift_work_availability: boolean | null
          travel_preference: string | null
          updated_at: string
          weekend_availability: boolean | null
          willing_to_change_region: boolean | null
          willing_to_relocate: boolean | null
        }
        Insert: {
          available_start_date?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          cv_url?: string | null
          desired_job_title?: string | null
          first_name?: string | null
          id: string
          job_search_duration?: string | null
          last_name?: string | null
          notes?: string | null
          profile_image_url?: string | null
          province?: string | null
          shift_work_availability?: boolean | null
          travel_preference?: string | null
          updated_at?: string
          weekend_availability?: boolean | null
          willing_to_change_region?: boolean | null
          willing_to_relocate?: boolean | null
        }
        Update: {
          available_start_date?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          cv_url?: string | null
          desired_job_title?: string | null
          first_name?: string | null
          id?: string
          job_search_duration?: string | null
          last_name?: string | null
          notes?: string | null
          profile_image_url?: string | null
          province?: string | null
          shift_work_availability?: boolean | null
          travel_preference?: string | null
          updated_at?: string
          weekend_availability?: boolean | null
          willing_to_change_region?: boolean | null
          willing_to_relocate?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_profiles: {
        Row: {
          company_name: string
          company_size: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          profile_image_url: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          company_name: string
          company_size?: string | null
          created_at?: string
          description?: string | null
          id: string
          industry?: string | null
          logo_url?: string | null
          profile_image_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          company_name?: string
          company_size?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          profile_image_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_matching: {
        Row: {
          candidate_id: string
          candidate_liked: boolean | null
          company_id: string
          company_liked: boolean | null
          created_at: string
          id: string
          match_date: string | null
          match_status: string | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          candidate_liked?: boolean | null
          company_id: string
          company_liked?: boolean | null
          created_at?: string
          id?: string
          match_date?: string | null
          match_status?: string | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          candidate_liked?: boolean | null
          company_id?: string
          company_liked?: boolean | null
          created_at?: string
          id?: string
          match_date?: string | null
          match_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_matching_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_matching_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          job_matching_id: string
          message: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          job_matching_id: string
          message: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          job_matching_id: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_job_matching_id_fkey"
            columns: ["job_matching_id"]
            isOneToOne: false
            referencedRelation: "job_matching"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          stripe_customer_id: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
          role: string
        }
        Insert: {
          created_at?: string
          id: string
          stripe_customer_id?: string | null
          updated_at?: string
          user_type: Database["public"]["Enums"]["user_type"]
          role?: string
        }
        Update: {
          created_at?: string
          id?: string
          stripe_customer_id?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          role?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: Database["public"]["Enums"]["plan_type"] | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: Database["public"]["Enums"]["plan_type"] | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: Database["public"]["Enums"]["plan_type"] | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_interviews: {
        Row: {
          candidate_id: string
          created_at: string
          description: string | null
          duration: number | null
          id: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type: "candidate" | "company"
      plan_type: "starter" | "builder" | "hero"
      subscription_status: "active" | "canceled" | "past_due" | "unpaid" | "trialing" | "incomplete" | "incomplete_expired" | "paused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_type: ["candidate", "company"],
      plan_type: ["starter", "builder", "hero"],
      subscription_status: ["active", "canceled", "past_due", "unpaid", "trialing", "incomplete", "incomplete_expired", "paused"],
    },
  },
} as const
