import Link from "next/link"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { Header } from "@/components/layout/header"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container flex flex-1 flex-col items-center justify-center py-12">
        <div className="w-full max-w-md">
          <SignUpForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
