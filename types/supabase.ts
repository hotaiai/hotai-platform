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
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          name: string | null
          avatar_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          email: string
          name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
        }
      }
      workspaces: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          owner_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          owner_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          owner_id?: string
        }
      }
      chats: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          user_id: string
          workspace_id: string
          model: string
          settings: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          user_id: string
          workspace_id: string
          model: string
          settings?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          user_id?: string
          workspace_id?: string
          model?: string
          settings?: Json | null
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          chat_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          tokens: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          chat_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          tokens?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          chat_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          tokens?: number | null
        }
      }
      prompts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          content: string
          description: string | null
          user_id: string
          workspace_id: string
          is_public: boolean
          tags: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          content: string
          description?: string | null
          user_id: string
          workspace_id: string
          is_public?: boolean
          tags?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          content?: string
          description?: string | null
          user_id?: string
          workspace_id?: string
          is_public?: boolean
          tags?: string[] | null
        }
      }
      usage: {
        Row: {
          id: string
          created_at: string
          user_id: string
          workspace_id: string
          model: string
          tokens_used: number
          cost: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          workspace_id: string
          model: string
          tokens_used: number
          cost: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          workspace_id?: string
          model?: string
          tokens_used?: number
          cost?: number
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