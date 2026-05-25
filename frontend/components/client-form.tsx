"use client"

import { CheckCircle2, LoaderCircle } from "lucide-react"

import { ClientFormField } from "@/components/client-form-field"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { ClientFormProps } from "@/types/components/client-form"

export function ClientForm({
  characterCounts,
  characterLimits,
  form,
  isPostalCodeLoading,
  postalCodeStatus,
  isSubmitting,
  onCancel,
  onLimitedChange,
  onPostalCodeChange,
  onSubmit,
  submitLabel,
  values,
}: ClientFormProps) {
  return (
    <Card className="rounded-3xl border shadow-none">
      <CardHeader>
        <CardTitle>Dados do cliente</CardTitle>
      </CardHeader>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-8">
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-medium">Dados principais</h2>
              <p className="text-sm text-muted-foreground">
                Preencha as informações básicas do cliente.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <ClientFormField
                fieldId="name"
                label="Nome"
                maxLength={characterLimits.name}
                currentLength={characterCounts.name}
                error={form.formState.errors.name?.message}
              >
                <Input
                  id="name"
                  value={values.name}
                  maxLength={characterLimits.name}
                  onChange={(event) => {
                    onLimitedChange(
                      "name",
                      event.target.value,
                      characterLimits.name
                    )
                  }}
                />
              </ClientFormField>

              <ClientFormField
                fieldId="email"
                label="E-mail"
                maxLength={characterLimits.email}
                currentLength={characterCounts.email}
                error={form.formState.errors.email?.message}
              >
                <Input
                  id="email"
                  type="email"
                  value={values.email}
                  maxLength={characterLimits.email}
                  onChange={(event) => {
                    onLimitedChange(
                      "email",
                      event.target.value,
                      characterLimits.email
                    )
                  }}
                />
              </ClientFormField>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-medium">Localização</h2>
              <p className="text-sm text-muted-foreground">
                Digite o CEP e complemente os dados manuais do endereço.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-12">
              <div className="lg:col-span-2">
                <ClientFormField
                  fieldId="postal_code"
                  label="CEP"
                  maxLength={characterLimits.postal_code}
                  currentLength={characterCounts.postal_code}
                  error={form.formState.errors.postal_code?.message}
                  description={
                    isPostalCodeLoading
                      ? "Buscando endereço..."
                      : postalCodeStatus === "success"
                        ? "Endereço carregado com sucesso."
                        : "Digite os 8 dígitos para preencher o endereço."
                  }
                >
                  <Input
                    id="postal_code"
                    inputMode="numeric"
                    value={values.postal_code}
                    maxLength={characterLimits.postal_code}
                    onChange={(event) => {
                      onPostalCodeChange(event.target.value)
                    }}
                  />
                </ClientFormField>
              </div>

              <div className="lg:col-span-2">
                <ClientFormField
                  fieldId="street_number"
                  label="Número"
                  maxLength={characterLimits.street_number}
                  currentLength={characterCounts.street_number}
                  error={form.formState.errors.street_number?.message}
                >
                  <Input
                    id="street_number"
                    value={values.street_number}
                    maxLength={characterLimits.street_number}
                    onChange={(event) => {
                      onLimitedChange(
                        "street_number",
                        event.target.value,
                        characterLimits.street_number
                      )
                    }}
                  />
                </ClientFormField>
              </div>

              <div className="lg:col-span-8">
                <ClientFormField
                  fieldId="complement"
                  label="Complemento"
                  maxLength={characterLimits.complement}
                  currentLength={characterCounts.complement}
                  error={form.formState.errors.complement?.message}
                  description="Campo opcional."
                >
                  <Input
                    id="complement"
                    value={values.complement}
                    maxLength={characterLimits.complement}
                    onChange={(event) => {
                      onLimitedChange(
                        "complement",
                        event.target.value,
                        characterLimits.complement
                      )
                    }}
                  />
                </ClientFormField>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="rounded-3xl border border-dashed bg-muted/30 p-5 md:p-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-medium">
                    Endereço preenchido automaticamente
                  </h2>
                  {postalCodeStatus === "success" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" />
                      CEP confirmado
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  Estes campos são carregados a partir do CEP informado.
                </p>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <ClientFormField
                    fieldId="street"
                    label="Logradouro"
                    maxLength={characterLimits.street}
                    currentLength={characterCounts.street}
                    error={form.formState.errors.street?.message}
                    description="Campo preenchido automaticamente pelo CEP."
                  >
                    <Input id="street" value={values.street} disabled />
                  </ClientFormField>
                </div>

                <div className="lg:col-span-5">
                  <ClientFormField
                    fieldId="neighborhood"
                    label="Bairro"
                    maxLength={characterLimits.neighborhood}
                    currentLength={characterCounts.neighborhood}
                    error={form.formState.errors.neighborhood?.message}
                    description="Campo preenchido automaticamente pelo CEP."
                  >
                    <Input
                      id="neighborhood"
                      value={values.neighborhood}
                      disabled
                    />
                  </ClientFormField>
                </div>

                <div className="lg:col-span-10">
                  <ClientFormField
                    fieldId="city"
                    label="Cidade"
                    maxLength={characterLimits.city}
                    currentLength={characterCounts.city}
                    error={form.formState.errors.city?.message}
                    description="Campo preenchido automaticamente pelo CEP."
                  >
                    <Input id="city" value={values.city} disabled />
                  </ClientFormField>
                </div>

                <div className="lg:col-span-2">
                  <ClientFormField
                    fieldId="state"
                    label="UF"
                    maxLength={characterLimits.state}
                    currentLength={characterCounts.state}
                    error={form.formState.errors.state?.message}
                    description="Campo preenchido automaticamente pelo CEP."
                  >
                    <Input id="state" value={values.state} disabled />
                  </ClientFormField>
                </div>
              </div>
            </div>
          </section>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || isPostalCodeLoading}>
            {isSubmitting ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Salvando
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
