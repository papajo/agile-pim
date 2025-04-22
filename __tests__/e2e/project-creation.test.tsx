/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClientSafe } from "@/lib/supabase/client"
import { createProject } from "@/app/projects/actions"
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

describe("End-to-End Project Creation Flow", () => {
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

  it("completes the full project creation flow with template", async () => {
    render(<NewProject />)

    // Wait for templates to load
    await waitFor(() => {
      expect(screen.getByText("Software Development")).toBeInTheDocument()
    })

    // 1. Select a template
    fireEvent.click(screen.getByText("Software Development"))

    // 2. Fill out the project details form
    fireEvent.change(screen.getByLabelText("Project Name"), {
      target: { value: "My New Software Project" },
    })

    fireEvent.change(screen.getByLabelText("Project Description"), {
      target: { value: "This is a test project for software development" },
    })

    // 3. Select sprint length
    const sprintLengthTrigger = screen.getByText("2 Weeks")
    fireEvent.click(sprintLengthTrigger)

    // Wait for dropdown to open
    await waitFor(() => {
      const threeWeeksOption = screen.getByText("3 Weeks")
      fireEvent.click(threeWeeksOption)
    })

    // 4. Select team size
    fireEvent.click(screen.getByLabelText("Medium (6-10)"))

    // 5. Submit the form
    fireEvent.click(screen.getByRole("button", { name: "Create Project" }))

    // 6. Verify form submission
    await waitFor(() => {
      expect(createProject).toHaveBeenCalledWith(expect.any(FormData))
      expect(mockRouter.push).toHaveBeenCalledWith("/projects/new-project-id")
    })
  })

  it("completes the full project creation flow with custom project", async () => {
    render(<NewProject />)

    // Wait for templates to load
    await waitFor(() => {
      expect(screen.getByText("Custom Project")).toBeInTheDocument()
    })

    // 1. Switch to custom project tab
    fireEvent.click(screen.getByText("Custom Project"))

    // 2. Fill out the custom project form
    fireEvent.change(screen.getByLabelText(/Project Name/i, { selector: "#custom-name" }), {
      target: { value: "My Custom Project" },
    })

    fireEvent.change(screen.getByLabelText(/Project Description/i, { selector: "#custom-description" }), {
      target: { value: "This is a custom project with specific settings" },
    })

    // 3. Select methodology
    const methodologyTrigger = screen.getByText("Scrum")
    fireEvent.click(methodologyTrigger)

    // Wait for dropdown to open
    await waitFor(() => {
      const kanbanOption = screen.getByText("Kanban")
      fireEvent.click(kanbanOption)
    })

    // 4. Select team size
    fireEvent.click(screen.getByLabelText("Large (11+)", { selector: "#custom-large" }))

    // 5. Submit the form
    fireEvent.click(screen.getByRole("button", { name: "Create Custom Project" }))

    // 6. Verify form submission
    await waitFor(() => {
      expect(createProject).toHaveBeenCalledWith(expect.any(FormData))
      expect(mockRouter.push).toHaveBeenCalledWith("/projects/new-project-id")
    })
  })

  it("handles errors during project creation", async () => {
    // Mock error response
    ;(createProject as jest.Mock).mockResolvedValue({ error: "Failed to create project" })

    render(<NewProject />)

    // Wait for templates to load
    await waitFor(() => {
      expect(screen.getByText("Software Development")).toBeInTheDocument()
    })

    // 1. Select a template
    fireEvent.click(screen.getByText("Software Development"))

    // 2. Fill out minimal required fields
    fireEvent.change(screen.getByLabelText("Project Name"), {
      target: { value: "Error Test Project" },
    })

    // 3. Submit the form
    fireEvent.click(screen.getByRole("button", { name: "Create Project" }))

    // 4. Verify error handling
    await waitFor(() => {
      expect(screen.getByText("Failed to create project")).toBeInTheDocument()
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })
})
