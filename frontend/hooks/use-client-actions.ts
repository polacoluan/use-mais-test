"use client"

import { useRouter } from "next/navigation"

export function useClientActions() {
  const router = useRouter()

  function handleEdit(clientId: number) {
    router.push(`/clients/${clientId}/edit`)
  }

  return {
    handleEdit,
  }
}
