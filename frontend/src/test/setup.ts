import '@testing-library/jest-dom'
import { afterAll, beforeAll, beforeEach, vi } from 'vitest'
import type { Session, Subscription } from '@supabase/supabase-js'
import supabase from '../supabase'

vi.mock('../supabase', () => ({
  default: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}))

window.MathJax = {
  typeset: vi.fn(),
}

window.HTMLElement.prototype.scrollIntoView = vi.fn()

// Mock Entra ID context
const mockEntraIDContext = {
  isAuthenticated: true,
  user: {
    id: 'mock_user_id',
    email: 'test@example.com',
    name: 'Test User',
  },
  loading: false,
  accessToken: 'mock_access_token',
  idToken: 'mock_id_token',
  login: vi.fn(),
  logout: vi.fn(),
  acquireToken: vi.fn(() => Promise.resolve('mock_token')),
  refreshToken: vi.fn(() => Promise.resolve(true)),
  error: null,
}

const mockEntraIDModule = {
  useEntraID: () => mockEntraIDContext,
  EntraIDProvider: ({ children }: any) => children,
}

vi.mock('../context/useEntraID', () => mockEntraIDModule)

vi.mock('../context/useEntraID.tsx', () => mockEntraIDModule)

vi.mock('../context/useEntraID.ts', () => mockEntraIDModule)

const mockSession: Session = {
  access_token: "mock_access_token",
  refresh_token: "mock_refresh_token",
  expires_in: 99999,
  token_type: 'bearer',
  user: {
    id: "cb844986-e61c-4f7c-99bb-1ea340145c7a", // Randomly generated UUID
    app_metadata: {
    },
    user_metadata: {
    },
    aud: "mock_aud",
    created_at: "mock_created_at",
  }
}

export function createStreamResponse(tokens: string[], delayMs = 50) {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for (const token of tokens) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        controller.enqueue(encoder.encode(token));
      }
      controller.close();
    },
  });
  return new Response(stream, { status: 200 });
}

const mockSubscription: Subscription = {
  id: "cb844986-e61c-4f7c-99bb-1ea340145c7a",
  callback: vi.fn(),
  unsubscribe: vi.fn(),
}

beforeAll(async () => {
})

afterAll(() => {
  vi.restoreAllMocks()
})

beforeEach(() => {
  window.history.pushState({}, '', '/')
  vi.clearAllMocks()
  vi.mocked(supabase.auth.getSession).mockResolvedValue({
    data: { session: mockSession },
    error: null,
  } as any)
  vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
    data: { subscription: mockSubscription },
  } as any)
  global.fetch = vi.fn()
})
