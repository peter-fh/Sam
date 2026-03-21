import React from 'react'
import { vi } from 'vitest'
import { ChatSettingsContextType, ChatSettingsContext, ChatSettingsProvider } from '../context/useChatContext'
import { Course } from '../types/options'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'
import { mockComponent } from 'react-dom/test-utils'

export const defaultSettings: ChatSettingsContextType = {
  course: Course.MATH203,
  setCourse: vi.fn(),
  sidebar: true,
  setSidebar: vi.fn(),
  smallScreen: false,
  setSmallScreen: vi.fn(),
  disclaimerAccepted: false,
  setDisclaimerAccepted: vi.fn(),
}

interface CustomRenderOptions extends RenderOptions {
  settings?: Partial<ChatSettingsContextType>;
}
export function renderApp() {
  return render(
    <BrowserRouter>
      <ChatSettingsProvider>
        <App/>
      </ChatSettingsProvider>
    </BrowserRouter>,
  )
}

export function renderComponent(ui: React.ReactElement) {
  return render(
    <BrowserRouter>
      <ChatSettingsProvider>
        {ui}
      </ChatSettingsProvider>
    </BrowserRouter>,
  )
}

export function renderWithProviders(
  ui: React.ReactElement,
  { settings, ...options }: CustomRenderOptions = {}
) {
  return render(
    <BrowserRouter>
      <ChatSettingsContext.Provider value={{ ...defaultSettings, ...settings }}>
        {ui}
      </ChatSettingsContext.Provider>
    </BrowserRouter>,
    options
  );
}

export type MockConversation = {
  id: number,
  updated_at: string,
  summary: string | null,
  title: string,
  course_id: number,
  mode_id: number | null,
  user_id: number,
}

export function createMockConversation(id: number = 0, 
  title: string = "title",
  summary: string | null = null,
) {
  const conversation: MockConversation = {
    id: id,
    updated_at: "2025-04-18 22:03:24.865034+00",
    summary: summary,
    title: title,
    course_id: 1,
    mode_id: null,
    user_id: 1,
  }
  return conversation
}
