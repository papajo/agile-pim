import { render, screen, waitFor } from "@testing-library/react"
import { Header } from "@/components/layout/header"
import { getSupabaseClientSafe } from "@/lib/supabase/client"
import { usePathname } from "next/navigation"

// Mock the dependencies
jest.mock("@/lib/supabase/client")
jest.mock("next/navigation")
jest.mock("@/components/auth/user-profile", () => ({
  UserProfile: () => <div data-testid="user-profile">User Profile</div>,
}))

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePathname as jest.Mock).mockReturnValue("/")
  })

  it("renders the header with logo and navigation links", async () => {
    const mockGetSession = jest.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    })

    const mockOnAuthStateChange = jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })

    const mockSupabase = {
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
      },
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<Header />)

    // Check for logo and basic navigation
    expect(screen.getByText("AgilePM")).toBeInTheDocument()
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Learning")).toBeInTheDocument()

    // Check for user profile component
    expect(screen.getByTestId("user-profile")).toBeInTheDocument()

    // Projects link should not be visible when not logged in
    await waitFor(() => {
      expect(screen.queryByText("Projects")).not.toBeInTheDocument()
    })
  })

  it("shows Projects link when user is authenticated", async () => {
    const mockGetSession = jest.fn().mockResolvedValue({
      data: { session: { user: { id: "123" } } },
      error: null,
    })

    const mockOnAuthStateChange = jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })

    const mockSupabase = {
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
      },
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<Header />)

    // Projects link should be visible when logged in
    await waitFor(() => {
      expect(screen.getByText("Projects")).toBeInTheDocument()
    })

    // New Project button should also be visible
    expect(screen.getByText("New Project")).toBeInTheDocument()
  })

  it("highlights the active navigation link based on pathname", async () => {
    ;(usePathname as jest.Mock).mockReturnValue("/learning")

    const mockGetSession = jest.fn().mockResolvedValue({
      data: { session: { user: { id: "123" } } },
      error: null,
    })

    const mockOnAuthStateChange = jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })

    const mockSupabase = {
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
      },
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<Header />)

    // Wait for auth check to complete
    await waitFor(() => {
      const learningLink = screen.getByText("Learning")
      // Check if the Learning link has the active class (text-primary)
      expect(learningLink.className).toContain("text-primary")

      const homeLink = screen.getByText("Home")
      // Home link should not have the active class
      expect(homeLink.className).not.toContain("text-primary")
    })
  })
})
