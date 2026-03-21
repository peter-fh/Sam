import { test, expect, vi } from 'vitest'
import { createMockConversation, renderApp, renderComponent } from './utils'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sidebar from '../components/Sidebar'
import { act } from 'react'

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
