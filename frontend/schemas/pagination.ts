import { z } from "zod"

export const paginationLinksSchema = z.object({
  first: z.string().nullable(),
  last: z.string().nullable(),
  prev: z.string().nullable(),
  next: z.string().nullable(),
})

export const paginationMetaLinkSchema = z.object({
  url: z.string().nullable(),
  label: z.string(),
  active: z.boolean(),
})

export const paginationMetaSchema = z.object({
  current_page: z.number(),
  from: z.number().nullable(),
  last_page: z.number(),
  links: z.array(paginationMetaLinkSchema),
  path: z.string(),
  per_page: z.number(),
  to: z.number().nullable(),
  total: z.number(),
})

export function createPaginatedSchema<TItem extends z.ZodType>(itemSchema: TItem) {
  return z.object({
    data: z.array(itemSchema),
    links: paginationLinksSchema,
    meta: paginationMetaSchema,
  })
}
