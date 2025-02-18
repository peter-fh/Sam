import { useState } from "react";
import { Message, newMessage } from "../../types/message";
import { useChatSettings } from "../../context/useChatContext";

const APIEndpoint = '/question'
const IntroEndpoint = '/introduction'
const ImageEndpoint = '/image'
const SummaryEndpoint = '/summary'

const MAX_CONVERSATION_LENGTH = 1000

const useConversation = () => {

  const {
    question,
    course,
    detailLevel
  } = useChatSettings()

  const [conversation, setConversation] = useState<Message[]>([]);
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const [aiMessage, setAiMessage] = useState('')
  const [lock, setLock] = useState(false)
  const [file, setFile] = useState('')
  const [image, setImage] = useState('')
  const [toSummarize, setToSummarize] = useState(false)

  const addMessage = (message: Message) => {
    setConversation((prevMessages) => [...prevMessages, message])
  }

  async function intro() {
    setLock(true)
    const request = new Request(IntroEndpoint, {
      method: 'GET'
    })

    const start_time = performance.now()
    const response = await fetch(request)
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

    setMessages([answer])
    const end_time = performance.now()
    console.log(`Response took ${(end_time - start_time) / 1000}`)
    setLock(false)
  }

  async function readImage(image: string) {

    const request = new Request(ImageEndpoint, {
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
    const request = new Request(SummaryEndpoint, {
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
    const request = new Request(APIEndpoint, {
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
    const response = await fetch(request)
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

    const end_time = performance.now()
    console.log(`Response took ${(end_time - start_time) / 1000}`)
    setToSummarize(true)

    return answer
  }

  const handleSendMessage = async () => {
    if (!lock && (message || image)) {
      setLock(true)
      const fileName = file
      setFile('')

      var current_message = message
      if (image) {
        current_message += `\n\n*[uploaded ${fileName}]*`
      }


      setMessages([...messages!, current_message])
      setMessage("")

      var final_message = message

      if (image) {
        setAiMessage("*Transcribing Image...*")
        const transcription = await readImage(image)
        final_message += transcription
        setAiMessage("")
      } 

      var json_message: any = newMessage(final_message, "user")
      const fullConversation = [...conversation, json_message]

      const aiMessagePromise = ask(fullConversation)
      const aiMessage = await aiMessagePromise

      setMessages([...messages!, current_message, aiMessage])
      setConversation([
        ...conversation, 
        newMessage(final_message, 'user'), 
        newMessage(aiMessage, 'assistant'),
      ])

      setImage('')
      setLock(false)
    } else if (!lock) {
      setMessage("")
    }
  }

  async function summarize() {
    setToSummarize(false)
    if (conversation.length < 2) {
      return
    }
    var total_length = 0
    for (var i = 0; i < conversation.length; i++) {
      total_length += conversation[i].content[0].text.length
    }

    if (total_length <= MAX_CONVERSATION_LENGTH) {
      return
    }

    if (conversation[conversation.length - 1].role != 'assistant') {
      return
    }

    console.log("Summarizing")

    setLock(true)
    setConversation([newMessage(await getSummary(conversation.slice(0, -2)), 'system'), conversation[conversation.length - 2], conversation[conversation.length - 1]])
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
  }
}

export default useConversation
