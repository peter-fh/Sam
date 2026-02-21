import './ConversationView.css'
import MarkTeX from '../MarkTeX'
import { Message, newMessage } from '../../api/message'

const INTRO_MESSAGE = "Hello! I'm Sam, an AI chatbot powered by Chat-GPT. I use context specific to Concordia to provide better explanations. AI makes mistakes, so please double check any answers you are given."
type ConversationViewProps = {
  messages: Message[]
}

const ConversationView = (props: ConversationViewProps) => {
  const messages: Message[] = [newMessage(INTRO_MESSAGE, 'assistant'), ...props.messages]
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
    </>
  )
}

export default ConversationView
