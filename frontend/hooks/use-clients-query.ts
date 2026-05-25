"use client"

import { useAuth } from "@clerk/nextjs"
import { useQuery } from "@tanstack/react-query"

import { ApiError } from "@/api/client"
import { listClients } from "@/api/clients"
import type { UseClientsQueryOptions } from "@/types/hooks/client"

export function useClientsQuery({ page, perPage }: UseClientsQueryOptions) {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  return useQuery({
    queryKey: ["clients", page, perPage],
    enabled: isLoaded && isSignedIn,
    queryFn: async () => {
      const token = await getToken()

      if (!token) {
        throw new ApiError(
          "Não foi possível carregar os clientes agora. Tente novamente.",
        )
      }

      return listClients({
        page,
        perPage,
        token,
      })
    },
  })
}
