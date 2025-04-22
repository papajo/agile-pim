import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { SignInForm } from "@/components/auth/sign-in-form"
import { getSupabaseClientSafe } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

// Mock the dependencies
jest.mock("@/lib/supabase/client")
jest.mock("next/navigation")

describe("SignInForm Component", () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it("renders the sign-in form correctly", () => {
    render(<SignInForm />)

    expect(screen.getByText("Sign in to AgilePM")).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/Forgot password/i)).toBeInTheDocument()
  })

  it("handles form submission with valid credentials", async () => {
    const mockSignInWithPassword = jest.fn().mockResolvedValue({
      data: { session: { user: { id: "123" } } },
      error: null,
    })

    const mockSupabase = {
      auth: {
        signInWithPassword: mockSignInWithPassword,
      },
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<SignInForm redirectTo="/dashboard" />)

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    })

    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    })

    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }))

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      })
      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard")
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  it("displays an error message when sign-in fails", async () => {
    const mockSignInWithPassword = jest.fn().mockResolvedValue({
      data: {},
      error: { message: "Invalid login credentials" },
    })

    const mockSupabase = {
      auth: {
        signInWithPassword: mockSignInWithPassword,
      },
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<SignInForm />)

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    })

    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "wrongpassword" },
    })

    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }))

    await waitFor(() => {
      expect(screen.getByText("Invalid login credentials")).toBeInTheDocument()
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })

  it("shows loading state during form submission", async () => {
    // Create a promise that won't resolve immediately to test loading state
    let resolveSignIn: (value: any) => void
    const signInPromise = new Promise((resolve) => {
      resolveSignIn = resolve
    })

    const mockSignInWithPassword = jest.fn().mockReturnValue(signInPromise)

    const mockSupabase = {
      auth: {
        signInWithPassword: mockSignInWithPassword,
      },
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<SignInForm />)

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    })

    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    })

    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }))

    // Check for loading state
    expect(screen.getByText("Signing in...")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Signing in.../i })).toBeDisabled()

    // Resolve the promise
    resolveSignIn!({ data: { session: { user: { id: "123" } } }, error: null })
  })
})
