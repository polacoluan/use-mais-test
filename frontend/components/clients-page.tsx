"use client"

import { useAuth } from "@clerk/nextjs"
import Link from "next/link"

import { useClientActions } from "@/hooks/use-client-actions"
import { useClientsPage } from "@/hooks/use-clients-page"
import { useClientsQuery } from "@/hooks/use-clients-query"
import { useDeleteClientMutation } from "@/hooks/use-delete-client-mutation"
import { AppShell } from "@/components/app-shell"
import { ClientDeleteDialog } from "@/components/client-delete-dialog"
import { ClientsEmptyState } from "@/components/clients-empty-state"
import { ClientsErrorState } from "@/components/clients-error-state"
import { ClientsPagination } from "@/components/clients-pagination"
import { ClientsPageSkeleton } from "@/components/clients-page-skeleton"
import { ClientsTable } from "@/components/clients-table"
import { ClientsTableSkeleton } from "@/components/clients-table-skeleton"
import { Button } from "@/components/ui/button"

const CLIENTS_PER_PAGE = 10

export function ClientsPage() {
  const { isLoaded } = useAuth()
  const { handleEdit } = useClientActions()
  const {
    clientToDelete,
    closeDeleteDialog,
    goToNextPage,
    goToPreviousPage,
    handleDeleteSuccess,
    openDeleteDialog,
    page,
  } = useClientsPage()
  const clientsQuery = useClientsQuery({
    page,
    perPage: CLIENTS_PER_PAGE,
  })
  const deleteClientMutation = useDeleteClientMutation({
    onSuccess: () =>
      handleDeleteSuccess(clientsQuery.data?.data.length ?? 0),
  })

  if (!isLoaded) {
    return <ClientsPageSkeleton />
  }

  const clients = clientsQuery.data?.data ?? []
  const meta = clientsQuery.data?.meta

  return (
    <AppShell
      breadcrumbItems={[
        { label: "Sistema", href: "/" },
        { label: "Clientes" },
      ]}
    >
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os clientes cadastrados e acompanhe os dados em ordem
            alfabética.
          </p>
        </div>
        <Button asChild>
          <Link href="/clients/new">Cadastrar cliente</Link>
        </Button>
      </section>

      {clientsQuery.isPending ? (
        <ClientsTableSkeleton />
      ) : clientsQuery.isError ? (
        <ClientsErrorState
          onRetry={() => {
            void clientsQuery.refetch()
          }}
        />
      ) : clients.length === 0 || !meta ? (
        <ClientsEmptyState />
      ) : (
        <section className="overflow-hidden rounded-3xl border bg-card">
          <ClientsTable
            clients={clients}
            onDelete={openDeleteDialog}
            onEdit={(client) => handleEdit(client.id)}
          />
          <ClientsPagination
            currentPage={meta.current_page}
            hasNextPage={meta.current_page < meta.last_page}
            hasPreviousPage={meta.current_page > 1}
            isDisabled={clientsQuery.isFetching}
            lastPage={meta.last_page}
            onNextPage={() => goToNextPage(meta.last_page)}
            onPreviousPage={goToPreviousPage}
            total={meta.total}
          />
        </section>
      )}

      <ClientDeleteDialog
        client={clientToDelete}
        isPending={deleteClientMutation.isPending}
        open={clientToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteDialog()
          }
        }}
        onConfirm={() => {
          if (clientToDelete) {
            deleteClientMutation.mutate(clientToDelete.id)
          }
        }}
      />
    </AppShell>
  )
}
