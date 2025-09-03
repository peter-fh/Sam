import { useEffect, useRef } from 'react'
import './Chat.css'
import MarkTeX from '../MarkTeX'
import imageCompression from 'browser-image-compression'
import useConversation from './useConversation'
import { useChatSettings } from '../../context/useChatContext'
import { Log, LogLevel } from '../../log'
import { BeatLoader } from "react-spinners"
import { useThreadSelectionContext } from '../../context/useThreadContext'


interface ChatProps {
  id: number | null
}

const Chat: React.FC<ChatProps> = ({id}) => {

  const {
    handleSendMessage,
    toSummarize,
    summarize,
    conversation,
    setFile,
    setImage,
    intro,
    file,
    aiMessage,
    setMessage,
    message,
    image,
    lock,
    messages,
    loadConversation,
    loadingConversation,
    loading,
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

  useEffect(() => {
    if (toSummarize) {
      Log(LogLevel.Debug, "useEffect on toSummarize")
      summarize()
    }
  }, [conversation])


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
    setFile(img.name)
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 2048,
      useWebWorker: true,
    }

    const compressedFile = await imageCompression(img, options);
    Log(LogLevel.Always, `Transcribing ${compressedFile.size / 1024 / 1024}MB file`);
    const reader = new FileReader()
    reader.onloadend = () => {
      setImage(reader!.result!.toString())
    }
    reader.readAsDataURL(compressedFile)
  }

  const buttonClass = file !== "" ? "chat-button interactive file-present" : "chat-button interactive"

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
  }, [loadingConversation])

  return (
    <>
      <div className="chat" onDrop={handleDrop} style={{
        marginLeft: sidebar ? '15em' : 0
      }}>
        <div className="messages" ref={messagesRef}>
          {messages && messages.map((message, index) => (
            <span key={index}className={message.role == "user" ? "question" : "output"}>
              <MarkTeX content={message.content}/>
            </span>
          ))}
          {loading && (
            <span key={-1}className="spinner">
              <BeatLoader 
                color="#c0c0c0"
                speedMultiplier={0.8}
              />
            </span>
          )}
          {aiMessage != '' && (
            <span key={-1}className="output">
              <MarkTeX content={aiMessage}/>
            </span>
          )}
          <div ref={bottomMarkerRef} style={{ height: 0, margin: 0, padding: 0, border: 'none', lineHeight: 0 }} />
        </div>

        <div className="input">
          <textarea
            onChange={(event) => {
              setMessage(event.target.value);
            }}
            value={message}
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
            key={image}
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
              {lock ? <i className="fa-solid fa-xmark"/>:<i className="fa-solid fa-arrow-up"/>}
            </button>
          </div>
        </div>
        <div className="chat-background"/>
      </div>
    </>
  )
}


export default Chat
