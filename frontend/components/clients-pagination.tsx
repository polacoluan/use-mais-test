import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { ClientsPaginationProps } from "@/types/components/client-list"

export function ClientsPagination({
  currentPage,
  hasNextPage,
  hasPreviousPage,
  isDisabled = false,
  lastPage,
  onNextPage,
  onPreviousPage,
  total,
}: ClientsPaginationProps) {
  return (
    <div className="flex flex-col gap-4 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        {total} {total === 1 ? "cliente encontrado" : "clientes encontrados"} ·
        Página {currentPage} de {lastPage}
      </div>

      <Pagination className="mx-0 w-auto justify-start sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              text="Anterior"
              aria-disabled={!hasPreviousPage || isDisabled}
              className={!hasPreviousPage || isDisabled ? "pointer-events-none opacity-50" : undefined}
              onClick={(event) => {
                event.preventDefault()

                if (hasPreviousPage && !isDisabled) {
                  onPreviousPage()
                }
              }}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              text="Próxima"
              aria-disabled={!hasNextPage || isDisabled}
              className={!hasNextPage || isDisabled ? "pointer-events-none opacity-50" : undefined}
              onClick={(event) => {
                event.preventDefault()

                if (hasNextPage && !isDisabled) {
                  onNextPage()
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
