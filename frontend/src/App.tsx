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

  if (!authReady) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl shadow-2xl">
          <div className="w-10 h-10 border-3 border-zinc-700 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-zinc-400 font-medium text-sm">Loading Concordia Sam...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md p-8 bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700/80 text-emerald-400 shadow-md mb-3">
              <i className="fa-solid fa-graduation-cap text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Concordia Sam</h1>
            <p className="text-sm text-zinc-400 mt-1">AI Calculus & Math Tutoring Assistant</p>
          </div>
          <Auth 
            supabaseClient={supabase} 
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#3f3f46',
                    brandAccent: '#52525b',
                    inputBackground: '#18181b',
                    inputText: '#f4f4f5',
                    inputBorder: '#3f3f46',
                    inputPlaceholder: '#71717a',
                  }
                }
              }
            }} 
          />
        </div>
      </div>
    )
  } else {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased">
        <Routes>
          <Route path="/" element={<Modal/>}/>
          <Route path="/chat/:id?" element={
            <div className="flex min-h-screen w-full relative overflow-hidden bg-zinc-950">
              <Sidebar/>
              <Chat/>
            </div>
          }/>
        </Routes>
      </div>
    )
  }
}

export default App
