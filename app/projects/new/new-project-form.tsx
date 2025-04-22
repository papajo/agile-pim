"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2 } from "lucide-react"
import { createProject } from "../actions"
import { Header } from "@/components/layout/header"

interface NewProjectFormProps {
  userId: string
}

export function NewProjectForm({ userId }: NewProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Create a new FormData object
      const formData = new FormData(event.currentTarget)

      // Add the user ID to the form data
      formData.append("user_id", userId)

      console.log("Submitting form with user ID:", userId)

      // Call the server action
      const result = await createProject(formData)

      if (result?.error) {
        setError(result.error)
      } else if (result?.projectId) {
        router.push(`/projects/${result.projectId}`)
      }
    } catch (err) {
      console.error("Error creating project:", err)
      setError("Failed to create project. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container py-10">
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Create New Project</h1>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Enter the details for your new project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" name="name" placeholder="Enter project name" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your project goals and objectives"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="methodology">Agile Methodology</Label>
                <Select name="methodology" defaultValue="scrum">
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

              <div className="grid gap-2">
                <Label htmlFor="sprint_length">Sprint Length</Label>
                <Select name="sprint_length" defaultValue="14">
                  <SelectTrigger id="sprint_length">
                    <SelectValue placeholder="Select sprint length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">1 Week</SelectItem>
                    <SelectItem value="14">2 Weeks</SelectItem>
                    <SelectItem value="21">3 Weeks</SelectItem>
                    <SelectItem value="28">4 Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="team_size">Team Size</Label>
                <Select name="team_size" defaultValue="small">
                  <SelectTrigger id="team_size">
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (3-5)</SelectItem>
                    <SelectItem value="medium">Medium (6-10)</SelectItem>
                    <SelectItem value="large">Large (11+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Project...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
