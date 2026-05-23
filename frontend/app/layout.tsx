import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { shadcn } from "@clerk/ui/themes"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { QueryProvider } from "@/components/query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Teste - Use Mais RH",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <ClerkProvider appearance={{ theme: shadcn }}>
          <QueryProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
