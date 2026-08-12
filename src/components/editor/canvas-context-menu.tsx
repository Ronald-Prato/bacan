import { useEffect, useLayoutEffect, useRef, useState } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type CanvasContextMenuItem = {
  label: string
  icon: LucideIcon
  onSelect: () => void
  disabled?: boolean
  destructive?: boolean
  separatorBefore?: boolean
}

export function CanvasContextMenu({
  items,
  onClose,
  x,
  y,
}: {
  items: CanvasContextMenuItem[]
  onClose: () => void
  x: number
  y: number
}) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x, y })

  useLayoutEffect(() => {
    const menu = menuRef.current

    if (!menu) {
      return
    }

    const padding = 8
    const bounds = menu.getBoundingClientRect()

    setPosition({
      x: Math.max(padding, Math.min(x, window.innerWidth - bounds.width - padding)),
      y: Math.max(padding, Math.min(y, window.innerHeight - bounds.height - padding)),
    })

    menu.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()
  }, [x, y])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        onClose()
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("pointerdown", handlePointerDown, true)
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("resize", onClose)
    window.addEventListener("scroll", onClose, true)

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true)
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("resize", onClose)
      window.removeEventListener("scroll", onClose, true)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Acciones del elemento"
      className="editor-canvas-context-menu fixed z-50 min-w-56 rounded-md border border-border bg-popover p-1 text-popover-foreground"
      style={{ left: position.x, top: position.y }}
      onContextMenu={(event) => event.preventDefault()}
    >
      {items.map((item) => {
        const Icon = item.icon

        return (
          <div key={item.label}>
            {item.separatorBefore ? <div className="my-1 h-px bg-border" role="separator" /> : null}
            <button
              type="button"
              role="menuitem"
              disabled={item.disabled}
              className={cn(
                "flex h-9 w-full items-center gap-3 rounded-sm px-2 text-left text-sm outline-none transition-colors hover:bg-accent focus-visible:bg-accent disabled:pointer-events-none disabled:opacity-40",
                item.destructive && "text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10",
              )}
              onClick={() => {
                item.onSelect()
                onClose()
              }}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
