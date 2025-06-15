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
      avatar_settings: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          headline: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name: string
          headline?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          headline?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      channels: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          course_id: string
          created_at: string
          id: string
          rating: number | null
          updated_at: string
          user_email: string | null
          user_name: string
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string
          id?: string
          rating?: number | null
          updated_at?: string
          user_email?: string | null
          user_name: string
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string
          id?: string
          rating?: number | null
          updated_at?: string
          user_email?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      content_blocks: {
        Row: {
          created_at: string
          description: string | null
          href: string | null
          icon_url: string | null
          id: string
          is_active: boolean
          order_index: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          href?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          order_index?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          href?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          order_index?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          level: number
          price: number | null
          thumbnail_url: string | null
          title: string
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          level?: number
          price?: number | null
          thumbnail_url?: string | null
          title: string
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          level?: number
          price?: number | null
          thumbnail_url?: string | null
          title?: string
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          access_level: string | null
          category: string
          created_at: string | null
          description: string | null
          downloads: number | null
          file_size: number
          file_type: string
          file_url: string
          id: string
          tags: string[] | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          access_level?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          downloads?: number | null
          file_size: number
          file_type: string
          file_url: string
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          access_level?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          downloads?: number | null
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          event_id: string | null
          id: string
          registered_at: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          event_id?: string | null
          id?: string
          registered_at?: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          event_id?: string | null
          id?: string
          registered_at?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          duration: number
          format: string
          id: string
          instructor: string | null
          location: string | null
          max_attendees: number
          meeting_link: string | null
          recording: string | null
          registered: number
          registered_users: Json | null
          status: string
          tags: Json | null
          time: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date: string
          description?: string | null
          duration?: number
          format?: string
          id?: string
          instructor?: string | null
          location?: string | null
          max_attendees?: number
          meeting_link?: string | null
          recording?: string | null
          registered?: number
          registered_users?: Json | null
          status?: string
          tags?: Json | null
          time: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          duration?: number
          format?: string
          id?: string
          instructor?: string | null
          location?: string | null
          max_attendees?: number
          meeting_link?: string | null
          recording?: string | null
          registered?: number
          registered_users?: Json | null
          status?: string
          tags?: Json | null
          time?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          attachment_url: string | null
          content_md: string | null
          created_at: string
          id: string
          is_preview: boolean | null
          module_id: string | null
          order_index: number | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          attachment_url?: string | null
          content_md?: string | null
          created_at?: string
          id?: string
          is_preview?: boolean | null
          module_id?: string | null
          order_index?: number | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          attachment_url?: string | null
          content_md?: string | null
          created_at?: string
          id?: string
          is_preview?: boolean | null
          module_id?: string | null
          order_index?: number | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          message_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          message_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          channel_id: string | null
          content: string
          created_at: string | null
          id: string
          reactions: Json | null
          reply_to: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          reactions?: Json | null
          reply_to?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          reactions?: Json | null
          reply_to?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          id: string
          order_index: number | null
          title: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      post_attachments: {
        Row: {
          id: string
          meta: Json | null
          name: string
          post_id: string | null
          type: string
          uploaded_at: string | null
          url: string
        }
        Insert: {
          id?: string
          meta?: Json | null
          name: string
          post_id?: string | null
          type: string
          uploaded_at?: string | null
          url: string
        }
        Update: {
          id?: string
          meta?: Json | null
          name?: string
          post_id?: string | null
          type?: string
          uploaded_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_attachments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_pinned: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
          visibility: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          href: string
          icon_url: string | null
          id: string
          platform: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          href: string
          icon_url?: string | null
          id?: string
          platform: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          href?: string
          icon_url?: string | null
          id?: string
          platform?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string
          email: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name: string
          email?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string
          email?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          courses_completed: number
          created_at: string
          current_streak: number | null
          id: string
          last_activity: string | null
          last_login_date: string | null
          level: number
          longest_streak: number | null
          posts_count: number
          streak_days: number
          total_online_hours: number | null
          total_xp: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          courses_completed?: number
          created_at?: string
          current_streak?: number | null
          id?: string
          last_activity?: string | null
          last_login_date?: string | null
          level?: number
          longest_streak?: number | null
          posts_count?: number
          streak_days?: number
          total_online_hours?: number | null
          total_xp?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          courses_completed?: number
          created_at?: string
          current_streak?: number | null
          id?: string
          last_activity?: string | null
          last_login_date?: string | null
          level?: number
          longest_streak?: number | null
          posts_count?: number
          streak_days?: number
          total_online_hours?: number | null
          total_xp?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_config: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: number
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value: number
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      xp_logs: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          id: string
          user_id: string | null
          xp_earned: number
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          id?: string
          user_id?: string | null
          xp_earned: number
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          id?: string
          user_id?: string | null
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "xp_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_feature: {
        Row: {
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_level: {
        Args: { total_xp: number }
        Returns: number
      }
      handle_daily_login: {
        Args: { user_id_param: string }
        Returns: Json
      }
      log_online_time: {
        Args: { user_id_param: string; hours_online: number }
        Returns: undefined
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
    Enums: {},
  },
} as const
