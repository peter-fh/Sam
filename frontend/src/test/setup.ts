import '@testing-library/jest-dom'
import supabase from '../supabase'
import { afterAll, beforeAll } from 'vitest'

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
