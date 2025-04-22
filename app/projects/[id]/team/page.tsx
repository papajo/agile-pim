"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus, ArrowLeft } from "lucide-react"
import { Header } from "@/components/layout/header"
import { ProjectSidebar } from "@/components/projects/project-sidebar"
import { getSupabaseClientSafe } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

interface TeamMember {
  id: string
  name: string
  role: string
  skills: string[] | null
  avatar_url: string | null
  is_simulated: boolean
  user_id: string | null
}

export default function ProjectTeamPage() {
  const { user, isLoading: isAuthLoading, refreshSession } = useAuth()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const projectId = params?.id as string

  // Ensure we have a valid session before proceeding
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Force a session refresh
        await refreshSession()

        if (!user) {
          console.log("No user found, redirecting to sign in")
          router.push(`/sign-in?redirect=/projects/${projectId}/team`)
          return
        }

        console.log("User authenticated:", user.id)
        fetchProjectAndTeam()
      } catch (error) {
        console.error("Error checking authentication:", error)
        router.push(`/sign-in?redirect=/projects/${projectId}/team`)
      }
    }

    if (!isAuthLoading) {
      checkAuth()
    }
  }, [isAuthLoading, user, refreshSession, router, projectId])

  const fetchProjectAndTeam = async () => {
    if (!projectId) return

    setIsLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClientSafe()

      // Fetch project details
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single()

      if (projectError) {
        console.error("Error fetching project:", projectError)
        setError("Project not found or you don't have access to it.")
        setIsLoading(false)
        return
      }

      if (!project) {
        setError("Project not found.")
        setIsLoading(false)
        return
      }

      setProject(project)

      // Check if user has access to this project
      if (project.owner_id !== user?.id) {
        // Check if user has a role in this project
        const { data: userRole, error: roleError } = await supabase
          .from("project_user_roles")
          .select("*")
          .eq("project_id", projectId)
          .eq("user_id", user?.id)
          .single()

        if (roleError && roleError.code !== "PGRST116") {
          // PGRST116 is "no rows returned"
          console.error("Error checking user role:", roleError)
          setError("Error checking project access.")
          setIsLoading(false)
          return
        }

        if (!userRole) {
          setError("You don't have access to this project.")
          setIsLoading(false)
          return
        }
      }

      // Fetch team members
      const { data: teamData, error: teamError } = await supabase
        .from("team_members")
        .select("*")
        .eq("project_id", projectId)
        .order("role", { ascending: true })

      if (teamError) {
        console.error("Error fetching team members:", teamError)
        setError("Failed to load team members.")
        setIsLoading(false)
        return
      }

      setTeamMembers(teamData || [])
    } catch (err) {
      console.error("Error fetching project and team:", err)
      setError("Failed to load project data. Please try again.")
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

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="container py-10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">{isAuthLoading ? "Checking authentication..." : "Loading team..."}</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="container py-10">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => router.push("/dashboard")} className="px-4 py-2 bg-primary text-white rounded-md">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="container py-10">
          <Alert variant="destructive">
            <AlertDescription>Project not found.</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => router.push("/dashboard")} className="px-4 py-2 bg-primary text-white rounded-md">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <ProjectSidebar projectId={projectId} />
        <main className="flex-1 p-6">
          <div className="flex items-center mb-8">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link href={`/projects/${projectId}`}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{project.name} - Team</h1>
              <p className="text-muted-foreground">Manage your project team members</p>
            </div>
            <div className="ml-auto">
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            </div>
          </div>

          <div className="space-y-6">
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
        </main>
      </div>
    </div>
  )
}
