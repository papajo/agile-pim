import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import NewProject from "@/app/projects/new/page"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClientSafe } from "@/lib/supabase/client"
import { createProject } from "@/app/projects/actions"

// Mock the dependencies
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

describe("NewProject Page", () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  }

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
  }

  const mockAuth = {
    user: mockUser,
    session: { user: mockUser },
    isLoading: false,
    refreshSession: jest.fn().mockResolvedValue(undefined),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useAuth as jest.Mock).mockReturnValue(mockAuth)

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
              {
                id: "marketing-template",
                name: "Marketing Campaign",
                description: "Agile marketing project",
                methodology: "kanban",
                default_sprint_length: 14,
              },
              {
                id: "event-template",
                name: "Event Planning",
                description: "Agile event management",
                methodology: "scrumban",
                default_sprint_length: 14,
              },
            ],
            error: null,
          }),
        }),
      }),
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    // Mock createProject server action
    ;(createProject as jest.Mock).mockResolvedValue({ projectId: "new-project-id" })
  })

  it("redirects to sign in if user is not authenticated", async () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      ...mockAuth,
      user: null,
      session: null,
    })

    render(<NewProject />)

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/sign-in?redirect=/projects/new")
    })
  })

  it("renders loading state while checking authentication", () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      ...mockAuth,
      isLoading: true,
    })

    render(<NewProject />)

    expect(screen.getByText("Checking authentication...")).toBeInTheDocument()
  })

  it("renders template selection and custom project tabs", async () => {
    render(<NewProject />)

    await waitFor(() => {
      expect(screen.getByText("Choose Template")).toBeInTheDocument()
      expect(screen.getByText("Custom Project")).toBeInTheDocument()
      expect(screen.getByText("Software Development")).toBeInTheDocument()
      expect(screen.getByText("Marketing Campaign")).toBeInTheDocument()
      expect(screen.getByText("Event Planning")).toBeInTheDocument()
    })
  })

  it("handles template selection", async () => {
    render(<NewProject />)

    await waitFor(() => {
      // Click on the template card
      fireEvent.click(screen.getByText("Software Development"))
    })

    // Project details form should appear
    expect(screen.getByText("Project Details")).toBeInTheDocument()
    expect(screen.getByLabelText("Project Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Project Description")).toBeInTheDocument()
    expect(screen.getByLabelText("Sprint Length")).toBeInTheDocument()
    expect(screen.getByLabelText("Team Size")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Create Project/i })).toBeInTheDocument()
  })

  it("handles form submission with template selection", async () => {
    render(<NewProject />)

    await waitFor(() => {
      // Click on the template card
      fireEvent.click(screen.getByText("Software Development"))
    })

    // Fill the form
    fireEvent.change(screen.getByLabelText("Project Name"), {
      target: { value: "New Test Project" },
    })

    fireEvent.change(screen.getByLabelText("Project Description"), {
      target: { value: "Project description" },
    })

    // Submit the form
    fireEvent.submit(screen.getByRole("button", { name: /Create Project/i }).closest("form")!)

    await waitFor(() => {
      expect(createProject).toHaveBeenCalled()
      expect(mockRouter.push).toHaveBeenCalledWith("/projects/new-project-id")
    })
  })

  it("handles form submission errors", async () => {
    ;(createProject as jest.Mock).mockResolvedValue({ error: "Failed to create project" })

    render(<NewProject />)

    await waitFor(() => {
      // Click on the template card
      fireEvent.click(screen.getByText("Software Development"))
    })

    // Fill the form
    fireEvent.change(screen.getByLabelText("Project Name"), {
      target: { value: "New Test Project" },
    })

    // Submit the form
    fireEvent.submit(screen.getByRole("button", { name: /Create Project/i }).closest("form")!)

    await waitFor(() => {
      expect(createProject).toHaveBeenCalled()
      expect(screen.getByText("Failed to create project")).toBeInTheDocument()
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })

  it("switches to custom project tab", async () => {
    render(<NewProject />)

    // Click on the Custom Project tab
    fireEvent.click(screen.getByText("Custom Project"))

    expect(screen.getByText("Create a project from scratch")).toBeInTheDocument()
    expect(screen.getByLabelText("Agile Methodology")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Create Custom Project/i })).toBeInTheDocument()
  })

  it("handles form submission from custom project tab", async () => {
    render(<NewProject />)

    // Click on the Custom Project tab
    fireEvent.click(screen.getByText("Custom Project"))

    // Fill the form
    fireEvent.change(screen.getByLabelText(/Project Name/i, { selector: "#custom-name" }), {
      target: { value: "Custom Test Project" },
    })

    // Submit the form
    fireEvent.submit(screen.getByRole("button", { name: /Create Custom Project/i }).closest("form")!)

    await waitFor(() => {
      expect(createProject).toHaveBeenCalled()
      expect(mockRouter.push).toHaveBeenCalledWith("/projects/new-project-id")
    })
  })
})
