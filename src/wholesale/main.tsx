import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import WholesalePage from './WholesalePage'

createRoot(document.getElementById('wholesale-root')!).render(
  <StrictMode>
    <WholesalePage />
  </StrictMode>,
)
