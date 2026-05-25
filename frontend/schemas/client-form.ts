import { z } from "zod"

export const clientFieldLimits = {
  name: 150,
  email: 150,
  postal_code: 8,
  street: 150,
  street_number: 10,
  complement: 100,
  neighborhood: 100,
  city: 100,
  state: 2,
} as const

export const clientFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome do cliente.")
    .max(clientFieldLimits.name, `O nome deve ter no máximo ${clientFieldLimits.name} caracteres.`),
  email: z
    .email("Informe um e-mail válido.")
    .max(clientFieldLimits.email, `O e-mail deve ter no máximo ${clientFieldLimits.email} caracteres.`),
  postal_code: z
    .string()
    .length(clientFieldLimits.postal_code, "Informe um CEP com 8 dígitos."),
  street: z
    .string()
    .trim()
    .min(1, "Preencha o CEP para carregar o logradouro.")
    .max(clientFieldLimits.street, `O logradouro deve ter no máximo ${clientFieldLimits.street} caracteres.`),
  street_number: z
    .string()
    .trim()
    .min(1, "Informe o número.")
    .max(clientFieldLimits.street_number, `O número deve ter no máximo ${clientFieldLimits.street_number} caracteres.`),
  complement: z
    .string()
    .trim()
    .max(clientFieldLimits.complement, `O complemento deve ter no máximo ${clientFieldLimits.complement} caracteres.`),
  neighborhood: z
    .string()
    .trim()
    .min(1, "Preencha o CEP para carregar o bairro.")
    .max(clientFieldLimits.neighborhood, `O bairro deve ter no máximo ${clientFieldLimits.neighborhood} caracteres.`),
  city: z
    .string()
    .trim()
    .min(1, "Preencha o CEP para carregar a cidade.")
    .max(clientFieldLimits.city, `A cidade deve ter no máximo ${clientFieldLimits.city} caracteres.`),
  state: z
    .string()
    .trim()
    .length(clientFieldLimits.state, "Preencha o CEP para carregar a UF."),
})
