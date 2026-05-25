"use client"

import { useAuth } from "@clerk/nextjs"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { ApiError, ApiValidationError } from "@/api/client"
import { updateClient } from "@/api/clients"
import type { ClientFormValues } from "@/types/client"
import type { UseUpdateClientMutationOptions } from "@/types/hooks/client"

export function useUpdateClientMutation({
  clientId,
  onSuccess,
}: UseUpdateClientMutationOptions) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ClientFormValues) => {
      const token = await getToken()

      if (!token) {
        throw new ApiError(
          "Não foi possível concluir a atualização agora. Tente novamente.",
        )
      }

      return updateClient({
        clientId,
        data,
        token,
      })
    },
    onSuccess: async () => {
      toast.success("Cliente atualizado com sucesso.")
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["clients"] }),
        queryClient.invalidateQueries({ queryKey: ["client", clientId] }),
      ])
      onSuccess?.()
    },
    onError: (error) => {
      if (error instanceof ApiValidationError) {
        return
      }

      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível atualizar o cliente agora. Tente novamente.",
      )
    },
  })
}
