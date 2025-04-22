import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const next = requestUrl.searchParams.get("next") || "/"

    if (code) {
      const cookieStore = cookies()

      // Get cookies as a simple object
      const cookieObj: Record<string, string> = {}
      cookieStore.getAll().forEach((cookie) => {
        cookieObj[cookie.name] = cookie.value
      })

      // Create a Supabase client with cookie auth
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
          },
          global: {
            headers: {
              cookie: Object.entries(cookieObj)
                .map(([name, value]) => `${name}=${value}`)
                .join("; "),
            },
          },
        },
      )

      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=Authentication failed`)
      }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${requestUrl.origin}${next}`)
  } catch (error) {
    console.error("Error in auth callback:", error)
    return NextResponse.redirect(`${new URL(request.url).origin}/sign-in?error=Authentication failed`)
  }
}
