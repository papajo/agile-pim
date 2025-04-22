"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { Header } from "@/components/layout/header"
import { ProjectSidebar } from "@/components/projects/project-sidebar"
import { ProjectBoard } from "@/components/projects/project-board"
import { ProjectOverview } from "@/components/projects/project-overview"
import { ProjectTeam } from "@/components/projects/project-team"
import { ProjectSprints } from "@/components/projects/project-sprints"
import { ProjectSettings } from "@/components/projects/project-settings"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClientSafe } from "@/lib/supabase/client"

export default function ProjectDetail() {
  const { user, isLoading: isAuthLoading, refreshSession } = useAuth()
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
          router.push(`/sign-in?redirect=/projects/${projectId}`)
          return
        }

        console.log("User authenticated:", user.id)
        fetchProject()
      } catch (error) {
        console.error("Error checking authentication:", error)
        router.push(`/sign-in?redirect=/projects/${projectId}`)
      }
    }

    if (!isAuthLoading) {
      checkAuth()
    }
  }, [isAuthLoading, user, refreshSession, router, projectId])

  const fetchProject = async () => {
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

      // Check if user has access to this project
      if (project.owner_id !== user?.id) {
        // Check if user has a role in this project
        const { data: userRole, error: roleError } = await supabase
          .from("project_user_roles")
          .select("*")
          .eq("project_id", projectId)
          .eq("user_id", user?.id)
          .single()

        if (roleError || !userRole) {
          console.error("User doesn't have access to this project:", roleError)
          setError("You don't have access to this project.")
          setIsLoading(false)
          return
        }
      }

      setProject(project)
    } catch (err) {
      console.error("Error fetching project:", err)
      setError("Failed to load project. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="container py-10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">{isAuthLoading ? "Checking authentication..." : "Loading project..."}</span>
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
            <button onClick={() => router.push("/dashboard")} className="px-4 py-2 bg-primary text-white rounded-md">
              Go to Dashboard
            </button>
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
            <button onClick={() => router.push("/dashboard")} className="px-4 py-2 bg-primary text-white rounded-md">
              Go to Dashboard
            </button>
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
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>

          <Tabs defaultValue="board">
            <TabsList className="mb-4">
              <TabsTrigger value="board">Board</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="sprints">Sprints</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="board">
              <ProjectBoard projectId={projectId} />
            </TabsContent>

            <TabsContent value="overview">
              <ProjectOverview project={project} />
            </TabsContent>

            <TabsContent value="team">
              <ProjectTeam projectId={projectId} />
            </TabsContent>

            <TabsContent value="sprints">
              <ProjectSprints projectId={projectId} />
            </TabsContent>

            <TabsContent value="settings">
              <ProjectSettings project={project} userId={user?.id} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
