"use client"

import { useRouter } from "next/navigation"

import { AppShell } from "@/components/app-shell"
import { ClientDetailsErrorState } from "@/components/client-details-error-state"
import { ClientForm } from "@/components/client-form"
import { ClientFormSkeleton } from "@/components/client-form-skeleton"
import { useClientForm } from "@/hooks/use-client-form"
import type { ClientFormPageProps } from "@/types/components/client-form"

export function ClientFormPage(props: ClientFormPageProps) {
  const router = useRouter()
  const clientForm = useClientForm(props)

  if (!clientForm.isAuthReady) {
    return <ClientFormSkeleton />
  }

  if (props.mode === "edit" && clientForm.clientQuery.isPending) {
    return <ClientFormSkeleton />
  }

  if (props.mode === "edit" && clientForm.clientQuery.isError) {
    return (
      <AppShell
        breadcrumbItems={[
          { label: "Sistema", href: "/" },
          { label: "Clientes", href: "/" },
          { label: "Editar cliente" },
        ]}
      >
        <section className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Editar cliente
          </h1>
          <p className="text-sm text-muted-foreground">
            Atualize os dados cadastrais do cliente selecionado.
          </p>
        </section>

        <ClientDetailsErrorState
          onRetry={() => {
            void clientForm.clientQuery.refetch()
          }}
        />
      </AppShell>
    )
  }

  const title = props.mode === "create" ? "Cadastrar cliente" : "Editar cliente"
  const description =
    props.mode === "create"
      ? "Preencha o CEP para carregar o endereço e conclua o cadastro."
      : "Atualize os dados do cliente e salve as alterações."

  return (
    <AppShell
      breadcrumbItems={[
        { label: "Sistema", href: "/" },
        { label: "Clientes", href: "/" },
        { label: title },
      ]}
    >
      <section className="space-y-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </section>

      <ClientForm
        characterCounts={clientForm.characterCounts}
        characterLimits={clientForm.clientFieldLimits}
        form={clientForm.form}
        isPostalCodeLoading={clientForm.isPostalCodeLoading}
        postalCodeStatus={clientForm.postalCodeStatus}
        isSubmitting={clientForm.isSubmitting}
        onCancel={() => router.push("/")}
        onLimitedChange={clientForm.handleLimitedChange}
        onPostalCodeChange={clientForm.handlePostalCodeChange}
        onSubmit={clientForm.handleSubmit}
        submitLabel={
          props.mode === "create" ? "Cadastrar cliente" : "Salvar alterações"
        }
        values={clientForm.values}
      />
    </AppShell>
  )
}
