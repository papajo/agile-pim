import { createProject } from "@/app/projects/actions"
import { getSupabaseServer } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { describe, beforeEach, it, expect, jest } from "@jest/globals"

// Mock dependencies
jest.mock("@/lib/supabase/server", () => ({
  getSupabaseServer: jest.fn(),
}))

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

describe("Project Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("creates a project successfully", async () => {
    // Mock FormData
    const formData = new FormData()
    formData.append("user_id", "user-123")
    formData.append("name", "Test Project")
    formData.append("description", "Test Description")
    formData.append("methodology", "scrum")
    formData.append("sprint_length", "14")
    formData.append("team_size", "small")
    formData.append("template_id", "template-123")

    // Mock Supabase response
    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: "new-project-id" },
          error: null,
        }),
      }),
    })

    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        insert: mockInsert,
      }),
    }
    ;(getSupabaseServer as jest.Mock).mockReturnValue(mockSupabase)

    // Call the action
    const result = await createProject(formData)

    // Verify results
    expect(mockSupabase.from).toHaveBeenCalledWith("projects")
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Test Project",
        description: "Test Description",
        methodology: "scrum",
        sprint_length: 14,
        owner_id: "user-123",
        template_id: "template-123",
      }),
    )
    expect(revalidatePath).toHaveBeenCalledWith("/")
    expect(result).toEqual({ projectId: "new-project-id" })
  })

  it("returns an error when user ID is missing", async () => {
    // Mock FormData without user_id
    const formData = new FormData()
    formData.append("name", "Test Project")

    // Call the action
    const result = await createProject(formData)

    // Verify results
    expect(result).toEqual({ error: "Authentication error. Please sign in again." })
    expect(getSupabaseServer).toHaveBeenCalled()
  })

  it("returns an error when project name is missing", async () => {
    // Mock FormData without name
    const formData = new FormData()
    formData.append("user_id", "user-123")
    // No name field

    // Call the action
    const result = await createProject(formData)

    // Verify results
    expect(result).toEqual({ error: "Project name is required" })
  })

  it("handles database errors", async () => {
    // Mock FormData
    const formData = new FormData()
    formData.append("user_id", "user-123")
    formData.append("name", "Test Project")

    // Mock Supabase error
    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      }),
    })

    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        insert: mockInsert,
      }),
    }
    ;(getSupabaseServer as jest.Mock).mockReturnValue(mockSupabase)

    // Call the action
    const result = await createProject(formData)

    // Verify results
    expect(result).toEqual({ error: "Failed to create project. Please try again." })
  })

  it("handles unexpected errors", async () => {
    // Mock FormData
    const formData = new FormData()
    formData.append("user_id", "user-123")
    formData.append("name", "Test Project")

    // Mock unexpected error
    ;(getSupabaseServer as jest.Mock).mockImplementation(() => {
      throw new Error("Unexpected error")
    })

    // Call the action
    const result = await createProject(formData)

    // Verify results
    expect(result).toEqual({ error: "An unexpected error occurred. Please try again." })
  })
})
