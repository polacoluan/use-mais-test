import type { ClientFormValues } from "@/types/client"

export type ListClientsParams = {
  page: number
  perPage: number
  token: string
}

export type DeleteClientParams = {
  clientId: number
  token: string
}

export type GetClientParams = {
  clientId: number
  token: string
}

export type SaveClientParams = {
  data: ClientFormValues
  token: string
}

export type UpdateClientParams = SaveClientParams & {
  clientId: number
}
