"use client"

import { useClerk, useUser } from "@clerk/nextjs"
import { startTransition, useMemo, useState } from "react"

export function useSidebarUser() {
  const { signOut } = useClerk()
  const { user } = useUser()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const initials = useMemo(() => {
    const name =
      user?.fullName?.trim() ||
      user?.firstName?.trim() ||
      user?.primaryEmailAddress?.emailAddress ||
      "Usuário"

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
  }, [user?.firstName, user?.fullName, user?.primaryEmailAddress?.emailAddress])

  function handleSignOut() {
    setIsSigningOut(true)

    startTransition(() => {
      void signOut({
        redirectUrl: "/sign-in",
      }).finally(() => {
        setIsSigningOut(false)
      })
    })
  }

  return {
    email: user?.primaryEmailAddress?.emailAddress ?? "",
    handleSignOut,
    imageUrl: user?.imageUrl,
    initials,
    isSigningOut,
    name: user?.fullName?.trim() || user?.firstName?.trim() || "Usuário",
  }
}
