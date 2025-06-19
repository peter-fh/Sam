import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
)

export namespace DB {

  export async function getConversations() {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      const { data } = await supabase
        .from("conversations")
        .select()
        .order("updated_at", { ascending: false })
      return data
    }

    const { data } = await supabase
      .from("conversations")
      .select()
      .or(`course_id.eq.1,course_id.is.null`)
      .order("updated_at", { ascending: false })
    return data
  }

  export async function getSettings(id: number) {
    const { data, error } = await supabase
      .from("conversations")
      .select(`
        course:course_id (code), 
        mode:mode_id (name)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Supabase error:", error.message, error.details)
    } 

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

  export async function addConversation(title: string, course: string, type: string) {
    const { data: modeData, error: modeError } = await supabase
      .from("modes")
      .select("id")
      .eq("name", type)
      .single()

    if (modeError) {
      console.error("Supabase error:", modeError.message, modeError.details)
      return
    } 

    const mode_id = modeData!.id

    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("code", course)
      .single()

    if (courseError) {
      console.error("Supabase error:", courseError.message, courseError.details)
      return
    } 

    const course_id = courseData!.id


    const { data, error } = await supabase
      .from("conversations")
      .insert({
        title: title,
        course_id: course_id,
        mode_id: mode_id,
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
      .update({
        summary: summary,
      })
      .eq('id', conversation_id)

    if (error) {
      console.error("Supabase error:", error.message, error.details)
    } 

  }
}
