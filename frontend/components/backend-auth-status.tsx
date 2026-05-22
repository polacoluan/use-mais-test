"use client"

import { useAuth, useUser } from "@clerk/nextjs"
import { useState } from "react"

import { Button } from "@/components/ui/button"

type BackendProfileResponse = {
  data: {
    id: number
    clerk_user_id: string
    name: string
    email: string
  }
  meta: {
    clerk: {
      session_id: string | null
      user_id: string | null
    }
  }
}

type BackendStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; profile: BackendProfileResponse }
  | { kind: "error"; message: string }

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000"

export function BackendAuthStatus() {
  const { getToken, isSignedIn } = useAuth()
  const { user } = useUser()
  const [status, setStatus] = useState<BackendStatus>({ kind: "idle" })

  async function fetchBackendProfile() {
    if (!isSignedIn) {
      setStatus({ kind: "idle" })
      return
    }

    setStatus({ kind: "loading" })

    try {
      const token = await getToken()

      if (!token) {
        setStatus({
          kind: "error",
          message: "Clerk did not return a session token.",
        })
        return
      }

      const response = await fetch(`${backendUrl}/api/v1/me`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      const payload = (await response.json()) as
        | BackendProfileResponse
        | { message?: string }

      if (!response.ok) {
        const errorMessage = "message" in payload ? payload.message : undefined

        setStatus({
          kind: "error",
          message:
            errorMessage ??
            `Backend request failed with status ${response.status}.`,
        })
        return
      }

      setStatus({ kind: "success", profile: payload as BackendProfileResponse })
    } catch (error) {
      setStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to reach the backend.",
      })
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-border/70 bg-background p-5">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium">Backend auth check</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Signed-in requests send a Clerk session token to Laravel at{" "}
            <span className="font-mono text-xs text-foreground">
              {backendUrl}
            </span>
            .
          </p>
        </div>

        {!isSignedIn ? (
          <p className="text-sm text-muted-foreground">
            Sign in or create an account to test the Laravel endpoint.
          </p>
        ) : null}

        {isSignedIn && status.kind === "idle" ? (
          <p className="text-sm text-muted-foreground">
            Click{" "}
            <span className="font-medium text-foreground">Recheck backend</span>{" "}
            to send your Clerk session token to Laravel.
          </p>
        ) : null}

        {status.kind === "loading" ? (
          <p className="text-sm text-muted-foreground">
            Checking the authenticated backend session for{" "}
            {user?.primaryEmailAddress?.emailAddress ?? user?.id}...
          </p>
        ) : null}

        {status.kind === "success" ? (
          <div className="space-y-2 text-sm">
            <p className="font-medium text-foreground">
              Backend accepted the Clerk token.
            </p>
            <p className="text-muted-foreground">
              Local user{" "}
              <span className="font-mono text-foreground">
                #{status.profile.data.id}
              </span>{" "}
              is mapped to{" "}
              <span className="font-mono text-foreground">
                {status.profile.data.clerk_user_id}
              </span>
              .
            </p>
            <p className="text-muted-foreground">
              Email on the Laravel side:{" "}
              <span className="font-mono text-foreground">
                {status.profile.data.email}
              </span>
            </p>
          </div>
        ) : null}

        {status.kind === "error" ? (
          <div className="space-y-2 text-sm">
            <p className="font-medium text-destructive">
              Backend check failed.
            </p>
            <p className="text-muted-foreground">{status.message}</p>
          </div>
        ) : null}

        <Button
          type="button"
          variant="outline"
          onClick={() => void fetchBackendProfile()}
          disabled={!isSignedIn || status.kind === "loading"}
        >
          Recheck backend
        </Button>
      </div>
    </div>
  )
}
