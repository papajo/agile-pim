"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getSupabaseClientSafe } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null | undefined
  session: Session | null | undefined
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Debounce function to prevent too many calls
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null
  let lastCall = 0

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve) => {
      const now = Date.now()
      const timeSinceLastCall = now - lastCall

      // Clear the timeout if it exists
      if (timeout) {
        clearTimeout(timeout)
      }

      // If we've waited long enough since the last call, execute immediately
      if (timeSinceLastCall >= wait) {
        lastCall = now
        resolve(func(...args))
      } else {
        // Otherwise, set a timeout to execute after the remaining wait time
        timeout = setTimeout(() => {
          lastCall = Date.now()
          resolve(func(...args))
        }, wait - timeSinceLastCall)
      }
    })
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const refreshingRef = useRef(false)
  const lastRefreshRef = useRef(0)

  // Implement the session refresh with rate limiting
  const refreshSession = useCallback(async () => {
    // Prevent concurrent refreshes
    if (refreshingRef.current) {
      console.log("Session refresh already in progress, skipping")
      return
    }

    // Rate limit to once per 5 seconds
    const now = Date.now()
    const timeSinceLastRefresh = now - lastRefreshRef.current
    if (timeSinceLastRefresh < 5000) {
      console.log(`Rate limiting session refresh (last refresh ${timeSinceLastRefresh}ms ago)`)
      return
    }

    try {
      refreshingRef.current = true
      setIsLoading(true)
      lastRefreshRef.current = now

      const supabase = getSupabaseClientSafe()

      // First try to get the session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        if (sessionError.message.includes("Too Many Requests")) {
          console.warn("Rate limited by Supabase, will try again later")
          return
        }
        console.error("Error getting session:", sessionError)
        setSession(null)
        setUser(null)
        return
      }

      // Log session status for debugging
      console.log("Client session check:", sessionData.session ? "Session found" : "No session found")

      setSession(sessionData.session)

      // If we have a session, get the user
      if (sessionData.session) {
        try {
          const { data: userData, error: userError } = await supabase.auth.getUser()

          if (userError) {
            if (userError.message.includes("Too Many Requests")) {
              console.warn("Rate limited by Supabase when getting user, using session user")
              // Use the user from the session instead
              setUser(sessionData.session.user)
              return
            }
            console.error("Error getting user:", userError)
            setUser(null)
          } else {
            setUser(userData.user)
          }
        } catch (userError: any) {
          console.error("Unexpected error getting user:", userError)
          // If we can't get the user, use the session user as fallback
          setUser(sessionData.session.user)
        }
      } else {
        setUser(null)
      }
    } catch (error: any) {
      console.error("Unexpected error refreshing session:", error)
      // Don't clear user/session on unexpected errors to prevent flickering
    } finally {
      refreshingRef.current = false
      setIsLoading(false)
    }
  }, [])

  // Debounced version of refreshSession to prevent too many calls
  const debouncedRefreshSession = useCallback(debounce(refreshSession, 1000), [refreshSession])

  // Check for protected routes that require authentication
  useEffect(() => {
    const protectedRoutes = ["/projects", "/dashboard"]
    const isProtectedRoute = protectedRoutes.some((route) => pathname?.startsWith(route))

    if (isProtectedRoute && user === null && !isLoading) {
      // Redirect to sign in if not authenticated
      const redirectUrl = `/sign-in?redirect=${encodeURIComponent(pathname || "")}`
      router.push(redirectUrl)
    }
  }, [pathname, user, isLoading, router])

  useEffect(() => {
    // Initial session check
    debouncedRefreshSession()

    // Set up auth state change listener
    try {
      const supabase = getSupabaseClientSafe()
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        console.log("Auth state changed:", _event, newSession ? "Session exists" : "No session")

        setSession(newSession)
        setUser(newSession?.user ?? null)

        // Force a router refresh to update server components
        router.refresh()
      })

      return () => {
        subscription?.unsubscribe()
      }
    } catch (error) {
      console.error("Error setting up auth listener:", error)
    }
  }, [debouncedRefreshSession, router])

  const signIn = async (email: string, password: string) => {
    try {
      const supabase = getSupabaseClientSafe()
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      // Update the session and user state immediately
      setSession(data.session)
      setUser(data.user)

      // Force a router refresh
      router.refresh()

      return { error: null }
    } catch (error: any) {
      console.error("Error signing in:", error)
      return { error: "An unexpected error occurred. Please try again." }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const supabase = getSupabaseClientSafe()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error: any) {
      console.error("Error signing up:", error)
      return { error: "An unexpected error occurred. Please try again." }
    }
  }

  const signOut = async () => {
    try {
      const supabase = getSupabaseClientSafe()
      await supabase.auth.signOut()

      // Clear the session and user state immediately
      setSession(null)
      setUser(null)

      // Force a router refresh
      router.refresh()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshSession: debouncedRefreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
