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
        className="message-image max-w-sm max-h-80 rounded-xl border border-slate-700 shadow-md object-contain my-2"
        src={props.message.url}
        alt="User attachment"
      /> 
    )
  }

  if (props.message.role === 'error') {
    return (
      <div className="flex items-center gap-3 py-1">
        <i className="fa-solid fa-triangle-exclamation text-rose-400 text-lg shrink-0"></i>
        <p className="error-message-content text-rose-200 text-sm m-0">An error occurred while trying to fetch the message, please try again.</p>
      </div>
    )
  }

  return (
    <div className="prose prose-invert max-w-none text-sm sm:text-base leading-relaxed">
      <MarkTeX content={props.message.content}/>
    </div>
  )
}

type MessageContentProps = {
  streamingMessage: string | undefined,
  messages: Message[],
  status: ChatStatus,
}

const MessageContent = (props: MessageContentProps) => {
  const messages: Message[] = [newMessage(INTRO_MESSAGE, 'assistant'), ...props.messages]
  if (props.status === "LOADING") {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingConversationSpinner/>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4 w-full">
      {messages?.map((message, index) => {
        const isUser = message.role === 'user';
        const isAssistant = message.role === 'assistant';

        return (
          <div key={index} className={`flex items-start gap-3 w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0 mt-1">
                S
              </div>
            )}
            
            <span 
              className={`assistant ${message.role} block transition-all ${
                isUser 
                  ? 'max-w-[85%] sm:max-w-[75%] bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl rounded-tr-xs px-5 py-3.5 shadow-md' 
                  : isAssistant 
                  ? 'flex-1 max-w-[90%] bg-slate-900/90 border border-slate-800 text-slate-100 rounded-2xl rounded-tl-xs px-5 py-4 shadow-sm backdrop-blur-md'
                  : 'w-full bg-rose-500/10 border border-rose-500/20 text-rose-200 rounded-2xl px-5 py-3.5'
              }`}
              data-testid={`message-${index}`}
            >
              <MessageView message={message}/>
            </span>
          </div>
        )
      })}

      {props.status === "THINKING" && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0">
            S
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-xs px-4 py-3 text-slate-400 text-xs">
            <ThinkingSpinner/>
          </div>
        </div>
      )}

      {props.status === "WAITING" && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0">
            S
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-xs px-4 py-3 text-slate-400 text-xs">
            <WaitingSpinner/>
          </div>
        </div>
      )}

      {props.status === "STREAMING" && props.streamingMessage && (
        <div className="flex items-start gap-3 w-full">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0 mt-1">
            S
          </div>
          <span 
            key={-1}
            className="assistant block flex-1 max-w-[90%] bg-slate-900/90 border border-slate-800 text-slate-100 rounded-2xl rounded-tl-xs px-5 py-4 shadow-sm backdrop-blur-md" 
            data-testid="streaming-message"
          >
            <div className="prose prose-invert max-w-none text-sm sm:text-base leading-relaxed">
              <MarkTeX content={props.streamingMessage}/>
            </div>
          </span>
        </div>
      )}
    </div>
  )
}

export default MessageContent
