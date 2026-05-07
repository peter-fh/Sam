import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ChatSettingsProvider } from './context/useChatContext.tsx'
import { EntraIDProvider } from './context/useEntraID.tsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <EntraIDProvider>
        <ChatSettingsProvider>
          <App />
        </ChatSettingsProvider>
      </EntraIDProvider>
    </BrowserRouter>
  </StrictMode>,
)
