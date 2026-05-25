import type { Client } from "@/types/client"

export type ClientDeleteDialogProps = {
  client: Client | null
  isPending: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
}

export type ClientDetailsErrorStateProps = {
  onRetry: () => void
}

export type ClientRowActionsProps = {
  client: Client
  onDelete: (client: Client) => void
  onEdit: (client: Client) => void
}

export type ClientsErrorStateProps = {
  onRetry: () => void
}

export type ClientsPaginationProps = {
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  isDisabled?: boolean
  lastPage: number
  onNextPage: () => void
  onPreviousPage: () => void
  total: number
}

export type ClientsTableProps = {
  clients: Client[]
  onDelete: (client: Client) => void
  onEdit: (client: Client) => void
}
