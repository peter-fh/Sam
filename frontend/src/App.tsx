import './App.css'
import Modal from './components/Modal'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import Threads from './components/Threads'
import { Route, Routes, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { Log, LogLevel } from './log'

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

export default App
