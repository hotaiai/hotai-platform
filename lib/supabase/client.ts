import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let _supabase: SupabaseClient<Database> | null = null

function getSupabaseClient(): SupabaseClient<Database> {
  if (!_supabase && supabaseUrl && supabaseAnonKey) {
    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  if (!_supabase) {
    _supabase = createClient<Database>(
      supabaseUrl || 'http://placeholder.local',
      supabaseAnonKey || 'placeholder'
    )
  }
  return _supabase
}

export const supabase = getSupabaseClient()

export function createSupabaseClient() {
  return getSupabaseClient()
}