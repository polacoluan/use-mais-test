import { FormCharacterCount } from "@/components/form-character-count"
import { Label } from "@/components/ui/label"
import type { ClientFormFieldProps } from "@/types/components/client-form"

export function ClientFormField({
  children,
  currentLength,
  description,
  error,
  fieldId,
  label,
  maxLength,
}: ClientFormFieldProps) {
  return (
    <div className="grid gap-2 self-start">
      <Label htmlFor={fieldId}>{label}</Label>
      {children}
      <div className="grid gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-3">
        <p
          className={
            error
              ? "min-w-0 text-xs leading-5 text-destructive"
              : "min-w-0 text-xs leading-5 text-muted-foreground"
          }
        >
          {error ?? description ?? "\u00A0"}
        </p>
        <div className="sm:justify-self-end">
          <FormCharacterCount current={currentLength} max={maxLength} />
        </div>
      </div>
    </div>
  )
}
