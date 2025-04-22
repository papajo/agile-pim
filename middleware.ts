import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function middleware(req: NextRequest) {
  try {
    // Skip middleware for public routes and static assets
    const publicRoutes = ["/", "/sign-in", "/sign-up", "/auth/callback", "/_next", "/api/auth", "/favicon.ico"]
    const isPublicRoute = publicRoutes.some(
      (route) => req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route),
    )
    const isStaticAsset =
      req.nextUrl.pathname.includes("/_next/") ||
      req.nextUrl.pathname.includes("/images/") ||
      req.nextUrl.pathname.includes("/fonts/") ||
      req.nextUrl.pathname.includes("/favicon.ico")

    if (isPublicRoute || isStaticAsset) {
      return NextResponse.next()
    }

    // Debug logging
    console.log(`Middleware processing: ${req.nextUrl.pathname}`)

    // Create a response object
    const res = NextResponse.next()

    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase environment variables are missing in middleware")
      return res
    }

    // Get the cookies from the request
    const cookies = req.cookies.getAll()
    const cookieHeader = cookies.map(({ name, value }) => `${name}=${value}`).join("; ")

    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
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

    // Check if the user is authenticated
    const { data, error } = await supabase.auth.getSession()

    // Log for debugging
    console.log(
      `Middleware auth check for: ${req.nextUrl.pathname}`,
      `Session: ${data.session ? "Found" : "Not found"}`,
      error ? `Error: ${error.message}` : "",
    )

    // If there's a session, set the auth cookie in the response
    if (data.session) {
      // Copy all cookies from the request to the response
      for (const { name, value, ...options } of req.cookies.getAll()) {
        res.cookies.set(name, value, options)
      }
      return res
    }

    // Special case for /projects/new - ensure it's properly handled
    if (req.nextUrl.pathname === "/projects/new") {
      console.log("Handling /projects/new route specifically")

      // If user is authenticated, allow access
      if (data.session) {
        return res
      }

      // If not authenticated, redirect to sign in
      const redirectUrl = new URL("/sign-in", req.url)
      redirectUrl.searchParams.set("redirect", "/projects/new")
      return NextResponse.redirect(redirectUrl)
    }

    // If accessing a protected route without authentication, redirect to sign in
    if (req.nextUrl.pathname.startsWith("/projects") || req.nextUrl.pathname.startsWith("/dashboard")) {
      const redirectUrl = new URL("/sign-in", req.url)
      redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // For other routes, just continue
    return res
  } catch (error) {
    console.error("Middleware error:", error)

    // In case of error, allow the request to continue
    // This prevents blocking access to the application due to auth errors
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
