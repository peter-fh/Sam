import { Course, DetailLevel, QuestionType } from '../../types/options'
import './Elements.css'
import React from 'react'
import { useChatSettings } from '../../context/useChatContext';
import { useThreadSelectionContext } from '../../context/useThreadContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { DB } from "../../database/db"
import { useEffect, useState } from "react"
import supabase from '../../supabase.ts'

export function NewConversationButton() {

  const { 
    setQuestion 
  } = useChatSettings()

  const navigate = useNavigate()
  return (
    <button
      title="New Chat"
      className="interactive sidebar-button"
      onClick={() => {
        setQuestion(null)
        navigate("/")
      }}
    >
      {/* <i className="fa-solid fa-plus" /> */}
      <i className="fa-solid fa-pen-to-square" />
    </button>
  );
}

export function OpenThreadsButton() {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    selectedThread
  } = useThreadSelectionContext()

  return (
    <button
      title='Open Chat History'
      className="interactive sidebar-button"
      onClick={ () => {
        if (location.pathname.includes('/chat')) {
          navigate("/threads")
        } else {
          if (selectedThread) {
            navigate(`/chat/${selectedThread}`)
          } else {
            navigate("/chat")
          }
        }
      }}
    >
      <i className="fa-solid fa-comments"></i>
    </button>
  )
}

export function SidebarButton() {
  const {
    sidebar,
    setSidebar,
  } = useChatSettings()

  return (
    <button
      title='Toggle Sidebar'
      className="interactive sidebar-button"
      onClick={ () => setSidebar(!sidebar) }
    >
      {sidebar ? 
        <i className="fa-solid fa-bars-staggered"></i>
        :
        <i className="fa-solid fa-bars"></i>
      }
    </button>
  )
}

export function LogoutButton() {
  return (
    <button
      title='Toggle Sidebar'
      className="interactive sidebar-button"
      onClick={ () => supabase.auth.signOut() }
    >
      <i className="fa-solid fa-right-from-bracket"></i>
    </button>
  )
}


export function LogoutText() {
  return (
    <button
      title='Toggle Sidebar'
      className="interactive sidebar-text-button"
      onClick={ () => supabase.auth.signOut() }
    >
      <i className="fa-solid fa-right-from-bracket"></i>
      <p>Logout</p>
    </button>
  )
}

export function NewConversationText() {
  const { 
    setQuestion 
  } = useChatSettings()

  const navigate = useNavigate()
  return (
    <button
      title="New Chat"
      className="interactive sidebar-text-button"
      onClick={() => {
        setQuestion(null)
        navigate("/")
      }}
    >
      <i className="fa-solid fa-plus" />
      <p>New Conversation</p>
    </button>
  );
}


export function InvisibleButton() {
  return (
    <button className="invisible-button">
      <i className="fa-solid fa-download"/>
    </button>
  )
}


export function SidebarButtons() {
  const {
    sidebar,
  } = useChatSettings()

  return (
    <>
      <div className="sidebar-buttons">
        { sidebar ? 
          <>
            <SidebarButton/>
            <h1 className="sidebar-title">Sam</h1>
            <InvisibleButton/>
            <InvisibleButton/>
          </> :
          <>
            <SidebarButton/>
            <InvisibleButton/>
            <InvisibleButton/>
            <InvisibleButton/>
          </>
        }
      </div>
    </>
  )
}


