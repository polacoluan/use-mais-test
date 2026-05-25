import { AppShell } from "@/components/app-shell"
import { Skeleton } from "@/components/ui/skeleton"

export function ClientFormSkeleton() {
  return (
    <AppShell
      breadcrumbItems={[
        { label: "Sistema", href: "/" },
        { label: "Clientes", href: "/" },
        { label: "Carregando" },
      ]}
    >
      <section className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-80" />
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </AppShell>
  )
}
