import type { z } from "zod"

import type { apiMessageSchema } from "@/schemas/api-message"
import type { apiValidationErrorSchema } from "@/schemas/api-validation-error"

export type ApiMessageResponse = z.infer<typeof apiMessageSchema>
export type ApiValidationErrorResponse = z.infer<typeof apiValidationErrorSchema>
