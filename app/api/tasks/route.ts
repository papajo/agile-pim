import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const taskData = await request.json()

    // Validate required fields
    if (!taskData.project_id || !taskData.title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create the task
    const { data, error } = await supabase.from("tasks").insert(taskData).select().single()

    if (error) {
      console.error("Error creating task:", error)
      return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
    }

    // Revalidate the project page
    revalidatePath(`/projects/${taskData.project_id}`)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in task creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = getSupabaseServer()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const taskData = await request.json()

    // Validate required fields
    if (!taskData.id) {
      return NextResponse.json({ error: "Missing task ID" }, { status: 400 })
    }

    // Update the task
    const { data, error } = await supabase.from("tasks").update(taskData).eq("id", taskData.id).select().single()

    if (error) {
      console.error("Error updating task:", error)
      return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
    }

    // Revalidate the project page
    revalidatePath(`/projects/${taskData.project_id}`)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in task update:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
