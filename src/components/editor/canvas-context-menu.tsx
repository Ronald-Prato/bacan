import { ChevronRight, Crown, type LucideIcon } from "lucide-react"
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react"

/**
 * Existing item objects remain valid. Optional fields add shortcuts, premium
 * markers, and nested menus without requiring changes at existing call sites.
 */
export type CanvasContextMenuItem = {
  id?: string
  label: string
  icon: LucideIcon
  onSelect?: () => void
  disabled?: boolean
  destructive?: boolean
  separatorBefore?: boolean
  shortcut?: string
  premium?: boolean
  submenu?: CanvasContextMenuEntry[]
}

export type CanvasContextMenuGroup = {
  type: "group"
  id?: string
  label?: string
  separatorBefore?: boolean
  items: CanvasContextMenuEntry[]
}

export type CanvasContextMenuSeparator = {
  type: "separator"
  id?: string
}

export type CanvasContextMenuEntry = CanvasContextMenuItem | CanvasContextMenuGroup | CanvasContextMenuSeparator

type CanvasContextMenuSurfaceProps = {
  entries: CanvasContextMenuEntry[]
  menuId: string
  ariaLabel?: string
  autoFocus?: boolean
  focusRequest?: number
  onClose: () => void
  onRequestClose?: () => void
}

function isCanvasContextMenuGroup(entry: CanvasContextMenuEntry): entry is CanvasContextMenuGroup {
  return "type" in entry && entry.type === "group"
}

function isCanvasContextMenuSeparator(entry: CanvasContextMenuEntry): entry is CanvasContextMenuSeparator {
  return "type" in entry && entry.type === "separator"
}

function getSelectableItems(entries: CanvasContextMenuEntry[]): CanvasContextMenuItem[] {
  return entries.flatMap((entry) => {
    if (isCanvasContextMenuGroup(entry)) {
      return getSelectableItems(entry.items)
    }

    return isCanvasContextMenuSeparator(entry) ? [] : [entry]
  })
}

function findEnabledItem(items: CanvasContextMenuItem[], start: number, direction: 1 | -1) {
  if (items.length === 0) {
    return -1
  }

  for (let offset = 1; offset <= items.length; offset += 1) {
    const index = (start + direction * offset + items.length) % items.length

    if (!items[index].disabled) {
      return index
    }
  }

  return -1
}

function getEntryKey(entry: CanvasContextMenuEntry, index: number) {
  if (isCanvasContextMenuSeparator(entry)) {
    return `separator-${entry.id ?? index}`
  }

  if (isCanvasContextMenuGroup(entry)) {
    return `group-${entry.id ?? entry.label ?? index}`
  }

  return `item-${entry.id ?? entry.label}-${index}`
}

function hasSeparatorBefore(entry: CanvasContextMenuItem | CanvasContextMenuGroup) {
  return entry.separatorBefore === true
}

