"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseServer } from "@/lib/supabase/server"

export async function createProject(formData: FormData) {
  try {
    console.log("Creating project with form data:", Object.fromEntries(formData.entries()))

    // Get user ID from form data
    const userId = formData.get("user_id")
    if (!userId) {
      console.error("No user ID provided")
      return { error: "Authentication error. Please sign in again." }
    }

    // Get project name from form data
    const name = formData.get("name")
    if (!name) {
      console.error("No project name provided")
      return { error: "Project name is required" }
    }

    // Get other form fields
    const description = formData.get("description") || null
    const methodology = formData.get("methodology") || "scrum"
    const sprintLength = formData.get("sprint_length") ? Number.parseInt(formData.get("sprint_length") as string) : 14
    const teamSize = formData.get("team_size") || "small"
    const templateId = formData.get("template_id") || null

    // Create project in database
    const supabase = getSupabaseServer()

    // Log for debugging
    console.log("Creating project with data:", {
      name,
      description,
      methodology,
      sprint_length: sprintLength,
      owner_id: userId,
      template_id: templateId,
      status: "planning",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: name as string,
        description: description as string | null,
        methodology: methodology as string,
        sprint_length: sprintLength,
        owner_id: userId as string,
        template_id: templateId as string | null,
        status: "planning",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating project:", error)
      return { error: "Failed to create project. Please try again." }
    }

    // Revalidate the projects page
    revalidatePath("/")
    revalidatePath("/projects")
    revalidatePath("/dashboard")

    console.log("Project created successfully:", data)
    return { projectId: data.id }
  } catch (error) {
    console.error("Unexpected error creating project:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
