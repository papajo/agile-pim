"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseServer, getServerSession } from "@/lib/supabase/server" // Import getServerSession
import { z } from "zod" // Import Zod

// Define Zod schema for project creation form data
const CreateProjectSchema = z.object({
  name: z.string().min(1, { message: "Project name is required" }),
  description: z.string().optional().nullable(),
  methodology: z.string().default("scrum"),
  sprint_length: z.coerce.number().int().positive().default(14), // Coerce string to number
  team_size: z.enum(["small", "medium", "large"]).default("small"),
  template_id: z.string().uuid().optional().nullable(),
})

export async function createProject(formData: FormData) {
  try {
    // --- Security Fix: Get user from server session ---
    const { session, user } = await getServerSession()
    if (!session || !user) {
      console.error("No active session or user found.")
      return { error: "Authentication error. Please sign in again." }
    }
    const userId = user.id
    // --- End Security Fix ---

    console.log("Creating project for user:", userId)
    console.log("Raw form data:", Object.fromEntries(formData.entries()))

    // --- Zod Validation ---
    const parsedData = CreateProjectSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description") || null,
      methodology: formData.get("methodology") || "scrum",
      sprint_length: formData.get("sprint_length") || "14", // Keep as string for coerce
      team_size: formData.get("team_size") || "small",
      template_id: formData.get("template_id") || null,
    })

    if (!parsedData.success) {
      console.error("Form validation failed:", parsedData.error.flatten().fieldErrors)
      // Return the first error message for simplicity
      const firstError = Object.values(parsedData.error.flatten().fieldErrors)[0]?.[0]
      return { error: firstError || "Invalid input data." }
    }

    const { name, description, methodology, sprint_length, template_id } = parsedData.data
    // --- End Zod Validation ---

    // Create project in database
    const supabase = getSupabaseServer()

    // Log validated data for debugging
    const projectDataToInsert = {
      name,
      description,
      methodology,
      sprint_length, // Use validated number
      owner_id: userId, // Use validated user ID from session
      template_id,
      status: "planning",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    console.log("Creating project with validated data:", projectDataToInsert)

    const { data, error } = await supabase.from("projects").insert(projectDataToInsert).select().single()

    if (error) {
      console.error("Error creating project:", error)
      // Provide a more specific error if possible, e.g., check for unique constraint violation
      if (error.code === "23505") { // unique_violation
        return { error: "A project with this name might already exist." }
      }
      return { error: "Failed to create project. Please try again." }
    }

    // Revalidate relevant paths
    revalidatePath("/")
    revalidatePath("/projects")
    revalidatePath("/dashboard")

    console.log("Project created successfully:", data)
    return { projectId: data.id } // Return success indicator
  } catch (error) {
    console.error("Unexpected error creating project:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
