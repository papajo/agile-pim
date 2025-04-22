export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          goal: string | null
          methodology: string
          sprint_length: number | null
          start_date: string | null
          end_date: string | null
          status: string
          owner_id: string
          template_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          goal?: string | null
          methodology: string
          sprint_length?: number | null
          start_date?: string | null
          end_date?: string | null
          status?: string
          owner_id: string
          template_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          goal?: string | null
          methodology?: string
          sprint_length?: number | null
          start_date?: string | null
          end_date?: string | null
          status?: string
          owner_id?: string
          template_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          methodology: string
          default_sprint_length: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          methodology: string
          default_sprint_length?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          methodology?: string
          default_sprint_length?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          project_id: string
          name: string
          role: string
          skills: string[] | null
          avatar_url: string | null
          is_simulated: boolean
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          role: string
          skills?: string[] | null
          avatar_url?: string | null
          is_simulated?: boolean
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          role?: string
          skills?: string[] | null
          avatar_url?: string | null
          is_simulated?: boolean
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sprints: {
        Row: {
          id: string
          project_id: string
          name: string
          goal: string | null
          start_date: string | null
          end_date: string | null
          status: string
          velocity_planned: number
          velocity_completed: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          goal?: string | null
          start_date?: string | null
          end_date?: string | null
          status?: string
          velocity_planned?: number
          velocity_completed?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          goal?: string | null
          start_date?: string | null
          end_date?: string | null
          status?: string
          velocity_planned?: number
          velocity_completed?: number
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          sprint_id: string | null
          title: string
          description: string | null
          type: string
          status: string
          priority: string
          story_points: number | null
          assignee_id: string | null
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          sprint_id?: string | null
          title: string
          description?: string | null
          type?: string
          status?: string
          priority?: string
          story_points?: number | null
          assignee_id?: string | null
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          sprint_id?: string | null
          title?: string
          description?: string | null
          type?: string
          status?: string
          priority?: string
          story_points?: number | null
          assignee_id?: string | null
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      standups: {
        Row: {
          id: string
          sprint_id: string
          team_member_id: string
          date: string
          yesterday: string | null
          today: string | null
          blockers: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sprint_id: string
          team_member_id: string
          date: string
          yesterday?: string | null
          today?: string | null
          blockers?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sprint_id?: string
          team_member_id?: string
          date?: string
          yesterday?: string | null
          today?: string | null
          blockers?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      retrospectives: {
        Row: {
          id: string
          sprint_id: string
          went_well: string[] | null
          to_improve: string[] | null
          action_items: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sprint_id: string
          went_well?: string[] | null
          to_improve?: string[] | null
          action_items?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sprint_id?: string
          went_well?: string[] | null
          to_improve?: string[] | null
          action_items?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      learning_resources: {
        Row: {
          id: string
          title: string
          description: string | null
          content: string | null
          type: string
          difficulty: string | null
          duration: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content?: string | null
          type: string
          difficulty?: string | null
          duration?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content?: string | null
          type?: string
          difficulty?: string | null
          duration?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      user_learning_progress: {
        Row: {
          id: string
          user_id: string
          resource_id: string
          progress: number
          completed: boolean
          last_accessed: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_id: string
          progress?: number
          completed?: boolean
          last_accessed?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_id?: string
          progress?: number
          completed?: boolean
          last_accessed?: string
          created_at?: string
          updated_at?: string
        }
      }
      project_user_roles: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
