import { apiRequest, getAuthorizationHeaders } from "@/api/client"
import { postalCodeLookupSchema } from "@/schemas/postal-code-lookup"
import type { LookupPostalCodeParams } from "@/types/api/postal-code"
import type { PostalCodeLookup } from "@/types/client"

export function lookupPostalCode({
  postalCode,
  token,
}: LookupPostalCodeParams): Promise<PostalCodeLookup> {
  return apiRequest({
    method: "GET",
    url: `/api/v1/postal-codes/${postalCode}`,
    headers: getAuthorizationHeaders(token),
    parser: (payload) =>
      postalCodeLookupSchema.parse((payload as { data?: unknown }).data),
  })
}
