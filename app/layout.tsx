import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { EnvironmentCheck } from "@/components/env-check"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AgilePM - Agile Project Management Learning Platform",
  description: "Learn and practice agile project management in a simulated environment",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <EnvironmentCheck />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
