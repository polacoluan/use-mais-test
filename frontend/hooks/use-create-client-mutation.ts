"use client"

import { useAuth } from "@clerk/nextjs"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { ApiError, ApiValidationError } from "@/api/client"
import { createClient } from "@/api/clients"
import type { ClientFormValues } from "@/types/client"
import type { UseCreateClientMutationOptions } from "@/types/hooks/client"

export function useCreateClientMutation({
  onSuccess,
}: UseCreateClientMutationOptions = {}) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ClientFormValues) => {
      const token = await getToken()

      if (!token) {
        throw new ApiError(
          "Não foi possível concluir o cadastro agora. Tente novamente.",
        )
      }

      return createClient({
        data,
        token,
      })
    },
    onSuccess: async (client) => {
      toast.success("Cliente cadastrado com sucesso.")
      await queryClient.invalidateQueries({
        queryKey: ["clients"],
      })
      onSuccess?.(client.id)
    },
    onError: (error) => {
      if (error instanceof ApiValidationError) {
        return
      }

      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível cadastrar o cliente agora. Tente novamente.",
      )
    },
  })
}
