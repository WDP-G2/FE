import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <App />
    <Toaster position="top-right" richColors closeButton />
  </StrictMode>,
)

const loader = document.getElementById('app-loader')
if (loader) {
  loader.classList.add('is-hidden')
  setTimeout(() => loader.remove(), 400)
}
