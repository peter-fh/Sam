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
      className={`flex-1 h-screen bg-[#FAF8F5] dark:bg-[#0F090B] text-slate-900 dark:text-slate-100 transition-colors duration-200 relative flex flex-col ${
        sidebar ? 'pl-0 lg:pl-72' : 'pl-0'
      }`} 
      onDrop={handleDrop} 
      onDragOver={handleDragOver}
      data-testid="chat"
    >
      {/* Fixed top header navbar */}
      <header className={`fixed top-0 right-0 z-30 h-14 backdrop-blur-xl bg-white/90 dark:bg-[#0F090B]/90 border-b border-[#E6DDD3] dark:border-[#261418] px-4 sm:px-6 flex items-center justify-between shadow-sm transition-colors duration-200 ${
        sidebar ? 'left-0 lg:left-72' : 'left-0'
      }`}>
        <div className="flex items-center gap-3">
          {!sidebar && (
            <SidebarButton />
          )}
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#E5A712] animate-pulse"></div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-tight m-0 no-underline">
              Concordia Sam
            </h2>
            {chatState.course && (
              <span className="px-2.5 py-1 text-xs font-semibold bg-[#FFF8E6] dark:bg-[#E5A712]/15 text-[#855D00] dark:text-[#F5C242] border border-[#F5E1A4] dark:border-[#E5A712]/30 rounded-lg flex items-center gap-1.5 transition-colors duration-200">
                <i className="fa-solid fa-book-open text-[10px] text-[#912338] dark:text-[#E5A712]"></i>
                {chatState.course}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <main className="flex-1 overflow-y-auto pt-20 pb-40 w-full" ref={messagesRef}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col gap-6 w-full">
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
        </div>
      </main>

      {/* Floating Input Area Bar */}
      <div className={`fixed bottom-0 right-0 z-20 p-4 sm:p-6 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/90 dark:from-[#0F090B] dark:via-[#0F090B]/90 to-transparent transition-colors duration-200 pointer-events-none ${
        sidebar ? 'left-0 lg:left-72' : 'left-0'
      }`}>
        <div className="max-w-4xl mx-auto pointer-events-auto">
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
