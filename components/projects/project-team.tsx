"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, UserPlus } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface TeamMember {
  id: string
  name: string
  role: string
  skills: string[] | null
  avatar_url: string | null
  is_simulated: boolean
}

export function ProjectTeam({ projectId }: { projectId: string }) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchTeamMembers()
  }, [projectId])

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("project_id", projectId)
        .order("role", { ascending: true })

      if (error) {
        throw error
      }

      setTeamMembers(data || [])
    } catch (err: any) {
      console.error("Error fetching team members:", err)
      setError(err.message || "Failed to load team members")

      toast({
        title: "Error loading team",
        description: "Could not load team members. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getAvatarColor = (role: string) => {
    const roleColors: Record<string, string> = {
      "product owner": "bg-blue-500",
      "scrum master": "bg-green-500",
      developer: "bg-purple-500",
      designer: "bg-pink-500",
      tester: "bg-yellow-500",
      stakeholder: "bg-orange-500",
    }

    return roleColors[role.toLowerCase()] || "bg-gray-500"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive">
        <h3 className="font-semibold mb-2">Error loading team members</h3>
        <p>{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={fetchTeamMembers}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Team</h2>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {teamMembers.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No team members yet</CardTitle>
            <CardDescription>Add team members to collaborate on this project</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add First Team Member
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    {member.avatar_url ? (
                      <AvatarImage src={member.avatar_url || "/placeholder.svg"} alt={member.name} />
                    ) : (
                      <AvatarFallback className={getAvatarColor(member.role)}>
                        {getInitials(member.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription className="capitalize">{member.role}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {member.is_simulated && (
                  <Badge variant="outline" className="mb-2">
                    Simulated
                  </Badge>
                )}
                {member.skills && member.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {member.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  View Profile
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
