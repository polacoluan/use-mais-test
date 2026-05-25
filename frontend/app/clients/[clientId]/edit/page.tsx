import { notFound } from "next/navigation"

import { ClientFormPage } from "@/components/client-form-page"

type EditClientPageProps = {
  params: Promise<{
    clientId: string
  }>
}

export default async function EditClientPage({
  params,
}: EditClientPageProps) {
  const { clientId } = await params
  const parsedClientId = Number(clientId)

  if (!Number.isInteger(parsedClientId) || parsedClientId <= 0) {
    notFound()
  }

  return <ClientFormPage mode="edit" clientId={parsedClientId} />
}
