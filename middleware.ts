import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Function to create Supabase client (avoids repetition)
const getSupabaseMiddlewareClient = (req: NextRequest) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase environment variables are missing in middleware")
    return null // Indicate failure
  }

  const cookies = req.cookies.getAll()
  const cookieHeader = cookies.map(({ name, value }) => `${name}=${value}`).join("; ")

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        cookie: cookieHeader,
      },
    },
  })
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const res = NextResponse.next() // Start with a pass-through response

  try {
    // Define public routes and patterns for static assets/API
    const publicRoutes = ["/", "/sign-in", "/sign-up", "/auth/callback"]
    const isApiAuthRoute = pathname.startsWith("/api/auth")
    const isStaticAsset = /\.(.*)$/.test(pathname) || pathname.startsWith("/_next")

    // Skip middleware for public routes, static assets, and specific API routes
    if (publicRoutes.includes(pathname) || isApiAuthRoute || isStaticAsset) {
      return res // Allow request
    }

    console.log(`Middleware processing protected route: ${pathname}`)

    const supabase = getSupabaseMiddlewareClient(req)

    if (!supabase) {
      // If Supabase client failed to initialize, block access to protected routes
      console.error("Middleware: Supabase client init failed. Blocking access.")
      const errorUrl = new URL("/sign-in", req.url) // Redirect to sign-in as a fallback
      errorUrl.searchParams.set("error", "Configuration error")
      return NextResponse.redirect(errorUrl)
    }

    // Check user session
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error(`Middleware auth error for ${pathname}:`, error.message)
      // If there's an error checking the session, redirect to sign-in with an error
      const errorUrl = new URL("/sign-in", req.url)
      errorUrl.searchParams.set("error", "Authentication check failed")
      errorUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(errorUrl)
    }

    // Log session status
    console.log(`Middleware auth check for: ${pathname}`, `Session: ${data.session ? "Found" : "Not found"}`)

    // If session exists, allow the request
    if (data.session) {
      // Note: Cookies are automatically passed in Next.js >= 13.4 middleware responses
      return res
    }

    // --- No session found ---
    // Redirect to sign-in page, preserving the intended destination
    console.log(`Middleware: No session found for ${pathname}. Redirecting to sign-in.`)
    const redirectUrl = new URL("/sign-in", req.url)
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error("Unexpected Middleware error:", error)
    // --- Improved Catch Block ---
    // Redirect to a generic error page or sign-in page in case of unexpected errors
    const errorUrl = new URL("/sign-in", req.url)
    errorUrl.searchParams.set("error", "An unexpected error occurred during authentication")
    errorUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(errorUrl)
    // --- End Improvement ---
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets (assuming they are served directly or via /public path)
     * Matcher needs to be efficient. Avoid overly complex regex if possible.
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
