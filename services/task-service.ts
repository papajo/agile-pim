"use client"

import { getSupabaseClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

export type Task = Database["public"]["Tables"]["tasks"]["Row"]
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"]
export type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"]

export const taskService = {
  async getProjectTasks(projectId: string) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("tasks")
      .select("*, assignee:team_members(*)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  async getSprintTasks(sprintId: string) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("tasks")
      .select("*, assignee:team_members(*)")
      .eq("sprint_id", sprintId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  async createTask(task: TaskInsert) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("tasks").insert(task).select().single()

    if (error) throw error
    return data
  },

  async updateTask(id: string, task: TaskUpdate) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("tasks").update(task).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async updateTaskStatus(id: string, status: string) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("tasks")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}
