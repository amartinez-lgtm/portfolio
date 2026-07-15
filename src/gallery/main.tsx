import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import GalleryPage from './GalleryPage'

createRoot(document.getElementById('gallery-root')!).render(
  <StrictMode>
    <GalleryPage />
  </StrictMode>,
)
