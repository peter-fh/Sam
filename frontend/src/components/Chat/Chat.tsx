import { useEffect, useRef } from 'react'
import './Chat.css'
import InputArea from './InputArea'
import useConversation from './useConversation'
import { useChatSettings } from '../../context/useChatContext'
import useFileReader from './useFileReader'
import MessageContent from './ConversationView'


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

  const messagesRef = useRef<HTMLDivElement>(null)

  const scrollIntoView = () => {
    bottomMarkerRef.current?.scrollIntoView()
  }

  useEffect(() => {
    scrollIntoView()
    if (status == "ERROR") {
      alert("An error occurred! Please try again.")
      window.location.reload()
    }
  }, [status])




  return (
    <>
      <div className="chat" onDrop={handleDrop} style={{
        marginLeft: sidebar ? '15em' : 0
      }}>
        <div className="messages" ref={messagesRef}>
          <MessageContent
            messages={chatState.messages}
            status={status}
            streamingMessage={chatState.streamingMessage}
            />
          <div ref={bottomMarkerRef} style={{ height: 0, margin: 0, padding: 0, border: 'none', lineHeight: 0 }} />
        </div>

        <div className="input">
          <InputArea
            isLocked={status != "IDLE"}
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
