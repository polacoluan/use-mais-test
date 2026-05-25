"use client"

import { useAuth } from "@clerk/nextjs"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { ApiError } from "@/api/client"
import { deleteClient } from "@/api/clients"
import type { UseDeleteClientMutationOptions } from "@/types/hooks/client"

export function useDeleteClientMutation({
  onSuccess,
}: UseDeleteClientMutationOptions = {}) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (clientId: number) => {
      const token = await getToken()

      if (!token) {
        throw new ApiError(
          "Não foi possível concluir a exclusão agora. Tente novamente.",
        )
      }

      return deleteClient({
        clientId,
        token,
      })
    },
    onSuccess: async (response) => {
      toast.success(response.message)
      await queryClient.invalidateQueries({
        queryKey: ["clients"],
      })
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível remover o cliente agora. Tente novamente.",
      )
    },
  })
}
