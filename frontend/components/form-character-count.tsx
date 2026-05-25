import type { FormCharacterCountProps } from "@/types/components/client-form"

export function FormCharacterCount({
  current,
  max,
}: FormCharacterCountProps) {
  return (
    <span className="text-xs text-muted-foreground">
      {current}/{max}
    </span>
  )
}
