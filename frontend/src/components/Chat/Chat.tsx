import { useEffect, useRef } from 'react'
import './Chat.css'
import MarkTeX from '../MarkTeX'
import imageCompression from 'browser-image-compression'
import useConversation from './useConversation'
import { useChatSettings } from '../../context/useChatContext'
import { Log, LogLevel } from '../../log'
import { BeatLoader, PropagateLoader, } from "react-spinners"


interface ChatProps {
  id: number | null
}

const Chat: React.FC<ChatProps> = ({id}) => {

  const {
    handleSendMessage,
    intro,
    loadConversation,
    chatState,
    setChatState,
    uiState,
  } = useConversation();

  const {
    sidebar,
  } = useChatSettings();

  const {
    setSelectedThread,
  } = useThreadSelectionContext();



  const enterListener = (e: KeyboardEvent) => {
    if (e.key == "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", enterListener, false)

    return () => {
      document.removeEventListener("keydown", enterListener, false)
    }
  })

  useEffect(() => {
    if (!id) {
      intro()
    } else {
      setSelectedThread(id)
    }
  }, [])


const bottomMarkerRef = useRef<HTMLDivElement>(null);
  const scrollIntoView = () => {
    bottomMarkerRef.current?.scrollIntoView()
  }


  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileButtonClick = () => {
    fileInputRef!.current!.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const img = event.target.files?.[0];
    if (img) {
      updateImage(img)
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const img = event.dataTransfer.files?.[0]
    if (img) {
      const allowedFiles = [".png",".jpg",".jpeg",".gif"]
      for (const filetype of allowedFiles) {
        if (img.name.endsWith(filetype)) {
          updateImage(img)
        }
      }
    }
  }

  const updateImage = async (img: File) => {

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 2048,
      useWebWorker: true,
    }

    const compressedFile = await imageCompression(img, options);
    Log(LogLevel.Always, `Transcribing ${compressedFile.size / 1024 / 1024}MB file`);
    const reader = new FileReader()
    reader.onloadend = () => {
      const image_string = reader!.result!.toString()
      setChatState(prev => ({
        ...prev,
        image: image_string,
        file: img.name
      }))
    }
    reader.readAsDataURL(compressedFile)
  }

  const buttonClass = chatState.file !== "" ? "chat-button interactive file-present" : "chat-button interactive"

  const messagesRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    Log(LogLevel.Debug, "Refreshing chat component")
    if (id) {
      Log(LogLevel.Debug, "Loading conversation with ID ", id)
      loadConversation(id)
    }
  }, [id])


  useEffect(() => {
    scrollIntoView()
  }, [uiState.initialLoading])

  const MessageContent = () => {
    const messages = chatState.conversation
    if (uiState.initialLoading) {
      return (
        <>
          <span key={-1}className="conversation-spinner">
            <PropagateLoader 
              color="#c0c0c0"
              speedMultiplier={1.5}
            />
          </span>
        </>
      )
    }
    if (uiState.thinking) {
      return (
        <>
          {messages && messages.map((message, index) => (
            <span key={index}className={message.role == "user" ? "question" : "output"}>
              <MarkTeX content={message.content}/>
            </span>
          ))}
          {
          <span key={-1}className="thinking-spinner">
            <BeatLoader 
                color="#c0c0c0"
                speedMultiplier={0.8}
            />
            <b>Thinking </b>
          </span>
          }

        </>
      )
    }

    return (
      <>
          {messages && messages.map((message, index) => (
            <span key={index}className={message.role == "user" ? "question" : "output"}>
              <MarkTeX content={message.content}/>
            </span>
          ))}
          {uiState.aiLoading && (
            <span key={-1}className="answer-spinner">
              <BeatLoader 
                color="#c0c0c0"
                speedMultiplier={0.8}
              />
            </span>
          )}
          {chatState.aiMessage != '' && (
            <span key={-1}className="output">
              <MarkTeX content={chatState.aiMessage}/>
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
          <textarea
            onChange={(event) => {
              setChatState(prev => ({
                ...prev,
                message: event.target.value
              }))
            }}
            value={chatState.message}
            rows={4} 
            cols={50} 
            placeholder="Enter your message here..."
            className="input-block"
          />
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".png,.jpg,.jpeg,.gif"
            key={chatState.image}
            onChange={handleFileChange}
          />
          <div className="button-container">
            <button 
              className={buttonClass}
              onClick={handleFileButtonClick}
            >
              <i className="fa-solid fa-paperclip"/>
            </button>
            <button 
              className="chat-button interactive" 
              onClick={handleSendMessage}
            >
              {uiState.sendLock ? <i className="fa-solid fa-xmark"/>:<i className="fa-solid fa-arrow-up"/>}
            </button>
          </div>
        </div>
        <div className="chat-background"/>
      </div>
    </>
  )
}


export default Chat
