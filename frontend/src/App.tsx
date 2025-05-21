import './App.css'
import Modal from './components/Modal'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import Threads from './components/Threads'
import { Route, Routes, useParams } from 'react-router-dom'

function ChatRouteWrapper() {
  const { id } = useParams<{ id: string }>();
  console.log("Id inside wrapper: ", id)

  if (!id) {
    return (
    <>
        <Chat id={null}/>
    </>
    )
  }
  const conversationId = parseInt(id)

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
