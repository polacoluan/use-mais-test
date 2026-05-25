import Image from "next/image"

import type { AppLogoProps } from "@/types/components/layout"
import { cn } from "@/lib/utils"

export function AppLogo({ compact = false }: AppLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
        <Image
          src="/brand-logo.svg"
          alt="Use Mais RH"
          width={40}
          height={40}
          className="size-10 object-contain"
          priority
        />
      </div>
      <div className={cn("min-w-0", compact && "hidden")}>
        <p className="truncate text-sm font-semibold text-sidebar-foreground">
          Teste - Use Mais RH
        </p>
        <p className="truncate text-xs text-sidebar-foreground/65">
          Gestão de clientes
        </p>
      </div>
    </div>
  )
}
