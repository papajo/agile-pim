import { render, screen } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClientSafe } from "@/lib/supabase/client"
import NewProject from "@/app/projects/new/page"

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(),
}))

jest.mock("@/lib/supabase/client", () => ({
  getSupabaseClientSafe: jest.fn(),
}))

jest.mock("@/components/layout/header", () => ({
  Header: () => <div data-testid="header">Header</div>,
}))

// Mock the server action
jest.mock("@/app/projects/actions", () => ({
  createProject: jest.fn(),
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

    // Mock Supabase client
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [
              {
                id: "software-template",
                name: "Software Development",
                description: "Agile software development project",
                methodology: "scrum",
                default_sprint_length: 14,
              },
            ],
            error: null,
          }),
        }),
      }),
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)
  })

  it("renders the NewProject component", async () => {
    render(<NewProject />)

    // Wait for templates to load
    await screen.findByText("Software Development")

    // Check that the page renders correctly
    expect(screen.getByText("Create New Project")).toBeInTheDocument()
    expect(screen.getByText("Choose Template")).toBeInTheDocument()
    expect(screen.getByText("Custom Project")).toBeInTheDocument()
  })

  it("exports the component as default", () => {
    expect(NewProject).toBeDefined()
    expect(typeof NewProject).toBe("function")
  })
})
