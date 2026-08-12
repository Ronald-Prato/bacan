import {
  AuthenticateWithRedirectCallback,
  ClerkProvider,
  useAuth,
} from "@clerk/react"
import { useSignIn } from "@clerk/react/legacy"
import { shadcn } from "@clerk/themes"
import { ConvexReactClient, useConvexAuth } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { useEffect, useState, type ReactNode } from "react"

import { SessionAvatarProvider } from "./session-avatar"
import { CALLBACK_PATH, LOGIN_PATH, safeReturnTo } from "./redirects"

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

type OAuthProvider = "github" | "google"

function requestedReturnTo() {
  return safeReturnTo(new URLSearchParams(window.location.search).get("redirect_url"))
}

function replaceLocation(path: string) {
  window.history.replaceState({}, "", path)
  window.dispatchEvent(new PopStateEvent("popstate"))
}

function useBrowserLocation() {
  const [location, setLocation] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
  }))

  useEffect(() => {
    const update = () => setLocation({ pathname: window.location.pathname, search: window.location.search })
    window.addEventListener("popstate", update)
    return () => window.removeEventListener("popstate", update)
  }, [])

  return location
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.93A6 6 0 0 1 6.07 12c0-.67.12-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.64.39 3.19 1.04 4.55l3.35-2.62Z" />
      <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" />
    </svg>
  )
}

function GitHubMark() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49l-.01-1.92c-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.64-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 7c.85 0 1.69.12 2.49.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.89l-.01 2.79c0 .27.18.59.69.49A10.2 10.2 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z" clipRule="evenodd" />
    </svg>
  )
}

function LoginPage() {
  const { isLoaded, signIn } = useSignIn()
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider>()
  const [error, setError] = useState("")
  const returnTo = requestedReturnTo()

  async function signInWith(provider: OAuthProvider) {
    if (!isLoaded) return
    setError("")
    setPendingProvider(provider)

    try {
      await signIn.authenticateWithRedirect({
        strategy: provider === "github" ? "oauth_github" : "oauth_google",
        redirectUrl: CALLBACK_PATH,
        redirectUrlComplete: returnTo,
        continueSignUp: true,
      })
    } catch {
      setPendingProvider(undefined)
      setError("No se pudo abrir el inicio de sesión. Inténtalo de nuevo.")
    }
  }

  return (
    <main className="bacan-auth-page">
      <section className="bacan-auth-card" aria-labelledby="bacan-auth-title">
        <div className="bacan-auth-mark" aria-hidden="true">B</div>
        <p className="bacan-auth-eyebrow">Bacan</p>
        <h1 id="bacan-auth-title">Accede a tu espacio</h1>
        <p className="bacan-auth-description">
          Tus diseños, recursos y versiones quedan protegidos y vinculados a tu cuenta.
        </p>

        <div className="bacan-auth-actions">
          <button
            type="button"
            disabled={!isLoaded || pendingProvider !== undefined}
            onClick={() => void signInWith("google")}
          >
            <GoogleMark />
            {pendingProvider === "google" ? "Abriendo Google…" : "Continuar con Google"}
          </button>
          <button
            type="button"
            disabled={!isLoaded || pendingProvider !== undefined}
            onClick={() => void signInWith("github")}
          >
            <GitHubMark />
            {pendingProvider === "github" ? "Abriendo GitHub…" : "Continuar con GitHub"}
          </button>
        </div>

        {error ? <p className="bacan-auth-error" role="alert">{error}</p> : null}
        <div id="clerk-captcha" />
      </section>
    </main>
  )
}

function AuthStatus({ message = "Verificando tu sesión…" }: { message?: string }) {
  return (
    <main className="bacan-auth-page">
      <div className="bacan-auth-status" role="status">{message}</div>
    </main>
  )
}

function AuthGate({ children }: { children: ReactNode }) {
  const clerk = useAuth()
  const convexAuth = useConvexAuth()
  const location = useBrowserLocation()
  const pathname = location.pathname

  useEffect(() => {
    if (!clerk.isLoaded) return

    if (!clerk.isSignedIn && pathname !== LOGIN_PATH && pathname !== CALLBACK_PATH) {
      const current = `${pathname}${window.location.search}${window.location.hash}`
      replaceLocation(`${LOGIN_PATH}?redirect_url=${encodeURIComponent(current)}`)
      return
    }

    if (clerk.isSignedIn && convexAuth.isAuthenticated && pathname === LOGIN_PATH) {
      replaceLocation(requestedReturnTo())
    }
  }, [clerk.isLoaded, clerk.isSignedIn, convexAuth.isAuthenticated, location.search, pathname])

  if (pathname === CALLBACK_PATH) {
    return <AuthenticateWithRedirectCallback signInFallbackRedirectUrl="/" signUpFallbackRedirectUrl="/" />
  }
  if (!clerk.isLoaded) return <AuthStatus />
  if (!clerk.isSignedIn) return <LoginPage />
  if (convexAuth.isLoading) return <AuthStatus message="Conectando tu espacio…" />
  if (!convexAuth.isAuthenticated) {
    return <AuthStatus message="Clerk inició la sesión, pero Convex no pudo validarla." />
  }
  if (pathname === LOGIN_PATH) return <AuthStatus />

  return <SessionAvatarProvider>{children}</SessionAvatarProvider>
}

export function AuthProviders({ children }: { children: ReactNode }) {
  if (!publishableKey || !convex) {
    return <AuthStatus message="Falta configurar Clerk o Convex para habilitar el acceso." />
  }

  return (
    <ClerkProvider
      appearance={{ theme: shadcn }}
      afterSignOutUrl={LOGIN_PATH}
      publishableKey={publishableKey}
      signInUrl={LOGIN_PATH}
      signUpUrl={LOGIN_PATH}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <AuthGate>{children}</AuthGate>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
