import { useEffect, useRef, useState } from "react";
import { Message } from "../../api/message";
import { useChatSettings } from "../../context/useChatContext";
import { DB } from "../../database/db";
import { Course, Mode } from "../../types/options";
import { API } from "../../api/api";


const TOKEN_THRESHOLD = 0
const INTRO_MESSAGE = "Hello! I'm Sam, an AI chatbot powered by Chat-GPT. I use context specific to Concordia to provide better explanations. AI makes mistakes, so please double check any answers you are given."

interface ConversationProps {
  id?: number
}
type ChatStatus = 'IDLE' | 'LOADING' | 'STREAMING' | 'WAITING' | 'THINKING' | 'ERROR'


interface Conversation {
  messages: Message[],
  mode: Mode,
  course: Course,
}

interface ChatState {
  streamingMessage?: string,
  userMessage: string,
  userImage: string,
  conversation: Conversation,
  status: ChatStatus,
  errorMessage?: string,
}



const useConversation = (props: ConversationProps) => {

  const {
    course
  } = useChatSettings()

  const stateRef = useRef<ChatState>({
    status: 'LOADING',
    userMessage: '',
    userImage: '',
    conversation: {
      messages: [],
      mode: Mode.DEFAULT,
      course: course,
    }
  })

  const [tempId, setTempId] = useState<number | null>(null)

  const loadConversation = async (id: number) => {
    const conversationPromise = DB.getConversation(id)
      .then((conversationJson) => {

        const conversation: Message[] = []
        for (const raw_message of conversationJson) {
          const message: Message = {
            role: raw_message.role as "user" | "assistant",
            content: raw_message.content!,
          }
          conversation.push(message)
        }
        stateRef.current.conversation.messages = conversation
      })
      .catch(err => {
        stateRef.current.status = 'ERROR'
        stateRef.current.errorMessage = 'Could not fetch messages for this conversation'
        console.error(err) })

    const settingsResult = DB.getSettings(id)
      .then(settingsJson => {
        stateRef.current.conversation.course = settingsJson.course.code as Course
        stateRef.current.conversation.mode = settingsJson.mode.name as Mode
      })
      .catch(err => {
        stateRef.current.status = 'ERROR'
        stateRef.current.errorMessage = 'Could not fetch metadata for this conversation'
        console.error(err) })

    await Promise.all([conversationPromise, settingsResult])
    stateRef.current.status = 'IDLE'

  }


  useEffect(() => {
    stateRef.current.status = 'LOADING'
    if (!props.id) {
      return
    }
    loadConversation(props.id)


  }, [])

  const updateMode = async (mode: Mode) => {
    if (!props.id) {
      return
    }
    await DB.updateMode(props.id, mode)
  }

  const newConversation = async (firstMessage: string, mode: Mode, course: Course) => {
    if (props.id) {
      return
    }

    const title = await API.getTitle(firstMessage)
    const id = await DB.addConversation(title, course, mode)
    if (!id) {
      stateRef.current.status = 'ERROR'
      stateRef.current.errorMessage = "Couldn't add conversation to the database"
      console.error("Couldn't add conversation to db, id returned none")
    }
    setTempId(id)

  }

  const addNewMessages = async (id: number, newMessages: Message[]) => {
    for (const message of newMessages) {
      await DB.addMessage(id, message.role, message.content)
    }
  }

  const handleSendMessage = async () => {
    if (stateRef.current.status != 'IDLE') {
      return
    }

    if (!stateRef.current.userMessage && !stateRef.current.userImage) {
    }

    stateRef.current.status = 'WAITING'

    const newMessages: Message[] = []
    const userMessage = stateRef.current.userMessage
    stateRef.current.userMessage = ''
    const userMessageObj: Message = {
      role: 'user',
      content: userMessage,
    }
    stateRef.current.conversation.messages = [...stateRef.current.conversation.messages, userMessageObj]
    newMessages.push(userMessageObj)


    const userImage = stateRef.current.userImage
    stateRef.current.userImage = ''

    if (userImage) {
      stateRef.current.conversation.messages = [...stateRef.current.conversation.messages, {
        role: 'user',
        content: `\n\n*[transcribing ${userImage}...]*`,
      }]
      const transcription = await API.readImage(userImage)
      const transcriptionMessage: Message = {
        role: 'user',
        content: `\n\n*Image Transcription:*\n\n${transcription}`,
      }
      stateRef.current.conversation.messages = [...stateRef.current.conversation.messages.slice(0, -1), transcriptionMessage]
      newMessages.push(transcriptionMessage)
    }

    const mode = await API.getMode(stateRef.current.conversation.mode, stateRef.current.conversation.messages)
    var conversationDbUpdatePromise
    if (props.id) {
      var firstMessage = ''
      for (const message of newMessages) {
        firstMessage += message + "\n"
      }
      conversationDbUpdatePromise = newConversation(firstMessage, mode, stateRef.current.conversation.course)
    } else {
      conversationDbUpdatePromise = updateMode(mode)
    }

    stateRef.current.status = 'THINKING'

    stateRef.current.streamingMessage = ''
    var firstChunkReceived = false
    for await(const chunk of API.ask(stateRef.current.conversation.messages, mode, stateRef.current.conversation.course)) {
      if (!firstChunkReceived) {
        stateRef.current.status = 'STREAMING'
        firstChunkReceived = true
      }

      stateRef.current.streamingMessage += chunk
    }

    if (!stateRef.current.streamingMessage || stateRef.current.streamingMessage == '') {
      stateRef.current.status = 'ERROR',
      stateRef.current.errorMessage = 'An error occurred while trying to get a response'
      console.error("AI message request returned zero tokens")
      return
    }

    const aiResponse: Message = {
      role: 'assistant',
      content: stateRef.current.streamingMessage,
    }
    stateRef.current.conversation.messages = [...stateRef.current.conversation.messages, aiResponse]
    newMessages.push(aiResponse)

    await conversationDbUpdatePromise

    const currentId = props.id ? props.id : tempId
    if (!currentId) {
      stateRef.current.status = 'ERROR',
      stateRef.current.errorMessage = 'An error occurred while trying to process the response'
      console.error("ID is null while attempting to add new messages")
      return
    }
    await addNewMessages(currentId, newMessages)
    stateRef.current.status = 'IDLE'
  }

  return {
    handleSendMessage,
    stateRef,
  }
}

export default useConversation
