import Link from "next/link"
import { SignInForm } from "@/components/auth/sign-in-form"
import { Header } from "@/components/layout/header"

export default function SignInPage({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container flex flex-1 flex-col items-center justify-center py-12">
        <div className="w-full max-w-md">
          <SignInForm redirectTo={searchParams.redirect} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
