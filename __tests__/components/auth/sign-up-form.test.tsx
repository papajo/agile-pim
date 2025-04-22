import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { getSupabaseClientSafe } from "@/lib/supabase/client"

// Mock the dependencies
jest.mock("@/lib/supabase/client")

describe("SignUpForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock window.location.origin
    Object.defineProperty(window, "location", {
      value: {
        origin: "http://localhost:3000",
      },
      writable: true,
    })
  })

  it("renders the sign-up form correctly", () => {
    render(<SignUpForm />)

    expect(screen.getByText("Create an account")).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Sign up/i })).toBeInTheDocument()
    expect(screen.getByText(/Password must be at least 8 characters long/i)).toBeInTheDocument()
  })

  it("handles form submission with valid credentials", async () => {
    const mockSignUp = jest.fn().mockResolvedValue({
      error: null,
    })

    const mockSupabase = {
      auth: {
        signUp: mockSignUp,
      },
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<SignUpForm />)

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    })

    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    })

    fireEvent.click(screen.getByRole("button", { name: /Sign up/i }))

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: {
          emailRedirectTo: "http://localhost:3000/auth/callback",
        },
      })
      expect(screen.getByText(/Registration successful/i)).toBeInTheDocument()
    })
  })

  it("displays an error message when sign-up fails", async () => {
    const mockSignUp = jest.fn().mockResolvedValue({
      error: { message: "Email already registered" },
    })

    const mockSupabase = {
      auth: {
        signUp: mockSignUp,
      },
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<SignUpForm />)

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "existing@example.com" },
    })

    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    })

    fireEvent.click(screen.getByRole("button", { name: /Sign up/i }))

    await waitFor(() => {
      expect(screen.getByText("Email already registered")).toBeInTheDocument()
      expect(screen.queryByText(/Registration successful/i)).not.toBeInTheDocument()
    })
  })

  it("shows loading state during form submission", async () => {
    // Create a promise that won't resolve immediately to test loading state
    let resolveSignUp: (value: any) => void
    const signUpPromise = new Promise((resolve) => {
      resolveSignUp = resolve
    })

    const mockSignUp = jest.fn().mockReturnValue(signUpPromise)

    const mockSupabase = {
      auth: {
        signUp: mockSignUp,
      },
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<SignUpForm />)

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    })

    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    })

    fireEvent.click(screen.getByRole("button", { name: /Sign up/i }))

    // Check for loading state
    expect(screen.getByText("Creating account...")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Creating account.../i })).toBeDisabled()

    // Resolve the promise
    resolveSignUp!({ error: null })
  })
})
