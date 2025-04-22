import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BookOpen, Calendar, FileText, Layers, Play, Users } from "lucide-react"
import { getSupabaseServer } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"

export default async function LearningPage() {
  const supabase = getSupabaseServer()

  // Fetch courses with error handling
  let courses = []
  try {
    const { data, error } = await supabase
      .from("learning_resources")
      .select("*")
      .eq("type", "course")
      .order("created_at", { ascending: false })

    if (!error) {
      courses = data || []
    } else {
      console.error("Error fetching courses:", error)
    }
  } catch (error) {
    console.error("Error fetching courses:", error)
  }

  // Fetch guides with error handling
  let guides = []
  try {
    const { data, error } = await supabase
      .from("learning_resources")
      .select("*")
      .eq("type", "guide")
      .order("created_at", { ascending: false })

    if (!error) {
      guides = data || []
    } else {
      console.error("Error fetching guides:", error)
    }
  } catch (error) {
    console.error("Error fetching guides:", error)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Learning Center</h1>
            <p className="text-muted-foreground">Master agile project management concepts and techniques</p>
          </div>
          <Button>
            <BookOpen className="mr-2 h-4 w-4" />
            My Learning Path
          </Button>
        </div>

        <Tabs defaultValue="courses" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="glossary">Glossary</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Featured Courses</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course: any) => (
                  <Card key={course.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <Badge className="mb-2">{course.difficulty}</Badge>
                        <Badge variant="outline">
                          {course.duration ? `${Math.floor(course.duration / 60)} hours` : "Self-paced"}
                        </Badge>
                      </div>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">2,345 enrolled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">8 modules</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" asChild>
                        <Link href={`/learning/courses/${course.id}`}>
                          Start Course
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Interactive Simulations</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Sprint Planning Simulation</CardTitle>
                    <CardDescription>
                      Practice facilitating a sprint planning meeting with a virtual team
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                      <Play className="h-12 w-12 text-muted-foreground" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">30-45 minutes</div>
                    <Button>Start Simulation</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Backlog Refinement Challenge</CardTitle>
                    <CardDescription>Learn to prioritize and refine a product backlog effectively</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                      <Play className="h-12 w-12 text-muted-foreground" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">20-30 minutes</div>
                    <Button>Start Simulation</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="guides" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Quick Guides</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {guides.map((guide: any) => (
                  <Card key={guide.id}>
                    <CardHeader>
                      <CardTitle>{guide.title}</CardTitle>
                      <CardDescription>{guide.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{guide.duration} minute read</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/learning/guides/${guide.id}`}>Read Guide</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Agile Templates</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Sprint Planning Template</CardTitle>
                    <CardDescription>A structured template for planning your sprints effectively</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Updated 2 weeks ago</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Download Template
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Retrospective Canvas</CardTitle>
                    <CardDescription>A visual canvas for conducting effective retrospectives</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Updated 1 month ago</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Download Template
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="glossary">
            <Card>
              <CardHeader>
                <CardTitle>Agile Terminology Glossary</CardTitle>
                <CardDescription>A comprehensive guide to agile terms and concepts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Backlog</h3>
                    <p className="text-muted-foreground">
                      A prioritized list of features, user stories, tasks, and requirements that define the work to be
                      done.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Burndown Chart</h3>
                    <p className="text-muted-foreground">
                      A graphical representation of work left to do versus time. It shows the actual and estimated
                      amount of work to be done in a sprint or project.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Daily Standup</h3>
                    <p className="text-muted-foreground">
                      A daily timeboxed event (typically 15 minutes) where team members synchronize activities and
                      create a plan for the next 24 hours.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Definition of Done (DoD)</h3>
                    <p className="text-muted-foreground">
                      A shared understanding of what it means for work to be complete, ensuring transparency and
                      quality.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Epic</h3>
                    <p className="text-muted-foreground">
                      A large body of work that can be broken down into smaller stories. It may encompass multiple
                      sprints or even releases.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Kanban</h3>
                    <p className="text-muted-foreground">
                      A visual framework used to implement Agile that uses cards or sticky notes on a board to represent
                      work items and their progress.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Product Owner</h3>
                    <p className="text-muted-foreground">
                      The person responsible for maximizing the value of the product by managing and expressing business
                      and functional expectations for the product to the development team.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Retrospective</h3>
                    <p className="text-muted-foreground">
                      A meeting held at the end of a sprint where the team reflects on what went well, what could be
                      improved, and what actions to take in the next sprint.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Scrum</h3>
                    <p className="text-muted-foreground">
                      A framework within which people can address complex problems, while productively and creatively
                      delivering products of the highest possible value.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Sprint</h3>
                    <p className="text-muted-foreground">
                      A time-boxed period (typically 1-4 weeks) during which a specific set of work must be completed
                      and made ready for review.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">User Story</h3>
                    <p className="text-muted-foreground">
                      A description of a feature from an end-user perspective, typically following the format: "As a
                      [type of user], I want [some goal] so that [some reason]."
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Velocity</h3>
                    <p className="text-muted-foreground">
                      A measure of the amount of work a team can complete in a single sprint, used for planning and
                      forecasting.
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Download Full Glossary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
