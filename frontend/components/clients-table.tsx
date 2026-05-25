import { ClientRowActions } from "@/components/client-row-actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ClientsTableProps } from "@/types/components/client-list"

export function ClientsTable({
  clients,
  onDelete,
  onEdit,
}: ClientsTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>CEP</TableHead>
            <TableHead>Logradouro</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead>UF</TableHead>
            <TableHead className="w-24 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.postal_code}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{client.street}</span>
                  <span className="text-xs text-muted-foreground">
                    Nº {client.street_number}
                    {client.complement ? ` · ${client.complement}` : ""}
                  </span>
                </div>
              </TableCell>
              <TableCell>{client.city}</TableCell>
              <TableCell>{client.state}</TableCell>
              <TableCell className="text-right">
                <ClientRowActions
                  client={client}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
