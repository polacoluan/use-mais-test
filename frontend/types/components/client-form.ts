import type { ReactNode } from "react"
import type { UseFormReturn } from "react-hook-form"

import type { ClientFormValues } from "@/types/client"

export type PostalCodeStatus = "idle" | "loading" | "success" | "error"

export type FormCharacterCountProps = {
  current: number
  max: number
}

export type ClientFormFieldProps = {
  children: ReactNode
  currentLength: number
  description?: string
  error?: string
  fieldId: string
  label: string
  maxLength: number
}

export type ClientFormPageProps =
  | {
      clientId?: never
      mode: "create"
    }
  | {
      clientId: number
      mode: "edit"
    }

export type CharacterCounts = Record<keyof ClientFormValues, number>
export type CharacterLimits = Record<keyof ClientFormValues, number>

export type ClientFormProps = {
  characterCounts: CharacterCounts
  characterLimits: CharacterLimits
  form: UseFormReturn<ClientFormValues>
  isPostalCodeLoading: boolean
  postalCodeStatus: PostalCodeStatus
  isSubmitting: boolean
  onCancel: () => void
  onLimitedChange: (
    fieldName: keyof ClientFormValues,
    value: string,
    maxLength: number,
  ) => void
  onPostalCodeChange: (value: string) => void
  onSubmit: (values: ClientFormValues) => void | Promise<void>
  submitLabel: string
  values: ClientFormValues
}
