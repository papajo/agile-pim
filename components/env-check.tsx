"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function EnvironmentCheck() {
  const [missingVars, setMissingVars] = useState<string[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Only check environment variables on the client side
    const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

    const missing = requiredVars.filter((varName) => {
      const value = process.env[varName]
      return !value || value.trim() === ""
    })

    setMissingVars(missing)
  }, [])

  // Don't render anything during SSR
  if (!isClient) return null

  // Don't render anything if no missing vars
  if (missingVars.length === 0) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Environment Error</AlertTitle>
      <AlertDescription>
        The following environment variables are missing: {missingVars.join(", ")}
        <br />
        Please make sure these are set in your environment.
      </AlertDescription>
    </Alert>
  )
}
