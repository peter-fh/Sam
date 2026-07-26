import './Spinners.css'
import { BeatLoader, PropagateLoader } from "react-spinners"

export const LoadingConversationSpinner = () => {
  return (
    <div key={-1} className="flex flex-col items-center justify-center p-8 gap-4">
      <PropagateLoader 
        color="#a1a1aa"
        speedMultiplier={1.2}
        size={12}
      />
      <span className="text-xs text-zinc-400 font-medium tracking-wide animate-pulse">
        Loading conversation history...
      </span>
    </div>
  )
}

export const WaitingSpinner = () => {
  return (
    <div key={-1} className="flex items-center gap-2 py-1 px-2 text-zinc-400">
      <BeatLoader 
        color="#a1a1aa"
        speedMultiplier={0.8}
        size={8}
      />
    </div>
  )
}

export const ThinkingSpinner = () => {
  return (
    <div key={-1} className="flex items-center gap-3 py-1 px-2 text-zinc-400">
      <BeatLoader 
        color="#a1a1aa"
        speedMultiplier={0.8}
        size={8}
      />
      <span className="text-xs font-semibold tracking-wide text-zinc-300">
        Thinking...
      </span>
    </div>
  )
}
