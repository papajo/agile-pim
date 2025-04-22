"use client"

import { getSupabaseClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

export type ProjectTemplate = Database["public"]["Tables"]["project_templates"]["Row"]
export type ProjectTemplateInsert = Database["public"]["Tables"]["project_templates"]["Insert"]

export const templateService = {
  async getTemplates() {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("project_templates").select("*").order("name", { ascending: true })

    if (error) throw error
    return data
  },

  async getTemplate(id: string) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("project_templates").select("*").eq("id", id).single()

    if (error) throw error
    return data
  },
}
