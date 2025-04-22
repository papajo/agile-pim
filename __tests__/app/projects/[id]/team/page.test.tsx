import { render, screen, waitFor } from "@testing-library/react"
import ProjectTeamPage from "@/app/projects/[id]/team/page"
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

describe("ProjectTeamPage", () => {
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

    render(<ProjectTeamPage />)

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(`/sign-in?redirect=/projects/${projectId}/team`)
    })
  })

  it("renders loading state while checking authentication", () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      ...mockAuth,
      isLoading: true,
    })

    render(<ProjectTeamPage />)

    expect(screen.getByText("Checking authentication...")).toBeInTheDocument()
  })

  it("fetches project and team data when component mounts", async () => {
    const mockProject = {
      id: projectId,
      name: "Test Project",
      description: "Project description",
      owner_id: mockUser.id,
    }

    const mockTeamMembers = [
      {
        id: "member-1",
        name: "John Doe",
        role: "Product Owner",
        skills: ["Requirements", "Prioritization"],
        avatar_url: null,
        is_simulated: true,
      },
    ]

    const mockProjectSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockProject,
          error: null,
        }),
      }),
    })

    const mockTeamSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockTeamMembers,
          error: null,
        }),
      }),
    })

    const mockSupabase = {
      from: jest.fn().mockImplementation((table) => {
        if (table === "projects") {
          return { select: mockProjectSelect }
        }
        if (table === "team_members") {
          return { select: mockTeamSelect }
        }
        return { select: jest.fn() }
      }),
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<ProjectTeamPage />)

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("projects")
      expect(mockSupabase.from).toHaveBeenCalledWith("team_members")
      expect(mockProjectSelect).toHaveBeenCalled()
      expect(mockTeamSelect).toHaveBeenCalled()
    })
  })

  it("renders team members when data is loaded successfully", async () => {
    const mockProject = {
      id: projectId,
      name: "Test Project",
      description: "Project description",
      owner_id: mockUser.id,
    }

    const mockTeamMembers = [
      {
        id: "member-1",
        name: "John Doe",
        role: "Product Owner",
        skills: ["Requirements", "Prioritization"],
        avatar_url: null,
        is_simulated: true,
      },
    ]

    const mockProjectSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockProject,
          error: null,
        }),
      }),
    })

    const mockTeamSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockTeamMembers,
          error: null,
        }),
      }),
    })

    const mockSupabase = {
      from: jest.fn().mockImplementation((table) => {
        if (table === "projects") {
          return { select: mockProjectSelect }
        }
        if (table === "team_members") {
          return { select: mockTeamSelect }
        }
        return { select: jest.fn() }
      }),
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<ProjectTeamPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Project - Team")).toBeInTheDocument()
      expect(screen.getByText("John Doe")).toBeInTheDocument()
      expect(screen.getByText("Product Owner")).toBeInTheDocument()
      expect(screen.getByText("Requirements")).toBeInTheDocument()
      expect(screen.getByText("Simulated")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /View Profile/i })).toBeInTheDocument()
    })
  })

  it("renders empty state when no team members are available", async () => {
    const mockProject = {
      id: projectId,
      name: "Test Project",
      description: "Project description",
      owner_id: mockUser.id,
    }

    const mockProjectSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockProject,
          error: null,
        }),
      }),
    })

    const mockTeamSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    })

    const mockSupabase = {
      from: jest.fn().mockImplementation((table) => {
        if (table === "projects") {
          return { select: mockProjectSelect }
        }
        if (table === "team_members") {
          return { select: mockTeamSelect }
        }
        return { select: jest.fn() }
      }),
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<ProjectTeamPage />)

    await waitFor(() => {
      expect(screen.getByText("No team members yet")).toBeInTheDocument()
      expect(screen.getByText("Add team members to collaborate on this project")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Add First Team Member/i })).toBeInTheDocument()
    })
  })
})
