import { useEffect, useRef } from 'react'
import './Chat.css'
import MarkTeX from '../MarkTeX'
import InputArea from './InputArea'
import ConversationView from './ConversationView'
import { LoadingConversationSpinner, WaitingSpinner, ThinkingSpinner } from './Spinners'
import useConversation from './useConversationNew'
import { useChatSettings } from '../../context/useChatContext'
import useFileReader from './useFileReader'


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
    updateUserImage(imageData.data)
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

  const messagesRef = useRef<HTMLDivElement>(null)

  const scrollIntoView = () => {
    bottomMarkerRef.current?.scrollIntoView()
  }

  useEffect(() => {
    scrollIntoView()
  }, [status])


  const MessageContent = () => {
    if (status == "LOADING") {

      return (
        <>
          <LoadingConversationSpinner/>
        </>
      )
    }
    return (
      <>
        <ConversationView
          messages={chatState.messages}
        />
        {status == "THINKING" && (
          <ThinkingSpinner/>
          )}
        {status == "WAITING" && (
          <WaitingSpinner/>
        )}
        {status == "STREAMING" && chatState.streamingMessage && (
          <span key={-1}className="output">
            <MarkTeX content={chatState.streamingMessage!}/>
          </span>
        )}
      </>
    )
  }


  return (
    <>
      <div className="chat" onDrop={handleDrop} style={{
        marginLeft: sidebar ? '15em' : 0
      }}>
        <div className="messages" ref={messagesRef}>
          <MessageContent/>
          <div ref={bottomMarkerRef} style={{ height: 0, margin: 0, padding: 0, border: 'none', lineHeight: 0 }} />
        </div>

        <div className="input">
          <InputArea
            isLocked={status == "IDLE" ? true : false}
            fileRef={fileInputRef}
            updateMessage={updateUserMessage}
            updateFile={updateImage}
            handleSend={handleSendMessage}
          />
        </div>
        <div className="chat-background"/>
      </div>
    </>
  )
}


export default Chat
