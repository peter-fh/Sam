import '@testing-library/jest-dom'
import supabase from '../supabase'
import { afterAll, beforeAll, beforeEach, vi } from 'vitest'

window.MathJax = {
  typeset: vi.fn(),
}

window.HTMLElement.prototype.scrollIntoView = vi.fn()

beforeAll(async () => {
  await supabase.auth.signUp({
    email: 'test@concordia.ca',
    password: 'testpassword123!'
  })

  await supabase.auth.signInWithPassword({
    email: 'test@concordia.ca',
    password: 'testpassword123!'
  })
})

afterAll(async () => {
  await supabase.auth.signOut()
})

beforeEach(() => {
  window.history.pushState({}, '', '/')
})
