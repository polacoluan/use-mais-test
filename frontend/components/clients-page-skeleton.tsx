import { AppSidebar } from "@/components/app-sidebar"
import { ClientsBreadcrumb } from "@/components/clients-breadcrumb"
import { ClientsTableSkeleton } from "@/components/clients-table-skeleton"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export function ClientsPageSkeleton() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <ClientsBreadcrumb
            items={[
              { label: "Sistema", href: "/" },
              { label: "Clientes" },
            ]}
          />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>

          <ClientsTableSkeleton />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
