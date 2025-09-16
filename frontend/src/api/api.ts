import Endpoints from "../endpoints"
import { Log, LogLevel } from "../log"
import supabase from "../supabase"
import { Course, DetailLevel, QuestionType } from "../types/options"
import { Message } from "./message"

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

export namespace API {

  export async function getTitle(question: string) {
    const start_time = performance.now()

    const response = await fetchWithAuth(Endpoints.Title, {
      'Content-Type': 'text/plain'
    }, 
      String(question)
    )
    const reader = response.body!.getReader()
    const decoder = new TextDecoder('utf-8')

    const {value} = await reader.read()

    const title = decoder.decode(value, { stream: true})
    const end_time = performance.now()
    Log(LogLevel.Debug, `getTitle took ${Math.round((end_time - start_time) / 100) / 10}s`)

    return title
  }

  export async function readImage(image: string) {
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

  export async function getSummary(conversation: Message[]) {
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

  export async function getMode(current_mode: QuestionType | null, conversation: Message[]) {
    var question_type: string = ""
    if (current_mode == null) {
      question_type = "None"
    } else {
      question_type = current_mode
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
    return mode
  }

  export async function* ask(conversation: Message[], mode: QuestionType, course: Course) {

    const response = await fetchWithAuth(Endpoints.Ask, {
      'Content-Type': 'application/json',
      'Course': course,
      'Brevity': DetailLevel.DETAILED,
      'Mode': mode,
    }, JSON.stringify(conversation))


    const reader = response.body!.getReader()
    const decoder = new TextDecoder('utf-8')

    while (true) {
      const {value, done} = await reader.read()
      if (done) {
        break
      }

      const chunk = decoder.decode(value, { stream: true})
      yield chunk
    }

  }
}
