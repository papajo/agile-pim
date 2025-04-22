"use client"

import { getSupabaseClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

export type Project = Database["public"]["Tables"]["projects"]["Row"]
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"]
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"]

export const projectService = {
  async getProjects() {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  async getUserProjects(userId: string) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  async getProject(id: string) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("projects").select("*").eq("id", id).single()

    if (error) throw error
    return data
  },

  async createProject(project: ProjectInsert) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("projects").insert(project).select().single()

    if (error) throw error
    return data
  },

  async updateProject(id: string, project: ProjectUpdate) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("projects").update(project).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async deleteProject(id: string) {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from("projects").delete().eq("id", id)

    if (error) throw error
    return true
  },
}
