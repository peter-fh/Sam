import { renderApp } from './utils'
import { screen, waitFor } from '@testing-library/react'
import { it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'

it('Disclaimer must be accepted and modal must be shown before chat is shown', async () => {
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

it('Validate sending a chat message', async () => {
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

  const chatInput = screen.getByTestId('chat-input')
  await userEvent.type(chatInput, "hi{enter}")
  await waitFor(() => {
    expect(screen.queryByTestId('streaming-message')).toBeInTheDocument()
  }, {timeout: 5000})
  await waitFor(() => {
    expect(screen.queryByTestId('streaming-message')).not.toBeInTheDocument()
  }, {timeout: 5000})
})

it('Check multiple conversations with loading previous from sidebar', async () => {
  // Setup
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
  const threadCount = screen.queryAllByTestId('thread').length

  // Send first message
  let chatInput = screen.getByTestId('chat-input')
  await userEvent.type(chatInput, "hi{enter}")
  await waitFor(() => {
    expect(screen.queryByTestId('streaming-message')).toBeInTheDocument()
  }, {timeout: 5000})
  await waitFor(() => {
    expect(screen.queryByTestId('streaming-message')).not.toBeInTheDocument()
  }, {timeout: 5000})

  // Create new chat
  expect(screen.queryByTestId('new-chat-button')).toBeInTheDocument()
  const newChatButton = screen.queryByTestId('new-chat-button');
  await userEvent.click(newChatButton!)
  await waitFor(() => {
    expect(screen.queryByTestId('course-modal')).toBeInTheDocument()
  })
  await userEvent.click(screen.getByRole('button'))

  // Send second message
  await waitFor(() => {
    expect(screen.queryByTestId('chat-input')).toBeInTheDocument()
  }, {timeout: 5000})
  chatInput = screen.getByTestId('chat-input')
  await userEvent.type(chatInput, "hi{enter}")
  await waitFor(() => {
    expect(screen.queryByTestId('streaming-message')).toBeInTheDocument()
  }, {timeout: 5000})
  await waitFor(() => {
    expect(screen.queryByTestId('streaming-message')).not.toBeInTheDocument()
  }, {timeout: 5000})

  // Assert
  await waitFor(() => {
    expect(screen.queryAllByTestId('thread').length + 2 == threadCount)
  }, {timeout: 5000})
}, 20000)