function MenuItem({
  item,
  itemIndex,
  isActive,
  isSubmenuOpen,
  onClose,
  onCloseSubmenu,
  onOpenSubmenu,
  onRequestClose,
  onNavigate,
  setItemRef,
}: {
  item: CanvasContextMenuItem
  itemIndex: number
  isActive: boolean
  isSubmenuOpen: boolean
  onClose: () => void
  onCloseSubmenu: (itemIndex: number) => void
  onOpenSubmenu: (itemIndex: number, focusFirstItem: boolean) => void
  onRequestClose?: () => void
  onNavigate: (event: ReactKeyboardEvent<HTMLButtonElement>, itemIndex: number) => void
  setItemRef: (itemIndex: number, element: HTMLButtonElement | null) => void
}) {
  const [focusRequest, setFocusRequest] = useState(0)
  const [submenuPosition, setSubmenuPosition] = useState<{ side: "left" | "right"; offsetY: number }>({
    side: "right",
    offsetY: 0,
  })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const submenuContainerRef = useRef<HTMLDivElement>(null)
  const submenuId = useId()
  const submenuEntries = item.submenu ?? []
  const hasSubmenu = submenuEntries.length > 0
  const Icon = item.icon

  const openSubmenu = (focusFirstItem: boolean) => {
    if (item.disabled || !hasSubmenu) {
      return
    }

    onOpenSubmenu(itemIndex, focusFirstItem)

    if (focusFirstItem) {
      setFocusRequest((request) => request + 1)
    }
  }

  const closeSubmenuAndFocusTrigger = () => {
    onCloseSubmenu(itemIndex)
    triggerRef.current?.focus()
  }

  useLayoutEffect(() => {
    const container = submenuContainerRef.current
    const trigger = triggerRef.current

    if (!isSubmenuOpen || !container || !trigger) {
      return
    }

    const padding = 8
    const bounds = container.getBoundingClientRect()
    const triggerBounds = trigger.getBoundingClientRect()
    const side = triggerBounds.right + bounds.width > window.innerWidth - padding && triggerBounds.left >= bounds.width
      ? "left"
      : "right"
    const offsetY = bounds.bottom > window.innerHeight - padding
      ? window.innerHeight - padding - bounds.bottom
      : bounds.top < padding
        ? padding - bounds.top
        : 0

    setSubmenuPosition({ side, offsetY })
  }, [isSubmenuOpen])

  return (
    <div
      className="editor-canvas-context-menu__item-container"
      onMouseEnter={() => openSubmenu(false)}
      onMouseLeave={() => onCloseSubmenu(itemIndex)}
    >
      <button
        ref={(element) => {
          triggerRef.current = element
          setItemRef(itemIndex, element)
        }}
        type="button"
        role="menuitem"
        tabIndex={item.disabled || !isActive ? -1 : 0}
        disabled={item.disabled}
        aria-disabled={item.disabled || undefined}
        aria-haspopup={hasSubmenu ? "menu" : undefined}
        aria-expanded={hasSubmenu ? isSubmenuOpen : undefined}
        aria-controls={hasSubmenu && isSubmenuOpen ? submenuId : undefined}
        data-destructive={item.destructive || undefined}
        data-has-submenu={hasSubmenu || undefined}
        data-highlighted={isActive && !item.disabled ? "true" : undefined}
        className="editor-canvas-context-menu__item"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" && hasSubmenu) {
            event.preventDefault()
            event.stopPropagation()
            openSubmenu(true)
            return
          }

          if ((event.key === "ArrowLeft" || event.key === "Escape") && onRequestClose) {
            event.preventDefault()
            event.stopPropagation()
            onRequestClose()
            return
          }

          onNavigate(event, itemIndex)
        }}
        onClick={() => {
          if (hasSubmenu) {
            if (isSubmenuOpen) {
              closeSubmenuAndFocusTrigger()
            } else {
              openSubmenu(true)
            }
            return
          }

          item.onSelect?.()
          onClose()
        }}
      >
        <Icon className="editor-canvas-context-menu__icon" aria-hidden="true" />
        <span className="editor-canvas-context-menu__label">{item.label}</span>
        {item.premium ? (
          <span className="editor-canvas-context-menu__premium" title="Premium">
            <Crown className="editor-canvas-context-menu__premium-icon" aria-hidden="true" />
            <span className="sr-only">Premium</span>
          </span>
        ) : null}
        {item.shortcut ? <kbd className="editor-canvas-context-menu__shortcut">{item.shortcut}</kbd> : null}
        {hasSubmenu ? (
          <ChevronRight className="editor-canvas-context-menu__submenu-indicator" aria-hidden="true" />
        ) : null}
      </button>

      {hasSubmenu && isSubmenuOpen ? (
        <div
          ref={submenuContainerRef}
          className="editor-canvas-context-menu__submenu-container"
          data-side={submenuPosition.side}
          style={{ marginTop: submenuPosition.offsetY }}
        >
          <CanvasContextMenuSurface
            entries={submenuEntries}
            menuId={submenuId}
            ariaLabel={item.label}
            autoFocus={focusRequest > 0}
            focusRequest={focusRequest}
            onClose={onClose}
            onRequestClose={closeSubmenuAndFocusTrigger}
          />
        </div>
      ) : null}
    </div>
  )
}

