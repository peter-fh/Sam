import './App.css'
import Modal from './components/Modal'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import { Route, Routes } from 'react-router-dom'


function App() {
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

export default App
