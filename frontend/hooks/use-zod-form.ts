import { zodResolver } from "@hookform/resolvers/zod"
import {
  useForm,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form"
import type { UseZodFormOptions } from "@/types/hooks/form"

export function useZodForm<TValues extends FieldValues>(
  options: UseZodFormOptions<TValues>,
): UseFormReturn<TValues> {
  const { schema, ...formOptions } = options

  return useForm<TValues>({
    ...formOptions,
    resolver: zodResolver(schema as never) as Resolver<TValues>,
  })
}
