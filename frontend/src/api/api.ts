import Endpoints from "../endpoints"
import { Log, LogLevel } from "../log"


const BASE_URL = import.meta.env.VITE_API_URL ?? ''

function authHeaders(headers: Record<string, string> = {}) {
  const token = sessionStorage.getItem("entra_id_token")
  if (!token) return headers

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  }
}

async function postStream(endpoint: string, headers: any, body: string) {
  const url = BASE_URL + endpoint
  const request = new Request(url, {
    method: 'POST',
    headers: authHeaders(headers),
    body: body,
  })
  const response = await fetch(request)
  return response

}

async function get(endpoint: string) {
  const url = BASE_URL + endpoint
  const response = await fetch(url, {
    method: 'GET',
    headers: authHeaders({
      'Content-Type': 'application/json',
    }),
  })

  if (!response.ok) {
    const bodyText = await response.text().catch(() => '')
    throw new Error(`Http error: ${response.status}${bodyText ? ` - ${bodyText}` : ''}`)
  }
  const response_json = await response.json()
  return response_json

}

async function post(endpoint: string, body: string) {
  const url = BASE_URL + endpoint
  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders({
      'Content-Type': 'application/json',
    }),
    body: body
  })

  if (!response.ok) {
    const bodyText = await response.text().catch(() => '')
    throw new Error(`Http error: ${response.status}${bodyText ? ` - ${bodyText}` : ''}`)
  }
  return response.json()
}

export namespace API {

  export function getConversations() {
    return get(Endpoints.Conversation)
  }

  export async function getConversation(conversation_id: number) {
    return get(Endpoints.Conversation + `/${conversation_id}`)
  }

  export async function addConversation(course: string) {
    const body =  JSON.stringify({
      course: course,
    })
    return post(Endpoints.Conversation, body)
  }


  export async function* ask(id: number, message: string, image: string | null = null) {

    const response = await postStream(Endpoints.Chat, {
      'Content-Type': 'application/json',
    }, JSON.stringify({
        'id': id,
        'message': message,
        'image': image,
      }))

    if (!response.ok) {
      const bodyText = await response.text().catch(() => '')
      throw new Error(`Http error: ${response.status}${bodyText ? ` - ${bodyText}` : ''}`)
    }
    if (!response.body) {
      throw new Error('Chat response did not include a readable stream')
    }

    Log(LogLevel.Info, `Fetching response for conversation ${JSON.stringify(message)}`)
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ""

    while (true) {
      const {value, done} = await reader.read()
      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true})
      const lines = buffer.split("\n")
      buffer = lines.pop()!
      for (const line of lines) {
        if (line) yield line + "\n"
      }
    }

  }
}
