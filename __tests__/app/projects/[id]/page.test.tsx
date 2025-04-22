import { render, screen, waitFor } from "@testing-library/react"
import ProjectDetail from "@/app/projects/[id]/page"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClientSafe } from "@/lib/supabase/client"

// Mock the dependencies
jest.mock("next/navigation")
jest.mock("@/contexts/auth-context")
jest.mock("@/lib/supabase/client")
jest.mock("@/components/layout/header", () => ({
  Header: () => <div data-testid="header">Header</div>,
}))
jest.mock("@/components/projects/project-sidebar", () => ({
  ProjectSidebar: () => <div data-testid="project-sidebar">Project Sidebar</div>,
}))
jest.mock("@/components/projects/project-board", () => ({
  ProjectBoard: () => <div data-testid="project-board">Project Board</div>,
}))
jest.mock("@/components/projects/project-overview", () => ({
  ProjectOverview: () => <div data-testid="project-overview">Project Overview</div>,
}))
jest.mock("@/components/projects/project-team", () => ({
  ProjectTeam: () => <div data-testid="project-team">Project Team</div>,
}))
jest.mock("@/components/projects/project-sprints", () => ({
  ProjectSprints: () => <div data-testid="project-sprints">Project Sprints</div>,
}))
jest.mock("@/components/projects/project-settings", () => ({
  ProjectSettings: () => <div data-testid="project-settings">Project Settings</div>,
}))

describe("ProjectDetail Page", () => {
  const projectId = "test-project-id"

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
    refreshSession: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useParams as jest.Mock).mockReturnValue({ id: projectId })
    ;(useAuth as jest.Mock).mockReturnValue(mockAuth)
  })

  it("redirects to sign in if user is not authenticated", async () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      ...mockAuth,
      user: null,
      session: null,
    })

    render(<ProjectDetail />)

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(`/sign-in?redirect=/projects/${projectId}`)
    })
  })

  it("renders loading state while checking authentication", () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      ...mockAuth,
      isLoading: true,
    })

    render(<ProjectDetail />)

    expect(screen.getByText("Checking authentication...")).toBeInTheDocument()
  })

  it("fetches project data when component mounts", async () => {
    const mockProject = {
      id: projectId,
      name: "Test Project",
      description: "Project description",
      owner_id: mockUser.id,
    }

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockProject,
          error: null,
        }),
      }),
    })

    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: mockSelect,
      }),
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<ProjectDetail />)

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("projects")
      expect(mockSelect).toHaveBeenCalled()
    })
  })

  it("renders project details when data is loaded successfully", async () => {
    const mockProject = {
      id: projectId,
      name: "Test Project",
      description: "Project description",
      owner_id: mockUser.id,
    }

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockProject,
          error: null,
        }),
      }),
    })

    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: mockSelect,
      }),
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<ProjectDetail />)

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument()
      expect(screen.getByText("Project description")).toBeInTheDocument()
      expect(screen.getByTestId("project-sidebar")).toBeInTheDocument()
      expect(screen.getByText("Board")).toBeInTheDocument()
      expect(screen.getByText("Overview")).toBeInTheDocument()
      expect(screen.getByText("Team")).toBeInTheDocument()
      expect(screen.getByText("Sprints")).toBeInTheDocument()
      expect(screen.getByText("Settings")).toBeInTheDocument()
    })
  })

  it("renders error state when project fetching fails", async () => {
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Project not found" },
        }),
      }),
    })

    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: mockSelect,
      }),
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<ProjectDetail />)

    await waitFor(() => {
      expect(screen.getByText("Project not found or you don't have access to it.")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Go to Dashboard/i })).toBeInTheDocument()
    })
  })

  it("checks user access to the project", async () => {
    const mockProject = {
      id: projectId,
      name: "Test Project",
      description: "Project description",
      owner_id: "different-user-id", // Different from the logged-in user
    }

    const mockProjectSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockProject,
          error: null,
        }),
      }),
    })

    const mockRoleSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { role: "member" },
            error: null,
          }),
        }),
      }),
    })

    const mockSupabase = {
      from: jest.fn().mockImplementation((table) => {
        if (table === "projects") {
          return { select: mockProjectSelect }
        }
        if (table === "project_user_roles") {
          return { select: mockRoleSelect }
        }
        return { select: jest.fn() }
      }),
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<ProjectDetail />)

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("project_user_roles")
      expect(mockRoleSelect).toHaveBeenCalled()
      expect(screen.getByText("Test Project")).toBeInTheDocument()
    })
  })
})
