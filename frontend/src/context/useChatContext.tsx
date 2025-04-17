import { createContext, ReactNode, useContext, useState } from "react";
import { QuestionType, Course, DetailLevel } from "../types/options";

interface ChatSettingsContextType {
  question: QuestionType
  setQuestion: (q: QuestionType) => void
  course: Course
  setCourse: (c: Course) => void
  detailLevel: DetailLevel
  setDetailLevel: (d: DetailLevel) => void
  chatLoaded: boolean
  setChatLoaded: (c: boolean) => void
  save: boolean
  setSave: (s: boolean) => void
  sidebar: boolean
  setSidebar: (s: boolean) => void
  smallScreen: boolean
  setSmallScreen: (s: boolean) => void
  colorScheme: string
  setColorScheme: (s: string) => void
  startNewConversation: boolean
  setStartNewConversation: (s: boolean) => void
}

const ChatSettingsContext = createContext<ChatSettingsContextType | undefined>(undefined)


export function ChatSettingsProvider({ children }: { children: ReactNode }) {
  const [question, setQuestion] = useState<QuestionType>(QuestionType.CONCEPT);
  const [course, setCourse] = useState<Course>(Course.MATH203);
  const [detailLevel, setDetailLevel] = useState<DetailLevel>(DetailLevel.DETAILED);
  const [chatLoaded, setChatLoaded] = useState<boolean>(false);
  const [save, setSave] = useState<boolean>(false);
  const [sidebar, setSidebar] = useState<boolean>(true);
  const [smallScreen, setSmallScreen] = useState<boolean>(true);
  const [colorScheme, setColorScheme] = useState<string>("dark");
  const [startNewConversation, setStartNewConversation] = useState<boolean>(false);

  return (
    <ChatSettingsContext.Provider
      value={{
        question, setQuestion,
        course, setCourse,
        detailLevel, setDetailLevel,
        chatLoaded, setChatLoaded,
        save, setSave,
        sidebar, setSidebar,
        smallScreen, setSmallScreen,
        colorScheme, setColorScheme,
        startNewConversation, setStartNewConversation
      }}
    >
      {children}
    </ChatSettingsContext.Provider>
  );
}

// Custom hook to use the context
export function useChatSettings() {
  const context = useContext(ChatSettingsContext);
  if (!context) {
    throw new Error("useChatSettings must be used within a ChatSettingsProvider");
  }
  return context;
}

