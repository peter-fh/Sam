import './InputArea.css'
import { useEffect, useState } from 'react'

type InputAreaProps = {
  fileRef: React.RefObject<HTMLInputElement>,
  updateMessage: (m: string) => void,
  updateFile: (file: File) => void,
  handleSend: () => void,
  isLocked: boolean,
}

const InputArea : React.FC<InputAreaProps> = (props: InputAreaProps) => {
  const [message, setMessage] = useState<string>('')
  const [imageFilename, setImageFilename] = useState<string>('')
  const [buttonClass, setButtonClass] = useState<string>("chat-button interactive")

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const img = event.target.files?.[0];
    if (img) {
      setImageFilename(img.name)
      props.updateFile(img)
      setButtonClass("chat-button interactive file-present")
    } else {
      setButtonClass("chat-button interactive")
    }
  };
  const handleFileButtonClick = () => {
    props.fileRef!.current!.click()
  }

  const enterListener = (e: KeyboardEvent) => {
    if (e.key == "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", enterListener, false)

    return () => {
      document.removeEventListener("keydown", enterListener, false)
    }
  })

  const handleSend = async () => {
    setMessage('')
    setButtonClass("chat-button interactive")
    props.handleSend()
  }

  return (
    <>
      <textarea
        onChange={(event) => {
          props.updateMessage(event.target.value)
          setMessage(event.target.value)
        }}
        value={message}
        rows={4} 
        cols={50} 
        placeholder="Enter your message here..."
        className="input-block"
      />
      <input
        type="file"
        ref={props.fileRef}
        style={{ display: "none" }}
        accept=".png,.jpg,.jpeg,.gif"
        key={imageFilename}
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
          onClick={handleSend}
        >
          {props.isLocked ? <i className="fa-solid fa-xmark"/>:<i className="fa-solid fa-arrow-up"/>}
        </button>
      </div>
    </>
  )
}

export default InputArea
