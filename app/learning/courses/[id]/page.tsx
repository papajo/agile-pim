import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BookOpen, CheckCircle2, Clock, Play } from "lucide-react"
import { getSupabaseServer } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header" // Assuming Header component exists

// Define Props type separately
type Props = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined }; // Optional searchParams
};

// Use the defined Props type
export default async function CourseDetailPage({ params }: Props) {
  const supabase = getSupabaseServer()

  // Fetch course details
  const { data: course, error } = await supabase
    .from("learning_resources")
    .select("*")
    .eq("id", params.id)
    .eq("type", "course")
    .single()

  if (error || !course) {
    // Log the error for debugging if needed
    if (error) console.error("Error fetching course:", error);
    notFound()
  }

  // Mock modules data - in a real app, this would come from your database
  const modules = [
    { id: 1, title: "Introduction to Agile", description: "Learn the core principles and values of Agile methodologies", duration: 30, completed: true },
    { id: 2, title: "Scrum Framework", description: "Understand the Scrum framework, roles, artifacts, and events", duration: 45, completed: true },
    { id: 3, title: "User Stories", description: "Learn how to write effective user stories and acceptance criteria", duration: 35, completed: false },
    { id: 4, title: "Sprint Planning", description: "Master the sprint planning process and estimation techniques", duration: 40, completed: false },
    { id: 5, title: "Daily Standups", description: "Facilitate effective daily standup meetings", duration: 25, completed: false },
    { id: 6, title: "Sprint Review and Retrospective", description: "Learn how to conduct sprint reviews and retrospectives", duration: 35, completed: false },
    { id: 7, title: "Agile Metrics", description: "Understand key metrics for measuring agile team performance", duration: 30, completed: false },
    { id: 8, title: "Scaling Agile", description: "Introduction to scaling agile practices across teams", duration: 40, completed: false },
  ]

  // Calculate progress
  const completedModules = modules.filter((m) => m.completed).length
  const progress = modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0 // Avoid division by zero

  // Calculate total duration
  const totalDuration = modules.reduce((total, module) => total + module.duration, 0)

  return (
    <div className="flex min-h-screen flex-col">
      <Header /> {/* Ensure Header component is correctly imported and used */}
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8"> {/* Added horizontal padding */}
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/learning">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{course.title}</h1> {/* Adjusted heading size */}
            {course.description && ( /* Conditionally render description */
              <p className="text-muted-foreground mt-1">{course.description}</p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
                <CardDescription>What you'll learn in this course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Course Description</h3>
                  <p className="text-muted-foreground">
                    {course.content ||
                      "This comprehensive course covers the fundamental principles and practices of Agile methodologies, with a focus on practical application. You'll learn how to implement Agile in real-world scenarios and gain the skills needed to work effectively in Agile teams."}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Learning Objectives</h3>
                  {/* Ideally, objectives would come from course data */}
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Understand the core principles and values of Agile</li>
                    <li>Learn the Scrum framework and its implementation</li>
                    <li>Master user story writing and estimation techniques</li>
                    <li>Facilitate effective Agile ceremonies</li>
                    <li>Measure and improve team performance using Agile metrics</li>
                    <li>Apply Agile practices to real-world projects</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Prerequisites</h3>
                  {/* Ideally, prerequisites would come from course data */}
                  <p className="text-muted-foreground">
                    No prior knowledge of Agile is required. Basic understanding of project management concepts is
                    helpful but not necessary.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                {modules.length > 0 && ( /* Conditionally render description */
                  <CardDescription>
                    {modules.length} modules • {Math.floor(totalDuration / 60)} hours {totalDuration % 60} minutes
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {modules.length > 0 ? (
                  <div className="space-y-4">
                    {modules.map((module, index) => (
                      <div key={module.id} className="border rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-2"> {/* Adjusted layout for smaller screens */}
                          <div className="space-y-1 flex-grow"> {/* Allow text to wrap */}
                            <div className="flex items-center">
                              <span className="font-medium">
                                {index + 1}. {module.title}
                              </span>
                              {module.completed && <CheckCircle2 className="h-4 w-4 text-green-500 ml-2 flex-shrink-0" />} {/* Prevent icon shrinking */}
                            </div>
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mt-2 sm:mt-0 flex-shrink-0"> {/* Prevent shrinking */}
                            <Clock className="h-4 w-4 mr-1" />
                            {module.duration} min
                          </div>
                        </div>
                        <div className="mt-4">
                          <Button
                            variant={module.completed ? "outline" : "default"}
                            size="sm"
                            className="w-full sm:w-auto"
                            // Add onClick handler later to navigate/start module
                          >
                            {module.completed ? (
                              <>
                                <BookOpen className="mr-2 h-4 w-4" />
                                Review
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Start
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No modules available for this course yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Course Completion</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} aria-label={`${progress}% course completed`} /> {/* Added aria-label */}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Modules Completed</span>
                  <span className="font-medium">
                    {completedModules}/{modules.length}
                  </span>
                </div>

                <div className="pt-4">
                  <Button className="w-full" disabled={modules.length === 0}> {/* Disable if no modules */}
                    {progress > 0 ? "Continue Course" : "Start Course"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Difficulty</span>
                  {/* Ensure course.difficulty exists and provide fallback */}
                  <Badge variant="outline">{course.difficulty || 'N/A'}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Duration</span>
                  <span className="text-sm font-medium">
                    {/* Use course.duration if available, otherwise calculated */}
                    {course.duration ? `${course.duration} min` : `${Math.floor(totalDuration / 60)} hours ${totalDuration % 60} minutes`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Updated</span>
                  <span className="text-sm font-medium">{new Date(course.updated_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Certificate</span>
                  {/* This should ideally come from course data */}
                  <span className="text-sm font-medium">Yes, upon completion</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Related Courses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mock Related Courses - Fetch dynamically in real app */}
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Product Owner Fundamentals</h4>
                    <p className="text-xs text-muted-foreground">Master the Product Owner role</p>
                    <Button variant="link" className="px-0 h-auto text-xs" asChild>
                      <Link href="#">View Course</Link> {/* Use Link component */}
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Kanban Essentials</h4>
                    <p className="text-xs text-muted-foreground">Learn the Kanban method</p>
                    <Button variant="link" className="px-0 h-auto text-xs" asChild>
                       <Link href="#">View Course</Link> {/* Use Link component */}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
