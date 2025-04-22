"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, PlusCircle, Calendar } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Sprint {
  id: string
  name: string
  goal: string | null
  start_date: string | null
  end_date: string | null
  status: string
  velocity_planned: number
  velocity_completed: number
}

export function ProjectSprints({ projectId }: { projectId: string }) {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchSprints()
  }, [projectId])

  const fetchSprints = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("sprints")
        .select("*")
        .eq("project_id", projectId)
        .order("start_date", { ascending: false })

      if (error) {
        throw error
      }

      setSprints(data || [])
    } catch (err: any) {
      console.error("Error fetching sprints:", err)
      setError(err.message || "Failed to load sprints")

      toast({
        title: "Error loading sprints",
        description: "Could not load sprint data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString()
  }

  // Calculate sprint progress
  const calculateProgress = (sprint: Sprint) => {
    if (sprint.velocity_planned === 0) return 0
    return Math.round((sprint.velocity_completed / sprint.velocity_planned) * 100)
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      planning: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
      active: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
      completed: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
    }

    return statusColors[status.toLowerCase()] || "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
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
        <h3 className="font-semibold mb-2">Error loading sprints</h3>
        <p>{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={fetchSprints}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sprints</h2>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Sprint
        </Button>
      </div>

      {sprints.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No sprints yet</CardTitle>
            <CardDescription>Create your first sprint to start tracking work</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create First Sprint
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-4">
          {sprints.map((sprint) => (
            <Card key={sprint.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{sprint.name}</CardTitle>
                    <CardDescription>{sprint.goal || "No sprint goal defined"}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(sprint.status)}>
                    {sprint.status.charAt(0).toUpperCase() + sprint.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                    </span>
                  </div>
                  <div className="text-sm text-right">
                    <span className="font-medium">{sprint.velocity_completed}</span>
                    <span className="text-muted-foreground"> / {sprint.velocity_planned} points</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{calculateProgress(sprint)}%</span>
                  </div>
                  <Progress value={calculateProgress(sprint)} className="h-2" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  View Sprint
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
