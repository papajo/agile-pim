import { render, screen, waitFor } from "@testing-library/react"
import { ProjectBoard } from "@/components/projects/project-board"
import { getSupabaseClientSafe } from "@/lib/supabase/client"

// Mock the dependencies
jest.mock("@/lib/supabase/client")
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

describe("ProjectBoard Component", () => {
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

    render(<ProjectBoard projectId={projectId} />)

    expect(screen.getByText(/Loading tasks.../i)).toBeInTheDocument()
    expect(screen.getByRole("status")).toBeInTheDocument() // Loader component
  })

  it("renders error state when task fetching fails", async () => {
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Failed to fetch tasks" },
        }),
      }),
    })

    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: mockSelect,
      }),
    }
    ;(getSupabaseClientSafe as jest.Mock).mockReturnValue(mockSupabase)

    render(<ProjectBoard projectId={projectId} />)

    await waitFor(() => {
      expect(screen.getByText(/Error loading tasks/i)).toBeInTheDocument()
      expect(screen.getByText(/Failed to load tasks/i)).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Try Again/i })).toBeInTheDocument()
    })
  })

  it("renders the board with tasks when data is loaded successfully", async () => {
    const mockTasks = [
      {
        id: "task-1",
        title: "Task 1",
        description: "Description 1",
        status: "todo",
        priority: "high",
        type: "feature",
      },
      {
        id: "task-2",
        title: "Task 2",
        description: "Description 2",
        status: "in_progress",
        priority: "medium",
        type: "bug",
      },
      {
        id: "task-3",
        title: "Task 3",
        description: "Description 3",
        status: "done",
        priority: "low",
        type: "task",
      },
    ]

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockTasks,
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

    render(<ProjectBoard projectId={projectId} />)

    await waitFor(() => {
      expect(screen.getByText("Project Board")).toBeInTheDocument()
      expect(screen.getByText("Task 1")).toBeInTheDocument()
      expect(screen.getByText("Task 2")).toBeInTheDocument()
      expect(screen.getByText("Task 3")).toBeInTheDocument()

      // Check column headers
      expect(screen.getByText("To Do")).toBeInTheDocument()
      expect(screen.getByText("In Progress")).toBeInTheDocument()
      expect(screen.getByText("Done")).toBeInTheDocument()

      // Check task details
      expect(screen.getByText("Description 1")).toBeInTheDocument()
      expect(screen.getByText("feature")).toBeInTheDocument()
      expect(screen.getByText("high")).toBeInTheDocument()
    })
  })

  it("renders empty state when no tasks are available", async () => {
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

    render(<ProjectBoard projectId={projectId} />)

    await waitFor(() => {
      // Check for empty state messages in each column
      const emptyStateMessages = screen.getAllByText("No tasks in this column")
      expect(emptyStateMessages.length).toBeGreaterThan(0)
    })
  })
})
