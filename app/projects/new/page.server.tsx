import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/supabase/server"

export async function generateMetadata() {
  return {
    title: "Create New Project - Agile PM Platform",
    description: "Create a new project with templates or custom settings",
  }
}

export default async function NewProjectPage() {
  // Check if the user is authenticated on the server side
  const { session } = await getServerSession()

  // If not authenticated, redirect to sign in
  if (!session) {
    redirect("/sign-in?redirect=/projects/new")
  }

  // Import the client component
  const NewProject = (await import("./page-client")).default

  // Return the client component
  return <NewProject />
}
