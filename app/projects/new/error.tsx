"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Header } from "@/components/layout/header"
import { ArrowLeft, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Project creation page error:", error)
  }, [error])

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
          <h1 className="text-3xl font-bold">Error Loading Project Creation</h1>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Something went wrong!</AlertTitle>
          <AlertDescription>
            <p className="mb-4">
              There was an error loading the project creation page. Please try again or contact support if the problem
              persists.
            </p>
            <p className="text-sm font-mono bg-gray-100 p-2 rounded">{error.message || "Unknown error occurred"}</p>
          </AlertDescription>
        </Alert>

        <div className="flex space-x-4">
          <Button onClick={reset} className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
