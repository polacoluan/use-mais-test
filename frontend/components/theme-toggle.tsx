"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const isDark = resolvedTheme === "dark"
  const nextTheme = isDark ? "light" : "dark"
  const label = isDark ? "Ativar tema claro" : "Ativar tema escuro"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => {
        setTheme(nextTheme)
      }}
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
