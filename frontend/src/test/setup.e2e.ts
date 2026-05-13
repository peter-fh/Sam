import '@testing-library/jest-dom'
import { afterAll, beforeAll, beforeEach, vi } from 'vitest'

window.MathJax = {
  typeset: vi.fn(),
}

window.HTMLElement.prototype.scrollIntoView = vi.fn()

// Mock Entra ID authentication
beforeAll(() => {
  // Store mock Entra ID token in session storage for e2e tests
  sessionStorage.setItem('entra_id_token', 'mock_id_token_for_testing')
})

afterAll(() => {
  // Clear mock token
  sessionStorage.removeItem('entra_id_token')
})

beforeEach(() => {
  window.history.pushState({}, '', '/')
})
