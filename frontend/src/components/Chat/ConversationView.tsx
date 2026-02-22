import './ConversationView.css'
import MarkTeX from '../MarkTeX'
import { Message, newMessage } from '../../api/message'
import { ChatStatus } from './useConversation'
import { LoadingConversationSpinner, ThinkingSpinner, WaitingSpinner } from './Spinners'

const INTRO_MESSAGE = "Hello! I'm Sam, an AI chatbot powered by Chat-GPT. I use context specific to Concordia to provide better explanations. AI makes mistakes, so please double check any answers you are given."

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
        <span key={index}className={message.role == "user" ? "question" : "output"}>
          {message.url != null ? (
            <img 
              className="message-image"
              src={message.url}/> 
          ):(
          <MarkTeX content={message.content}/>
            )}
        </span>
      ))}
      {props.status == "THINKING" && (
        <ThinkingSpinner/>
      )}
      {props.status == "WAITING" && (
        <WaitingSpinner/>
      )}
      {props.status == "STREAMING" && props.streamingMessage && (
        <span key={-1}className="output">
          <MarkTeX content={props.streamingMessage}/>
        </span>
      )}
    </>
  )
}

export default MessageContent
