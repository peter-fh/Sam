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
    if (e.key === "Enter" && !e.shiftKey) {
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
    setImageFilename('')
    setButtonClass("chat-button interactive")
    props.handleSend()
  }

  return (
    <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 shadow-2xl backdrop-blur-xl transition-all focus-within:border-zinc-700 focus-within:ring-2 focus-within:ring-zinc-700/30">
      {/* File attachment preview badge if present */}
      {imageFilename && (
        <div className="mb-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700/80 rounded-xl flex items-center justify-between text-xs text-zinc-300 w-fit gap-2">
          <div className="flex items-center gap-1.5 truncate max-w-xs">
            <i className="fa-solid fa-image text-emerald-400"></i>
            <span className="truncate font-medium">{imageFilename}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setImageFilename('')}
            className="text-zinc-400 hover:text-zinc-200 cursor-pointer ml-2"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      <textarea
        onChange={(event) => {
          props.updateMessage(event.target.value)
          setMessage(event.target.value)
        }}
        value={message}
        rows={2} 
        placeholder="Enter your message here..."
        className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-sm sm:text-base border-0 outline-none resize-none focus:outline-none focus:ring-0 p-1"
        data-testid="chat-input"
      />

      <input
        type="file"
        ref={props.fileRef}
        style={{ display: "none" }}
        accept=".png,.jpg,.jpeg,.gif"
        key={imageFilename}
        onChange={handleFileChange}
      />

      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 mt-1">
        <div className="flex items-center gap-2">
          <button 
            className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center text-sm ${
              imageFilename 
                ? "bg-zinc-800 text-zinc-200 border border-zinc-700" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-transparent"
            } ${buttonClass}`}
            onClick={handleFileButtonClick}
            title="Attach file or image"
            type="button"
          >
            <i className="fa-solid fa-paperclip text-base"/>
          </button>
          <span className="text-[11px] text-zinc-500 hidden sm:inline-block">
            Shift + Enter for new line
          </span>
        </div>

        <button 
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center text-sm font-semibold shadow-sm active:scale-95 ${
            props.isLocked 
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
              : message.trim() || imageFilename
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/80"
              : "bg-zinc-800/70 text-zinc-400 hover:bg-zinc-800 border border-transparent"
          }`} 
          onClick={handleSend}
          title={props.isLocked ? "Busy" : "Send message"}
          type="button"
        >
          {props.isLocked ? (
            <i className="fa-solid fa-xmark text-base"/>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline text-xs font-semibold">Send</span>
              <i className="fa-solid fa-arrow-up text-sm text-emerald-400"/>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

export default InputArea
