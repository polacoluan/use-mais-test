import { apiMessageSchema } from "@/schemas/api-message"
import { clientListSchema } from "@/schemas/client-list"
import { clientSchema } from "@/schemas/client"
import { apiRequest, getAuthorizationHeaders } from "@/api/client"
import type { ApiMessageResponse } from "@/types/api"
import type {
  DeleteClientParams,
  GetClientParams,
  ListClientsParams,
  SaveClientParams,
  UpdateClientParams,
} from "@/types/api/clients"
import type { Client, ClientFormValues, ClientListResponse } from "@/types/client"

function serializeClientFormData(data: ClientFormValues) {
  return {
    ...data,
    complement: data.complement.trim() === "" ? null : data.complement,
  }
}

export function listClients({
  page,
  perPage,
  token,
}: ListClientsParams): Promise<ClientListResponse> {
  return apiRequest({
    method: "GET",
    url: "/api/v1/clients",
    params: {
      page,
      per_page: perPage,
    },
    headers: getAuthorizationHeaders(token),
    parser: (payload) => clientListSchema.parse(payload),
  })
}

export function deleteClient({
  clientId,
  token,
}: DeleteClientParams): Promise<ApiMessageResponse> {
  return apiRequest({
    method: "DELETE",
    url: `/api/v1/clients/${clientId}`,
    headers: getAuthorizationHeaders(token),
    parser: (payload) => apiMessageSchema.parse(payload),
  })
}

export function getClient({
  clientId,
  token,
}: GetClientParams): Promise<Client> {
  return apiRequest({
    method: "GET",
    url: `/api/v1/clients/${clientId}`,
    headers: getAuthorizationHeaders(token),
    parser: (payload) => clientSchema.parse((payload as { data?: unknown }).data),
  })
}

export function createClient({
  data,
  token,
}: SaveClientParams): Promise<Client> {
  return apiRequest({
    method: "POST",
    url: "/api/v1/clients",
    data: serializeClientFormData(data),
    headers: getAuthorizationHeaders(token),
    parser: (payload) => clientSchema.parse((payload as { data?: unknown }).data),
  })
}

export function updateClient({
  clientId,
  data,
  token,
}: UpdateClientParams): Promise<Client> {
  return apiRequest({
    method: "PUT",
    url: `/api/v1/clients/${clientId}`,
    data: serializeClientFormData(data),
    headers: getAuthorizationHeaders(token),
    parser: (payload) => clientSchema.parse((payload as { data?: unknown }).data),
  })
}
