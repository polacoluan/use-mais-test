export type UseClientQueryOptions = {
  clientId: number
  enabled?: boolean
}

export type UseClientsQueryOptions = {
  page: number
  perPage: number
}

export type UseCreateClientMutationOptions = {
  onSuccess?: (clientId: number) => void
}

export type UseDeleteClientMutationOptions = {
  onSuccess?: () => void
}

export type UseUpdateClientMutationOptions = {
  clientId: number
  onSuccess?: () => void
}

export type UseClientFormOptions =
  | {
      clientId?: never
      mode: "create"
    }
  | {
      clientId: number
      mode: "edit"
    }
