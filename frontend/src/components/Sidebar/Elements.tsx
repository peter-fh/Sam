import { Course } from '../../types/options'
import './Elements.css'
import React from 'react'
import { useChatSettings } from '../../context/useChatContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from "react"
import { API } from '../../api/api.ts'
import supabase from '../../supabase.ts'

export function SidebarButton() {
  const {
    sidebar,
    setSidebar,
  } = useChatSettings()

  return (
    <button
      title='Toggle Sidebar'
      className="p-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 active:scale-95 transition-all cursor-pointer border border-transparent hover:border-slate-700/50"
      onClick={() => setSidebar(!sidebar)}
    >
      {sidebar ? 
        <i className="fa-solid fa-bars-staggered text-lg"></i>
        :
        <i className="fa-solid fa-bars text-lg"></i>
      }
    </button>
  )
}

export function LogoutText() {
  return (
    <button
      title='Logout'
      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-[0.98] transition-all cursor-pointer text-sm font-medium text-left border border-transparent hover:border-rose-500/20"
      onClick={() => supabase.auth.signOut()}
    >
      <i className="fa-solid fa-right-from-bracket text-base"></i>
      <span>Logout</span>
    </button>
  )
}

export function NewConversationText() {
  const navigate = useNavigate()
  return (
    <button
      title="New Chat"
      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-100 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] transition-all cursor-pointer text-sm font-semibold shadow-md shadow-indigo-500/20"
      data-testid="new-chat-button"
      onClick={() => {
        navigate("/")
      }}
    >
      <i className="fa-solid fa-plus text-base"></i>
      <span>New Conversation</span>
    </button>
  );
}

export function InvisibleButton() {
  return (
    <button className="hidden">
      <i className="fa-solid fa-download"/>
    </button>
  )
}

export function SidebarButtons() {
  const {
    sidebar,
  } = useChatSettings()

  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/80">
      { sidebar ? 
        <>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-500/30">
              S
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white m-0 no-underline">Sam</h1>
          </div>
          <SidebarButton/>
        </> :
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-2xl shadow-xl p-1">
          <SidebarButton/>
        </div>
      }
    </div>
  )
}

export function CourseSelect() {
  const { course, setCourse } = useChatSettings()
  const { id } = useParams()
  const isExistingConversation = Boolean(id)

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!isExistingConversation) {
      setCourse(event.target.value as Course)
    }
  }

  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Course
        </label>
        {isExistingConversation && (
          <span className="flex items-center gap-1 text-[10px] text-indigo-400 font-medium">
            <i className="fa-solid fa-lock text-[9px]"></i>
            Fixed
          </span>
        )}
      </div>

      {isExistingConversation ? (
        <div className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 text-xs font-semibold text-indigo-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5 truncate">
            <i className="fa-solid fa-book-open text-indigo-400 text-xs"></i>
            {course}
          </span>
          <i className="fa-solid fa-lock text-slate-500 text-xs shrink-0" title="Course is locked for this conversation"></i>
        </div>
      ) : (
        <select
          className="w-full bg-slate-800/80 text-slate-200 border border-slate-700/70 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer shadow-sm"
          onChange={onChange}
          value={course}
        >
          {Object.values(Course).map((option) => (
            <option key={option} value={option} className="bg-slate-900 text-slate-100">
              {option}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

interface ConversationItem {
  title: string,
  id: number,
  course?: string,
}

export function Threads() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  interface ClickableThreadProps {
    id: number,
    title: string,
    course?: string,
  }

  function ClickableThread(props: ClickableThreadProps) {
    const handleClick = () => {
      navigate(`/chat/${props.id}`)
    }
    const isSelected = id && props.id === parseInt(id);

    return (
      <div 
        className={`group relative flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
          isSelected 
            ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30 shadow-sm' 
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
        }`} 
        onClick={handleClick} 
        data-testid="thread"
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <i className={`fa-regular fa-message text-xs shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'}`}></i>
          <p className="truncate m-0 text-xs font-medium text-slate-200 flex-1" title={props.title} data-testid={props.title}>{props.title}</p>
        </div>
        {props.course && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 shrink-0">
            {props.course}
          </span>
        )}
      </div>
    )
  }

  async function updateConversations() {
    setError(false)
    try {
      const conversation_data = await API.getConversations()
      if (!conversation_data) {
        setLoading(false)
        return
      }

      const total_conversations: ConversationItem[] = []
      for (const conversation of conversation_data) {
        let courseName = conversation.course || (conversation.courses && conversation.courses.code)
        if (!courseName && conversation.course_id === 1) {
          courseName = 'MATH 203'
        }
        const convo: ConversationItem = {
          title: conversation.title!,
          id: conversation.id!,
          course: courseName || 'MATH 203',
        }
        total_conversations.push(convo)
      }
      setConversations(total_conversations)
    } catch (e) {
      console.error(e)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    updateConversations()
  }, [id])

  if (loading) {
    return (
      <div className="px-3 py-4 text-center">
        <div className="inline-block w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-2"></div>
        <p className="text-xs text-slate-500 italic">Loading conversations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-3 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-center">
        Error fetching conversations. Try again later.
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="px-3 py-6 text-center text-slate-500 text-xs leading-relaxed">
        No previous chats.<br/>Click <span className="text-indigo-400 font-medium">"New Conversation"</span> to start.
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="px-3 py-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Recent Chats</span>
      </div>
      <div className="space-y-1">
        {conversations.map((conversation) => (
          <ClickableThread key={conversation.id} id={conversation.id} title={conversation.title} course={conversation.course}/>
        ))}
      </div>
    </div>
  )
}

export function Attribution() {
  return (
    <a 
      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800/60 text-slate-400 hover:text-indigo-300 text-xs leading-snug transition-all no-underline group" 
      href="https://www.concordia.ca/students/success/learning-support/math-help.html"
      target='_blank'
      rel="noreferrer"
      title="Student Success Center Math Help">
      <i className="fa-solid fa-graduation-cap text-indigo-400 text-sm group-hover:scale-110 transition-transform shrink-0"></i>
      <span>Concordia Student Success Center Math Support</span>
    </a>
  )
}
