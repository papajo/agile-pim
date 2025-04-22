import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { getSupabaseServer, getServerSession } from "@/lib/supabase/server"
import { PlusCircle, BookOpen, BarChart } from "lucide-react"

export default async function Dashboard() {
  // Get the session without throwing errors
  const { session, user } = await getServerSession()

  // If user is not logged in, redirect to sign in
  if (!session) {
    redirect("/sign-in?redirect=/dashboard")
  }

  const supabase = getSupabaseServer()

  // Fetch user's projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch learning resources
  const { data: resources } = await supabase.from("learning_resources").select("*").limit(3)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

          <div className="grid gap-8 md:grid-cols-2">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Your Projects</h2>
                <Link href="/projects/new" passHref>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </Link>
              </div>

              {projects && projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <Card key={project.id}>
                      <CardHeader className="pb-2">
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>
                          {project.methodology.charAt(0).toUpperCase() + project.methodology.slice(1)} •{" "}
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {project.description || "No description provided"}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/projects/${project.id}`} passHref>
                          <Button variant="outline" size="sm">
                            View Project
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No projects yet</CardTitle>
                    <CardDescription>Create your first agile project to get started</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Link href="/projects/new" passHref>
                      <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Project
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Learning Resources</h2>
                <Link href="/learning" passHref>
                  <Button variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>

              {resources && resources.length > 0 ? (
                <div className="space-y-4">
                  {resources.map((resource) => (
                    <Card key={resource.id}>
                      <CardHeader className="pb-2">
                        <CardTitle>{resource.title}</CardTitle>
                        <CardDescription>
                          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)} •{" "}
                          {resource.difficulty
                            ? resource.difficulty.charAt(0).toUpperCase() + resource.difficulty.slice(1)
                            : "All Levels"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {resource.description || "No description provided"}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/learning/${resource.id}`} passHref>
                          <Button variant="outline" size="sm">
                            Start Learning
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Learning resources</CardTitle>
                    <CardDescription>Explore our library of agile learning materials</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Link href="/learning" passHref>
                      <Button variant="outline">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Browse Resources
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              )}
            </section>
          </div>

          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Your Progress</h2>
              <Button variant="outline">
                <BarChart className="h-4 w-4 mr-2" />
                View Stats
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Track your journey through agile methodologies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Scrum Fundamentals</span>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                      <div className="h-full bg-primary rounded-full" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Kanban Basics</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                      <div className="h-full bg-primary rounded-full" style={{ width: "25%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Agile Leadership</span>
                      <span className="text-sm font-medium">0%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                      <div className="h-full bg-primary rounded-full" style={{ width: "0%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/learning" passHref>
                  <Button variant="outline">Continue Learning</Button>
                </Link>
              </CardFooter>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}
