import { useEffect, useRef, useState } from "react";
import { Message } from "../../api/message";
import { useChatSettings } from "../../context/useChatContext";
import { Course, Mode } from "../../types/options";
import { API } from "../../api/api";
import { Log, LogLevel } from "../../log";
import { useNavigate, useParams } from "react-router-dom";


type ChatStatus = 'IDLE'          // Waiting for user input
                | 'LOADING'       // Initial loading of conversation
                | 'STREAMING'     // Message from the assistant is currently streaming
                | 'WAITING'       // Message from user is being sent to the API
                | 'THINKING'      // Assistant has recieved the user message and is reasoning
                | 'TRANSCRIBING'  // A transcription for the user's image is being processed
                | 'ERROR'         // An error has occurred. The chat will not leave this mode until refreshed


interface ChatState {
  userMessage: string,
  userImage: string,

  streamingMessage?: string,
  errorMessage?: string,

  messages: Message[],
  mode: Mode,
  course: Course,
}

const useConversation = () => {

  const {
    id
  } = useParams()

  const navigate = useNavigate()
  const {
    course
  } = useChatSettings()

  const [chatState, setChatState] = useState<ChatState>({
    userMessage: '',
    userImage: '',
    messages: [],
    mode: Mode.DEFAULT,
    course: course,
  })

  const statusRef = useRef<ChatStatus>('IDLE')
  const [status, setStatus] = useState<ChatStatus>('IDLE')

  const handleError = (err: unknown, msg: string) => {
    setStatus('ERROR')
    setChatState((prev) => ({
      ...prev,
      errorMessage: msg,
    }))
    console.error(err)
  }

  const loadConversation = async (id: number) => {
    setStatus('LOADING')
    const conversationPromise = API.getConversation(id)
      .then((resultJson) => {
        const course = resultJson['course']
        const conversationJson = resultJson['messages']
        const conversation: Message[] = []
        for (const raw_message of conversationJson) {
          const message: Message = {
            role: raw_message.role as "user" | "assistant",
            content: raw_message.content!,
          }
          conversation.push(message)
        }
        setChatState((prev) => ({
          ...prev,
          messages: conversation,
          course: course,
        }))
        })
      .catch(err => handleError(err, 'Could not fetch messages for this conversation'))


    await conversationPromise
    setStatus('IDLE')
  }


  useEffect(() => {
    if (id == null) {
      return
    }
    if (chatState.messages.length > 0) {
      return
    }
    loadConversation(parseInt(id))


  }, [id])

  const newConversation = async (course: Course) => {

    if (id) {
      Log(LogLevel.Error, `Creating new conversation even with ID: ${id}`)
      return
    }

    const id_response = await API.addConversation(course)
    const new_id = id_response["id"]
    Log(LogLevel.Info, `Created new conversation with ID: ${new_id}`)
    if (!new_id) {
      const err = new Error("Couldn't add conversation to db, id returned none")
      throw err
    }
    return new_id

  }

  const handleSendMessage = async () => {
    if (statusRef.current != 'IDLE') {
      return
    }

    if (!chatState.userMessage && !chatState.userImage) {
      return
    }

    var temp_id: string
    if (id == null) {
      try {
        temp_id = await newConversation(chatState.course)
      } catch(e) {
        handleError(e, "Failed do add new conversation")
        return
      }
    } else {
      temp_id = id
    }

    const userQuestion = chatState.userMessage
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, {
        role: 'user',
        content: userQuestion,
      }],
      userMessage: '',
    }))

    setStatus('WAITING')

    chatState.streamingMessage = ''
      setChatState((prev) => ({
        ...prev,
        streamingMessage: '',
      }))

    if (temp_id == null) {
      const err = new Error("ID is null when asking question")
      handleError(err, 'An error occurred while trying to get a response')
      return
    }

    var totalMessage = ''
    var firstChunkReceived = false
    var startSymbolRecieved = false
    for await(const chunk of API.ask(parseInt(temp_id), userQuestion)) {
      if (!startSymbolRecieved) {
        setStatus('THINKING')
        startSymbolRecieved = true
      } else {
        if (!firstChunkReceived) {
          setStatus('STREAMING')
          firstChunkReceived = true
        } 

        totalMessage += chunk
        setChatState((prev) => ({
          ...prev,
          streamingMessage: totalMessage
        }))
      }

    }

    if (!totalMessage) {
      const err = new Error("AI message request returned zero tokens")
      handleError(err, 'An error occurred while trying to get a response')
      return
    }

    const aiResponse: Message = {
      role: 'assistant',
      content: totalMessage,
    }
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, aiResponse],
      streamingMessage: '',
    }))
    if (id == null) {
        navigate(String(temp_id!), { replace: true })
    }
    setStatus('IDLE')
  }

  const updateUserMessage = (msg: string) => {
    setChatState((prev) => ({
      ...prev,
      userMessage: msg,
    }))
  }
  const updateUserImage = (imageData: string) => {
    setChatState((prev) => ({
      ...prev,
      userImage: imageData,
    }))
  }

  return {
    handleSendMessage,
    chatState,
    status,
    updateUserMessage,
    updateUserImage,
  }
}

export default useConversation
