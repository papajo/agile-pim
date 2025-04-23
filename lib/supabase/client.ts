"use client"

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Create a single instance of the Supabase client to be used across the client-side application
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

export const getSupabaseClient = () => {
  // Only create the client in browser environments
  if (typeof window === "undefined") {
    // Return a safe dummy client during SSR or if window is not available
    console.warn("Supabase client requested in non-browser environment. Returning dummy client.")
    return getSupabaseClientSafe() // Use the safe fallback
  }

  // If we already have a client, return it (Singleton pattern)
  if (supabaseClient) {
    return supabaseClient
  }

  // --- Cooldown Logic Removed ---
  // Removed the rate-limiting/cooldown logic as it's generally not needed
  // for standard singleton initialization. If there were specific issues
  // causing rapid re-initialization, those should be addressed directly.
  // --- End Removal ---

  try {
    // Check if environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing!")
      // Don't throw here, let getSupabaseClientSafe handle it below
      return getSupabaseClientSafe()
    }

    // Initialize the client
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true, // Keep session persistence
        autoRefreshToken: true, // Keep auto-refresh
        detectSessionInUrl: false, // Keep as false
      },
    })

  } catch (error) {
    console.error("Error initializing Supabase client:", error)
    // Fallback to safe client if initialization fails
    return getSupabaseClientSafe()
  }

  return supabaseClient
}

// Safe version that doesn't throw errors and provides a dummy client
export const getSupabaseClientSafe = () => {
  // Return the existing client if it was successfully initialized
  if (supabaseClient) {
    return supabaseClient
  }

  // Return a dummy client for SSR or when initialization fails
  console.warn("Using fallback Supabase dummy client.")
  return {
    from: (table: string) => ({
      select: (...args: any[]) => ({ // Make methods chainable and return promises
        eq: (...args: any[]) => Promise.resolve({ data: [], error: { message: `Dummy client used for ${table}`, code: 'DUMMY_CLIENT' } }),
        order: (...args: any[]) => Promise.resolve({ data: [], error: { message: `Dummy client used for ${table}`, code: 'DUMMY_CLIENT' } }),
        single: () => Promise.resolve({ data: null, error: { message: `Dummy client used for ${table}`, code: 'DUMMY_CLIENT' } }),
        // Add other common methods as needed, returning errors
        insert: (...args: any[]) => Promise.resolve({ data: null, error: { message: `Dummy client cannot insert into ${table}`, code: 'DUMMY_CLIENT' } }),
        update: (...args: any[]) => Promise.resolve({ data: null, error: { message: `Dummy client cannot update ${table}`, code: 'DUMMY_CLIENT' } }),
        delete: (...args: any[]) => Promise.resolve({ data: null, error: { message: `Dummy client cannot delete from ${table}`, code: 'DUMMY_CLIENT' } }),
      }),
       // Add top-level methods if needed
       insert: (...args: any[]) => Promise.resolve({ data: null, error: { message: `Dummy client cannot insert into ${table}`, code: 'DUMMY_CLIENT' } }),
       update: (...args: any[]) => Promise.resolve({ data: null, error: { message: `Dummy client cannot update ${table}`, code: 'DUMMY_CLIENT' } }),
       delete: (...args: any[]) => Promise.resolve({ data: null, error: { message: `Dummy client cannot delete from ${table}`, code: 'DUMMY_CLIENT' } }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Dummy client used for auth', code: 'DUMMY_CLIENT' } }),
      getSession: () => Promise.resolve({ data: { session: null }, error: { message: 'Dummy client used for auth', code: 'DUMMY_CLIENT' } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Dummy client cannot sign in', code: 'DUMMY_CLIENT' } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Dummy client cannot sign up', code: 'DUMMY_CLIENT' } }),
      signOut: () => Promise.resolve({ error: { message: 'Dummy client cannot sign out', code: 'DUMMY_CLIENT' } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }), // Provide unsubscribe
    },
    // Add other top-level Supabase methods if needed
    rpc: (...args: any[]) => Promise.resolve({ data: null, error: { message: 'Dummy client cannot call RPCs', code: 'DUMMY_CLIENT' } }),
  } as any // Use 'as any' carefully, only for the dummy client structure
}
