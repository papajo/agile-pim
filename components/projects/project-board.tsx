"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

type Task = {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  priority: string
}

type Column = {
  id: string
  title: string
  tasks: Task[]
}

export function ProjectBoard({ projectId }: { projectId: string }) {
  const [columns, setColumns] = useState<Column[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchTasks()
  }, [projectId])

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: tasks, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      // Define columns
      const columnsData: Column[] = [
        { id: "backlog", title: "Backlog", tasks: [] },
        { id: "todo", title: "To Do", tasks: [] },
        { id: "in_progress", title: "In Progress", tasks: [] },
        { id: "review", title: "Review", tasks: [] },
        { id: "done", title: "Done", tasks: [] },
      ]

      // Distribute tasks to columns
      if (tasks && tasks.length > 0) {
        tasks.forEach((task) => {
          const column = columnsData.find((col) => col.id === task.status)
          if (column) {
            column.tasks.push(task as Task)
          } else {
            // If status doesn't match any column, put in backlog
            columnsData[0].tasks.push(task as Task)
          }
        })
      }

      setColumns(columnsData)
    } catch (err: any) {
      console.error("Error fetching tasks:", err)
      setError(err.message || "Failed to load tasks")

      // Handle auth errors
      if (err.code === "PGRST301" || err.message.includes("JWT")) {
        toast({
          title: "Authentication error",
          description: "Please sign in again to continue",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
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
        <h3 className="font-semibold mb-2">Error loading tasks</h3>
        <p>{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={fetchTasks}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Board</h2>
        <Button onClick={() => setIsTaskFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {columns.map((column) => (
          <div key={column.id} className="space-y-2">
            <div className="bg-muted p-2 rounded-md">
              <h3 className="font-semibold">{column.title}</h3>
              <p className="text-xs text-muted-foreground">{column.tasks.length} tasks</p>
            </div>

            <div className="min-h-[500px] bg-muted/50 rounded-md p-2 space-y-2">
              {column.tasks && column.tasks.length > 0 ? (
                column.tasks.map((task) => (
                  <Card key={task.id} className="mb-2 cursor-pointer">
                    <CardHeader className="p-3 pb-0">
                      <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                      {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{task.type}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            task.priority === "high"
                              ? "bg-destructive/10 text-destructive"
                              : task.priority === "medium"
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center text-muted-foreground">No tasks in this column</CardContent>
                </Card>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
