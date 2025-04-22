import { type NextRequest, NextResponse } from "next/server"
import { middleware } from "@/middleware"
import { createClient } from "@supabase/supabase-js"
import { describe, beforeEach, it, expect, jest } from "@jest/globals"

// Mock dependencies
jest.mock("next/server", () => {
  const originalModule = jest.requireActual("next/server")
  return {
    ...originalModule,
    NextResponse: {
      next: jest.fn().mockReturnValue({ cookies: { set: jest.fn() } }),
      redirect: jest.fn().mockImplementation((url) => ({ url })),
    },
  }
})

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}))

describe("Route Handler", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co"
    process.env.SUPABASE_ANON_KEY = "test-key"
  })

  it("allows access to /projects/new when authenticated", async () => {
    // Mock authenticated session
    ;(createClient as jest.Mock).mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { id: "user-123" } } },
          error: null,
        }),
      },
    })

    // Create mock request
    const req = {
      nextUrl: {
        pathname: "/projects/new",
      },
      cookies: {
        getAll: jest.fn().mockReturnValue([{ name: "supabase-auth-token", value: "token", options: {} }]),
      },
    } as unknown as NextRequest

    // Call middleware
    await middleware(req)

    // Verify response
    expect(NextResponse.next).toHaveBeenCalled()
    expect(NextResponse.redirect).not.toHaveBeenCalled()
  })

  it("redirects from /projects/new to sign-in when not authenticated", async () => {
    // Mock unauthenticated session
    ;(createClient as jest.Mock).mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
      },
    })

    // Create mock request with URL
    const req = {
      nextUrl: {
        pathname: "/projects/new",
      },
      url: "http://localhost:3000/projects/new",
      cookies: {
        getAll: jest.fn().mockReturnValue([]),
      },
    } as unknown as NextRequest

    // Call middleware
    await middleware(req)

    // Verify redirect
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: "/sign-in",
      }),
    )
  })
})
