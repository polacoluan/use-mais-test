import type { ReactNode } from "react"

export type AppLogoProps = {
  compact?: boolean
}

export type BreadcrumbItem = {
  href?: string
  label: string
}

export type ClientsBreadcrumbProps = {
  items: BreadcrumbItem[]
}

export type AppShellProps = {
  breadcrumbItems: BreadcrumbItem[]
  children: ReactNode
}
