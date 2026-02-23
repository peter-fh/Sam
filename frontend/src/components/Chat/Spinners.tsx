import './Spinners.css'
import { BeatLoader, PropagateLoader, } from "react-spinners"

export const LoadingConversationSpinner = () => {
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

export const WaitingSpinner = () => {
  return (
    <>
      <span key={-1}className="answer-spinner">
        <BeatLoader 
          color="#c0c0c0"
          speedMultiplier={0.8}
        />
      </span>
    </>
  )
}

export const ThinkingSpinner = () => {
  return (
    <>
      <span key={-1}className="thinking-spinner">
        <BeatLoader 
          color="#c0c0c0"
          speedMultiplier={0.8}
        />
        <b>Thinking </b>
      </span>
    </>
  )
}
