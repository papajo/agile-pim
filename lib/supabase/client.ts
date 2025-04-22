"use client"

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Create a single instance of the Supabase client to be used across the client-side application
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

// Track the last time we created a client to prevent too many creations
let lastClientCreation = 0
const CLIENT_CREATION_COOLDOWN = 1000 // 1 second cooldown

export const getSupabaseClient = () => {
  // Only create the client in browser environments
  if (typeof window === "undefined") {
    throw new Error("Supabase client cannot be initialized during server-side rendering")
  }

  const now = Date.now()

  // If we already have a client, return it
  if (supabaseClient) {
    return supabaseClient
  }

  // Check if we're trying to create clients too quickly
  if (now - lastClientCreation < CLIENT_CREATION_COOLDOWN) {
    console.warn("Attempted to create Supabase client too quickly, using existing client or waiting")

    // If we have a client, return it; otherwise throw an error
    if (supabaseClient) {
      return supabaseClient
    }

    throw new Error("Rate limited: Attempted to create Supabase client too quickly")
  }

  try {
    // Check if environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase environment variables are missing!")
      throw new Error("Supabase environment variables are missing")
    }

    lastClientCreation = now

    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  } catch (error) {
    console.error("Error initializing Supabase client:", error)
    throw error
  }

  return supabaseClient
}

// Safe version that doesn't throw errors - use this for components that should work without auth
export const getSupabaseClientSafe = () => {
  try {
    return getSupabaseClient()
  } catch (error) {
    console.warn("Using fallback Supabase client")
    // Return a dummy client for SSR or when initialization fails
    return {
      from: () => ({
        select: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: null }),
        signUp: () => Promise.resolve({ data: null, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as any
  }
}
