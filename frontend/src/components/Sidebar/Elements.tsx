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
      className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 active:scale-95 transition-all cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-slate-700/50"
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

export function ThemeToggle() {
  const { theme, toggleTheme } = useChatSettings()

  return (
    <button
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-[#912338]/5 dark:hover:bg-[#912338]/15 active:scale-[0.98] transition-all cursor-pointer text-sm font-medium text-left border border-transparent hover:border-[#912338]/20 dark:hover:border-[#912338]/30"
      onClick={toggleTheme}
    >
      {theme === 'dark' ? (
        <>
          <i className="fa-solid fa-sun text-[#E5A712] dark:text-[#F5C242] text-base"></i>
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <i className="fa-solid fa-moon text-[#912338] dark:text-[#E5A712] text-base"></i>
          <span>Dark Mode</span>
        </>
      )}
    </button>
  )
}

export function LogoutText() {
  return (
    <button
      title='Logout'
      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 active:scale-[0.98] transition-all cursor-pointer text-sm font-medium text-left border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20"
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
      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#912338] to-[#7A1D2F] hover:from-[#A82942] hover:to-[#8E2237] active:scale-[0.98] transition-all cursor-pointer text-sm font-semibold shadow-md shadow-[#912338]/25"
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
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#E5DDD4] dark:border-[#281519]">
      { sidebar ? 
        <>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#912338] to-[#B82B46] flex items-center justify-center text-[#FFE8B3] text-sm font-bold shadow-md shadow-[#912338]/30">
              S
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white m-0 no-underline">Sam</h1>
          </div>
          <SidebarButton/>
        </> :
        <div className="bg-white/90 dark:bg-[#180D10]/90 border border-[#E6DDD3] dark:border-[#2D181C] backdrop-blur-md rounded-2xl shadow-xl p-1">
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
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Course
        </label>
        {isExistingConversation && (
          <span className="flex items-center gap-1 text-[10px] text-[#912338] dark:text-[#F5C242] font-medium">
            <i className="fa-solid fa-lock text-[9px]"></i>
            Fixed
          </span>
        )}
      </div>

      {isExistingConversation ? (
        <div className="w-full bg-[#FFF8E6] dark:bg-[#E5A712]/15 border border-[#F5E1A4] dark:border-[#E5A712]/30 rounded-xl px-3 py-2 text-xs font-semibold text-[#855D00] dark:text-[#F5C242] flex items-center justify-between">
          <span className="flex items-center gap-1.5 truncate">
            <i className="fa-solid fa-book-open text-[#912338] dark:text-[#E5A712] text-xs"></i>
            {course}
          </span>
          <i className="fa-solid fa-lock text-slate-400 dark:text-slate-500 text-xs shrink-0" title="Course is locked for this conversation"></i>
        </div>
      ) : (
        <select
          className="w-full bg-white dark:bg-[#1F1215] text-slate-800 dark:text-slate-200 border border-[#E5DDD4] dark:border-[#331C21] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#912338]/50 cursor-pointer shadow-sm"
          onChange={onChange}
          value={course}
        >
          {Object.values(Course).map((option) => (
            <option key={option} value={option} className="bg-white dark:bg-[#180D10] text-slate-800 dark:text-slate-100">
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
            ? 'bg-[#912338]/10 dark:bg-[#912338]/25 text-[#912338] dark:text-[#FFB3C0] border border-[#912338]/20 dark:border-[#912338]/40 shadow-sm' 
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-[#912338]/5 dark:hover:bg-[#912338]/15 border border-transparent'
        }`} 
        onClick={handleClick} 
        data-testid="thread"
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <i className={`fa-regular fa-message text-xs shrink-0 ${isSelected ? 'text-[#912338] dark:text-[#F5C242]' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400'}`}></i>
          <p className="truncate m-0 text-xs font-medium text-slate-800 dark:text-slate-200 flex-1" title={props.title} data-testid={props.title}>{props.title}</p>
        </div>
        {props.course && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FFF8E6] dark:bg-[#E5A712]/15 text-[#855D00] dark:text-[#F5C242] border border-[#F5E1A4] dark:border-[#E5A712]/30 shrink-0">
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
        <div className="inline-block w-5 h-5 border-2 border-[#912338]/30 border-t-[#912338] rounded-full animate-spin mb-2"></div>
        <p className="text-xs text-slate-500 italic">Loading conversations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-3 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 text-xs text-center">
        Error fetching conversations. Try again later.
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="px-3 py-6 text-center text-slate-500 text-xs leading-relaxed">
        No previous chats.<br/>Click <span className="text-[#912338] dark:text-[#F5C242] font-medium">"New Conversation"</span> to start.
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="px-3 py-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Recent Chats</span>
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
      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#EFE8E1]/80 dark:bg-[#1F1215]/80 hover:bg-[#E5DDD4] dark:hover:bg-[#2B171B] border border-[#E5DDD4] dark:border-[#331C21] text-slate-600 dark:text-slate-400 hover:text-[#912338] dark:hover:text-[#F5C242] text-xs leading-snug transition-all no-underline group" 
      href="https://www.concordia.ca/students/success/learning-support/math-help.html"
      target='_blank'
      rel="noreferrer"
      title="Student Success Center Math Help">
      <i className="fa-solid fa-graduation-cap text-[#912338] dark:text-[#E5A712] text-sm group-hover:scale-110 transition-transform shrink-0"></i>
      <span>Concordia Student Success Center Math Support</span>
    </a>
  )
}
