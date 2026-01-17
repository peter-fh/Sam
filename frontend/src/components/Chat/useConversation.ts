import { useState } from "react";
import { getMessageContent, Message } from "../../api/message";
import { useChatSettings } from "../../context/useChatContext";
import { DB } from "../../database/db";
import { useThreadSelectionContext } from "../../context/useThreadContext";
import { Log, LogLevel } from "../../log";
import { Course, QuestionType } from "../../types/options";
import { API } from "../../api/api";


const TOKEN_THRESHOLD = 0
const INTRO_MESSAGE = "Hello! I'm Sam, an AI chatbot powered by Chat-GPT. I use context specific to Concordia to provide better explanations. AI makes mistakes, so please double check any answers you are given."

const estimateTokens = (characterCount: number) => {
  return Math.ceil(characterCount * 0.25)
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface ChatState {
  message: string,
  file: string,
  image: string,

  aiMessage: string,

  conversation: Message[],
  summary: string,
  id: number | null,
}

interface UIState {
  sendLock: boolean,
  initialLoading: boolean,
  aiLoading: boolean,
  thinking: boolean,
}


const useConversation = () => {

  const {
    question, setQuestion,
    course, setCourse,
  } = useChatSettings()

  const {
    setSelectedThread
  } = useThreadSelectionContext()

  const [chatState, setChatState] = useState<ChatState>({
    message: '',
    file: '',
    image: '',
    aiMessage: '',
    conversation: [],
    summary: '',
    id: null,
  })

  const [uiState, setUIState] = useState<UIState>({
    sendLock: false,
    initialLoading: false,
    aiLoading: false,
    thinking: false,
  })

  const lock = () => {
    setUIState(prev => ({
      ...prev,
      sendLock: true,
    }))
  }

  const unlock = () => {
    setUIState(prev => ({
      ...prev,
      sendLock: false,
    }))
  }


  async function loadConversation(id: number) {
    setUIState(prev => ({
      ...prev, 
      sendLock: true, 
      initialLoading: true
    }))

    const summaryResult = await DB.getSummary(id)

    const messagesResult = await DB.getConversation(id)
    if (messagesResult == null) {
      return
    }

    const settingsResult = await DB.getSettings(id)
    if (settingsResult && settingsResult.course && settingsResult.mode) {
      setCourse(settingsResult.course.code as Course)
      setQuestion(settingsResult.mode.name as QuestionType)
    }

    const conversation: Message[] = []

    const intro_message: Message = {
      role: "assistant",
      content: INTRO_MESSAGE,
    }

    conversation.push(intro_message)

    for (const raw_message of messagesResult) {
      const message: Message = {
        role: raw_message.role as "user" | "assistant",
        content: raw_message.content!,
      }
      conversation.push(message)
    }

    var summary = ''
    if (summaryResult && summaryResult.summary) {
      summary = summaryResult.summary
    }



    setChatState(prev => ({
      ...prev,
      summary: summary,
      conversation: conversation,
      id: id,
    }))

    setUIState(prev => ({
      ...prev,
      initialLoading: false,
      sendLock: false,
    }))
  }


  async function intro() {
    setUIState(prev => ({
      ...prev,
      sendLock: false,
    }))
    var answer = ""
    for (const word of INTRO_MESSAGE.split(" ")) {
      await sleep(30)
      answer += word + " "
      setChatState(prev => ({
        ...prev,
        aiMessage: answer,
      }))
    }

    const introductionMessage: Message = {
      role: "assistant",
      content: answer,
    }

    setChatState(prev => ({
      ...prev,
      aiMessage: '',
      conversation: [introductionMessage],
    }))

    setUIState(prev => ({
      ...prev,
      sendLock: false,
    }))
  }


  const imageTranscription = async (filename: string) => {
    let transcription = ""

    transcription = `\n\n*[transcribing ${filename}...]*`
    appendMessage(transcription, 'user')
    setChatState(prev => ({
      ...prev,
      message: "",
    }))

    var final_message = chatState.message

    transcription = await API.readImage(chatState.image)
    transcription = `\n\n*Image Transcription:*\n\n${transcription}` 
    appendMessage(transcription, 'user')
    final_message += "The following is a transcription of an image sent by the user:\n\n" + transcription
    return final_message

  }

  function appendMessage(new_message: string, role: 'user' | 'assistant') {
    const display_message : Message = {
      role: role,
      content: new_message,
    }
    setChatState(prev => ({
      ...prev,
      conversation: [...prev.conversation, display_message]
    }))
  }
  const handleSendMessage = async () => {
    if (uiState.sendLock) {
      return
    }

    if (!chatState.message && !chatState.image) {
      setChatState(prev => ({
        ...prev,
        message: '',
      }))
      return
    }

    setUIState(prev => ({
      ...prev,
      sendLock: true,
      aiLoading: true,
    }))

    const user_question = chatState.message
    const filename = chatState.file

    setChatState(prev => ({
      ...prev,
      file: '',
      message: '',
    }))

    const initial_conversation = [...chatState.conversation]

    try {
      appendMessage(user_question, 'user')
      let final_question = ''
      if (chatState.image) {
        Log(LogLevel.Debug, "Awaiting Transcription")
        final_question = await imageTranscription(filename)
      } else {
        final_question = chatState.message
      }

      const user_message: Message = {
        role: 'user',
        content: final_question
      }

      const conversation = [...chatState.conversation]

      conversation.shift()
      if (chatState.summary) {
        const summary_message: Message = {
          role: 'assistant',
          content: chatState.summary
        }
        conversation.unshift(summary_message)
      }
      conversation.push(user_message)

      const mode_start_time = performance.now()
      lock()
      Log(LogLevel.Debug, "Awaiting Mode")
      const mode = await API.getMode(question, conversation)
      const mode_end_time = performance.now()
      Log(LogLevel.Always, `Selected "${mode}" in ${Math.round((mode_end_time - mode_start_time) / 100) / 10}s`)
      setQuestion(mode)

      let current_conversation_id = chatState.id
      var conversation_id_promise 

      if (current_conversation_id == null) {
        conversation_id_promise = API.getTitle(final_question)
          .then(title => DB.addConversation(title, course, mode))
          .then(add_conversation_result => {

            if (add_conversation_result == null) {
              throw new Error("Did not find course or title")
            }
            const new_conversation_id = add_conversation_result
            setChatState(prev => ({
              ...prev,
              id: new_conversation_id
            }))
            setSelectedThread(new_conversation_id)
            return new_conversation_id
          })
      } else {
        DB.updateMode(current_conversation_id, mode)
      }

      setUIState(prev => ({
        ...prev,
        thinking: true,
      }))

      const ask_start_time = performance.now()
      Log(LogLevel.Debug, "Awaiting response")
      var assistant_response = ""
      var firstChunkReceived = false
      for await (const currentAnswer of API.ask(conversation, mode, course)) {
        if (!firstChunkReceived) {
          firstChunkReceived = true
          setUIState(prev => ({
            ...prev,
            aiLoading: false,
            thinking: false,
          }))
        }
        assistant_response += currentAnswer
        setChatState(prev => ({
          ...prev,
          aiMessage: assistant_response,
        }))
      }
      const ask_end_time = performance.now()
      Log(LogLevel.Always, `Question took ${(ask_end_time - ask_start_time) / 1000}`)

      if (assistant_response == '') {
        throw new Error("Ask returned zero tokens")
      }

      if (current_conversation_id == null) {
        Log(LogLevel.Debug, "Awaiting conversation creation")
        const db_start_time = performance.now()
        current_conversation_id = await conversation_id_promise
        const db_end_time = performance.now()
        Log(LogLevel.Always, `Waited for conversation result in ${Math.round((db_end_time - db_start_time) / 100) / 10}s`)
      }
      DB.addMessage(current_conversation_id!, 'user', final_question)
        .then(() => DB.addMessage(current_conversation_id!, 'assistant', assistant_response))



      const ai_message: Message = {
        role: 'assistant',
        content: assistant_response
      }

      setChatState(prev => ({
        ...prev,
        image: '',
        aiMessage: '',
        conversation: [
          ...prev.conversation,
          ai_message,
        ]
      }))
    } catch {
      alert("Sorry, an error occured! Please try again")
      setUIState(prev => ({
        ...prev,
        thinking: false,
        aiLoading: false,
      }))
      setChatState(prev => ({
        ...prev,
        image: '',
        file: '',
        aiMessage: '',
        conversation: initial_conversation
      }))
    }
    Log(LogLevel.Debug, "Unlocking Chat")
    unlock()
    summarize()

  }


  function shouldSummarize(): boolean {
    const conversation = chatState.conversation
    if (conversation.length < 5) {
      return false
    }

    if (conversation[conversation.length - 1].role != 'assistant') {
      return false
    }
    var total_length = 0
    for (var i = 0; i < conversation.length-1; i++) {
      total_length += getMessageContent(conversation[i]).length
    }

    if (estimateTokens(total_length) <= TOKEN_THRESHOLD) {
      Log(LogLevel.Debug, "Characters in conversation: ", total_length)
      Log(LogLevel.Debug, "Estimated tokens: " + estimateTokens(total_length))
      Log(LogLevel.Debug, "Threshold: " + TOKEN_THRESHOLD)
      Log(LogLevel.Debug, "Does not meet token threshold")
      return false
    }
    return true
  }


  async function summarize() {
    if (!shouldSummarize()) {
      return
    }

    lock()
    const conversationToSummarize = chatState.conversation.slice(0,-4)

    const summary = await API.getSummary(conversationToSummarize)

    setChatState(prev => ({
      ...prev,
      summary: summary,
    }))

    await DB.updateSummary(chatState.id!, summary)

    unlock()
  }

  return {
    intro,
    handleSendMessage,
    summarize,
    loadConversation,
    chatState,
    setChatState,
    uiState,
    setUIState,
  }
}

export default useConversation
