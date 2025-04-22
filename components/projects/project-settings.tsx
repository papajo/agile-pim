"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Trash2 } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface ProjectSettingsProps {
  project: any
  userId: string
}

export function ProjectSettings({ project, userId }: ProjectSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = getSupabaseClient()

  // Form state
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
    goal: project.goal || "",
    methodology: project.methodology,
    sprint_length: project.sprint_length?.toString() || "14",
    start_date: project.start_date ? new Date(project.start_date) : null,
    end_date: project.end_date ? new Date(project.end_date) : null,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: string, date: Date | null) => {
    setFormData((prev) => ({ ...prev, [name]: date }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          name: formData.name,
          description: formData.description,
          goal: formData.goal,
          methodology: formData.methodology,
          sprint_length: Number.parseInt(formData.sprint_length),
          start_date: formData.start_date?.toISOString() || null,
          end_date: formData.end_date?.toISOString() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id)

      if (error) throw error

      toast({
        title: "Project updated",
        description: "Your project settings have been saved successfully.",
      })

      // Refresh the page to show updated data
      router.refresh()
    } catch (error: any) {
      console.error("Error updating project:", error)
      toast({
        title: "Error updating project",
        description: error.message || "Failed to update project settings.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)

    try {
      // Check if user is the owner
      if (project.owner_id !== userId) {
        throw new Error("Only the project owner can delete this project")
      }

      const { error } = await supabase.from("projects").delete().eq("id", project.id)

      if (error) throw error

      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error deleting project",
        description: error.message || "Failed to delete project.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>Update your project details and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Project Goal</Label>
                  <Textarea id="goal" name="goal" value={formData.goal} onChange={handleInputChange} rows={2} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="methodology">Methodology</Label>
                    <Select
                      value={formData.methodology}
                      onValueChange={(value) => handleSelectChange("methodology", value)}
                    >
                      <SelectTrigger id="methodology">
                        <SelectValue placeholder="Select methodology" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scrum">Scrum</SelectItem>
                        <SelectItem value="kanban">Kanban</SelectItem>
                        <SelectItem value="scrumban">Scrumban</SelectItem>
                        <SelectItem value="xp">Extreme Programming (XP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sprint_length">Sprint Length (days)</Label>
                    <Select
                      value={formData.sprint_length}
                      onValueChange={(value) => handleSelectChange("sprint_length", value)}
                    >
                      <SelectTrigger id="sprint_length">
                        <SelectValue placeholder="Select sprint length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">1 Week (7 days)</SelectItem>
                        <SelectItem value="14">2 Weeks (14 days)</SelectItem>
                        <SelectItem value="21">3 Weeks (21 days)</SelectItem>
                        <SelectItem value="28">4 Weeks (28 days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <DatePicker date={formData.start_date} setDate={(date) => handleDateChange("start_date", date)} />
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <DatePicker date={formData.end_date} setDate={(date) => handleDateChange("end_date", date)} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="team" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Settings</CardTitle>
              <CardDescription>Manage team members and roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Team Invitations</Label>
                  <p className="text-sm text-muted-foreground">Let team members invite others to join the project</p>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Approval</Label>
                  <p className="text-sm text-muted-foreground">Require owner approval for new team members</p>
                </div>
                <Switch defaultChecked={true} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive project updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive project updates via email</p>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Task Assignments</Label>
                  <p className="text-sm text-muted-foreground">Notify when tasks are assigned to you</p>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sprint Updates</Label>
                  <p className="text-sm text-muted-foreground">Notify about sprint starts and completions</p>
                </div>
                <Switch defaultChecked={true} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-4 mt-4">
          <Card className="border-destructive">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>Danger Zone</CardTitle>
              </div>
              <CardDescription>Actions here can't be undone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border border-destructive/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Delete Project</h4>
                    <p className="text-sm text-muted-foreground">
                      This will permanently delete the project and all associated data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleDeleteProject} disabled={isDeleting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete Project"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
