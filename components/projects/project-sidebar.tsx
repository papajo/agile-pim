"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, HelpCircle, LayoutDashboard, LineChart, ListTodo, Settings, Users } from "lucide-react"

interface ProjectSidebarProps {
  projectId: string
}

export function ProjectSidebar({ projectId }: ProjectSidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === `/projects/${projectId}${path}`
  }

  return (
    <nav className="grid gap-2">
      <Button variant={isActive("") ? "default" : "ghost"} className="justify-start" asChild>
        <Link href={`/projects/${projectId}`}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Overview
        </Link>
      </Button>
      <Button variant={isActive("/backlog") ? "default" : "ghost"} className="justify-start" asChild>
        <Link href={`/projects/${projectId}/backlog`}>
          <ListTodo className="mr-2 h-4 w-4" />
          Backlog
        </Link>
      </Button>
      <Button variant={isActive("/board") ? "default" : "ghost"} className="justify-start" asChild>
        <Link href={`/projects/${projectId}/board`}>
          <FileText className="mr-2 h-4 w-4" />
          Board
        </Link>
      </Button>
      <Button variant={isActive("/sprints") ? "default" : "ghost"} className="justify-start" asChild>
        <Link href={`/projects/${projectId}/sprints`}>
          <Calendar className="mr-2 h-4 w-4" />
          Sprints
        </Link>
      </Button>
      <Button variant={isActive("/team") ? "default" : "ghost"} className="justify-start" asChild>
        <Link href={`/projects/${projectId}/team`}>
          <Users className="mr-2 h-4 w-4" />
          Team
        </Link>
      </Button>
      <Button variant={isActive("/reports") ? "default" : "ghost"} className="justify-start" asChild>
        <Link href={`/projects/${projectId}/reports`}>
          <LineChart className="mr-2 h-4 w-4" />
          Reports
        </Link>
      </Button>
      <Button variant={isActive("/learning") ? "default" : "ghost"} className="justify-start" asChild>
        <Link href={`/projects/${projectId}/learning`}>
          <HelpCircle className="mr-2 h-4 w-4" />
          Learning
        </Link>
      </Button>
      <Button variant={isActive("/settings") ? "default" : "ghost"} className="justify-start" asChild>
        <Link href={`/projects/${projectId}/settings`}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Link>
      </Button>
    </nav>
  )
}
