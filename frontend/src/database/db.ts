import supabase from "../supabase.ts"

const DatabaseEndpoints = {
  Conversations: '/db/conversations',
  Settings: '/db/conversations/settings',
  Summary: '/db/conversations/summary',
}

export namespace DB {

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
    console.log(response_json)
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

  export function getConversations() {
    return authorizedGet(DatabaseEndpoints.Conversations)
  }

  export async function getSettings(id: number) {
    return authorizedGet(DatabaseEndpoints.Settings + `/${id}`)
  }

  export async function getConversation(id: number) {
    return authorizedGet(DatabaseEndpoints.Conversations + `/${id}`)
  }

  export async function getSummary(id: number) {
    return authorizedGet(DatabaseEndpoints.Summary + `/${id}`)
  }

  export async function addMessage(conversation_id: number, role: string, content: string) {
    const body = JSON.stringify({
        role: role,
        content: content,
      })

    return authorizedPost(DatabaseEndpoints.Conversations + `/${conversation_id}`, body)

  }

  export async function addConversation(title: string, course: string, mode: string) {
    const body =  JSON.stringify({
      title: title,
      course: course,
      mode: mode,
    })
    return authorizedPost(DatabaseEndpoints.Conversations, body)

  }

  export async function updateSummary(conversation_id: number, summary: string) {

    const body = JSON.stringify({
      summary: summary,
    })
    return authorizedPost(DatabaseEndpoints.Summary + `/${conversation_id}`, body)

  }

  export async function updateMode(conversation_id: number, mode: string) {
    const body = JSON.stringify({
      mode: mode,
    })
    return authorizedPost(DatabaseEndpoints.Settings + `/${conversation_id}`, body)
  }

}
