import { useEffect, useRef, useState } from "react";
import { Message } from "../../api/message";
import { useChatSettings } from "../../context/useChatContext";
import { DB } from "../../database/db";
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
    idParam
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

  useEffect(() => {
  }, [])

  const handleError = (err: unknown, msg: string) => {
    statusRef.current = 'ERROR'
    setChatState((prev) => ({
      ...prev,
      errorMessage: msg,
    }))
    console.error(err)
  }

  /*
  async function* generateIntro() {
    for (const word of INTRO_MESSAGE.split(" ")) {
      await new Promise(resolve => setTimeout(resolve, 30));
      if (word) {
        yield word + " "
      }
    }
  }

  async function streamIntro() {
    console.log("Stream intro called")
    statusRef.current = 'STREAMING'
    var total_intro = ''
    for await (const chunk of generateIntro()) {
      total_intro += chunk
      setChatState((prev) => ({
        ...prev,
        streamingMessage: total_intro,
      }))
    }
    setChatState((prev) => ({
      ...prev,
      streamingMessage: '',
      messages: [...prev.messages, {
        role: 'assistant',
        content: INTRO_MESSAGE,
      }]
    }))
    statusRef.current = 'IDLE'
  }
  */


  const loadConversation = async (id: number) => {
    statusRef.current = 'LOADING'
    const conversationPromise = API.getConversations(id)
      .then((conversationJson) => {

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
          messages: conversation
        }))
        })
      .catch(err => handleError(err, 'Could not fetch messages for this conversation'))


    const settingsResult = DB.getSettings(id)
      .then(settingsJson => {
        setChatState((prev) => ({
          ...prev,
        course: settingsJson.course.code as Course,
        mode: settingsJson.mode.name as Mode,
        }))
      })
      .catch(err => handleError(err, 'Could not fetch metadata for this conversation'))

    await Promise.all([conversationPromise, settingsResult])
    statusRef.current = 'IDLE'

  }


  //const ranIntro = useRef<boolean>(false)
  useEffect(() => {
    if (!idParam) {
      /*
      if (!ranIntro.current){
        ranIntro.current = true
        streamIntro()
      }
      */
      return
    }
    loadConversation(parseInt(idParam))


  }, [idParam])

  const updateMode = async (mode: Mode) => {
    if (!idParam) {
      return
    }
    await DB.updateMode(parseInt(idParam), mode)
  }

  const newConversation = async (firstMessage: string, mode: Mode, course: Course) => {
    if (idParam) {
      Log(LogLevel.Error, `Creating new conversation even with ID: ${idParam}`)
      return
    }

    const title = await API.getTitle(firstMessage)
    const new_id = await DB.addConversation(title, course, mode)
    Log(LogLevel.Info, `Created new conversation with ID: ${new_id}`)
    if (!new_id) {
      const err = new Error("Couldn't add conversation to db, id returned none")
      throw err
    }
    navigate(new_id, { replace: true })

  }

  const addNewMessages = async (id: number, newMessages: Message[]) => {
    for (const message of newMessages) {
      await DB.addMessage(id, message.role, message.content)
    }
  }

  const handleSendMessage = async () => {
    if (statusRef.current != 'IDLE') {
      return
    }

    if (!chatState.userMessage && !chatState.userImage) {
      return
    }

    statusRef.current = 'WAITING'

    const newMessages: Message[] = []
    const userMessageObj: Message = {
      role: 'user',
      content: chatState.userMessage,
    }
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessageObj],
      userMessage: '',
    }))
    newMessages.push(userMessageObj)



    const userImage = chatState.userImage
    if (userImage) {
      statusRef.current = 'TRANSCRIBING'
      const transcription = await API.readImage(userImage)
      const transcriptionMessage: Message = {
        role: 'user',
        content: `\n\n*Image Transcription:*\n\n${transcription}`,
      }
      setChatState((prev) => ({
        ...prev,
        userImage: '',
        messages: [...prev.messages, transcriptionMessage]
      }))
      newMessages.push(transcriptionMessage)
    }

    const mode = await API.getMode(chatState.mode, [...chatState.messages, ...newMessages])

    var conversationDbUpdatePromise
    if (!idParam) {
      var firstMessage = ''
      for (const message of newMessages) {
        firstMessage += message.content + "\n"
      }
      conversationDbUpdatePromise = newConversation(firstMessage, mode, chatState.course)
    } else {
      conversationDbUpdatePromise = updateMode(mode)
    }

    statusRef.current = 'THINKING'

    chatState.streamingMessage = ''
      setChatState((prev) => ({
        ...prev,
        streamingMessage: '',
      }))
    var totalMessage = ''
    var firstChunkReceived = false
    for await(const chunk of API.ask([...chatState.messages, ...newMessages], mode, chatState.course)) {
      if (!firstChunkReceived) {
        statusRef.current = 'STREAMING'
        firstChunkReceived = true
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

    const aiResponse: Message = {
      role: 'assistant',
      content: totalMessage,
    }
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, aiResponse],
      streamingMessage: '',
    }))
    newMessages.push(aiResponse)

    await conversationDbUpdatePromise

    const currentId = idParam ? parseInt(idParam) : undefined
    if (!currentId) {
      statusRef.current = 'ERROR',
      chatState.errorMessage = 'An error occurred while trying to process the response'
      console.error("ID is null while attempting to add new messages")
      return
    }
    await addNewMessages(currentId, newMessages)
    statusRef.current = 'IDLE'
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
    statusRef,
    updateUserMessage,
    updateUserImage,
  }
}

export default useConversation
