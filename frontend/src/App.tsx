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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-200">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-2xl">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-300 font-medium text-sm animate-pulse">Loading Concordia Sam...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-slate-50 to-slate-50 dark:from-indigo-900/20 dark:via-slate-950 dark:to-slate-950 transition-colors duration-200">
        <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/25 mb-3">
              <i className="fa-solid fa-graduation-cap text-2xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Concordia Sam</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">AI Calculus & Math Tutoring Assistant</p>
          </div>
          <Auth 
            supabaseClient={supabase} 
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4f46e5',
                    brandAccent: '#6366f1',
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-200">
        <Routes>
          <Route path="/" element={<Modal/>}/>
          <Route path="/chat/:id?" element={
            <div className="flex min-h-screen w-full relative overflow-hidden bg-slate-50 dark:bg-slate-950">
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
