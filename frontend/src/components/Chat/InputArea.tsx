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
    <div className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xl backdrop-blur-xl transition-all focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20">
      {/* File attachment preview badge if present */}
      {imageFilename && (
        <div className="mb-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300 w-fit gap-2">
          <div className="flex items-center gap-1.5 truncate max-w-xs">
            <i className="fa-solid fa-image text-indigo-600 dark:text-indigo-400"></i>
            <span className="truncate font-medium">{imageFilename}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setImageFilename('')}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 cursor-pointer ml-2"
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
        className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base border-0 outline-none resize-none focus:outline-none focus:ring-0 p-1"
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

      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/60 mt-1">
        <div className="flex items-center gap-2">
          <button 
            className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center text-sm ${
              imageFilename 
                ? "bg-indigo-100 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent"
            } ${buttonClass}`}
            onClick={handleFileButtonClick}
            title="Attach file or image"
            type="button"
          >
            <i className="fa-solid fa-paperclip text-base"/>
          </button>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline-block">
            Shift + Enter for new line
          </span>
        </div>

        <button 
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center text-sm font-semibold shadow-md active:scale-95 ${
            props.isLocked 
              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed" 
              : message.trim() || imageFilename
              ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/20"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/80"
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
              <i className="fa-solid fa-arrow-up text-sm"/>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

export default InputArea
