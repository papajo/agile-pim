import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus } from "lucide-react"
import { getSupabaseServer } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"

export default async function ProjectBoardPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServer()

  // Fetch project details
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // Fetch active sprint
  const { data: activeSprint, error: sprintError } = await supabase
    .from("sprints")
    .select("*")
    .eq("project_id", params.id)
    .eq("status", "active")
    .single()

  // Fetch tasks for the active sprint
  let tasks = []
  if (activeSprint) {
    const { data: sprintTasks } = await supabase
      .from("tasks")
      .select(`
        *,
        team_members(*)
      `)
      .eq("sprint_id", activeSprint.id)

    tasks = sprintTasks || []
  } else {
    // If no active sprint, fetch backlog tasks
    const { data: backlogTasks } = await supabase
      .from("tasks")
      .select(`
        *,
        team_members(*)
      `)
      .eq("project_id", params.id)
      .is("sprint_id", null)

    tasks = backlogTasks || []
  }

  // Group tasks by status
  const todoTasks = tasks.filter((task) => task.status === "todo" || task.status === "backlog")
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress")
  const doneTasks = tasks.filter((task) => task.status === "done")

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container py-10">
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href={`/projects/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.name} - Sprint Board</h1>
            <p className="text-muted-foreground">
              {activeSprint
                ? `Sprint: ${activeSprint.name} (${new Date(activeSprint.start_date).toLocaleDateString()} - ${new Date(activeSprint.end_date).toLocaleDateString()})`
                : "No active sprint"}
            </p>
          </div>
          <div className="ml-auto">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="font-medium text-center p-2 bg-muted rounded-md">To Do ({todoTasks.length})</h3>
            {todoTasks.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground">No tasks in this column</CardContent>
              </Card>
            ) : (
              todoTasks.map((task) => (
                <Card key={task.id} className="p-3 border rounded-lg bg-card shadow-sm">
                  <div className="font-medium">{task.title}</div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {task.description || "No description"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{task.story_points || "?"} points</Badge>
                    <Badge variant={task.priority === "high" ? "destructive" : "outline"}>{task.priority}</Badge>
                    {task.assignee_id && task.team_members && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={task.team_members.avatar_url || "/placeholder.svg"}
                          alt={task.team_members.name}
                        />
                        <AvatarFallback>{task.team_members.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-center p-2 bg-muted rounded-md">In Progress ({inProgressTasks.length})</h3>
            {inProgressTasks.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground">No tasks in this column</CardContent>
              </Card>
            ) : (
              inProgressTasks.map((task) => (
                <Card key={task.id} className="p-3 border rounded-lg bg-card shadow-sm">
                  <div className="font-medium">{task.title}</div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {task.description || "No description"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{task.story_points || "?"} points</Badge>
                    <Badge variant={task.priority === "high" ? "destructive" : "outline"}>{task.priority}</Badge>
                    {task.assignee_id && task.team_members && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={task.team_members.avatar_url || "/placeholder.svg"}
                          alt={task.team_members.name}
                        />
                        <AvatarFallback>{task.team_members.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-center p-2 bg-muted rounded-md">Done ({doneTasks.length})</h3>
            {doneTasks.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground">No tasks in this column</CardContent>
              </Card>
            ) : (
              doneTasks.map((task) => (
                <Card key={task.id} className="p-3 border rounded-lg bg-card shadow-sm">
                  <div className="font-medium">{task.title}</div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {task.description || "No description"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{task.story_points || "?"} points</Badge>
                    <Badge variant={task.priority === "high" ? "destructive" : "outline"}>{task.priority}</Badge>
                    {task.assignee_id && task.team_members && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={task.team_members.avatar_url || "/placeholder.svg"}
                          alt={task.team_members.name}
                        />
                        <AvatarFallback>{task.team_members.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
