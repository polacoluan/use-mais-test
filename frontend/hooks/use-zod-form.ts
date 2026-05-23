import { zodResolver } from "@hookform/resolvers/zod"
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form"
import type { z } from "zod"

type Options<TValues extends FieldValues> = Omit<
  UseFormProps<TValues>,
  "resolver" | "defaultValues"
> & {
  defaultValues?: DefaultValues<TValues>
  schema: z.ZodType<TValues>
}

export function useZodForm<TValues extends FieldValues>(
  options: Options<TValues>,
): UseFormReturn<TValues> {
  const { schema, ...formOptions } = options

  return useForm<TValues>({
    ...formOptions,
    resolver: zodResolver(schema as never) as Resolver<TValues>,
  })
}
