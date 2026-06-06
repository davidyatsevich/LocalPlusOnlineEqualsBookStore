import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'   // team theme (Ivy Forest palette + .error-msg/.success-msg)
import './App.css'     // layout styles for the React app
import App from './App.jsx'
import { AuthProvider } from './state/auth.jsx'
import { CartProvider } from './state/cart.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
