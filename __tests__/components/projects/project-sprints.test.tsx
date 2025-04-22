import { render, screen, waitFor } from "@testing-library/react"
import { ProjectSprints } from "@/components/projects/project-sprints"
import { getSupabaseClientSafe } from "@/lib/supabase/client"

// Mock the dependencies
jest.mock("@/lib/supabase/client")
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

describe("ProjectSprints Component", () => {
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

    render(<ProjectSprints projectId={projectId} />)

    expect(screen.getByRole("status")).toBeInTheDocument() // Loader component
  })

  it("renders error state when sprint fetching fails", async () => {
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Failed to fetch sprints" },
        }),
      }),
    })

    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: mockSelect,
      }),
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<ProjectSprints projectId={projectId} />)

    await waitFor(() => {
      expect(screen.getByText(/Error loading sprints/i)).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Try Again/i })).toBeInTheDocument()
    })
  })

  it("renders the sprints when data is loaded successfully", async () => {
    const mockSprints = [
      {
        id: "sprint-1",
        name: "Sprint 1",
        goal: "Complete user authentication",
        start_date: "2023-01-01T00:00:00Z",
        end_date: "2023-01-14T00:00:00Z",
        status: "completed",
        velocity_planned: 20,
        velocity_completed: 18,
      },
      {
        id: "sprint-2",
        name: "Sprint 2",
        goal: "Implement dashboard",
        start_date: "2023-01-15T00:00:00Z",
        end_date: "2023-01-28T00:00:00Z",
        status: "active",
        velocity_planned: 25,
        velocity_completed: 10,
      },
    ]

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockSprints,
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

    render(<ProjectSprints projectId={projectId} />)

    await waitFor(() => {
      expect(screen.getByText("Sprints")).toBeInTheDocument()
      expect(screen.getByText("Sprint 1")).toBeInTheDocument()
      expect(screen.getByText("Sprint 2")).toBeInTheDocument()
      expect(screen.getByText("Complete user authentication")).toBeInTheDocument()
      expect(screen.getByText("Implement dashboard")).toBeInTheDocument()

      // Check for status badges
      expect(screen.getByText("Completed")).toBeInTheDocument()
      expect(screen.getByText("Active")).toBeInTheDocument()

      // Check for velocity information
      expect(screen.getByText("18 / 20 points")).toBeInTheDocument()
      expect(screen.getByText("10 / 25 points")).toBeInTheDocument()

      // Check for view sprint buttons
      const viewSprintButtons = screen.getAllByRole("button", { name: /View Sprint/i })
      expect(viewSprintButtons.length).toBe(2)
    })
  })

  it("renders empty state when no sprints are available", async () => {
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

    render(<ProjectSprints projectId={projectId} />)

    await waitFor(() => {
      expect(screen.getByText("No sprints yet")).toBeInTheDocument()
      expect(screen.getByText("Create your first sprint to start tracking work")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Create First Sprint/i })).toBeInTheDocument()
    })
  })
})