export function CourseSelect() {
  const {
    course,
    setCourse,
  } = useChatSettings()

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCourse(event.target.value as Course)
  }

  return (
    <div className="option">

      <select
        className="interactive sidebar-select-box"
        onChange={onChange}
        value={course}
      >
        {Object.values(Course).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export function QuestionTypeSelect() {
  const {
    question,
    setQuestion,
  } = useChatSettings()

  return (
    <div className="option">
      <h3 className="sidebar-input-header">Question Type</h3>

      <span>
        {Object.values(QuestionType).map((option, index) => (
          <React.Fragment key={option}>
            <button
              key={option}
              onClick={() => setQuestion(option)}
              className={`select-box-option ${
question === option ? "active" : ""
}`}
            >
              {option}
            </button>
            {index < Object.values(QuestionType).length - 1
              ? "|"
              : ""}
          </React.Fragment>
        ))}
      </span>
    </div>
  );
}

export function NewConversation() {
  const { 
    setQuestion 
  } = useChatSettings()

  const navigate = useNavigate()
  return (
    <div className="option">
    <button
      title="New Chat"
      className="interactive new-conversation-button"
      onClick={() => {
        setQuestion(null)
        navigate("/")
      }}
    >
      {/* <i className="fa-solid fa-plus" /> */}
        <p>New Conversation</p>
    </button>
    </div>
  );
}

export function BrevitySelect() {
  const {
    detailLevel,
    setDetailLevel,
  } = useChatSettings()

  return (
    <div className="option">
      <h3 className='sidebar-input-header'>Level of Detail</h3>

      <span>
        {Object.values(DetailLevel).map((option, index) => (
          <React.Fragment key={option}>
            <button
              key={option}
              onClick={() => setDetailLevel(option)}
              className={`select-box-option ${
detailLevel === option ? "active" : ""
}`}
            >
              {option}
            </button>
            {index < Object.values(DetailLevel).length - 1 ? "|" : ""}
          </React.Fragment>
        ))}
      </span>
    </div>
  );
}

interface ConversationItem {
  title: string,
  id: number,
}
export function Threads() {

  const navigate = useNavigate()

  const {
    selectedThread,
    setSelectedThread,
  } = useThreadSelectionContext()

  const {
  } = useChatSettings()

  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  interface ClickableThreadProps {
    id: number,
    title: string,
  }

  function ClickableThread(props: ClickableThreadProps) {
    const handleClick = () => {
      navigate(`/chat/${props.id}`)
      setSelectedThread(props.id)
    }
    let current_classes = ""
    const thread_classes = "thread thread-list-item"
    const selected_thread_classes = "thread thread-list-item thread-selected"
    if (props.id == selectedThread) {
      current_classes = selected_thread_classes
    } else {
      current_classes = thread_classes
    }

    useEffect(() => {
      if (props.id == selectedThread) {
        current_classes = selected_thread_classes
      } else {
        current_classes = thread_classes
      }
    }, [selectedThread])

    return (
      <div className={current_classes} onClick={handleClick}>
        <p>{props.title}</p>
      </div>
    )
  }


  async function updateConversations() {
    setError(false)
    try {
      const conversation_data = await DB.getConversations()
      if (!conversation_data) {
        setLoading(false)
        return
      }

      const total_conversations = []
      for (const conversation of conversation_data) {
        const convo: ConversationItem = {
          title: conversation.title!,
          id: conversation.id!,
        }
        total_conversations.push(convo)
      }
      setConversations(total_conversations)
    } catch (e) {
      setError(true)
    } finally {
      setLoading(false)
    }
    
  }

  useEffect(() => {
    updateConversations()
  }, [selectedThread])

  if (loading) {
    return (
      <>
        <div className="threads-list">
          <i>
            Loading Conversations...
          </i>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="threads-list">
          <p>
            There was an error fetching previous conversations. Try again later.
          </p>
        </div>
      </>
    )
  }

  if (conversations.length == 0) {
    return (
      <>
        <div className="threads-list">
          <p>
            No previous chats. Click "New Chat" to start a conversation.
          </p>
        </div>
      </>
    )
  }
  return (
    <>
      <div className="threads">
        <ul className="threads-list">
          <p className="thread-list-item thread-title">Chats</p>
          {conversations.map((conversation) => (
            <ClickableThread key={conversation.id} id={conversation.id} title={conversation.title}/>
          ))}
        </ul>
      </div>
    </>
  )

}

export function Attribution() {
  return (
    <a 
      className="attribution" 
      href="https://www.concordia.ca/students/success/learning-support/math-help.html"
      target='_blank'
      title="robot icons">
      Get learning support for math-based courses via the Student Success Center
    </a>
  )
}
