import './ConversationView.css'
import MarkTeX from '../MarkTeX'
import { Message, newMessage } from '../../api/message'
import { ChatStatus } from './useConversation'
import { LoadingConversationSpinner, ThinkingSpinner, WaitingSpinner } from './Spinners'

const INTRO_MESSAGE = "Hello! I'm Sam, an AI chatbot powered by Chat-GPT. I use context specific to Concordia to provide better explanations. AI makes mistakes, so please double check any answers you are given."

type MessageProps = {
  message: Message,
}

const MessageView = (props: MessageProps) => {
 if (props.message.url != null) {
    return (
      <img 
        className="message-image"
        src={props.message.url}/> 
    )
  }

  if (props.message.role == 'error') {
    return (
      <>
        <i 
          className="fa-solid fa-triangle-exclamation" 
          style={{
            color: "rgb(255, 59, 59)"
          }}>
        </i>
        <p className="error-message-content">An error occurred while trying to fetch the message, please try again.</p>
      </>
    )
  }

  return (
  <>
      <MarkTeX content={props.message.content}/>
  </>
  )
}
type MessageContentProps = {
  streamingMessage: string | undefined,
  messages: Message[],
  status: ChatStatus,
}
const MessageContent = (props: MessageContentProps) => {
  const messages: Message[] = [newMessage(INTRO_MESSAGE, 'assistant'), ...props.messages]
  if (props.status == "LOADING") {

    return (
      <>
        <LoadingConversationSpinner/>
      </>
    )
  }
  return (
    <>
      {messages?.map((message, index) => (
        <span key={index}className={message.role}>
          <MessageView message={message}/>
        </span>
      ))}
      {props.status == "THINKING" && (
        <ThinkingSpinner/>
      )}
      {props.status == "WAITING" && (
        <WaitingSpinner/>
      )}
      {props.status == "STREAMING" && props.streamingMessage && (
        <span key={-1}className="assistant">
          <MarkTeX content={props.streamingMessage}/>
        </span>
      )}
    </>
  )
}

export default MessageContent
