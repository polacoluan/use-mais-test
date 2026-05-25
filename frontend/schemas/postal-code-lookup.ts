import { z } from "zod"

export const postalCodeLookupSchema = z.object({
  postal_code: z.string(),
  street: z.string(),
  complement: z.string().nullable(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
})
