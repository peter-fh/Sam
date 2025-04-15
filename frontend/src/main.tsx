import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ChatSettingsProvider } from './context/useChatContext.tsx'
import { ThreadSelectionProvider } from './context/useThreadContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChatSettingsProvider>
      <ThreadSelectionProvider>
        <App />
      </ThreadSelectionProvider>
    </ChatSettingsProvider>
  </StrictMode>,
)
