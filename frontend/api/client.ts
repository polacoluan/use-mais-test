import axios, { type AxiosRequestConfig } from "axios"

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

type RequestOptions<T> = {
  parser: (payload: unknown) => T
} & AxiosRequestConfig

const apiClient = axios.create({
  headers: {
    Accept: "application/json",
  },
})

function getFriendlyMessage(status?: number) {
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
}: RequestOptions<T>): Promise<T> {
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
          "Não foi possível conectar ao servidor. Verifique se o backend está disponível.",
        )
      }

      throw new ApiError(getFriendlyMessage(error.response.status), error.response.status)
    }

    throw new ApiError("Ocorreu um erro inesperado. Tente novamente.")
  }
}
