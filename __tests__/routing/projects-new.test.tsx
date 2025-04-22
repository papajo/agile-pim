import { render } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import NewProject from "@/app/projects/new/page"
import { describe, beforeEach, it, expect, jest } from "@jest/globals"

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(),
}))

jest.mock("@/lib/supabase/client", () => ({
  getSupabaseClientSafe: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    }),
  }),
}))

jest.mock("@/components/layout/header", () => ({
  Header: () => <div data-testid="header">Header</div>,
}))

describe("Projects New Route", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock router
    ;(useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
      refresh: jest.fn(),
    })

    // Mock auth
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { id: "user-123" },
      session: { user: { id: "user-123" } },
      isLoading: false,
      refreshSession: jest.fn().mockResolvedValue(undefined),
    })
  })

  it("renders the NewProject component", () => {
    const { container } = render(<NewProject />)
    expect(container).toBeTruthy()
  })

  it("exports the component as default", () => {
    expect(NewProject).toBeDefined()
    expect(typeof NewProject).toBe("function")
  })
})
