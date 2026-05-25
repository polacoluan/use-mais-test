import type { AxiosRequestConfig } from "axios"

export type ApiRequestOptions<T> = {
  parser: (payload: unknown) => T
} & AxiosRequestConfig
