import { z } from "zod"

export const clientSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
  postal_code: z.string(),
  street: z.string(),
  street_number: z.string(),
  complement: z.string().nullable(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})
