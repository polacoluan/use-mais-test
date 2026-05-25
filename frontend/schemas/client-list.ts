import { clientSchema } from "@/schemas/client"
import { createPaginatedSchema } from "@/schemas/pagination"

export const clientListSchema = createPaginatedSchema(clientSchema)
