import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
)

export namespace DB {
  export async function getConversations() {
    const { data } = await supabase
      .from("conversations")
      .select()
      .order("updated_at", { ascending: false })
    return data
  }

  export async function getConversation(id: number) {
    const { data, error }  = await supabase
      .from("messages")
      .select()
      .eq("conversation_id", id)
      .order("timestamp", { ascending: true })

    if (error) {
      console.error("Supabase error:", error.message, error.details)
    } 

    return data
  }

  export async function getSummary(id: number) {
    const { data, error } = await supabase
      .from("conversations")
      .select("summary")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Supabase error:", error.message, error.details)
    } 

    return data

  }

  export async function addMessage(conversation_id: number, role: string, content: string) {
    const { error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversation_id,
        role: role,
        content: content,
      })

    if (error) {
      console.error("Supabase error:", error.message, error.details)
    } 

  }

  export async function addConversation(title: string) {
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        title: title,
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error.message, error.details);
    } 

    return data!.id

  }

  export async function updateSummary(conversation_id: number, summary: string) {
    const { error } = await supabase
      .from("conversations")
      .insert({
        summary: summary,
      })
      .eq('id', conversation_id)

    if (error) {
      console.error("Supabase error:", error.message, error.details)
    } 

  }
}
