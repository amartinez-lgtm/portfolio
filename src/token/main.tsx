import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import TokenPage from './TokenPage'

createRoot(document.getElementById('token-root')!).render(
  <StrictMode>
    <TokenPage />
  </StrictMode>,
)
