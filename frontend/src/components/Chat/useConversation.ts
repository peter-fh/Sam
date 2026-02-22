import { useEffect, useState } from "react";
import { Message, newMessage } from "../../api/message";
import { useChatSettings } from "../../context/useChatContext";
import { Course } from "../../types/options";
import { API } from "../../api/api";
import { Log, LogLevel } from "../../log";
import { useNavigate, useParams } from "react-router-dom";
import { ImageInfo } from "./useFileReader";


export type ChatStatus = 'IDLE'          // Waiting for user input
                | 'LOADING'       // Initial loading of conversation
                | 'STREAMING'     // Message from the assistant is currently streaming
                | 'WAITING'       // Message from user is being sent to the API
                | 'THINKING'      // Assistant has recieved the user message and is reasoning
                | 'TRANSCRIBING'  // A transcription for the user's image is being processed
                | 'ERROR'         // An error has occurred. The chat will not leave this mode until refreshed

const START_SYMBOL = "__START__"
const ERROR_SYMBOL = "__ERROR__"
const END_SYMBOL = "__END__"

interface ChatState {
  userMessage: string,
  userImage: ImageInfo | null,

  streamingMessage?: string,
  errorMessage?: string,

  messages: Message[],
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
    userImage: null,
    messages: [],
    course: course,
  })

  const [status, setStatus] = useState<ChatStatus>('IDLE')
  const [loadedId, setLoadedId] = useState<number | null>(null)

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
          const message: Message = newMessage(raw_message.content!, raw_message.role as "user" | "assistant")
          conversation.push(message)
        }
        setChatState((prev) => ({
          ...prev,
          messages: conversation,
          course: course,
        }))
        })
      .catch(err => handleError(err, 'Could not fetch messages for this conversation'))


    setLoadedId(id)
    await conversationPromise
    setStatus('IDLE')
  }


  useEffect(() => {
    if (id == null) {
      return
    }
    if (loadedId == parseInt(id)) {
      return
    }
    loadConversation(parseInt(id))


  }, [id])

  const newConversation = async (course: Course) => {

    if (id) {
      const err = new Error(`Creating new conversation where ID already exists: ${id}`)
      throw err
    }

    const id_response = await API.addConversation(course)
    const new_id = id_response["id"]
    Log(LogLevel.Info, `Created new conversation with ID: ${new_id}`)
    if (!new_id) {
      const err = new Error("Couldn't add conversation to db, id returned none")
      throw err
    }
    setLoadedId(new_id)
    return parseInt(new_id)

  }

  const handleSendMessage = async () => {
    if (status != 'IDLE') {
      return
    }
    console.log("Message in sendMessage: ", chatState.userMessage)

    if (!chatState.userMessage && !chatState.userImage) {
      return
    }

    var local_id: number
    if (id == null || !parseInt(id) || !(parseInt(id) > 0)) {
      try {
        local_id = await newConversation(chatState.course)
      } catch(e) {
        handleError(e, "Failed do add new conversation")
        return
      }
    } else {
      local_id = parseInt(id)
    }

    const userQuestion = chatState.userMessage
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage(userQuestion, 'user')],
      userMessage: '',
    }))

    setStatus('WAITING')

      setChatState((prev) => ({
        ...prev,
        streamingMessage: '',
      }))

    if (local_id == null) {
      const err = new Error("ID is null when asking question")
      handleError(err, 'An error occurred while trying to get a response')
      return
    }
    var image = null
    if (chatState.userImage != null) {
      image = chatState.userImage.data
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage('', 'user', chatState.userImage!.url)],
        userImage: null,
      }))
    }

    const answerGenerator = API.ask(local_id, userQuestion, image)
    const startingSymbol = await answerGenerator.next()
    if (startingSymbol.value != START_SYMBOL) {
      const err = new Error("First symbol was not the start symbol: " + startingSymbol.value)
      handleError(err, 'An error occurred while trying to get a response')
      return
    }

    var totalMessage = ''
    var firstChunkReceived = false
    for await(const chunk of answerGenerator) {
      if (!firstChunkReceived) {
        console.log("received first chunk")
        setStatus('STREAMING')
        firstChunkReceived = true
      } 
      if (chunk == END_SYMBOL) {
        break
      }
      if (chunk == ERROR_SYMBOL) {
        const err = new Error("Error symbol encountered during generation")
        handleError(err, 'An error occurred while trying to get a response')
      }

      totalMessage += chunk
      setChatState((prev) => ({
        ...prev,
        streamingMessage: totalMessage
      }))

    }

    if (!totalMessage) {
      const err = new Error("AI message request returned zero tokens")
      handleError(err, 'An error occurred while trying to get a response')
      return
    }

    const aiResponse: Message = newMessage(totalMessage, 'assistant')
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, aiResponse],
      streamingMessage: '',
    }))
    if (id == null) {
        navigate(String(local_id), { replace: true })
    }
    setStatus('IDLE')
  }

  const updateUserMessage = (msg: string) => {
    setChatState((prev) => ({
      ...prev,
      userMessage: msg,
    }))
  }
  const updateUserImage = (imageData: ImageInfo) => {
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
