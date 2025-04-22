"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Code, FileText, Megaphone, Users, Loader2, RefreshCw } from "lucide-react"
import { createProject } from "../actions"
import { Header } from "@/components/layout/header"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClientSafe } from "@/lib/supabase/client"

// Define mock templates to use as fallback
const MOCK_TEMPLATES = [
  {
    id: "software-template",
    name: "Software Development",
    description: "Agile software development project with sprints, user stories, and technical tasks.",
    methodology: "scrum",
    default_sprint_length: 14,
  },
  {
    id: "marketing-template",
    name: "Marketing Campaign",
    description: "Agile marketing project with campaign planning, content creation, and analytics.",
    methodology: "kanban",
    default_sprint_length: 14,
  },
  {
    id: "event-template",
    name: "Event Planning",
    description: "Agile event management with timeline, vendor coordination, and budget tracking.",
    methodology: "scrumban",
    default_sprint_length: 14,
  },
]

export default function NewProject() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [useMockData, setUseMockData] = useState(false)
  const router = useRouter()
  const { user, session, isLoading: isAuthLoading, refreshSession } = useAuth()

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if we should use mock data
      if (useMockData) {
        setTemplates(MOCK_TEMPLATES)
        setIsLoading(false)
        return
      }

      const supabase = getSupabaseClientSafe()
      const { data, error } = await supabase.from("project_templates").select("*").order("name")

      if (error) throw error

      if (data && data.length > 0) {
        setTemplates(data)
      } else {
        // If no data returned, use mock data
        console.log("No templates found in database, using mock data")
        setTemplates(MOCK_TEMPLATES)
        setUseMockData(true)
      }
    } catch (err) {
      console.error("Error fetching templates:", err)
      setError("Failed to load project templates. Using default templates instead.")
      setTemplates(MOCK_TEMPLATES)
      setUseMockData(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Make sure we have a user
      if (!user || !user.id) {
        setError("You must be logged in to create a project. Please sign in and try again.")
        setTimeout(() => {
          router.push("/sign-in?redirect=/projects/new")
        }, 2000)
        return
      }

      // Create a new FormData object
      const formData = new FormData()

      // Add the user ID to the form data
      formData.append("user_id", user.id)

      // Get form values directly from named elements in the event target
      const form = event.target as HTMLFormElement

      // Add form fields safely with null checks
      const nameInput = form.elements.namedItem("name") as HTMLInputElement
      formData.append("name", nameInput ? nameInput.value : "")

      const descriptionInput = form.elements.namedItem("description") as HTMLTextAreaElement
      formData.append("description", descriptionInput ? descriptionInput.value : "")

      const methodologyInput = form.elements.namedItem("methodology") as HTMLSelectElement
      formData.append("methodology", methodologyInput ? methodologyInput.value : "scrum")

      const sprintLengthInput = form.elements.namedItem("sprint_length") as HTMLSelectElement
      formData.append("sprint_length", sprintLengthInput ? sprintLengthInput.value : "14")

      // For radio buttons, we need to find the checked one
      const teamSizeInputs = form.querySelectorAll('input[name="team_size"]') as NodeListOf<HTMLInputElement>
      let teamSize = "small" // Default value
      teamSizeInputs.forEach((input) => {
        if (input.checked) {
          teamSize = input.value
        }
      })
      formData.append("team_size", teamSize)

      // Add template ID if selected
      if (selectedTemplate) {
        formData.append("template_id", selectedTemplate)
      }

      console.log("Submitting form with user ID:", user.id)

      // Call the server action
      const result = await createProject(formData)

      if (result?.error) {
        setError(result.error)

        // If it's an auth error, refresh the session and redirect to sign in
        if (
          result.error.includes("logged in") ||
          result.error.includes("authentication") ||
          result.error.includes("sign in") ||
          result.error.includes("session")
        ) {
          setTimeout(() => {
            router.push("/sign-in?redirect=/projects/new")
          }, 2000)
        }
      } else if (result?.projectId) {
        router.push(`/projects/${result.projectId}`)
        return
      }
    } catch (err) {
      console.error("Error creating project:", err)
      setError("Failed to create project. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Find template objects by name
  const softwareTemplate = templates.find((t) => t.name === "Software Development")
  const marketingTemplate = templates.find((t) => t.name === "Marketing Campaign")
  const eventTemplate = templates.find((t) => t.name === "Event Planning")

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="container py-10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading templates...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container py-10">
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Create New Project</h1>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              {useMockData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUseMockData(false)
                    fetchTemplates()
                  }}
                  className="ml-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="template" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template">Choose Template</TabsTrigger>
            <TabsTrigger value="custom">Custom Project</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {softwareTemplate && (
                <Card
                  className={`cursor-pointer transition-all hover:border-primary ${selectedTemplate === softwareTemplate.id ? "border-2 border-primary" : ""}`}
                  onClick={() => setSelectedTemplate(softwareTemplate.id)}
                >
                  <CardHeader>
                    <Code className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Software Development</CardTitle>
                    <CardDescription>
                      Agile software development project with sprints, user stories, and technical tasks.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Pre-configured Scrum framework</li>
                      <li>• Technical team roles</li>
                      <li>• Software-specific metrics</li>
                      <li>• 2-week sprint cycles</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant={selectedTemplate === softwareTemplate.id ? "default" : "outline"}
                      className="w-full"
                    >
                      {selectedTemplate === softwareTemplate.id ? "Selected" : "Select Template"}
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {marketingTemplate && (
                <Card
                  className={`cursor-pointer transition-all hover:border-primary ${selectedTemplate === marketingTemplate.id ? "border-2 border-primary" : ""}`}
                  onClick={() => setSelectedTemplate(marketingTemplate.id)}
                >
                  <CardHeader>
                    <Megaphone className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Marketing Campaign</CardTitle>
                    <CardDescription>
                      Agile marketing project with campaign planning, content creation, and analytics.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Kanban workflow</li>
                      <li>• Marketing team roles</li>
                      <li>• Campaign metrics</li>
                      <li>• Content calendar</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant={selectedTemplate === marketingTemplate.id ? "default" : "outline"}
                      className="w-full"
                    >
                      {selectedTemplate === marketingTemplate.id ? "Selected" : "Select Template"}
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {eventTemplate && (
                <Card
                  className={`cursor-pointer transition-all hover:border-primary ${selectedTemplate === eventTemplate.id ? "border-2 border-primary" : ""}`}
                  onClick={() => setSelectedTemplate(eventTemplate.id)}
                >
                  <CardHeader>
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Event Planning</CardTitle>
                    <CardDescription>
                      Agile event management with timeline, vendor coordination, and budget tracking.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Timeline-based planning</li>
                      <li>• Event coordination roles</li>
                      <li>• Budget tracking</li>
                      <li>• Vendor management</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant={selectedTemplate === eventTemplate.id ? "default" : "outline"} className="w-full">
                      {selectedTemplate === eventTemplate.id ? "Selected" : "Select Template"}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>

            {selectedTemplate && (
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Project Details</h2>
                  <p className="text-muted-foreground">Customize your project</p>
                </div>

                <div className="space-y-4">
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
                    <Label>Team Size</Label>
                    <RadioGroup defaultValue="small" name="team_size" className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="small" id="small" />
                        <Label htmlFor="small">Small (3-5)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium">Medium (6-10)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="large" id="large" />
                        <Label htmlFor="large">Large (11+)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <Button type="submit" size="lg" className="mt-6" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Project...
                    </>
                  ) : (
                    "Create Project"
                  )}
                </Button>
              </form>
            )}
          </TabsContent>

          <TabsContent value="custom" className="mt-6">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Custom Project</CardTitle>
                  <CardDescription>
                    Create a project from scratch with your own settings and configurations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="custom-name">Project Name</Label>
                    <Input id="custom-name" name="name" placeholder="Enter project name" required />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="custom-description">Project Description</Label>
                    <Textarea
                      id="custom-description"
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
                    <Label htmlFor="sprint_length">Sprint Length (if applicable)</Label>
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
                    <Label>Team Configuration</Label>
                    <RadioGroup defaultValue="small" name="team_size" className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="small" id="custom-small" />
                        <Label htmlFor="custom-small">Small (3-5)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="custom-medium" />
                        <Label htmlFor="custom-medium">Medium (6-10)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="large" id="custom-large" />
                        <Label htmlFor="custom-large">Large (11+)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Project...
                      </>
                    ) : (
                      "Create Custom Project"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
