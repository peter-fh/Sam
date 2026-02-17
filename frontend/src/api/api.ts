import Endpoints from "../endpoints"
import { Log, LogLevel } from "../log"
import supabase from "../supabase"
import { Course, DetailLevel, Mode, QuestionType } from "../types/options"
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

async function authorizedGet(endpoint: string) {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) {
    throw new Error('Not authenticated')
  }
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Http error: ${response.status}`)
  }
  const response_json = await response.json()
  return response_json

}

async function authorizedPost(endpoint: string, body: string) {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) {
    throw new Error('Not authenticated')
  }
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: body
  })

  if (!response.ok) {
    throw new Error(`Http error: ${response.status}`)
  }
  return response.json()
}

export namespace API {

  export function getConversations() {
    return authorizedGet(Endpoints.Conversation)
  }

  export async function getConversation(conversation_id: number) {
    return authorizedGet(Endpoints.Conversation + `/${conversation_id}`)
  }

  export async function addConversation(course: string) {
    const body =  JSON.stringify({
      course: course,
    })
    return authorizedPost(Endpoints.Conversation, body)
  }


  export async function* ask(id: number, message: string) {

    const response = await fetchWithAuth(Endpoints.Chat, {
      'Content-Type': 'application/json',
    }, JSON.stringify({
        'id': id,
        'message': message,
      }))


    Log(LogLevel.Info, `Fetching response for conversation ${JSON.stringify(message)}`)
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

