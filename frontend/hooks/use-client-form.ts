"use client"

import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef } from "react"
import type { UseFormReturn } from "react-hook-form"
import { useWatch } from "react-hook-form"
import { toast } from "sonner"

import { ApiError, ApiValidationError } from "@/api/client"
import { clientFieldLimits, clientFormSchema } from "@/schemas/client-form"
import { useClientQuery } from "@/hooks/use-client-query"
import { useCreateClientMutation } from "@/hooks/use-create-client-mutation"
import { usePostalCodeLookup } from "@/hooks/use-postal-code-lookup"
import { useUpdateClientMutation } from "@/hooks/use-update-client-mutation"
import { useZodForm } from "@/hooks/use-zod-form"
import type { PostalCodeStatus } from "@/types/components/client-form"
import type { Client, ClientFormValues } from "@/types/client"
import type { UseClientFormOptions } from "@/types/hooks/client"

const defaultValues: ClientFormValues = {
  name: "",
  email: "",
  postal_code: "",
  street: "",
  street_number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
}

export function useClientForm(options: UseClientFormOptions) {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useAuth()
  const lastLookupRef = useRef<string | null>(null)
  const pendingLookupRef = useRef<string | null>(null)

  const form = useZodForm<ClientFormValues>({
    schema: clientFormSchema,
    defaultValues,
    mode: "onSubmit",
  })

  useEffect(() => {
    form.register("name")
    form.register("email")
    form.register("postal_code")
    form.register("street")
    form.register("street_number")
    form.register("complement")
    form.register("neighborhood")
    form.register("city")
    form.register("state")
  }, [form])

  const createClientMutation = useCreateClientMutation({
    onSuccess: () => {
      router.push("/")
    },
  })
  const updateClientMutation = useUpdateClientMutation({
    clientId: options.mode === "edit" ? options.clientId : 0,
    onSuccess: () => {
      router.push("/")
    },
  })
  const { getPostalCodeInfo, isPending: isPostalCodeLoading } = usePostalCodeLookup()

  const clientQuery = useClientQuery({
    clientId: options.mode === "edit" ? options.clientId : 0,
    enabled: options.mode === "edit",
  })

  useEffect(() => {
    if (options.mode !== "edit" || !clientQuery.data) {
      return
    }

    form.reset(mapClientToFormValues(clientQuery.data))
    lastLookupRef.current = clientQuery.data.postal_code.replace(/\D/g, "")
    pendingLookupRef.current = null
  }, [clientQuery.data, form, options.mode])

  const watchedValues = useWatch({
    control: form.control,
  })

  const characterCounts = useMemo(() => {
    return {
      name: watchedValues.name?.length ?? 0,
      email: watchedValues.email?.length ?? 0,
      postal_code: watchedValues.postal_code?.length ?? 0,
      street: watchedValues.street?.length ?? 0,
      street_number: watchedValues.street_number?.length ?? 0,
      complement: watchedValues.complement?.length ?? 0,
      neighborhood: watchedValues.neighborhood?.length ?? 0,
      city: watchedValues.city?.length ?? 0,
      state: watchedValues.state?.length ?? 0,
    }
  }, [watchedValues])

  const values = useMemo<ClientFormValues>(() => {
    return {
      ...defaultValues,
      ...watchedValues,
    }
  }, [watchedValues])

  const normalizedPostalCode = useMemo(() => {
    return values.postal_code.replace(/\D/g, "").slice(0, 8)
  }, [values.postal_code])

  const postalCodeStatus = useMemo<PostalCodeStatus>(() => {
    if (isPostalCodeLoading) {
      return "loading"
    }

    return resolvePostalCodeStatus({
      city: values.city,
      neighborhood: values.neighborhood,
      normalizedPostalCode,
      postalCodeErrorMessage: form.formState.errors.postal_code?.message,
      state: values.state,
      street: values.street,
    })
  }, [
    form.formState.errors.postal_code?.message,
    isPostalCodeLoading,
    normalizedPostalCode,
    values.city,
    values.neighborhood,
    values.state,
    values.street,
  ])

  useEffect(() => {
    if (normalizedPostalCode.length !== clientFieldLimits.postal_code) {
      if (lastLookupRef.current === normalizedPostalCode) {
        lastLookupRef.current = null
      }

      if (pendingLookupRef.current === normalizedPostalCode) {
        pendingLookupRef.current = null
      }

      return
    }

    if (
      lastLookupRef.current === normalizedPostalCode ||
      pendingLookupRef.current === normalizedPostalCode
    ) {
      return
    }

    let isCancelled = false

    async function loadPostalCode() {
      pendingLookupRef.current = normalizedPostalCode

      try {
        const postalCode = await getPostalCodeInfo(normalizedPostalCode)

        if (isCancelled) {
          return
        }

        applyPostalCode(form, postalCode)
        form.clearErrors("postal_code")
        lastLookupRef.current = normalizedPostalCode
      } catch (error) {
        if (isCancelled) {
          return
        }

        clearAddressFields(form)
        lastLookupRef.current = normalizedPostalCode
        const postalCodeErrorMessage =
          error instanceof ApiError
            ? error.message
            : "Não foi possível consultar o CEP agora. Tente novamente."

        form.setError("postal_code", {
          type: "manual",
          message: postalCodeErrorMessage,
        })

        toast.error(postalCodeErrorMessage)
      } finally {
        if (!isCancelled) {
          pendingLookupRef.current = null
        }
      }
    }

    void loadPostalCode()

    return () => {
      isCancelled = true
    }
  }, [form, getPostalCodeInfo, normalizedPostalCode])

  async function handleSubmit(values: ClientFormValues) {
    try {
      if (options.mode === "create") {
        await createClientMutation.mutateAsync(values)
        return
      }

      await updateClientMutation.mutateAsync(values)
    } catch (error) {
      if (error instanceof ApiValidationError) {
        applyValidationErrors(form, error.errors)
      }
    }
  }

  function handlePostalCodeChange(value: string) {
    const normalizedValue = value.replace(/\D/g, "").slice(0, clientFieldLimits.postal_code)

    if (normalizedValue !== normalizedPostalCode) {
      lastLookupRef.current = null
      pendingLookupRef.current = null
    }

    if (normalizedValue.length < clientFieldLimits.postal_code) {
      clearAddressFields(form)
    }

    form.setValue("postal_code", normalizedValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
  }

  function handleLimitedChange(
    fieldName: keyof ClientFormValues,
    value: string,
    maxLength: number,
  ) {
    form.setValue(fieldName, value.slice(0, maxLength), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
  }

  return {
    characterCounts,
    clientFieldLimits,
    clientQuery,
    form,
    handleLimitedChange,
    handlePostalCodeChange,
    handleSubmit,
    isAuthReady: isLoaded && isSignedIn,
    isPostalCodeLoading,
    postalCodeStatus,
    isSubmitting:
      createClientMutation.isPending || updateClientMutation.isPending,
    values,
  }
}

function mapClientToFormValues(client: Client): ClientFormValues {
  return {
    name: client.name,
    email: client.email,
    postal_code: client.postal_code,
    street: client.street,
    street_number: client.street_number,
    complement: client.complement ?? "",
    neighborhood: client.neighborhood,
    city: client.city,
    state: client.state,
  }
}

function applyPostalCode(
  form: UseFormReturn<ClientFormValues>,
  postalCode: {
    city: string
    neighborhood: string
    postal_code: string
    state: string
    street: string
  },
) {
  form.setValue("street", postalCode.street, { shouldValidate: true })
  form.setValue("neighborhood", postalCode.neighborhood, { shouldValidate: true })
  form.setValue("city", postalCode.city, { shouldValidate: true })
  form.setValue("state", postalCode.state, { shouldValidate: true })
}

function clearAddressFields(form: UseFormReturn<ClientFormValues>) {
  form.setValue("street", "", { shouldValidate: true })
  form.setValue("neighborhood", "", { shouldValidate: true })
  form.setValue("city", "", { shouldValidate: true })
  form.setValue("state", "", { shouldValidate: true })
}

function resolvePostalCodeStatus({
  city,
  neighborhood,
  normalizedPostalCode,
  postalCodeErrorMessage,
  state,
  street,
}: {
  city: string
  neighborhood: string
  normalizedPostalCode: string
  postalCodeErrorMessage?: string
  state: string
  street: string
}): "idle" | "success" | "error" {
  if (normalizedPostalCode.length !== clientFieldLimits.postal_code) {
    return "idle"
  }

  if (postalCodeErrorMessage) {
    return "error"
  }

  if (street && neighborhood && city && state) {
    return "success"
  }

  return "idle"
}

function applyValidationErrors(
  form: UseFormReturn<ClientFormValues>,
  errors: Record<string, string[]>,
) {
  for (const [fieldName, messages] of Object.entries(errors)) {
    if (messages.length === 0) {
      continue
    }

    const formField = fieldName as keyof ClientFormValues

    form.setError(formField, {
      type: "server",
      message: messages[0],
    })
  }
}
