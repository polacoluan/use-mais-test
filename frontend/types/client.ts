import type { z } from "zod"

import type { clientFormSchema } from "@/schemas/client-form"
import type { clientListSchema } from "@/schemas/client-list"
import type { clientSchema } from "@/schemas/client"
import type { postalCodeLookupSchema } from "@/schemas/postal-code-lookup"

export type Client = z.infer<typeof clientSchema>
export type ClientFormValues = z.infer<typeof clientFormSchema>
export type ClientListResponse = z.infer<typeof clientListSchema>
export type PostalCodeLookup = z.infer<typeof postalCodeLookupSchema>
