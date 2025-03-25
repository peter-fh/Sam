import { useRef, useState } from "react";
import { Message, newMessage } from "../../types/message";
import { useChatSettings } from "../../context/useChatContext";
import Endpoints from "../../endpoints";


const TOKEN_THRESHOLD = 2048
const REVIEW_MESSAGE = "You've reached the end of the conversation! If you have any follow up questions, please feel free to ask here. If you have a new problem to work on, please start a new conversation. Consider [booking a tutoring session](https://www.concordia.ca/students/success/learning-support/math-help.html#tutoring) to help with these concepts. Keep practicing these problems, and it will help solidify you understanding!"

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
    question,
    course,
    detailLevel
  } = useChatSettings()

  const [conversation, setConversation] = useState<Message[]>([]);
  const [totalConversation, setTotalConversation] = useState<Message[]>([]);
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

  const addMessage = (message: Message) => {
    setConversation((prevMessages) => [...prevMessages, message])
  }

  const intro_message = "Hello! I'm Sam, an AI chatbot powered by Chat-GPT. I use context specific to Concordia to provide better explanations. AI makes mistakes, so please double check any answers you are given."

  async function intro() {
    setHasReviewed(false)
    setLock(true)
    var answer = ""
    for (const word of intro_message.split(" ")) {
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

    console.log("Image transcription:\n", transcription)
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

    console.log("Summarized conversation:\n", summary)

    return summary
  }

  async function ask(conversation: Message[]) {
    const request = new Request(Endpoints.Ask, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Course': course,
        'Brevity': detailLevel,
        'Type': question,
      },
      body: JSON.stringify(conversation)
    })



    const start_time = performance.now()
    var elapsedIntervals = 0
    const intervalId = setInterval(() => {
      const numberOfDots = elapsedIntervals % 4
      const thinkingMessage = "Thinking" + ".".repeat(numberOfDots)

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
      if (answer.includes("+END+")) {
        console.log("End!")
        answer = answer.replace("+END+", "")
        setToReview(true)
      }
      setAiMessage(answer)
    }
    setAiMessage('')
    console.log(answer)

    const end_time = performance.now()
    console.log(`Response took ${(end_time - start_time) / 1000}`)
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
    const request = new Request(Endpoints.Review, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Course': course,
      },
      body: JSON.stringify(totalConversation)
    })



    const start_time = performance.now()
    var elapsedIntervals = 0
    const intervalId = setInterval(() => {
      const numberOfDots = elapsedIntervals % 4
      const thinkingMessage = "Reviewing Conversation" + ".".repeat(numberOfDots)

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
    console.log(answer)

    const end_time = performance.now()
    console.log(`Response took ${(end_time - start_time) / 1000}`)

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

      const ai_message_promise = ask(fullConversation)
      const ai_message = await ai_message_promise

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
      return
    }


    console.log("Summarizing")

    setLock(true)
    const conversationToSummarize = conversation.slice(0,-4)
    console.log("Sending the following conversation to summarize:")
    console.log(conversationToSummarize)

    const summary = await getSummary(conversationToSummarize)
    const summaryMessage = newMessage(summary, 'system')

    setConversation([
      summaryMessage, 
      ...conversation.slice(0,4)
    ])

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
  }
}

export default useConversation
