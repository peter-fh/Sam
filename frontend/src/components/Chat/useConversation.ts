import { useRef, useState } from "react";
import { Message, newMessage } from "../../types/message";
import { useChatSettings } from "../../context/useChatContext";
import Endpoints from "../../endpoints";
import { DB } from "../../database/db";
import { useThreadSelectionContext } from "../../context/useThreadContext";
import { Log, LogLevel } from "../../log";
import { Course, QuestionType } from "../../types/options";


const TOKEN_THRESHOLD = 1024
const REVIEW_MESSAGE = "You've reached the end of the conversation! If you have any follow up questions, please feel free to ask here. If you have a new problem to work on, please start a new conversation. Consider [booking a tutoring session](https://www.concordia.ca/students/success/learning-support/math-help.html#tutoring) to help with these concepts. Keep practicing these problems, and it will help solidify you understanding!"
const INTRO_MESSAGE = "Hello! I'm Sam, an AI chatbot powered by Chat-GPT. I use context specific to Concordia to provide better explanations. AI makes mistakes, so please double check any answers you are given."

const estimateTokens = (characterCount: number) => {
  return Math.ceil(characterCount * 0.25)
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

type DisplayMessage = {
  sender: "user" | "assistant"
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
  const [_, setTotalConversation] = useState<Message[]>([]);
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [aiMessage, setAiMessage] = useState('')
  const [lock, setLock] = useState(false)
  const resolveLockRef = useRef<(() => void) | null>(null);
  const [file, setFile] = useState('')
  const [image, setImage] = useState('')
  const [toSummarize, setToSummarize] = useState(false)
  const [toReview, setToReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [loading, setLoading] = useState(false)

  const addMessage = (message: Message) => {
    setConversation((prevMessages) => [...prevMessages, message])
  }


  async function loadConversation(id: number) {
    setLock(true)
    setLoading(true)
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
      sender: "assistant",
      content: INTRO_MESSAGE,
    }
    conversationDisplayMessages.push(intro_message)
    const formattedMessages: Message[] = []
    for (const conversation_message of conversationMessages) {
      const conversation_display_message: DisplayMessage = {
        sender: conversation_message.role as "user" | "assistant",
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

    setLoading(false)
    setLock(false)
  }
  async function intro() {
    setHasReviewed(false)
    setLock(true)
    setMessages([])
    var answer = ""
    for (const word of INTRO_MESSAGE.split(" ")) {
      await sleep(30)
      answer += word + " "
      setAiMessage(answer)
    }

    const introductionMessage: DisplayMessage = {
      sender: "assistant",
      content: answer,
    }

    setMessages([introductionMessage])
    setAiMessage('')

    setLock(false)
  }

  async function getTitle(question: string) {
    const request = new Request(Endpoints.Title, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: String(question),
    })
    const response = await fetch(request)
    const reader = response.body!.getReader()
    const decoder = new TextDecoder('utf-8')

    const {value} = await reader.read()

    const title = decoder.decode(value, { stream: true})

    return title
  }

  async function readImage(image: string) {

    const request = new Request(Endpoints.Image, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: String(image),
    })
    const response = await fetch(request)
    const reader = response.body!.getReader()
    const decoder = new TextDecoder('utf-8')

    const {value} = await reader.read()

    const transcription = decoder.decode(value, { stream: true})

    Log(LogLevel.Debug, "Image transcription:\n", transcription)
    return transcription
  }

  async function getSummary(conversation: Message[]) {
    const request = new Request(Endpoints.Summary, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(conversation)
    })

    const response = await fetch(request)
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

    const mode_request = new Request(Endpoints.Mode, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Mode': question_type,
      },
      body: JSON.stringify(conversation)
    })

    const mode_response = await fetch(mode_request)
    const mode_raw = await mode_response.text()
    if (mode_raw == "") {
      throw new Error("Could not fetch mode")
    }
    const mode = mode_raw as QuestionType
    return mode
  }

  async function ask(conversation: Message[], mode: QuestionType) {

    const request = new Request(Endpoints.Ask, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Course': course,
        'Brevity': detailLevel,
        'Mode': mode,
      },
      body: JSON.stringify(conversation)
    })



    var elapsedIntervals = 0
    const intervalId = setInterval(() => {
      const numberOfDots = elapsedIntervals % 4
      const thinkingMessage = "Solving" + ".".repeat(numberOfDots)

      if (elapsedIntervals != 0) {
        setAiMessage("*" + thinkingMessage + "*")
      }
      elapsedIntervals++
    }, 500)
    const response = await fetch(request)

    clearInterval(intervalId);
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

  const waitForUnlock = (): Promise<void> => {
    if (!lock) {
      return Promise.resolve();
    }
    return new Promise((resolve: () => void) => {
      resolveLockRef.current = resolve;
    });
  };

  async function review() {
    setToReview(false)
    setHasReviewed(true)
    await waitForUnlock()
    setLock(true)

    const answer = REVIEW_MESSAGE

    const display_ai_message: DisplayMessage = {
      sender: "assistant",
      content: answer
    }

    setMessages([...messages!, display_ai_message])

    setConversation([
      ...conversation, 
      newMessage(answer, 'assistant'),
    ])

    setTotalConversation([
      ...conversation, 
      newMessage(answer, 'assistant'),
    ])
    setLock(false)
  }

  const handleSendMessage = async () => {
    if (!lock && (message || image)) {
      setLock(true)
      const fileName = file
      setFile('')

      var current_message = message


      const current_display_question: DisplayMessage = {
        sender: "user",
        content: current_message

      }
      const image_info: DisplayMessage = {
        sender: "user",
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
      const mode = await getMode(fullConversation)
      const mode_end_time = performance.now()
      Log(LogLevel.Always, `Mode fetch took ${(mode_end_time - mode_start_time) / 1000}`)
      setQuestion(mode)

      const ask_start_time = performance.now()
      const ai_message = await ask(fullConversation, mode)
      const ask_end_time = performance.now()
      Log(LogLevel.Always, `Question took ${(ask_end_time - ask_start_time) / 1000}`)

      const display_ai_message: DisplayMessage = {
        sender: "assistant",
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
      total_length += conversation[i].content[0].text.length
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
    review,
    toReview,
    hasReviewed,
    loadConversation,
    loading,
  }
}

export default useConversation
