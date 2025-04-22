import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    // Check if the user is authenticated
    const { session } = await getServerSession()

    // If not authenticated, redirect to sign in
    if (!session) {
      const redirectUrl = new URL("/sign-in", request.url)
      redirectUrl.searchParams.set("redirect", "/projects/new")
      return NextResponse.redirect(redirectUrl)
    }

    // If authenticated, continue to the page
    return NextResponse.next()
  } catch (error) {
    console.error("Error in /projects/new route handler:", error)

    // In case of error, return a simple error response
    return new NextResponse(JSON.stringify({ error: "Failed to process authentication" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
