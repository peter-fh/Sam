import { render, screen, waitFor } from '@testing-library/react'
import { it, expect } from 'vitest'
import App from '../App'
import { BrowserRouter } from 'react-router-dom'
import { ChatSettingsProvider } from '../context/useChatContext'

it('Disclaimer modal is visible on startup', async () => {
  render(
    <BrowserRouter>
      <ChatSettingsProvider>
          <App />
      </ChatSettingsProvider>
    </BrowserRouter>
  )

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /disclaimer/i })).toBeInTheDocument()
  })
})
