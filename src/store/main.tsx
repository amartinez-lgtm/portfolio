import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import StorePage from './StorePage'

createRoot(document.getElementById('store-root')!).render(
  <StrictMode>
    <StorePage />
  </StrictMode>,
)
