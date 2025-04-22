"use client"
import { render, screen, waitFor, act } from "@testing-library/react"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { getSupabaseClientSafe } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"

// Mock the dependencies
jest.mock("@/lib/supabase/client")
jest.mock("next/navigation")

// Test component that uses the auth context
const TestComponent = () => {
  const { user, isLoading, signIn, signOut } = useAuth()

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : user ? (
        <div>
          <div>Logged in as: {user.email}</div>
          <button onClick={() => signOut()}>Sign Out</button>
        </div>
      ) : (
        <div>
          <div>Not logged in</div>
          <button onClick={() => signIn("test@example.com", "password")}>Sign In</button>
        </div>
      )}
    </div>
  )
}

describe("AuthContext", () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(usePathname as jest.Mock).mockReturnValue("/")
  })

  it("provides loading state initially", async () => {
    // Mock getSession to never resolve to keep loading state
    const mockGetSession = jest.fn().mockReturnValue(new Promise(() => {}))

    const mockSupabase = {
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: jest.fn().mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } },
        }),
      },
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("provides user when authenticated", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
    }

    const mockGetSession = jest.fn().mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    })

    const mockGetUser = jest.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const mockOnAuthStateChange = jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })

    const mockSupabase = {
      auth: {
        getSession: mockGetSession,
        getUser: mockGetUser,
        onAuthStateChange: mockOnAuthStateChange,
      },
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText(`Logged in as: ${mockUser.email}`)).toBeInTheDocument()
    })
  })

  it("provides null user when not authenticated", async () => {
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

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })
  })

  it("handles sign in", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
    }

    const mockSignInWithPassword = jest.fn().mockResolvedValue({
      data: { session: { user: mockUser }, user: mockUser },
      error: null,
    })

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
        signInWithPassword: mockSignInWithPassword,
        onAuthStateChange: mockOnAuthStateChange,
      },
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    // Click sign in button
    act(() => {
      screen.getByText("Sign In").click()
    })

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password",
      })
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  it("handles sign out", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
    }

    const mockGetSession = jest.fn().mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    })

    const mockGetUser = jest.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const mockSignOut = jest.fn().mockResolvedValue({
      error: null,
    })

    const mockOnAuthStateChange = jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })

    const mockSupabase = {
      auth: {
        getSession: mockGetSession,
        getUser: mockGetUser,
        signOut: mockSignOut,
        onAuthStateChange: mockOnAuthStateChange,
      },
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText(`Logged in as: ${mockUser.email}`)).toBeInTheDocument()
    })

    // Click sign out button
    act(() => {
      screen.getByText("Sign Out").click()
    })

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockRouter.refresh).toHaveBeenCalled()
      expect(mockRouter.push).toHaveBeenCalledWith("/")
    })
  })

  it("redirects to sign in for protected routes when not authenticated", async () => {
    ;(usePathname as jest.Mock).mockReturnValue("/projects/123")

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

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/sign-in?redirect=/projects/123")
    })
  })
})
