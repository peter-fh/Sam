import './App.css'
import Modal from './components/Modal'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import Threads from './components/Threads'
import { useThreadSelectionContext } from './context/useThreadContext'

function App() {
  const {
    currentThread,
    threadsOpen,
    threadKey
  } = useThreadSelectionContext()

  return (
    <>
      <Modal/>
      <Sidebar/>
      { threadsOpen ? 
        <Threads/>
        :
        <Chat key={threadKey} id={currentThread}/>
      }
    </>
  )
}

export default App
