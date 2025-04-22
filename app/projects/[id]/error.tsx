"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Project error:", error)

    // If it's an auth error, redirect to sign in
    if (error.message.includes("Authentication required") || error.name === "AuthRequiredError") {
      const currentPath = window.location.pathname
      router.push(`/sign-in?redirect=${encodeURIComponent(currentPath)}`)
    }
  }, [error, router])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>
            {error.message.includes("Authentication required") || error.name === "AuthRequiredError"
              ? "You need to be signed in to view this project."
              : "An error occurred while loading this project."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error.message.includes("Authentication required") || error.name === "AuthRequiredError"
              ? "You'll be redirected to the sign in page."
              : "Please try again or contact support if the problem persists."}
          </p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              router.push("/dashboard")
            }}
          >
            Go to Dashboard
          </Button>
          {!error.message.includes("Authentication required") && error.name !== "AuthRequiredError" && (
            <Button
              onClick={() => {
                reset()
              }}
            >
              Try Again
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
