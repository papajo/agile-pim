import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { UserProfile } from "@/components/auth/user-profile"
import { getSupabaseClientSafe } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

// Mock the dependencies
jest.mock("@/lib/supabase/client")
jest.mock("next/navigation")

describe("UserProfile Component", () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it("renders sign in and sign up buttons when user is not authenticated", async () => {
    const mockGetUser = jest.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const mockOnAuthStateChange = jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })

    const mockSupabase = {
      auth: {
        getUser: mockGetUser,
        onAuthStateChange: mockOnAuthStateChange,
      },
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<UserProfile />)

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /Sign In/i })).toBeInTheDocument()
      expect(screen.getByRole("link", { name: /Sign Up/i })).toBeInTheDocument()
    })
  })

  it("renders user dropdown when user is authenticated", async () => {
    const mockGetUser = jest.fn().mockResolvedValue({
      data: { user: { id: "123", email: "test@example.com" } },
      error: null,
    })

    const mockOnAuthStateChange = jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })

    const mockSupabase = {
      auth: {
        getUser: mockGetUser,
        onAuthStateChange: mockOnAuthStateChange,
      },
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<UserProfile />)

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument()
    })

    // Open the dropdown
    fireEvent.click(screen.getByRole("button"))

    // Check dropdown content
    await waitFor(() => {
      expect(screen.getByText("test@example.com")).toBeInTheDocument()
      expect(screen.getByText("Dashboard")).toBeInTheDocument()
      expect(screen.getByText("Settings")).toBeInTheDocument()
      expect(screen.getByText("Sign out")).toBeInTheDocument()
    })
  })

  it("handles sign out correctly", async () => {
    const mockGetUser = jest.fn().mockResolvedValue({
      data: { user: { id: "123", email: "test@example.com" } },
      error: null,
    })

    const mockSignOut = jest.fn().mockResolvedValue({ error: null })

    const mockOnAuthStateChange = jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })

    const mockSupabase = {
      auth: {
        getUser: mockGetUser,
        signOut: mockSignOut,
        onAuthStateChange: mockOnAuthStateChange,
      },
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<UserProfile />)

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument()
    })

    // Open the dropdown
    fireEvent.click(screen.getByRole("button"))

    // Click sign out
    await waitFor(() => {
      fireEvent.click(screen.getByText("Sign out"))
    })

    // Check if sign out was called
    expect(mockSignOut).toHaveBeenCalled()
    expect(mockRouter.push).toHaveBeenCalledWith("/")
    expect(mockRouter.refresh).toHaveBeenCalled()
  })
})
