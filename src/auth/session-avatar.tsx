import { useClerk, useUser } from "@clerk/react"
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react"

const SessionAvatarContext = createContext<ReactNode>(null)

export function SessionAvatar() {
  return useContext(SessionAvatarContext)
}

export function SessionAvatarMenu({
  imageUrl,
  initial,
  label,
  name,
  email,
  onSignOut,
}: {
  imageUrl?: string
  initial: string
  label: string
  name?: string
  email?: string
  onSignOut: () => void | Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener("pointerdown", closeOutside)
    document.addEventListener("keydown", closeWithEscape)
    return () => {
      document.removeEventListener("pointerdown", closeOutside)
      document.removeEventListener("keydown", closeWithEscape)
    }
  }, [open])

  async function signOut() {
    if (signingOut) return
    setSigningOut(true)
    setOpen(false)
    await onSignOut()
  }

  return (
    <div className="bacan-session-avatar" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="bacan-session-avatar__trigger"
        aria-label={`Abrir menú de sesión de ${label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        {imageUrl ? <img src={imageUrl} alt="" /> : <span aria-hidden="true">{initial}</span>}
      </button>

      {open ? (
        <div id={menuId} className="bacan-session-avatar__menu" role="menu">
          <div className="bacan-session-avatar__profile">
            {imageUrl ? <img src={imageUrl} alt="" /> : <span aria-hidden="true">{initial}</span>}
            <span className="bacan-session-avatar__identity">
              {name ? <strong>{name}</strong> : null}
              {email ? <small>{email}</small> : null}
            </span>
          </div>
          <button
            type="button"
            className="bacan-session-avatar__sign-out"
            role="menuitem"
            disabled={signingOut}
            onClick={() => void signOut()}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M10 17l5-5-5-5M15 12H3M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
            </svg>
            {signingOut ? "Cerrando sesión…" : "Cerrar sesión"}
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function SessionAvatarProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const name = user?.fullName ?? undefined
  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress
  const label = name ?? email ?? "tu cuenta"
  const initial = user?.firstName?.trim().charAt(0) || label.trim().charAt(0) || "B"

  return (
    <SessionAvatarContext.Provider
      value={
        <SessionAvatarMenu
          imageUrl={user?.imageUrl}
          initial={initial.toUpperCase()}
          label={label}
          name={name}
          email={email}
          onSignOut={() => signOut({ redirectUrl: "/login" })}
        />
      }
    >
      {children}
    </SessionAvatarContext.Provider>
  )
}
