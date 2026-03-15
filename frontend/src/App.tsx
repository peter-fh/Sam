import './App.css'
import Modal from './components/Modal'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import { Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import type { Session } from '@supabase/supabase-js'
import supabase from './supabase'


function App() {

  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    let alive = true
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!alive) return
        setSession(error ? null : (data.session ?? null))
        setAuthReady(true)
      })
      .catch(() => {
        if (!alive) return
        setSession(null)
        setAuthReady(true)
      })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setAuthReady(true)
    })
    return () => {
      alive = false
      subscription.unsubscribe()
    }
  }, [])

  // Avoid a brief "login screen flash" while Supabase hydrates session from storage.
  if (!authReady) {
    return (
      <div style={{ padding: '1rem' }}>
        Loading...
      </div>
    )
  }

  if (!session) {
    return (<Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />)
  } else {
    return (
      <>
        <Routes>
          <Route path="/" element={<Modal/>}/>
          <Route path="/chat/:id?" element={
            <>
              <Sidebar/>
              <Chat/>
            </>
          }/>
        </Routes>
      </>
    )
  }
}

export default App
