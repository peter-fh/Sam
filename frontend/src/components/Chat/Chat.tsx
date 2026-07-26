import { useEffect, useRef } from 'react'
import './Chat.css'
import InputArea from './InputArea'
import useConversation from './useConversation'
import { useChatSettings } from '../../context/useChatContext'
import useFileReader from './useFileReader'
import MessageContent from './ConversationView'
import ErrorBar from './ErrorBar'
import { SidebarButton } from '../Sidebar/Elements'

const Chat: React.FC = () => {
  const {
    status,
    chatState,

    handleSendMessage,
    updateUserMessage,
    updateUserImage,
  } = useConversation();

  const {
    sidebar,
  } = useChatSettings();

  const {
    updateImage,
    imageData,
  } = useFileReader()

  useEffect(() => {
    if (!imageData){
      return
    }
    updateUserImage(imageData)
  }, [imageData])

  const bottomMarkerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const img = event.dataTransfer.files?.[0]
    if (img) {
      updateImage(img)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }

  const messagesRef = useRef<HTMLDivElement>(null)

  const scrollIntoView = () => {
    bottomMarkerRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollIntoView()
  }, [status, chatState.messages.length, chatState.streamingMessage])

  if (status === "ERROR" && chatState.errorMessage === "CHAT") {
    alert("An error occurred! Please try again.")
    window.location.reload()
  }

  return (
    <div 
      className={`flex-1 h-screen bg-zinc-950 text-zinc-100 transition-all duration-300 relative flex flex-col ${
        sidebar ? 'pl-0 lg:pl-72' : 'pl-0'
      }`} 
      onDrop={handleDrop} 
      onDragOver={handleDragOver}
      data-testid="chat"
    >
      {/* Fixed top header navbar - 100% unified zinc palette */}
      <header className={`fixed top-0 right-0 z-30 h-14 backdrop-blur-xl bg-zinc-950/90 border-b border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between shadow-sm transition-all duration-300 ${
        sidebar ? 'left-0 lg:left-72' : 'left-0'
      }`}>
        <div className="flex items-center gap-3">
          {!sidebar && (
            <SidebarButton />
          )}
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <h2 className="text-sm font-semibold text-zinc-200 tracking-tight m-0 no-underline">
              Concordia Sam
            </h2>
            {chatState.course && (
              <span className="px-2.5 py-1 text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/70 rounded-lg flex items-center gap-1.5">
                <i className="fa-solid fa-book-open text-[10px] text-zinc-400"></i>
                {chatState.course}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pt-20 pb-40 w-full max-w-4xl mx-auto flex flex-col gap-6" ref={messagesRef}>
        {status === "ERROR" && 
          <ErrorBar
            message={chatState.errorMessage!}
          />
        }
        <MessageContent
          messages={chatState.messages}
          status={status}
          streamingMessage={chatState.streamingMessage}
        />
        <div ref={bottomMarkerRef} className="h-0 w-0 m-0 p-0 border-none leading-none opacity-0" />
      </main>

      {/* Floating Input Area Bar */}
      <div className={`fixed bottom-0 right-0 z-20 p-4 sm:p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent transition-all duration-300 ${
        sidebar ? 'left-0 lg:left-72' : 'left-0'
      }`}>
        <div className="max-w-4xl mx-auto">
          <InputArea
            isLocked={status !== "IDLE"}
            fileRef={fileInputRef}
            updateMessage={updateUserMessage}
            updateFile={updateImage}
            handleSend={handleSendMessage}
          />
        </div>
      </div>
    </div>
  )
}

export default Chat
