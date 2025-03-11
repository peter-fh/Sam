import { useEffect, useRef } from 'react'
import './Chat.css'
import MarkTeX from '../MarkTeX'
import imageCompression from 'browser-image-compression'
import html2canvas from 'html2canvas'
import useConversation from './useConversation'
import { useChatSettings } from '../../context/useChatContext'

function Chat() {

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
  } = useConversation();

  const {
    sidebar,
    chatLoaded,
    save,
    setSave,
  } = useChatSettings();


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
    if (chatLoaded){
      intro()
    } else {
    }
  }, [chatLoaded])

  useEffect(() => {
    if (toSummarize) {
      summarize()
    }
  }, [conversation])




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
    console.log(`Transcribing ${compressedFile.size / 1024 / 1024}MB file`);
    const reader = new FileReader()
    reader.onloadend = () => {
      setImage(reader!.result!.toString())
    }
    reader.readAsDataURL(compressedFile)
  }

  const buttonClass = file !== "" ? "button interactive file-present" : "button interactive"

  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (save) {
      saveAsPdf()
    }
  }, [save])

  const saveAsPdf = async () => {
    if (messagesRef.current) {
      const canvas = await html2canvas(messagesRef.current);
      setSave(false)
      const imgData = canvas.toDataURL('image/png');

      // Create a link element to download the image
      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'AI Math Tutor Conversation.png'; // File name for the downloaded image
      link.click();
    }
  }

  return (
    <>
      <div className="chat" onDrop={handleDrop} style={{
        marginLeft: sidebar ? '15em' : 0
      }}>
        <div className="messages" ref={messagesRef}>
          {messages && messages.map((message, index) => (
            <span key={index}className={message.sender == "user" ? "question" : "output"}>
              <MarkTeX content={message.content} isSaved={save}/>
            </span>
          ))}
          {aiMessage != '' && (
            <span key={-1}className="output">
              <MarkTeX content={aiMessage} isSaved={save}/>
            </span>
          )}
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
              className="button interactive" 
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
