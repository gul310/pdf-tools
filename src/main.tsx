import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerWebMcpTools } from './utils/webMcp'

// Safely register WebMCP tools if browser environment supports navigator.modelContext
registerWebMcpTools();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
