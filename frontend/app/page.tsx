import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs"

import { BackendAuthStatus } from "@/components/backend-auth-status"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top,theme(colors.orange.100),transparent_38%),linear-gradient(180deg,theme(colors.background),theme(colors.orange.50/.45))] p-6 dark:bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.2),transparent_30%),linear-gradient(180deg,theme(colors.background),rgba(24,24,27,0.98))]">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-6xl flex-col rounded-[2rem] border border-border/70 bg-background/90 p-6 shadow-xl shadow-orange-950/5 backdrop-blur md:p-10">
        <header className="flex items-center justify-between gap-4 border-b border-border/70 pb-6">
          <div>
            <p className="text-sm font-medium text-primary">Teste Use Mais</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Clerk authentication is ready
            </h1>
          </div>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </header>

        <section className="grid flex-1 items-center gap-10 py-10 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-primary uppercase">
                Next.js + Clerk
              </p>
              <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
                Add your first user from the app navigation, not from a demo
                screen.
              </h2>
              <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
                Sign up with Clerk, confirm the user button appears in the
                header, and use this page as the starting point for the rest of
                your product.
              </p>
            </div>

            <Show when="signed-out">
              <div className="flex flex-wrap gap-3">
                <SignUpButton mode="redirect">
                  <Button size="lg">Create account</Button>
                </SignUpButton>
                <SignInButton mode="redirect">
                  <Button variant="outline" size="lg">
                    Sign in
                  </Button>
                </SignInButton>
              </div>
            </Show>

            <Show when="signed-in">
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg">Start building</Button>
                <p className="text-sm text-muted-foreground">
                  Your session is active and the app can now use Clerk-protected
                  routes.
                </p>
              </div>
            </Show>
          </div>

          <aside className="rounded-[1.75rem] border border-border/70 bg-muted/40 p-6 shadow-sm">
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium">What to verify</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  The page should clearly show auth actions when signed out and
                  the profile control when signed in.
                </p>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-border bg-background px-4 py-3">
                  1. Click{" "}
                  <span className="font-medium text-foreground">
                    Create account
                  </span>
                </div>
                <div className="rounded-2xl border border-border bg-background px-4 py-3">
                  2. Finish the first sign-up flow
                </div>
                <div className="rounded-2xl border border-border bg-background px-4 py-3">
                  3. Confirm the{" "}
                  <span className="font-medium text-foreground">
                    UserButton
                  </span>{" "}
                  shows in the header
                </div>
                <div className="rounded-2xl border border-border bg-background px-4 py-3">
                  4. Verify the backend auth check succeeds
                </div>
              </div>
              <BackendAuthStatus />
              <p className="font-mono text-xs text-muted-foreground">
                Press <kbd>d</kbd> to toggle dark mode.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
