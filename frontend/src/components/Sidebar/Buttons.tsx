import { Course, DetailLevel, QuestionType } from '../../types/options'
import './Sidebar.css'
import React from 'react'
import { useChatSettings } from '../../context/useChatContext';
import { useThreadSelectionContext } from '../../context/useThreadContext';
import { useLocation, useNavigate } from 'react-router-dom';

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
            <OpenThreadsButton/>
            <NewConversationButton/>
          </> :
          <>
            <SidebarButton/>
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
      <h3 className="sidebar-input-header">Course</h3>

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
