const DatabaseEndpoints = {
  Conversations: '/db/conversations',
  Settings: '/db/conversations/settings',
  Summary: '/db/conversations/summary',
}

export namespace DB {

  export async function getConversations() {
    const response = await fetch(DatabaseEndpoints.Conversations, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.ok) {
      const response_json = await response.json()
      console.log(response_json)
      return response_json
    }
    return null
  }

  export async function getSettings(id: number) {

    const response = await fetch(DatabaseEndpoints.Settings + `/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.ok) {
      const response_json = await response.json()
      console.log(response_json)
      return response_json
    }
    return null
  }

  export async function getConversation(id: number) {
    const response = await fetch(DatabaseEndpoints.Conversations + `/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.ok) {
      const response_json = await response.json()
      console.log(response_json)
      return response_json
    }
    return null
  }

  export async function getSummary(id: number) {
    const response = await fetch(DatabaseEndpoints.Summary + `/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.ok) {
      const response_json = await response.json()
      console.log(response_json)
      return response_json
    }
    return null

  }

  export async function addMessage(conversation_id: number, role: string, content: string) {
    await fetch(DatabaseEndpoints.Conversations + `/${conversation_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: role,
        content: content,
      })
    })
    return null

  }

  export async function addConversation(title: string, course: string, mode: string) {
    await fetch(DatabaseEndpoints.Conversations, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title,
        course: course,
        mode: mode,
      })
    })
    return null

  }

  export async function updateSummary(conversation_id: number, summary: string) {
    await fetch(DatabaseEndpoints.Summary + `/${conversation_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: summary,
      })
    })
    return null

  }

  export async function updateMode(conversation_id: number, mode: string) {
    await fetch(DatabaseEndpoints.Settings + `/${conversation_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: mode,
      })
    })
    return null
  }

}
