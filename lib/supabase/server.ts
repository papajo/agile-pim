import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export const getSupabaseServer = () => {
  try {
    const cookieStore = cookies()

    // Get cookies as a simple object
    const cookieObj: Record<string, string> = {}
    cookieStore.getAll().forEach((cookie) => {
      cookieObj[cookie.name] = cookie.value
    })

    // Log cookie names for debugging (don't include values for security)
    console.log("Server cookies available:", Object.keys(cookieObj))

    // Check if we have auth-related cookies
    const hasSupabaseCookies = Object.keys(cookieObj).some(
      (name) => name.includes("supabase") || name.includes("sb-") || name.includes("auth"),
    )

    if (!hasSupabaseCookies) {
      console.warn("No Supabase auth cookies found in request")
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase environment variables are missing!")
      throw new Error("Supabase environment variables are missing")
    }

    // Create a Supabase client with cookie auth
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          cookie: Object.entries(cookieObj)
            .map(([name, value]) => `${name}=${value}`)
            .join("; "),
        },
      },
    })
  } catch (error) {
    console.error("Error creating Supabase server client:", error)

    // Return a dummy client that will gracefully fail
    return {
      from: () => ({
        select: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
          eq: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      },
    } as any
  }
}

// Create a separate function for auth operations to handle errors better
export const getServerSession = async () => {
  try {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Error getting session:", error)
      return { session: null, user: null }
    }

    // Log session status for debugging
    console.log("Server session check:", data.session ? "Session found" : "No session found")

    return {
      session: data.session,
      user: data.session?.user || null,
    }
  } catch (error) {
    console.error("Unexpected error getting session:", error)
    return { session: null, user: null }
  }
}

// Helper function to check if a user is authenticated without redirecting
export const isAuthenticated = async () => {
  try {
    const { session } = await getServerSession()
    return !!session
  } catch (error) {
    console.error("Error checking authentication:", error)
    return false
  }
}
