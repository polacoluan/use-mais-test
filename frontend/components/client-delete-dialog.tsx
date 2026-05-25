"use client"

import { TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { ClientDeleteDialogProps } from "@/types/components/client-list"

export function ClientDeleteDialog({
  client,
  isPending,
  onConfirm,
  onOpenChange,
  open,
}: ClientDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TriangleAlert className="size-8 text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
          <AlertDialogDescription>
            {client
              ? `Tem certeza de que deseja excluir o cliente ${client.name}?`
              : "Tem certeza de que deseja excluir este cliente?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
