import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts'
import './index.css'
import App from './App.tsx'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProviders } from '@/auth/auth'
import { I18nProvider } from '@/i18n/i18n-context'
import { ProductionVersionToast } from '@/components/production-version-toast'

const app = (
  <TooltipProvider>
    <App />
  </TooltipProvider>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <AuthProviders>{app}</AuthProviders>
      <ProductionVersionToast />
    </I18nProvider>
  </StrictMode>,
)
