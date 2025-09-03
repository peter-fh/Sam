import { useRef, useState } from "react";
import { getMessageContent, Message, newMessage } from "../../types/message";
import { useChatSettings } from "../../context/useChatContext";
import Endpoints from "../../endpoints";
import { DB } from "../../database/db";
import { useThreadSelectionContext } from "../../context/useThreadContext";
import { Log, LogLevel } from "../../log";
import { Course, QuestionType } from "../../types/options";
import supabase from "../../supabase";


const TOKEN_THRESHOLD = 1024
const INTRO_MESSAGE = "Hello! I'm Sam, an AI chatbot powered by Chat-GPT. I use context specific to Concordia to provide better explanations. AI makes mistakes, so please double check any answers you are given."

const estimateTokens = (characterCount: number) => {
  return Math.ceil(characterCount * 0.25)
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

type DisplayMessage = {
  role: "user" | "assistant"
  content: string
}

const useConversation = () => {

  const {
    question, setQuestion,
    course, setCourse,
    detailLevel,
  } = useChatSettings()

  const {
    setSelectedThread
  } = useThreadSelectionContext()

  const [conversation, setConversation] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  //const [_, setTotalConversation] = useState<Message[]>([]);
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [aiMessage, setAiMessage] = useState('')
  const [lock, setLock] = useState(false)
  const [file, setFile] = useState('')
  const [image, setImage] = useState('')
  const [toSummarize, setToSummarize] = useState(false)
  const [loadingConversation, setLoadingConversation] = useState(false)
  const [loading, setLoading] = useState(false)

  const addMessage = (message: Message) => {
    setConversation((prevMessages) => [...prevMessages, message])
  }


  async function loadConversation(id: number) {
    setLock(true)
    setLoadingConversation(true)
    setConversationId(id)

    const summary = await DB.getSummary(id)

    const conversationMessages = await DB.getConversation(id)
    if (conversationMessages == null) {
      return
    }

    const conversationSettings = await DB.getSettings(id)
    if (conversationSettings && conversationSettings.course && conversationSettings.mode) {
      setCourse(conversationSettings.course.code as Course)
      setQuestion(conversationSettings.mode.name as QuestionType)
    }

    const conversationDisplayMessages: DisplayMessage[] = []
    const intro_message: DisplayMessage = {
      role: "assistant",
      content: INTRO_MESSAGE,
    }
    conversationDisplayMessages.push(intro_message)
    const formattedMessages: Message[] = []
    for (const conversation_message of conversationMessages) {
      const conversation_display_message: DisplayMessage = {
        role: conversation_message.role as "user" | "assistant",
        content: conversation_message.content!,
      }
      conversationDisplayMessages.push(conversation_display_message)

      const formatted_message = newMessage(conversation_message.content!, conversation_message.role!)
      formattedMessages.push(formatted_message)
    }

    if (summary && summary.summary) {
      const formatted_summary = newMessage(summary.summary, 'user')
      setConversation([
        formatted_summary,
        ...formattedMessages.slice(1).slice(-4),
      ])
    } else {
      setConversation([
        ...formattedMessages
      ])
    }

    setMessages(conversationDisplayMessages)

    setLoadingConversation(false)
    setLock(false)
  }
  async function intro() {
    setLock(true)
    setMessages([])
    var answer = ""
    for (const word of INTRO_MESSAGE.split(" ")) {
      await sleep(30)
      answer += word + " "
      setAiMessage(answer)
    }

    const introductionMessage: DisplayMessage = {
      role: "assistant",
      content: answer,
    }

    setMessages([introductionMessage])
    setAiMessage('')

    setLock(false)
  }


  async function fetchWithAuth(endpoint: string, headers: any, body: string) {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session) {
      throw new Error('Not authenticated')
    }
    const request = new Request(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        ...headers
      },
      body: body,
    })
    const response = await fetch(request)
    return response

  }

  async function getTitle(question: string) {

    const response = await fetchWithAuth(Endpoints.Title, {
      'Content-Type': 'text/plain'
    }, 
      String(question)
    )
    const reader = response.body!.getReader()
    const decoder = new TextDecoder('utf-8')

    const {value} = await reader.read()

    const title = decoder.decode(value, { stream: true})

    return title
  }

  async function readImage(image: string) {
    const response = await fetchWithAuth(Endpoints.Image, {
      'Content-Type': 'text/plain',
    }, String(image))

    const reader = response.body!.getReader()
    const decoder = new TextDecoder('utf-8')

    const {value} = await reader.read()

    const transcription = decoder.decode(value, { stream: true})

    Log(LogLevel.Debug, "Image transcription:\n", transcription)
    return transcription
  }

  async function getSummary(conversation: Message[]) {
    const response = await fetchWithAuth(Endpoints.Summary, {
      'Content-Type': 'application/json',
    }, JSON.stringify(conversation))

    const reader = response.body!.getReader()
    const decoder = new TextDecoder('utf-8')

    const {value} = await reader.read()

    const summary = decoder.decode(value, { stream: true})

    Log(LogLevel.Debug, "Summarized conversation:\n", summary)

    return summary
  }

  async function getMode(conversation: Message[]) {
    var question_type: string = ""
    if (question_type == null) {
      question_type = "None"
    } else {
      question_type = question!
    }

    const mode_response = await fetchWithAuth(Endpoints.Mode, {
      'Content-Type': 'application/json',
      'Mode': question_type,
    }, JSON.stringify(conversation))

    const mode_raw = await mode_response.text()
    if (mode_raw == "") {
      throw new Error("Could not fetch mode")
    }
    const mode = mode_raw as QuestionType
    Log(LogLevel.Debug, mode)
    return mode
  }

  async function ask(conversation: Message[], mode: QuestionType) {

    const response = await fetchWithAuth(Endpoints.Ask, {
      'Content-Type': 'application/json',
      'Course': course,
      'Brevity': detailLevel,
      'Mode': mode,
    }, JSON.stringify(conversation))
    setLoading(false)

    const reader = response.body!.getReader()
    const decoder = new TextDecoder('utf-8')
    var answer = ""

    while (true) {
      const {value, done} = await reader.read()
      if (done) {
        break
      }

      const chunk = decoder.decode(value, { stream: true})
      answer += chunk
      setAiMessage(answer)
    }
    setAiMessage('')
    Log(LogLevel.Debug, answer)

    setToSummarize(true)

    return answer
  }

  /*
  const waitForUnlock = (): Promise<void> => {
    if (!lock) {
      return Promise.resolve();
    }
    return new Promise((resolve: () => void) => {
      resolveLockRef.current = resolve;
    });
  };
  */

  const imageTranscription = async (filename: string) => {
    let transcription = ""

    transcription = `\n\n*[transcribing ${filename}...]*`
    displayNewMessage(transcription, 'user')
    setMessage("")

    var final_message = message

    transcription = await readImage(image)
    transcription = `\n\n*Image Transcription:*\n\n${transcription}` 
    displayNewMessage(transcription, 'user')
    final_message += "The following is a transcription of an image sent by the user:\n\n" + transcription
    return final_message

  }

  function displayNewMessage(new_message: string, role: 'user' | 'assistant') {
    const display_message : DisplayMessage = {
      role: role,
      content: new_message,
    }
    setMessages(prevMessages => [...prevMessages!, display_message])
  }
  const handleSendMessage = async () => {
    if (lock) {
      return
    }

    if (!message && !image) {
      setMessage('')
      return
    }

    setLock(true)
    const user_message = message
    setMessage('')

    const filename = file
    setFile('')

    displayNewMessage(user_message, 'user')
    let final_message = user_message
    if (image) {
      final_message = await imageTranscription(filename)
    }


    var json_message: any = newMessage(final_message, "user")
    const fullConversation = [...conversation, json_message]

    const mode_start_time = performance.now()
    setLoading(true)
    const mode = await getMode(fullConversation)
    const mode_end_time = performance.now()
    Log(LogLevel.Always, `Mode fetch took ${(mode_end_time - mode_start_time) / 1000}`)
    setQuestion(mode)

    let current_conversation_id = conversationId
    var conversation_id_promise 

    if (current_conversation_id == null) {
      conversation_id_promise = getTitle(final_message)
        .then(title => DB.addConversation(title, course, mode))
        .then(add_conversation_result => {

          if (add_conversation_result == null) {
            throw new Error("Did not find course or title")
          }
          const new_conversation_id = add_conversation_result
          setConversationId(new_conversation_id)
          setSelectedThread(new_conversation_id)
          return new_conversation_id
        })
        .then(new_conversation_id => {
          console.log("New conversation id: ", new_conversation_id)
          DB.addMessage(new_conversation_id, 'user', final_message)
          return new_conversation_id
        })
    } else {
      DB.updateMode(current_conversation_id, mode)
    }

    const ask_start_time = performance.now()
    const ai_message = await ask(fullConversation, mode)
    const ask_end_time = performance.now()
    Log(LogLevel.Always, `Question took ${(ask_end_time - ask_start_time) / 1000}`)

    displayNewMessage(ai_message, 'assistant')
    if (current_conversation_id == null) {
      current_conversation_id = await conversation_id_promise
    }
    DB.addMessage(current_conversation_id!, 'assistant', ai_message)

    setConversation([
      ...conversation, 
      newMessage(final_message, 'user'), 
      newMessage(ai_message, 'assistant'),
    ])

    setImage('')
    setLock(false)

  }

  /*
  const oldHandleSendMessage = async () => {
    if (!lock && (message || image)) {
      setLock(true)
      const fileName = file
      setFile('')

      var current_message = message


      const current_display_question: DisplayMessage = {
        role: "user",
        content: current_message

      }
      const image_info: DisplayMessage = {
        role: "user",
        content: ""
      }

      if (image) {
        image_info.content = `\n\n*[transcribing ${fileName}...]*`
        setMessages([...messages!, current_display_question, image_info])
      } else {
        setMessages([...messages!, current_display_question])
      }
      setMessage("")

      var final_message = message

      if (image) {
        const transcription = await readImage(image)
        image_info.content = `\n\n*Image Transcription:*\n\n${transcription}` 
        setMessages([...messages!, current_display_question, image_info])
        final_message += "The following is a transcription of an image sent by the user:\n\n" + transcription
      } 


      var json_message: any = newMessage(final_message, "user")
      const fullConversation = [...conversation, json_message]

      const mode_start_time = performance.now()
      setLoading(true)
      const mode = await getMode(fullConversation)
      const mode_end_time = performance.now()
      Log(LogLevel.Always, `Mode fetch took ${(mode_end_time - mode_start_time) / 1000}`)
      setQuestion(mode)

      const ask_start_time = performance.now()
      const ai_message = await ask(fullConversation, mode)
      const ask_end_time = performance.now()
      Log(LogLevel.Always, `Question took ${(ask_end_time - ask_start_time) / 1000}`)

      const display_ai_message: DisplayMessage = {
        role: "assistant",
        content: ai_message
      }

      if (image) {
        setMessages([...messages!, current_display_question, image_info, display_ai_message])
      } else {
        setMessages([...messages!, current_display_question, display_ai_message])
      }

      setConversation([
        ...conversation, 
        newMessage(final_message, 'user'), 
        newMessage(ai_message, 'assistant'),
      ])

      setTotalConversation([
        ...conversation, 
        newMessage(final_message, 'user'), 
        newMessage(ai_message, 'assistant'),
      ])

      var current_conversation_id = conversationId
      if (current_conversation_id == null) {
        const title = await getTitle(final_message)
        Log(LogLevel.Debug, "Title: ", title)
        const add_conversation_result = await DB.addConversation(title, course, mode)
        if (add_conversation_result == null) {
          throw new Error("Did not find course or title")
        }
        current_conversation_id = add_conversation_result
        setConversationId(current_conversation_id)
        setSelectedThread(current_conversation_id)
      } else {
        await DB.updateMode(current_conversation_id, mode)
      }

      await DB.addMessage(current_conversation_id, "user", final_message)
      await DB.addMessage(current_conversation_id, "assistant", ai_message)


      setImage('')
      setLock(false)
    } else if (!lock) {
      setMessage("")
    }

  }
*/

  async function summarize() {
    setToSummarize(false)
    if (conversation.length < 5) {
      return
    }

    if (conversation[conversation.length - 1].role != 'assistant') {
      return
    }
    var total_length = 0
    for (var i = 0; i < conversation.length-1; i++) {
      total_length += getMessageContent(conversation[i]).length
    }

    if (estimateTokens(total_length) <= TOKEN_THRESHOLD) {
      Log(LogLevel.Debug, "Estimated tokens: " + estimateTokens(total_length))
      Log(LogLevel.Debug, "Threshold: " + TOKEN_THRESHOLD)
      Log(LogLevel.Debug, "Does not meet token threshold")
      return
    }


    setLock(true)
    const conversationToSummarize = conversation.slice(0,-4)

    const summary = await getSummary(conversationToSummarize)
    const summaryMessage = newMessage(summary, 'system')

    setConversation([
      summaryMessage, 
      ...conversation.slice(-4)
    ])

    await DB.updateSummary(conversationId!, summary)

    setLock(false)
  }

  return {
    conversation,
    setConversation,
    message,
    setMessage,
    messages,
    setMessages,
    aiMessage,
    setAiMessage,
    lock,
    setLock,
    file,
    setFile,
    image,
    setImage,
    toSummarize,
    setToSummarize,
    addMessage,
    intro,
    handleSendMessage,
    summarize,
    loadConversation,
    loadingConversation,
    loading,
  }
}

export default useConversation
