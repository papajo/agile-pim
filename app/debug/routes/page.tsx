import { headers } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugRoutesPage() {
  const headersList = headers()
  const userAgent = headersList.get("user-agent")
  const host = headersList.get("host")
  const referer = headersList.get("referer")

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Route Debugging</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Headers</CardTitle>
            <CardDescription>Information about the current request</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(
                {
                  userAgent,
                  host,
                  referer,
                },
                null,
                2,
              )}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Routes</CardTitle>
            <CardDescription>Routes defined in the application</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="p-2 bg-gray-100 rounded">
                <span className="font-mono">/</span> - Home Page
              </li>
              <li className="p-2 bg-gray-100 rounded">
                <span className="font-mono">/sign-in</span> - Sign In Page
              </li>
              <li className="p-2 bg-gray-100 rounded">
                <span className="font-mono">/sign-up</span> - Sign Up Page
              </li>
              <li className="p-2 bg-gray-100 rounded">
                <span className="font-mono">/projects/new</span> - Create New Project
              </li>
              <li className="p-2 bg-gray-100 rounded">
                <span className="font-mono">/projects/[id]</span> - Project Details
              </li>
              <li className="p-2 bg-gray-100 rounded">
                <span className="font-mono">/projects/[id]/team</span> - Project Team
              </li>
              <li className="p-2 bg-gray-100 rounded">
                <span className="font-mono">/dashboard</span> - Dashboard
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
