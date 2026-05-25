"use client"

import { useAuth } from "@clerk/nextjs"
import { useQuery } from "@tanstack/react-query"

import { ApiError } from "@/api/client"
import { getClient } from "@/api/clients"
import type { UseClientQueryOptions } from "@/types/hooks/client"

export function useClientQuery({
  clientId,
  enabled = true,
}: UseClientQueryOptions) {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  return useQuery({
    queryKey: ["client", clientId],
    enabled: enabled && isLoaded && isSignedIn,
    queryFn: async () => {
      const token = await getToken()

      if (!token) {
        throw new ApiError(
          "Não foi possível carregar o cliente agora. Tente novamente.",
        )
      }

      return getClient({
        clientId,
        token,
      })
    },
  })
}