function CanvasContextMenuSurface({
  entries,
  menuId,
  ariaLabel,
  autoFocus = false,
  focusRequest = 0,
  onClose,
  onRequestClose,
}: CanvasContextMenuSurfaceProps) {
  const selectableItems = getSelectableItems(entries)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [activeIndex, setActiveIndex] = useState(() => findEnabledItem(selectableItems, -1, 1))
  const [openSubmenuIndex, setOpenSubmenuIndex] = useState<number | null>(null)

  useEffect(() => {
    setActiveIndex((currentIndex) => {
      if (currentIndex >= 0 && currentIndex < selectableItems.length && !selectableItems[currentIndex].disabled) {
        return currentIndex
      }

      return findEnabledItem(selectableItems, -1, 1)
    })
  }, [selectableItems])

  useLayoutEffect(() => {
    if (!autoFocus) {
      return
    }

    const firstEnabledIndex = findEnabledItem(selectableItems, -1, 1)

    if (firstEnabledIndex >= 0) {
      itemRefs.current[firstEnabledIndex]?.focus()
    }
  }, [autoFocus, focusRequest, selectableItems])

  const setItemRef = (itemIndex: number, element: HTMLButtonElement | null) => {
    itemRefs.current[itemIndex] = element
  }

  const moveFocus = (itemIndex: number, direction: 1 | -1) => {
    const nextIndex = findEnabledItem(selectableItems, itemIndex, direction)

    if (nextIndex >= 0) {
      setOpenSubmenuIndex(null)
      setActiveIndex(nextIndex)
      itemRefs.current[nextIndex]?.focus()
    }
  }

  const onNavigate = (event: ReactKeyboardEvent<HTMLButtonElement>, itemIndex: number) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      event.stopPropagation()
      moveFocus(itemIndex, 1)
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      event.stopPropagation()
      moveFocus(itemIndex, -1)
      return
    }

    if (event.key === "Home") {
      event.preventDefault()
      event.stopPropagation()
      const firstEnabledIndex = findEnabledItem(selectableItems, -1, 1)

      if (firstEnabledIndex >= 0) {
        setOpenSubmenuIndex(null)
        setActiveIndex(firstEnabledIndex)
        itemRefs.current[firstEnabledIndex]?.focus()
      }

      return
    }

    if (event.key === "End") {
      event.preventDefault()
      event.stopPropagation()
      const lastEnabledIndex = findEnabledItem(selectableItems, 0, -1)

      if (lastEnabledIndex >= 0) {
        setOpenSubmenuIndex(null)
        setActiveIndex(lastEnabledIndex)
        itemRefs.current[lastEnabledIndex]?.focus()
      }

      return
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  let itemIndex = 0

  const renderEntry = (entry: CanvasContextMenuEntry, entryIndex: number) => {
    if (isCanvasContextMenuSeparator(entry)) {
      return <div key={getEntryKey(entry, entryIndex)} className="editor-canvas-context-menu__separator" role="separator" />
    }

    if (isCanvasContextMenuGroup(entry)) {
      const groupLabelId = `${menuId}-group-${entryIndex}`

      return (
        <div key={getEntryKey(entry, entryIndex)}>
          {hasSeparatorBefore(entry) ? <div className="editor-canvas-context-menu__separator" role="separator" /> : null}
          <div
            role="group"
            aria-labelledby={entry.label ? groupLabelId : undefined}
            className="editor-canvas-context-menu__group"
          >
            {entry.label ? (
              <div id={groupLabelId} className="editor-canvas-context-menu__group-label">
                {entry.label}
              </div>
            ) : null}
            {entry.items.map((groupEntry, groupEntryIndex) => renderEntry(groupEntry, groupEntryIndex))}
          </div>
        </div>
      )
    }

    const currentItemIndex = itemIndex
    itemIndex += 1

    return (
      <div key={getEntryKey(entry, entryIndex)}>
        {hasSeparatorBefore(entry) ? <div className="editor-canvas-context-menu__separator" role="separator" /> : null}
        <MenuItem
          item={entry}
          itemIndex={currentItemIndex}
          isActive={activeIndex === currentItemIndex}
          isSubmenuOpen={openSubmenuIndex === currentItemIndex}
          onClose={onClose}
          onCloseSubmenu={(index) => {
            setOpenSubmenuIndex((currentIndex) => (currentIndex === index ? null : currentIndex))
          }}
          onOpenSubmenu={(index) => setOpenSubmenuIndex(index)}
          onRequestClose={onRequestClose}
          onNavigate={onNavigate}
          setItemRef={setItemRef}
        />
      </div>
    )
  }

  return (
    <div id={menuId} role="menu" aria-label={ariaLabel} aria-orientation="vertical" className="editor-canvas-context-menu__surface">
      {entries.map(renderEntry)}
    </div>
  )
}

export function CanvasContextMenu({
  items,
  onClose,
  x,
  y,
}: {
  items: CanvasContextMenuEntry[]
  onClose: () => void
  x: number
  y: number
}) {
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
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
        event.preventDefault()
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
      className="editor-canvas-context-menu fixed z-50"
      style={{ left: position.x, top: position.y }}
      onContextMenu={(event) => event.preventDefault()}
    >
      <CanvasContextMenuSurface
        entries={items}
        menuId={`${menuId}-root`}
        ariaLabel="Acciones del elemento"
        onClose={onClose}
      />
    </div>
  )
}
