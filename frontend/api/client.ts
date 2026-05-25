import axios from "axios"

import { apiValidationErrorSchema } from "@/schemas/api-validation-error"
import type { ApiRequestOptions } from "@/types/api/client"

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export class ApiValidationError extends ApiError {
  constructor(
    message: string,
    public readonly errors: Record<string, string[]>,
    status = 422,
  ) {
    super(message, status)
    this.name = "ApiValidationError"
  }
}

export const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000"

const apiClient = axios.create({
  baseURL: backendUrl,
  headers: {
    Accept: "application/json",
  },
})

export function getAuthorizationHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  }
}

function getFriendlyMessage(status?: number) {
  if (status === 422) {
    return "Revise os dados informados e tente novamente."
  }

  if (status === 401) {
    return "Não foi possível validar sua sessão. Entre novamente e tente outra vez."
  }

  if (status === 403) {
    return "Você não tem permissão para realizar esta ação."
  }

  if (status === 404) {
    return "Não foi possível encontrar os dados solicitados."
  }

  if (status !== undefined && status >= 500) {
    return "O servidor não conseguiu concluir a solicitação agora. Tente novamente em instantes."
  }

  return "Não foi possível concluir a solicitação."
}

export async function apiRequest<T>({
  parser,
  ...config
}: ApiRequestOptions<T>): Promise<T> {
  try {
    const response = await apiClient.request({
      ...config,
    })

    try {
      return parser(response.data)
    } catch {
      throw new ApiError(
        "Recebemos uma resposta inválida do servidor. Tente novamente.",
        response.status,
      )
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new ApiError(
          "Não foi possível concluir a solicitação agora. Tente novamente em instantes.",
        )
      }

      if (error.response.status === 422) {
        const parsedPayload = apiValidationErrorSchema.safeParse(error.response.data)

        if (parsedPayload.success) {
          throw new ApiValidationError(
            parsedPayload.data.message,
            parsedPayload.data.errors,
          )
        }
      }

      throw new ApiError(getFriendlyMessage(error.response.status), error.response.status)
    }

    throw new ApiError("Ocorreu um erro inesperado. Tente novamente.")
  }
}
