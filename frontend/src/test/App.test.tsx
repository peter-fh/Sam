import { test, expect, vi } from 'vitest'
import { createMockConversation, renderApp, renderComponent } from './utils'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sidebar from '../components/Sidebar'
import { act } from 'react'
import Chat from '../components/Chat'
import { createStreamResponse } from './setup'

test('Disclaimer must be accepted and modal must be shown before chat is shown', async () => {
  vi.mocked(global.fetch).mockResolvedValueOnce(
    new Response(JSON.stringify([
      createMockConversation(),
    ]), { status: 200 })
  )
  renderApp()
  await waitFor(() => {
    expect(screen.queryByTestId('disclaimer-modal')).toBeInTheDocument()
  })

  await userEvent.click(screen.getByRole('button'))

  await waitFor(() => {
    expect(screen.queryByTestId('course-modal')).toBeInTheDocument()
  })

  await userEvent.click(screen.getByRole('button'))

  await waitFor(() => {
    expect(screen.queryByTestId('chat')).toBeInTheDocument()
  })
})

test('Test displaying conversations on the sidebar', async() => {
  vi.mocked(global.fetch).mockResolvedValueOnce(
    new Response(JSON.stringify([
      createMockConversation(1, "mock-title-1"),
      createMockConversation(2, "mock-title-2"),
    ]), { status: 200 })
  )
  renderComponent(<Sidebar/>)
  await act(async () => {})
  await waitFor(() => {
    expect(screen.queryByTestId('mock-title-1')).toBeInTheDocument()
    expect(screen.queryByTestId('mock-title-2')).toBeInTheDocument()
  })
})


test('Test that the end symbol does not appear', async() => {
  vi.mocked(global.fetch).mockResolvedValueOnce(
    new Response(JSON.stringify({
      "id": 1
    }), { status: 200 })
  )

  vi.mocked(global.fetch).mockResolvedValueOnce(
    createStreamResponse(['\n__START__\n', 'hi', ' there!', '\n__END__\n'])
  )
  renderComponent(<Chat/>)
  await act(async () => {})
  await waitFor(() => {
    expect(screen.queryByTestId('chat-input')).toBeInTheDocument()
  }, {timeout: 5000})
  const chatInput = screen.getByTestId('chat-input')
  await userEvent.type(chatInput, "hi{enter}")
  await waitFor(() => {
    expect(screen.queryByTestId('streaming-message')).toBeInTheDocument()
  }, {timeout: 1000})
  await waitFor(() => {
    expect(screen.queryByTestId('streaming-message')).not.toBeInTheDocument()
  }, {timeout: 1000})
  const message = screen.getByTestId('message-2')
  console.log(message.innerHTML)
  await waitFor(() => {
    expect(message.textContent).toBe('hi there!\n')
    expect(message.textContent).not.toContain('__START__')
    expect(message.textContent).not.toContain('__END__')
    expect(message.textContent).not.toContain('__ERROR__')
  }, {timeout: 1000})

})
