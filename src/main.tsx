import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts'
import './index.css'
import App from './App.tsx'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProviders } from '@/auth/auth'
import { I18nProvider } from '@/i18n/i18n-context'

const app = (
  <TooltipProvider>
    <App />
  </TooltipProvider>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <AuthProviders>{app}</AuthProviders>
    </I18nProvider>
  </StrictMode>,
)
