import { RefreshCcw, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import type { ClientDetailsErrorStateProps } from "@/types/components/client-list"

export function ClientDetailsErrorState({
  onRetry,
}: ClientDetailsErrorStateProps) {
  return (
    <Empty className="min-h-85 rounded-3xl border bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert />
        </EmptyMedia>
        <EmptyTitle>Não foi possível carregar o cliente</EmptyTitle>
        <EmptyDescription>
          Tente novamente em instantes para recuperar os dados de edição.
        </EmptyDescription>
      </EmptyHeader>
      <Button variant="outline" onClick={onRetry}>
        <RefreshCcw className="size-4" />
        Tentar novamente
      </Button>
    </Empty>
  )
}
