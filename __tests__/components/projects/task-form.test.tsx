import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { TaskForm } from "@/components/projects/task-form"
import { useRouter } from "next/navigation"

// Mock the dependencies
jest.mock("next/navigation")

describe("TaskForm Component", () => {
  const projectId = "test-project-id"
  const sprintId = "test-sprint-id"
  const teamMembers = [
    { id: "member-1", name: "John Doe" },
    { id: "member-2", name: "Jane Smith" },
  ]
  const mockOnSuccess = jest.fn()
  const mockRouter = { refresh: jest.fn() }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

    // Mock fetch for API calls
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ id: "new-task-id" }),
    })
  })

  it("renders the task form dialog with trigger button", () => {
    render(<TaskForm projectId={projectId} sprintId={sprintId} teamMembers={teamMembers} onSuccess={mockOnSuccess} />)

    // Check if the trigger button is rendered
    expect(screen.getByRole("button", { name: /Add Task/i })).toBeInTheDocument()

    // Dialog should not be open initially
    expect(screen.queryByText("Create New Task")).not.toBeInTheDocument()
  })

  it("opens the dialog when trigger button is clicked", async () => {
    render(<TaskForm projectId={projectId} sprintId={sprintId} teamMembers={teamMembers} onSuccess={mockOnSuccess} />)

    // Click the trigger button
    fireEvent.click(screen.getByRole("button", { name: /Add Task/i }))

    // Dialog should be open
    await waitFor(() => {
      expect(screen.getByText("Create New Task")).toBeInTheDocument()
      expect(screen.getByLabelText("Title")).toBeInTheDocument()
      expect(screen.getByLabelText("Description")).toBeInTheDocument()
      expect(screen.getByLabelText("Type")).toBeInTheDocument()
      expect(screen.getByLabelText("Priority")).toBeInTheDocument()
      expect(screen.getByLabelText("Story Points")).toBeInTheDocument()
      expect(screen.getByLabelText("Assignee")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Create Task/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument()
    })
  })

  it("submits the form with correct data", async () => {
    render(<TaskForm projectId={projectId} sprintId={sprintId} teamMembers={teamMembers} onSuccess={mockOnSuccess} />)

    // Open the dialog
    fireEvent.click(screen.getByRole("button", { name: /Add Task/i }))

    // Fill the form
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText("Title"), {
        target: { value: "New Task Title" },
      })

      fireEvent.change(screen.getByLabelText("Description"), {
        target: { value: "Task description" },
      })

      // Submit the form
      fireEvent.click(screen.getByRole("button", { name: /Create Task/i }))
    })

    // Check if fetch was called with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: projectId,
          sprint_id: sprintId,
          title: "New Task Title",
          description: "Task description",
          type: "task", // Default value
          priority: "medium", // Default value
          story_points: 3, // Default value
          assignee_id: null,
          status: "todo",
        }),
      })

      // Check if success callback was called
      expect(mockOnSuccess).toHaveBeenCalled()

      // Check if router refresh was called
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  it("handles form submission errors", async () => {
    // Mock fetch to return an error
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: "Failed to create task" }),
    })

    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error
    console.error = jest.fn()

    render(<TaskForm projectId={projectId} sprintId={sprintId} teamMembers={teamMembers} onSuccess={mockOnSuccess} />)

    // Open the dialog
    fireEvent.click(screen.getByRole("button", { name: /Add Task/i }))

    // Fill the form
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText("Title"), {
        target: { value: "New Task Title" },
      })

      // Submit the form
      fireEvent.click(screen.getByRole("button", { name: /Create Task/i }))
    })

    // Check if error was logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled()
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })

    // Restore console.error
    console.error = originalConsoleError
  })

  it("shows loading state during form submission", async () => {
    // Create a promise that won't resolve immediately to test loading state
    let resolvePromise: (value: any) => void
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    global.fetch = jest.fn().mockReturnValue(fetchPromise)

    render(<TaskForm projectId={projectId} sprintId={sprintId} teamMembers={teamMembers} onSuccess={mockOnSuccess} />)

    // Open the dialog
    fireEvent.click(screen.getByRole("button", { name: /Add Task/i }))

    // Fill the form
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText("Title"), {
        target: { value: "New Task Title" },
      })

      // Submit the form
      fireEvent.click(screen.getByRole("button", { name: /Create Task/i }))
    })

    // Check for loading state
    await waitFor(() => {
      expect(screen.getByText("Creating...")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Creating.../i })).toBeDisabled()
    })

    // Resolve the promise
    resolvePromise!({
      ok: true,
      json: () => Promise.resolve({ id: "new-task-id" }),
    })
  })
})
