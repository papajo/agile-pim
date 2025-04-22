import { Loader2 } from "lucide-react"
import { Header } from "@/components/layout/header"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container py-10 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading project creation page...</p>
        </div>
      </div>
    </div>
  )
}
