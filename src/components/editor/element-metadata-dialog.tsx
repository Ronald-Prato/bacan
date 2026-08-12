import { useEffect, useRef, type ChangeEvent, type KeyboardEvent } from "react"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/i18n-context"

export function ElementMetadataDialog({
  description,
  label,
  multiline = false,
  onCancel,
  onChange,
  onSave,
  title,
  value,
}: {
  description: string
  label: string
  multiline?: boolean
  onCancel: () => void
  onChange: (value: string) => void
  onSave: () => void
  title: string
  value: string
}) {
  const { tx } = useI18n()
  const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const dialogRef = useRef<HTMLFormElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null
    fieldRef.current?.focus()
    fieldRef.current?.select()

    return () => previousFocusRef.current?.focus()
  }, [])

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    event.stopPropagation()

    if (event.key === "Escape") {
      event.preventDefault()
      onCancel()
      return
    }

    if (event.key !== "Tab") {
      return
    }

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>('input, textarea, button:not(:disabled)') ?? [],
    )
    const first = focusable[0]
    const last = focusable.at(-1)

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  const sharedProps = {
    ref: (node: HTMLInputElement | HTMLTextAreaElement | null) => {
      fieldRef.current = node
    },
    value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
    "aria-label": label,
    className: "editor-element-metadata-field min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px]",
  }

  return (
    <div
      className="editor-element-metadata-backdrop fixed inset-0 z-[60] grid place-items-center bg-black/65 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel()
        }
      }}
    >
      <form
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="element-metadata-title"
        aria-describedby="element-metadata-description"
        className="editor-element-metadata-dialog w-full max-w-md rounded-md border border-border bg-popover p-5 text-popover-foreground"
        onKeyDown={handleDialogKeyDown}
        onSubmit={(event) => {
          event.preventDefault()
          onSave()
        }}
      >
        <h2 id="element-metadata-title" className="text-base font-bold">{title}</h2>
        <p id="element-metadata-description" className="mt-1 text-sm text-muted-foreground">{description}</p>
        <label className="mt-5 block text-sm font-semibold">
          <span className="mb-2 block">{label}</span>
          {multiline ? (
            <textarea {...sharedProps} rows={4} />
          ) : (
            <input {...sharedProps} type="url" inputMode="url" placeholder="https://" />
          )}
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>{tx("Cancelar")}</Button>
          <Button type="submit">{tx("Guardar")}</Button>
        </div>
      </form>
    </div>
  )
}
