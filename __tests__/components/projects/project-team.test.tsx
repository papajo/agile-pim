import { render, screen, waitFor } from "@testing-library/react"
import { ProjectTeam } from "@/components/projects/project-team"
import { getSupabaseClientSafe } from "@/lib/supabase/client"

// Mock the dependencies
jest.mock("@/lib/supabase/client")
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

describe("ProjectTeam Component", () => {
  const projectId = "test-project-id"

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders loading state initially", () => {
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue(new Promise(() => {})), // Never resolves to keep loading
      }),
    })

    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: mockSelect,
      }),
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<ProjectTeam projectId={projectId} />)

    expect(screen.getByRole("status")).toBeInTheDocument() // Loader component
  })

  it("renders error state when team fetching fails", async () => {
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Failed to fetch team members" },
        }),
      }),
    })

    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: mockSelect,
      }),
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<ProjectTeam projectId={projectId} />)

    await waitFor(() => {
      expect(screen.getByText(/Error loading team members/i)).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Try Again/i })).toBeInTheDocument()
    })
  })

  it("renders the team members when data is loaded successfully", async () => {
    const mockTeamMembers = [
      {
        id: "member-1",
        name: "John Doe",
        role: "Product Owner",
        skills: ["Requirements", "Prioritization"],
        avatar_url: null,
        is_simulated: true,
      },
      {
        id: "member-2",
        name: "Jane Smith",
        role: "Developer",
        skills: ["Frontend", "Backend"],
        avatar_url: null,
        is_simulated: false,
      },
    ]

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockTeamMembers,
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

    render(<ProjectTeam projectId={projectId} />)

    await waitFor(() => {
      expect(screen.getByText("Project Team")).toBeInTheDocument()
      expect(screen.getByText("John Doe")).toBeInTheDocument()
      expect(screen.getByText("Jane Smith")).toBeInTheDocument()
      expect(screen.getByText("Product Owner")).toBeInTheDocument()
      expect(screen.getByText("Developer")).toBeInTheDocument()

      // Check for skills
      expect(screen.getByText("Requirements")).toBeInTheDocument()
      expect(screen.getByText("Frontend")).toBeInTheDocument()

      // Check for simulated badge
      expect(screen.getByText("Simulated")).toBeInTheDocument()

      // Check for view profile buttons
      const viewProfileButtons = screen.getAllByRole("button", { name: /View Profile/i })
      expect(viewProfileButtons.length).toBe(2)
    })
  })

  it("renders empty state when no team members are available", async () => {
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: [],
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

    render(<ProjectTeam projectId={projectId} />)

    await waitFor(() => {
      expect(screen.getByText("No team members yet")).toBeInTheDocument()
      expect(screen.getByText("Add team members to collaborate on this project")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Add First Team Member/i })).toBeInTheDocument()
    })
  })
})
