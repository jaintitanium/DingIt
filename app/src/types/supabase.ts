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
      customer_user: {
        Row: {
          id: string
        }
        Insert: {
          id: string
        }
        Update: {
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_user_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      product: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          image_path: string | null
          order: number
          service_provider: string
          thumbnail_path: string | null
          product_rating: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          image_path?: string | null
          order?: number
          service_provider: string
          thumbnail_path?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          image_path?: string | null
          order?: number
          service_provider?: string
          thumbnail_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_owner_fkey"
            columns: ["service_provider"]
            isOneToOne: false
            referencedRelation: "service_provider"
            referencedColumns: ["id"]
          },
        ]
      }
      product_price: {
        Row: {
          created_at: string
          id: string
          name: string
          price: unknown
          product: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          price: unknown
          product?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price?: unknown
          product?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_product_price_product_fkey"
            columns: ["product"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      review: {
        Row: {
          created_at: string
          description: string
          id: string
          owner: string
          rating: number
          service_provider: string
          review_tip_total: number | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          owner: string
          rating: number
          service_provider: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          owner?: string
          rating?: number
          service_provider?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_service_provider_fkey"
            columns: ["service_provider"]
            isOneToOne: false
            referencedRelation: "service_provider"
            referencedColumns: ["id"]
          },
        ]
      }
      review_product: {
        Row: {
          description: string
          id: string
          product: string
          rating: number
          review: string
        }
        Insert: {
          description: string
          id?: string
          product: string
          rating: number
          review: string
        }
        Update: {
          description?: string
          id?: string
          product?: string
          rating?: number
          review?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_product_product_fkey"
            columns: ["product"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_product_review_fkey"
            columns: ["review"]
            isOneToOne: false
            referencedRelation: "review"
            referencedColumns: ["id"]
          },
        ]
      }
      review_service_member: {
        Row: {
          description: string
          id: string
          rating: number
          review: string
          service_member: string
          tip: number | null
        }
        Insert: {
          description: string
          id?: string
          rating: number
          review: string
          service_member: string
          tip?: number | null
        }
        Update: {
          description?: string
          id?: string
          rating?: number
          review?: string
          service_member?: string
          tip?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "review_service_member_review_fkey"
            columns: ["review"]
            isOneToOne: false
            referencedRelation: "review"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_service_member_service_member_fkey"
            columns: ["service_member"]
            isOneToOne: false
            referencedRelation: "service_provider_member"
            referencedColumns: ["id"]
          },
        ]
      }
      service_member_user: {
        Row: {
          id: string
          onboarded: boolean
          stripe_account_id: string | null
        }
        Insert: {
          id: string
          onboarded?: boolean
          stripe_account_id?: string | null
        }
        Update: {
          id?: string
          onboarded?: boolean
          stripe_account_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_member_user_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      service_provider: {
        Row: {
          address_1: string | null
          address_2: string | null
          city: string | null
          created_at: string
          display_name: string
          featured_product: string | null
          header_image_path: string | null
          id: string
          lat: number | null
          lng: number | null
          location: unknown | null
          owner: string
          phone_number: string | null
          postal_code: string | null
          promo_image_path: string | null
          state: string | null
          sub_title: string | null
          textsearchable_index_col: unknown | null
          timezone: string | null
          website: string | null
          provider_rating: number | null
        }
        Insert: {
          address_1?: string | null
          address_2?: string | null
          city?: string | null
          created_at?: string
          display_name: string
          featured_product?: string | null
          header_image_path?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location?: unknown | null
          owner: string
          phone_number?: string | null
          postal_code?: string | null
          promo_image_path?: string | null
          state?: string | null
          sub_title?: string | null
          textsearchable_index_col?: unknown | null
          timezone?: string | null
          website?: string | null
        }
        Update: {
          address_1?: string | null
          address_2?: string | null
          city?: string | null
          created_at?: string
          display_name?: string
          featured_product?: string | null
          header_image_path?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location?: unknown | null
          owner?: string
          phone_number?: string | null
          postal_code?: string | null
          promo_image_path?: string | null
          state?: string | null
          sub_title?: string | null
          textsearchable_index_col?: unknown | null
          timezone?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_provider_featured_product_fkey"
            columns: ["featured_product"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_provider_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      service_provider_hours: {
        Row: {
          close_time: string
          day_of_week: number
          id: string
          open_time: string
          service_provider: string
        }
        Insert: {
          close_time: string
          day_of_week?: number
          id?: string
          open_time: string
          service_provider: string
        }
        Update: {
          close_time?: string
          day_of_week?: number
          id?: string
          open_time?: string
          service_provider?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_provider_hours_service_provider_fkey"
            columns: ["service_provider"]
            isOneToOne: false
            referencedRelation: "service_provider"
            referencedColumns: ["id"]
          },
        ]
      }
      service_provider_member: {
        Row: {
          id: string
          service_member_id: string
          service_provider_id: string
          member_rating: number | null
        }
        Insert: {
          id?: string
          service_member_id: string
          service_provider_id: string
        }
        Update: {
          id?: string
          service_member_id?: string
          service_provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_provider_member_service_member_id_fkey"
            columns: ["service_member_id"]
            isOneToOne: false
            referencedRelation: "service_member_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_provider_member_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_provider"
            referencedColumns: ["id"]
          },
        ]
      }
      service_provider_user: {
        Row: {
          active: boolean
          id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          active?: boolean
          id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          active?: boolean
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_provider_user_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      user: {
        Row: {
          created_at: string
          id: string
          name: string
          profile_path: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          profile_path?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          profile_path?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_hotspots: {
        Args: {
          input_lat: number
          input_lng: number
        }
        Returns: {
          id: string
          display_name: string
          sub_title: string
          distance: number
          header_image_path: string
          rating: number
        }[]
      }
      get_service_provider_distance: {
        Args: {
          input_id: string
          input_lat: number
          input_lng: number
        }
        Returns: number
      }
      get_user_by_email: {
        Args: {
          email_address: string
        }
        Returns: string
      }
      member_rating: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      product_rating: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      provider_rating: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      review_tip_total: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      search_service_provider: {
        Args: {
          search_text: string
          input_lat: number
          input_lng: number
        }
        Returns: {
          id: string
          display_name: string
          sub_title: string
          distance: number
          header_image_path: string
          rating: number
          city: string
          state: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

