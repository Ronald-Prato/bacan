import { Type } from "lucide-react"
import { useId, useState, type CSSProperties, type DragEvent, type KeyboardEvent } from "react"

import {
  TEXT_PRESETS,
  TEXT_PRESET_DRAG_MIME,
  type TextPreset,
  type TextPresetElementDefinition,
} from "@/editor/text-presets"

export type TextLibraryProps = {
  onAddText: () => void
  onAddPreset: (presetId: string) => void
}

const BASIC_PRESET_IDS = ["title", "subtitle", "body"] as const
const PREVIEW_FONT_SCALE = 0.2
const BASIC_PRESETS = BASIC_PRESET_IDS.flatMap(
  (id) => TEXT_PRESETS.find((preset) => preset.id === id) ?? [],
)
const STYLE_PRESETS = TEXT_PRESETS.filter((preset) => preset.section === "style")
const COMBINATION_PRESETS = TEXT_PRESETS.filter((preset) => preset.section === "combination")

function previewStyle(element: TextPresetElementDefinition): CSSProperties {
  const style = element.style

  return {
    color: style.fill,
    fontFamily: style.fontFamily,
    fontSize: `${Math.min(30, Math.max(11, style.fontSize * PREVIEW_FONT_SCALE))}px`,
    fontStyle: style.fontStyle,
    fontWeight: style.fontWeight,
    letterSpacing: `${(style.letterSpacing ?? 0) * PREVIEW_FONT_SCALE}px`,
    lineHeight: style.lineHeight,
    textAlign: style.align,
    textDecoration: style.textDecoration,
  }
}

function addFromKeyboard(event: KeyboardEvent<HTMLButtonElement>, onAdd: () => void) {
  if (event.key !== "Enter" && event.key !== " ") return

  event.preventDefault()
  onAdd()
}

function startPresetDrag(event: DragEvent<HTMLButtonElement>, presetId: string) {
  event.dataTransfer.effectAllowed = "copy"
  event.dataTransfer.setData(TEXT_PRESET_DRAG_MIME, presetId)
}

function PresetCard({
  preset,
  hintId,
  onAdd,
}: {
  preset: TextPreset
  hintId: string
  onAdd: (presetId: string) => void
}) {
  return (
    <button
      type="button"
      className="text-library__card"
      draggable
      aria-describedby={hintId}
      aria-label={`Agregar ${preset.label}: ${preset.description}`}
      title={`${preset.label}. Arrastra o haz doble click`}
      onDragStart={(event) => startPresetDrag(event, preset.id)}
      onDoubleClick={() => onAdd(preset.id)}
      onKeyDown={(event) => addFromKeyboard(event, () => onAdd(preset.id))}
    >
      <span className="text-library__card-preview" aria-hidden="true">
        {preset.elements.map((element) => (
          <span
            key={`${preset.id}-${element.name}`}
            className="text-library__preview-layer"
            style={previewStyle(element)}
          >
            {element.text}
          </span>
        ))}
      </span>
    </button>
  )
}

function BasicPresetButton({
  preset,
  onAdd,
}: {
  preset: TextPreset
  onAdd: (presetId: string) => void
}) {
  const element = preset.elements[0]

  return (
    <button
      type="button"
      className="text-library__basic-button"
      draggable
      aria-label={`Agregar ${preset.label}`}
      title={`Agregar ${preset.label}`}
      onClick={() => onAdd(preset.id)}
      onDragStart={(event) => startPresetDrag(event, preset.id)}
    >
      <span
        className="text-library__basic-preview"
        style={element ? { ...previewStyle(element), textAlign: "center" } : undefined}
        aria-hidden="true"
      >
        {element?.name ?? preset.label}
      </span>
    </button>
  )
}

export function TextLibrary({ onAddText, onAddPreset }: TextLibraryProps) {
  const hintId = useId()
  const [liveMessage, setLiveMessage] = useState("")

  const addPreset = (presetId: string, label: string) => {
    onAddPreset(presetId)
    setLiveMessage(`${label} se agregó`)
  }

  const addText = () => {
    onAddText()
    setLiveMessage("La caja de texto se agregó")
  }

  return (
    <aside className="text-library" aria-label="Biblioteca de texto">
      <header className="text-library__header">
        <p id={hintId} className="text-library__hint">Arrastra o haz doble click</p>
        <button
          type="button"
          className="text-library__primary-action"
          onClick={addText}
        >
          <Type aria-hidden="true" />
          Agregar caja de texto
        </button>
      </header>

      <div className="text-library__catalog">
        <section className="text-library__quick-section" aria-labelledby="text-library-quick-title">
          <h2 id="text-library-quick-title">Accesos rápidos</h2>
          <div className="text-library__basic-grid">
            {BASIC_PRESETS.map((preset) => (
              <BasicPresetButton key={preset.id} preset={preset} onAdd={(id) => addPreset(id, preset.label)} />
            ))}
          </div>
        </section>
        <section className="text-library__section" aria-labelledby="text-library-styles-title">
          <h2 id="text-library-styles-title">Estilos de texto predeterminados</h2>
          <div className="text-library__grid">
            {STYLE_PRESETS.map((preset) => (
              <PresetCard key={preset.id} preset={preset} hintId={hintId} onAdd={(id) => addPreset(id, preset.label)} />
            ))}
          </div>
        </section>
        <section className="text-library__section" aria-labelledby="text-library-combinations-title">
          <h2 id="text-library-combinations-title">Combinaciones de fuentes</h2>
          <div className="text-library__grid">
            {COMBINATION_PRESETS.map((preset) => (
              <PresetCard key={preset.id} preset={preset} hintId={hintId} onAdd={(id) => addPreset(id, preset.label)} />
            ))}
          </div>
        </section>
        <div className="sr-only" aria-live="polite">{liveMessage}</div>
      </div>
    </aside>
  )
}
