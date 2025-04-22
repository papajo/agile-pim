"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Settings, User } from "lucide-react"
import { useState, useEffect } from "react"
import { getSupabaseClientSafe } from "@/lib/supabase/client"

export function UserProfile() {
  const [user, setUser] = useState<any>(null)
  const [loading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = getSupabaseClientSafe()
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
      } catch (error) {
        console.warn("Error checking user:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    // Set up auth state change listener
    try {
      const supabase = getSupabaseClientSafe()
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })

      return () => {
        subscription?.unsubscribe()
      }
    } catch (error) {
      console.warn("Error setting up auth listener:", error)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      const supabase = getSupabaseClientSafe()
      await supabase.auth.signOut()
      setUser(null)
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return (
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-muted">...</AvatarFallback>
      </Avatar>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </div>
    )
  }

  // Get user initials for avatar
  const userInitials = user.email
    ? user.email
        .split("@")[0]
        .split(".")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.email && <p className="font-medium">{user.email}</p>}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <User className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(event) => {
            event.preventDefault()
            handleSignOut()
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
