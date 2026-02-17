import './ConversationView.css'
import MarkTeX from '../MarkTeX'
import { Message } from '../../api/message'

const INTRO_MESSAGE = "Hello! I'm Sam, an AI chatbot powered by Chat-GPT. I use context specific to Concordia to provide better explanations. AI makes mistakes, so please double check any answers you are given."
type ConversationViewProps = {
  messages: Message[]
}

const ConversationView = (props: ConversationViewProps) => {
  const messages: Message[] = [{
    role: 'assistant',
    content: INTRO_MESSAGE,
  }, ...props.messages]
  return (
    <>
      {messages?.map((message, index) => (
        <span key={index}className={message.role == "user" ? "question" : "output"}>
          <MarkTeX content={message.content}/>
        </span>
      ))}
    </>
  )
}

export default ConversationView
