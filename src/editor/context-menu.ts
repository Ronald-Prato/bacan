import { findSelectedElements, type CanvasElement, type EditorDocument, type Selection } from "./document"

export const LOCAL_CONTEXT_MENU_ACTION_IDS = [
  "copy",
  "paste",
  "duplicate",
  "position",
  "delete",
  "align",
  "lock",
] as const

export const OPTIONAL_CONTEXT_MENU_ACTION_IDS = [
  "comment",
  "link",
  "duration",
  "alt-text",
  "magic-text",
  "translate",
  "create-component",
] as const

export const CONTEXT_MENU_ACTION_IDS = [
  ...LOCAL_CONTEXT_MENU_ACTION_IDS,
  ...OPTIONAL_CONTEXT_MENU_ACTION_IDS,
] as const

export type LocalContextMenuActionId = (typeof LOCAL_CONTEXT_MENU_ACTION_IDS)[number]
export type OptionalContextMenuActionId = (typeof OPTIONAL_CONTEXT_MENU_ACTION_IDS)[number]
export type ContextMenuActionId = (typeof CONTEXT_MENU_ACTION_IDS)[number]
export type ContextMenuActionSource = "local" | "optional"
export type ContextMenuActionState = "available" | "disabled" | "hidden"
export type ContextMenuActionReason =
  | "no-selection"
  | "unsupported-selection"
  | "capability-unavailable"
  | "clipboard-empty"
export type ContextMenuCapability = OptionalContextMenuActionId

export type ContextMenuCapabilities = Partial<Record<ContextMenuCapability, boolean>>

export type ContextMenuAction = {
  id: ContextMenuActionId
  source: ContextMenuActionSource
  state: ContextMenuActionState
  visible: boolean
  enabled: boolean
  reason?: ContextMenuActionReason
}

export type ContextMenuRequest = {
  document: EditorDocument
  selection: Selection
  capabilities?: ContextMenuCapabilities
  hasClipboardElements?: boolean
}

type OptionalActionRule = {
  capability: ContextMenuCapability
  matches: (elements: readonly CanvasElement[]) => boolean
}

const OPTIONAL_ACTION_RULES: Record<OptionalContextMenuActionId, OptionalActionRule> = {
  comment: {
    capability: "comment",
    matches: (elements) => elements.length === 1,
  },
  link: {
    capability: "link",
    matches: (elements) => elements.length > 0,
  },
  duration: {
    capability: "duration",
    matches: (elements) => elements.length > 0,
  },
  "alt-text": {
    capability: "alt-text",
    matches: (elements) =>
      elements.length === 1 &&
      elements.every((element) => element.type === "image" || element.type === "shape"),
  },
  "magic-text": {
    capability: "magic-text",
    matches: (elements) => elements.length === 1 && elements.every((element) => element.type === "text"),
  },
  translate: {
    capability: "translate",
    matches: (elements) => elements.length > 0 && elements.every((element) => element.type === "text"),
  },
  "create-component": {
    capability: "create-component",
    matches: (elements) => elements.length > 0,
  },
}

export function getContextMenuActions({
  document,
  selection,
  capabilities = {},
  hasClipboardElements = false,
}: ContextMenuRequest): ContextMenuAction[] {
  const selectedElements = findSelectedElements(document, selection)

  return CONTEXT_MENU_ACTION_IDS.map((id) => {
    if (selectedElements.length === 0) {
      return createAction(id, "hidden", "no-selection")
    }

    if (isLocalContextMenuAction(id)) {
      if (id === "paste" && !hasClipboardElements) {
        return createAction(id, "disabled", "clipboard-empty")
      }

      return createAction(id, "available")
    }

    const rule = OPTIONAL_ACTION_RULES[id]

    if (!rule.matches(selectedElements)) {
      return createAction(id, "hidden", "unsupported-selection")
    }

    if (capabilities[rule.capability] !== true) {
      return createAction(id, "disabled", "capability-unavailable")
    }

    return createAction(id, "available")
  })
}

function isLocalContextMenuAction(id: ContextMenuActionId): id is LocalContextMenuActionId {
  return (LOCAL_CONTEXT_MENU_ACTION_IDS as readonly ContextMenuActionId[]).includes(id)
}

function createAction(
  id: ContextMenuActionId,
  state: ContextMenuActionState,
  reason?: ContextMenuActionReason,
): ContextMenuAction {
  return {
    id,
    source: isLocalContextMenuAction(id) ? "local" : "optional",
    state,
    visible: state !== "hidden",
    enabled: state === "available",
    ...(reason ? { reason } : {}),
  }
}
