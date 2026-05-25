"use client"

import { useAuth } from "@clerk/nextjs"
import { useCallback, useMemo, useState } from "react"

import { ApiError } from "@/api/client"
import { lookupPostalCode } from "@/api/postal-codes"
import type { PostalCodeLookup } from "@/types/client"

export function usePostalCodeLookup() {
  const { getToken } = useAuth()
  const [postalCodeEntries, setPostalCodeEntries] = useState<PostalCodeLookup[]>([])
  const [isPending, setIsPending] = useState(false)

  const postalCodeCache = useMemo(() => {
    return new Map(
      postalCodeEntries.map((entry) => [
        entry.postal_code.replace(/\D/g, ""),
        entry,
      ]),
    )
  }, [postalCodeEntries])

  const getPostalCodeInfo = useCallback(
    async (postalCode: string) => {
      const normalizedPostalCode = postalCode.replace(/\D/g, "").slice(0, 8)
      const cachedPostalCode = postalCodeCache.get(normalizedPostalCode)

      if (cachedPostalCode) {
        return cachedPostalCode
      }

      const token = await getToken()

      if (!token) {
        throw new ApiError(
          "Não foi possível consultar o CEP agora. Tente novamente.",
        )
      }

      setIsPending(true)

      try {
        const response = await lookupPostalCode({
          postalCode: normalizedPostalCode,
          token,
        })

        setPostalCodeEntries((currentEntries) => {
          if (
            currentEntries.some(
              (entry) =>
                entry.postal_code.replace(/\D/g, "") === normalizedPostalCode,
            )
          ) {
            return currentEntries
          }

          return [...currentEntries, response]
        })

        return response
      } finally {
        setIsPending(false)
      }
    },
    [getToken, postalCodeCache],
  )

  return {
    getPostalCodeInfo,
    isPending,
  }
}
