"use client"

import { getSupabaseClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

export type TeamMember = Database["public"]["Tables"]["team_members"]["Row"]
export type TeamMemberInsert = Database["public"]["Tables"]["team_members"]["Insert"]

export const teamService = {
  async getProjectTeam(projectId: string) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("project_id", projectId)
      .order("role", { ascending: true })

    if (error) throw error
    return data
  },

  async createTeamMember(member: TeamMemberInsert) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("team_members").insert(member).select().single()

    if (error) throw error
    return data
  },

  async createSimulatedTeam(projectId: string, teamSize: "small" | "medium" | "large") {
    // Define team roles based on size
    const teamRoles = {
      small: [
        {
          name: "Alex Johnson",
          role: "Product Owner",
          skills: ["Requirements", "Prioritization", "Stakeholder Management"],
        },
        { name: "Sarah Miller", role: "Scrum Master", skills: ["Facilitation", "Coaching", "Process Improvement"] },
        { name: "David Chen", role: "Developer", skills: ["Frontend", "Backend", "Testing"] },
        { name: "Emma Wilson", role: "Designer", skills: ["UI/UX", "Prototyping", "User Research"] },
      ],
      medium: [
        {
          name: "Alex Johnson",
          role: "Product Owner",
          skills: ["Requirements", "Prioritization", "Stakeholder Management"],
        },
        { name: "Sarah Miller", role: "Scrum Master", skills: ["Facilitation", "Coaching", "Process Improvement"] },
        { name: "David Chen", role: "Lead Developer", skills: ["Architecture", "Frontend", "Backend"] },
        { name: "Emma Wilson", role: "Designer", skills: ["UI/UX", "Prototyping", "User Research"] },
        { name: "Michael Brown", role: "Developer", skills: ["Frontend", "React", "CSS"] },
        { name: "Jessica Lee", role: "Developer", skills: ["Backend", "Database", "API Design"] },
        { name: "Robert Taylor", role: "QA Engineer", skills: ["Testing", "Automation", "Quality Assurance"] },
      ],
      large: [
        {
          name: "Alex Johnson",
          role: "Product Owner",
          skills: ["Requirements", "Prioritization", "Stakeholder Management"],
        },
        { name: "Sarah Miller", role: "Scrum Master", skills: ["Facilitation", "Coaching", "Process Improvement"] },
        { name: "David Chen", role: "Lead Developer", skills: ["Architecture", "Frontend", "Backend"] },
        { name: "Emma Wilson", role: "Lead Designer", skills: ["UI/UX", "Design Systems", "User Research"] },
        { name: "Michael Brown", role: "Frontend Developer", skills: ["React", "CSS", "JavaScript"] },
        { name: "Jessica Lee", role: "Backend Developer", skills: ["Node.js", "Database", "API Design"] },
        { name: "Robert Taylor", role: "QA Lead", skills: ["Testing Strategy", "Automation", "Quality Assurance"] },
        { name: "Olivia Garcia", role: "UX Researcher", skills: ["User Testing", "Interviews", "Analytics"] },
        { name: "William Martinez", role: "DevOps Engineer", skills: ["CI/CD", "Infrastructure", "Monitoring"] },
        { name: "Sophia Anderson", role: "Frontend Developer", skills: ["React", "TypeScript", "Responsive Design"] },
        { name: "James Wilson", role: "Backend Developer", skills: ["Python", "Database", "Security"] },
      ],
    }

    const members = teamRoles[teamSize].map((member) => ({
      project_id: projectId,
      name: member.name,
      role: member.role,
      skills: member.skills,
      is_simulated: true,
      avatar_url: `/placeholder.svg?height=200&width=200&text=${member.name
        .split(" ")
        .map((n) => n[0])
        .join("")}`,
    }))

    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("team_members").insert(members).select()

    if (error) throw error
    return data
  },
}
