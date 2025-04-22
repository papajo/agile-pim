"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserProfile } from "@/components/auth/user-profile"
import { BookOpen, Home, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { getSupabaseClientSafe } from "@/lib/supabase/client"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = getSupabaseClientSafe()
        const { data } = await supabase.auth.getSession()
        setIsLoggedIn(!!data.session)
      } catch (error) {
        console.warn("Error checking auth:", error)
        setIsLoggedIn(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Set up auth state change listener
    try {
      const supabase = getSupabaseClientSafe()
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsLoggedIn(!!session)
      })

      return () => {
        subscription?.unsubscribe()
      }
    } catch (error) {
      console.warn("Error setting up auth listener:", error)
    }
  }, [])

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            AgilePM
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Home className="h-4 w-4 mr-1 inline-block" />
              Home
            </Link>
            {!isLoading && isLoggedIn && (
              <Link
                href="/projects"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname?.startsWith("/projects") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Projects
              </Link>
            )}
            <Link
              href="/learning"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname?.startsWith("/learning") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4 mr-1 inline-block" />
              Learning
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {!isLoading && isLoggedIn && (
            <Button size="sm" asChild>
              <Link href="/projects/new">
                <Plus className="h-4 w-4 mr-1" />
                New Project
              </Link>
            </Button>
          )}
          <UserProfile />
        </div>
      </div>
    </header>
  )
}
