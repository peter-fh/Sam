import './App.css'
import Modal from './components/Modal'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import Threads from './components/Threads'
import { Route, Routes, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Log, LogLevel } from './log'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import supabase from './supabase'



function ChatRouteWrapper() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <>
        <Chat id={null}/>
      </>
    )
  }
  const conversationId = parseInt(id)

  useEffect(() => {
    Log(LogLevel.Debug, "Updated conversationId: ", conversationId)
  }, [conversationId])

  return (
    <>
      <Chat id={conversationId}/>
    </>
  )
}

function App() {

  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    return (<Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />)
  } else {
    return (
      <>
        <Routes>
          <Route path="/" element={<Modal/>}/>
          <Route path="/chat" element={
            <>
              <Sidebar/>
              <ChatRouteWrapper/>
            </>
          }/>
          <Route path="/chat/:id" element={
            <>
              <Sidebar/>
              <ChatRouteWrapper/>
            </>
          }/>
          <Route path="/threads" element={
            <>
              <Sidebar/>
              <Threads/>
            </>
          }/>
        </Routes>
      </>
    )
  }
}

export default App
