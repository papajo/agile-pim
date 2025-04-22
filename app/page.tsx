import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function Home() {
  let isAuthenticated = false

  try {
    const cookieStore = cookies()

    // Get cookies as a simple object
    const cookieObj: Record<string, string> = {}
    cookieStore.getAll().forEach((cookie) => {
      cookieObj[cookie.name] = cookie.value
    })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            cookie: Object.entries(cookieObj)
              .map(([name, value]) => `${name}=${value}`)
              .join("; "),
          },
        },
      },
    )

    // Try to get the user session
    const { data, error } = await supabase.auth.getSession()

    // Don't treat missing session as an error
    if (error && error.message !== "Auth session missing!") {
      console.error("Error checking session:", error)
    }

    // Check if user is logged in
    isAuthenticated = !!data?.session
  } catch (error) {
    // If there's an error, just continue rendering the landing page
    console.error("Error checking session:", error)
  }

  // If user is logged in, redirect to dashboard
  // We do this after the try/catch to avoid throwing during error handling
  if (isAuthenticated) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Learn Agile Project Management
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Master agile methodologies through interactive projects and simulations. Perfect for beginners and
                    experienced professionals.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/sign-up" passHref>
                    <Button size="lg">Get Started</Button>
                  </Link>
                  <Link href="/learning" passHref>
                    <Button variant="outline" size="lg">
                      Explore Resources
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Why Learn Agile?</CardTitle>
                    <CardDescription>
                      Agile methodologies are essential in today's fast-paced work environment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                      <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Increased Productivity</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Teams using Agile report up to 50% faster delivery times
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                      <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Better Collaboration</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Improve team communication and stakeholder engagement
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                      <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Career Advancement</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Agile skills are among the most in-demand in project management
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href="/sign-up" className="w-full" passHref>
                      <Button className="w-full">Sign Up Free</Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Features of Our Learning Platform
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Everything you need to master agile project management in one place
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Interactive Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Apply agile concepts in simulated project environments with real-world scenarios.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Comprehensive Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Learn Scrum, Kanban, and other methodologies through structured courses.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Progress Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Monitor your learning journey with detailed progress analytics.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Team Collaboration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Practice with simulated team members or invite colleagues to join your projects.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Certification Prep</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Prepare for industry certifications with targeted learning paths.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Resource Library</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Access templates, guides, and best practices for agile implementation.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
