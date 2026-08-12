import { useEffect, useRef, type ChangeEvent } from "react"

import { Button } from "@/components/ui/button"

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
  const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    fieldRef.current?.focus()
    fieldRef.current?.select()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onCancel])

  const sharedProps = {
    ref: (node: HTMLInputElement | HTMLTextAreaElement | null) => {
      fieldRef.current = node
    },
    value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
    "aria-label": label,
    className: "editor-element-metadata-field min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25",
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="element-metadata-title"
        aria-describedby="element-metadata-description"
        className="editor-element-metadata-dialog w-full max-w-md rounded-md border border-border bg-popover p-5 text-popover-foreground"
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
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </div>
  )
}
