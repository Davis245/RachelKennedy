export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type PostStatus = "draft" | "published";
export type CommentModerationStatus = "pending" | "approved" | "rejected";

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          user_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          display_name: string;
          private_email: string | null;
          comment_text: string;
          moderation_status: CommentModerationStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          display_name: string;
          private_email?: string | null;
          comment_text: string;
          moderation_status?: CommentModerationStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          display_name?: string;
          private_email?: string | null;
          comment_text?: string;
          moderation_status?: CommentModerationStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      post_images: {
        Row: {
          id: string;
          post_id: string;
          image_url: string;
          alt_text: string;
          caption: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          image_url: string;
          alt_text: string;
          caption?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          image_url?: string;
          alt_text?: string;
          caption?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_images_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      post_likes: {
        Row: {
          id: string;
          post_id: string;
          visitor_identifier_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          visitor_identifier_hash: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          visitor_identifier_hash?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: Json;
          cover_image_url: string | null;
          cover_image_alt: string | null;
          location: string | null;
          country: string | null;
          travel_start_date: string | null;
          travel_end_date: string | null;
          status: PostStatus;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content?: Json;
          cover_image_url?: string | null;
          cover_image_alt?: string | null;
          location?: string | null;
          country?: string | null;
          travel_start_date?: string | null;
          travel_end_date?: string | null;
          status?: PostStatus;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: Json;
          cover_image_url?: string | null;
          cover_image_alt?: string | null;
          location?: string | null;
          country?: string | null;
          travel_start_date?: string | null;
          travel_end_date?: string | null;
          status?: PostStatus;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      post_like_totals: {
        Row: {
          post_id: string | null;
          like_count: number | null;
        };
      };
    };
    Functions: {
      is_admin_user: {
        Args: {
          check_user_id: string | null;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
