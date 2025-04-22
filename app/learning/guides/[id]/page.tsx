import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BookOpen, Calendar, FileText } from "lucide-react"
import { getSupabaseServer } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"

export default async function GuideDetailPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServer()

  // Fetch guide details
  const { data: guide, error } = await supabase
    .from("learning_resources")
    .select("*")
    .eq("id", params.id)
    .eq("type", "guide")
    .single()

  if (error || !guide) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container py-10">
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/learning">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{guide.title}</h1>
            <p className="text-muted-foreground">{guide.description}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <div className="prose max-w-none">
                  <h2>Introduction</h2>
                  <p>
                    {guide.content ||
                      `This guide provides practical advice on ${guide.title.toLowerCase()}. Whether you're new to agile or an experienced practitioner, you'll find valuable insights to improve your practice.`}
                  </p>

                  <h2>Key Principles</h2>
                  <p>
                    When implementing agile practices, it's important to understand the underlying principles that make
                    them effective. This guide will walk you through the essential concepts and provide practical
                    examples.
                  </p>

                  <h3>1. Focus on Value</h3>
                  <p>
                    The primary goal of any agile practice is to deliver value to the customer. This means prioritizing
                    work that has the greatest impact and continuously seeking feedback to ensure you're building the
                    right thing.
                  </p>

                  <h3>2. Embrace Collaboration</h3>
                  <p>
                    Agile methodologies emphasize collaboration between team members, stakeholders, and customers.
                    Regular communication and transparency are key to successful implementation.
                  </p>

                  <h3>3. Adapt and Improve</h3>
                  <p>
                    Agile is about continuous improvement. Regularly reflect on your processes and be willing to adapt
                    based on what you learn.
                  </p>

                  <h2>Practical Implementation</h2>
                  <p>Now that we understand the principles, let's look at how to implement them in practice:</p>

                  <ul>
                    <li>Start with small, manageable changes</li>
                    <li>Involve the entire team in the process</li>
                    <li>Collect feedback regularly</li>
                    <li>Measure results to track improvement</li>
                    <li>Be patient - cultural change takes time</li>
                  </ul>

                  <h2>Common Challenges</h2>
                  <p>
                    Implementing agile practices often comes with challenges. Here are some common ones and strategies
                    to overcome them:
                  </p>

                  <h3>Resistance to Change</h3>
                  <p>
                    People naturally resist change. Address this by clearly communicating the benefits, involving team
                    members in the process, and celebrating small wins.
                  </p>

                  <h3>Lack of Leadership Support</h3>
                  <p>
                    Agile transformations need leadership support to succeed. Educate leaders on the benefits and
                    involve them in the process.
                  </p>

                  <h2>Conclusion</h2>
                  <p>
                    Implementing agile practices is a journey, not a destination. By focusing on the principles and
                    adapting them to your specific context, you can create a more effective, collaborative, and
                    responsive team.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Guide Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Reading Time</span>
                  <span className="text-sm font-medium">{guide.duration} minutes</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Updated</span>
                  <span className="text-sm font-medium">{new Date(guide.updated_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Difficulty</span>
                  <span className="text-sm font-medium">{guide.difficulty}</span>
                </div>

                <div className="pt-4">
                  <Button className="w-full">Mark as Completed</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Related Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Agile Fundamentals</h4>
                    <p className="text-xs text-muted-foreground">Comprehensive course on agile principles</p>
                    <Button variant="link" className="px-0 h-auto text-xs">
                      View Course
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">User Story Writing Workshop</h4>
                    <p className="text-xs text-muted-foreground">Learn to write effective user stories</p>
                    <Button variant="link" className="px-0 h-auto text-xs">
                      Read Guide
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Sprint Planning Template</h4>
                    <p className="text-xs text-muted-foreground">Template for effective sprint planning</p>
                    <Button variant="link" className="px-0 h-auto text-xs">
                      Download
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
