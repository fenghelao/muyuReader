import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/app.css'
import DecoyScreen from './components/DecoyScreen'

// Placeholder view follows the system color scheme.
document.documentElement.setAttribute(
  'data-theme',
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
)

createRoot(document.getElementById('decoy-root')!).render(<DecoyScreen />)
