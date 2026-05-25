import type {
  DefaultValues,
  FieldValues,
  UseFormProps,
} from "react-hook-form"
import type { z } from "zod"

export type UseZodFormOptions<TValues extends FieldValues> = Omit<
  UseFormProps<TValues>,
  "resolver" | "defaultValues"
> & {
  defaultValues?: DefaultValues<TValues>
  schema: z.ZodType<TValues>
}
