import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/supabase/server"
import { NewProjectForm } from "./new-project-form"

export default async function NewProjectPage() {
  try {
    // Check if the user is authenticated on the server side
    const { session, user } = await getServerSession()

    // If not authenticated, redirect to sign in
    if (!session || !user) {
      console.log("User not authenticated, redirecting to sign in")
      redirect("/sign-in?redirect=/projects/new")
    }

    // If authenticated, render the client component
    return <NewProjectForm userId={user.id} />
  } catch (error) {
    console.error("Error in NewProjectPage:", error)
    // Return a simple error message instead of redirecting
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-4">Error Loading Page</h1>
        <p>There was an error loading the project creation page. Please try again later.</p>
        <pre className="bg-gray-100 p-4 mt-4 rounded overflow-auto">
          {error instanceof Error ? error.message : "Unknown error"}
        </pre>
      </div>
    )
  }
}
