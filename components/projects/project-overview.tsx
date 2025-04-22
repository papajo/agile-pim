"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Users, Target, Clock } from "lucide-react"

interface ProjectOverviewProps {
  project: any
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  // Format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString()
  }

  // Calculate project duration
  const calculateDuration = () => {
    if (!project.start_date || !project.end_date) return "Not set"

    const start = new Date(project.start_date)
    const end = new Date(project.end_date)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return `${diffDays} days`
  }

  // Ensure project has all required properties
  const safeProject = {
    status: project?.status || "planning",
    methodology: project?.methodology || "scrum",
    sprint_length: project?.sprint_length || 14,
    created_at: project?.created_at || new Date().toISOString(),
    updated_at: project?.updated_at || new Date().toISOString(),
    start_date: project?.start_date || null,
    end_date: project?.end_date || null,
    template_id: project?.template_id || null,
    goal: project?.goal || null,
    description: project?.description || null,
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Badge variant="outline" className="capitalize">
              {safeProject.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{safeProject.status}</div>
            <p className="text-xs text-muted-foreground">Current project phase</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Methodology</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{safeProject.methodology}</div>
            <p className="text-xs text-muted-foreground">Agile framework</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sprint Length</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeProject.sprint_length || "Not set"} days</div>
            <p className="text-xs text-muted-foreground">Duration of each sprint</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Team Members</div>
            <p className="text-xs text-muted-foreground">Project collaborators</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Key information about this project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">{formatDate(safeProject.created_at)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">{formatDate(safeProject.updated_at)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-sm text-muted-foreground">{formatDate(safeProject.start_date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">End Date</p>
                <p className="text-sm text-muted-foreground">{formatDate(safeProject.end_date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">{calculateDuration()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Template</p>
                <p className="text-sm text-muted-foreground">{safeProject.template_id || "Custom Project"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Goal</CardTitle>
            <CardDescription>The main objective of this project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <Target className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="text-sm">
                  {safeProject.goal ||
                    "No goal has been set for this project yet. Define a clear goal to help guide your team's efforts and measure success."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Description</CardTitle>
          <CardDescription>Detailed information about this project</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{safeProject.description || "No description has been provided for this project."}</p>
        </CardContent>
      </Card>
    </div>
  )
}
