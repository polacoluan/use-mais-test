import Link from "next/link"
import { Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function ClientsEmptyState() {
  return (
    <Empty className="min-h-85 rounded-3xl border bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Users />
        </EmptyMedia>
        <EmptyTitle>Nenhum cliente encontrado</EmptyTitle>
        <EmptyDescription>
          Ainda não há clientes cadastrados para exibir nesta página.
        </EmptyDescription>
        <Button asChild className="mt-4">
          <Link href="/clients/new">Cadastrar cliente</Link>
        </Button>
      </EmptyHeader>
    </Empty>
  )
}
