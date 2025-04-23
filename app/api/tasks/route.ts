import { NextResponse } from "next/server"
import { getSupabaseServer, getServerSession } from "@/lib/supabase/server" // Import getServerSession
import { revalidatePath } from "next/cache"
import { z } from "zod" // Import Zod

// --- Zod Schemas ---
const TaskBaseSchema = z.object({
  project_id: z.string().uuid({ message: "Invalid Project ID" }),
  sprint_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional().nullable(),
  type: z.string().default("task"),
  status: z.string().default("todo"),
  priority: z.string().default("medium"),
  story_points: z.coerce.number().int().nonnegative().optional().nullable(), // Coerce string/null to number
  assignee_id: z.string().uuid().optional().nullable(),
  parent_id: z.string().uuid().optional().nullable(),
})

const CreateTaskSchema = TaskBaseSchema // Use base for creation

const UpdateTaskSchema = TaskBaseSchema.partial().extend({
  // Require 'id' for updates
  id: z.string().uuid({ message: "Task ID is required for updates" }),
  // Project ID might not be updatable, depending on logic, but keep it optional here
  project_id: z.string().uuid({ message: "Invalid Project ID" }).optional(),
})
// --- End Zod Schemas ---

// Helper function to handle authentication
async function checkAuth(supabase: ReturnType<typeof getSupabaseServer>) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) {
    console.error("Error getting session:", sessionError)
    return { session: null, error: NextResponse.json({ error: "Authentication check failed" }, { status: 500 }) }
  }
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  return { session, error: null }
}


export async function POST(request: Request) {
  const supabase = getSupabaseServer()

  // Check authentication
  const authCheck = await checkAuth(supabase)
  if (authCheck.error) return authCheck.error

  try {
    const rawData = await request.json()

    // --- Zod Validation ---
    const parsedData = CreateTaskSchema.safeParse(rawData)
    if (!parsedData.success) {
      console.error("Task creation validation failed:", parsedData.error.flatten().fieldErrors)
      return NextResponse.json(
        { error: "Invalid input data", details: parsedData.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    const taskData = parsedData.data
    // --- End Zod Validation ---

    // Create the task using validated data
    const { data, error } = await supabase.from("tasks").insert(taskData).select().single()

    if (error) {
      console.error("Error creating task:", error)
       // Provide a more specific error if possible
       if (error.code === "23503") { // foreign_key_violation
         return NextResponse.json({ error: "Invalid project, sprint, or assignee ID provided." }, { status: 400 })
       }
      return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
    }

    // Revalidate the project page
    revalidatePath(`/projects/${taskData.project_id}`)
    if (taskData.sprint_id) {
        revalidatePath(`/sprints/${taskData.sprint_id}`) // Revalidate sprint if assigned
    }


    return NextResponse.json(data)
  } catch (error) {
    console.error("Error parsing request or during task creation:", error)
    // Differentiate between JSON parsing errors and others
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "Invalid JSON format in request body" }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const supabase = getSupabaseServer()

  // Check authentication
  const authCheck = await checkAuth(supabase)
  if (authCheck.error) return authCheck.error

  try {
    const rawData = await request.json()

    // --- Zod Validation ---
    const parsedData = UpdateTaskSchema.safeParse(rawData)
    if (!parsedData.success) {
      console.error("Task update validation failed:", parsedData.error.flatten().fieldErrors)
      return NextResponse.json(
        { error: "Invalid input data", details: parsedData.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    // Separate ID from the rest of the update data
    const { id: taskId, ...taskUpdateData } = parsedData.data
    // --- End Zod Validation ---


    // Ensure there's something to update besides the ID
    if (Object.keys(taskUpdateData).length === 0) {
       return NextResponse.json({ error: "No update data provided" }, { status: 400 })
    }

    // Add updated_at timestamp
    taskUpdateData.updated_at = new Date().toISOString()

    // Update the task
    const { data, error } = await supabase
        .from("tasks")
        .update(taskUpdateData)
        .eq("id", taskId) // Use validated taskId
        .select()
        .single()

    if (error) {
      console.error("Error updating task:", error)
       // Provide a more specific error if possible
       if (error.code === "23503") { // foreign_key_violation
         return NextResponse.json({ error: "Invalid project, sprint, or assignee ID provided." }, { status: 400 })
       }
       if (error.code === "PGRST116") { // No rows returned
         return NextResponse.json({ error: "Task not found" }, { status: 404 })
       }
      return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
    }

    // Revalidate the project page if project_id is available
    // Note: If project_id wasn't part of the update, we might need to fetch the task first
    // For simplicity, we use the potentially updated project_id or the original if not updated.
    // A more robust approach might involve fetching the task before update or after to get the correct project_id.
    const projectIdForRevalidation = taskUpdateData.project_id || data.project_id;
    if (projectIdForRevalidation) {
        revalidatePath(`/projects/${projectIdForRevalidation}`)
    }
     if (taskUpdateData.sprint_id || data.sprint_id) {
        revalidatePath(`/sprints/${taskUpdateData.sprint_id || data.sprint_id}`) // Revalidate sprint if assigned/changed
    }


    return NextResponse.json(data)
  } catch (error) {
     console.error("Error parsing request or during task update:", error)
    // Differentiate between JSON parsing errors and others
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "Invalid JSON format in request body" }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Ensure no "export const middleware = ..." exists in this file
