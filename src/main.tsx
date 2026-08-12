import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts'
import './index.css'
import App from './App.tsx'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProviders } from '@/auth/auth'

const app = (
  <TooltipProvider>
    <App />
  </TooltipProvider>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProviders>{app}</AuthProviders>
  </StrictMode>,
)
