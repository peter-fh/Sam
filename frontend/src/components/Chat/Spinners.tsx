import './Spinners.css'
import { BeatLoader, PropagateLoader } from "react-spinners"

export const LoadingConversationSpinner = () => {
  return (
    <div key={-1} className="flex flex-col items-center justify-center p-8 gap-4">
      <PropagateLoader 
        color="#6366f1"
        speedMultiplier={1.2}
        size={12}
      />
      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide animate-pulse">
        Loading conversation history...
      </span>
    </div>
  )
}

export const WaitingSpinner = () => {
  return (
    <div key={-1} className="flex items-center gap-2 py-1 px-2 text-indigo-500 dark:text-indigo-400">
      <BeatLoader 
        color="#6366f1"
        speedMultiplier={0.8}
        size={8}
      />
    </div>
  )
}

export const ThinkingSpinner = () => {
  return (
    <div key={-1} className="flex items-center gap-3 py-1 px-2 text-indigo-500 dark:text-indigo-400">
      <BeatLoader 
        color="#6366f1"
        speedMultiplier={0.8}
        size={8}
      />
      <span className="text-xs font-semibold tracking-wide text-indigo-600 dark:text-indigo-300">
        Thinking...
      </span>
    </div>
  )
}
