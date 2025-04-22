"use client"

import { getSupabaseClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

export type Sprint = Database["public"]["Tables"]["sprints"]["Row"]
export type SprintInsert = Database["public"]["Tables"]["sprints"]["Insert"]
export type SprintUpdate = Database["public"]["Tables"]["sprints"]["Update"]

export const sprintService = {
  async getProjectSprints(projectId: string) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("sprints")
      .select("*")
      .eq("project_id", projectId)
      .order("start_date", { ascending: true })

    if (error) throw error
    return data
  },

  async getCurrentSprint(projectId: string) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("sprints")
      .select("*")
      .eq("project_id", projectId)
      .eq("status", "active")
      .single()

    if (error && error.code !== "PGRST116") throw error // PGRST116 is the error code for no rows returned
    return data || null
  },

  async createSprint(sprint: SprintInsert) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("sprints").insert(sprint).select().single()

    if (error) throw error
    return data
  },

  async updateSprint(id: string, sprint: SprintUpdate) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("sprints").update(sprint).eq("id", id).select().single()

    if (error) throw error
    return data
  },
}
