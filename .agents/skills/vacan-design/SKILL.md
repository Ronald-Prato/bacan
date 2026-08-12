---
name: vacan-design
description: Enforce Bacan's visual system when designing, implementing, refactoring, or reviewing editor screens, navigation, panels, forms, buttons, themes, and shared UI components. Use for every Bacan UI or UX change, especially light-mode styling, color choices, spacing, states, and visual consistency work.
---

# Vacan Design

Apply this system to every Bacan interface change. Treat its tokens and rules as constraints, not suggestions.

## Canonical palette

Use these exact light-mode primitives:

- Accent: `#93B259`
- Background: `#FDF6E3`
- Foreground: `#5C6A72`

Define primitives once as CSS variables. Derive every light-mode surface, border, muted state, hover, and focus color with `color-mix()` from these three primitives and transparent, white, or black. Do not add independent light-mode hex colors.

## Implementation rules

1. Use semantic component classes and CSS variables. Do not solve theme consistency by scattering Tailwind arbitrary hex values.
2. Scope light-mode rules under `.editor-theme-light`; preserve dark-mode behavior unless the task explicitly changes it.
3. Use background for app chrome and primary surfaces. Use a foreground/background mix for the canvas workspace and secondary surfaces.
4. Use foreground for text and icons. Reduce emphasis with opacity or a background mix; never substitute a new gray.
5. Use accent only for selection, active navigation, primary actions, focus, and positive status.
6. Keep contrast readable: primary action text must use foreground or black according to contrast; muted text must remain legible.
7. Keep the product flat. Do not add box shadows, drop shadows, glow effects, or depth gradients. Separate regions with one-pixel derived borders.
8. Keep radii compact: use existing small/medium radii for editor controls. Avoid decorative oversized cards inside the editor.
9. Show interaction state through fill, border, and text changes. Do not rely on shadow or scale alone.
10. Preserve dense editor structure: tool rail, context panel, canvas, inspector, compact toolbar, and direct manipulation.

## Workflow

1. Inspect the affected component and `src/index.css` before editing.
2. Reuse an existing semantic class or add one describing the component role.
3. Add or update the light-mode rule using the canonical variables.
4. Search the changed surface for hard-coded light colors and shadows; remove violations.
5. Verify active, hover, focus, disabled, empty, and destructive states in both themes.
6. Run `bun run test`, `bun run lint`, and `bun run build`.

## Review checklist

- No light-mode color exists outside the three primitives or a documented derived mix.
- No shadows or glow effects exist.
- Text and icons use foreground consistently.
- Accent is reserved for meaningful states and actions.
- Borders and surfaces remain visible in both themes.
- Controls retain accessible names, focus states, and adequate contrast.
