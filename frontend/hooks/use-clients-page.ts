"use client"

import { useState } from "react"

import type { Client } from "@/types/client"

export function useClientsPage() {
  const [page, setPage] = useState(1)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)

  function goToNextPage(lastPage: number) {
    setPage((currentPage) => Math.min(currentPage + 1, lastPage))
  }

  function goToPreviousPage() {
    setPage((currentPage) => Math.max(currentPage - 1, 1))
  }

  function openDeleteDialog(client: Client) {
    setClientToDelete(client)
  }

  function closeDeleteDialog() {
    setClientToDelete(null)
  }

  function handleDeleteSuccess(visibleItemsCount: number) {
    if (visibleItemsCount === 1 && page > 1) {
      setPage((currentPage) => currentPage - 1)
    }

    closeDeleteDialog()
  }

  return {
    clientToDelete,
    closeDeleteDialog,
    goToNextPage,
    goToPreviousPage,
    handleDeleteSuccess,
    openDeleteDialog,
    page,
  }
}
