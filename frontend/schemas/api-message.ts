import { z } from "zod"

export const apiMessageSchema = z.object({
  message: z.string(),
})
