import { createContext, ReactNode, useContext, useState } from "react";
import { QuestionType, Course, DetailLevel } from "../types/options";

interface ChatSettingsContextType {
  question: QuestionType | null
  setQuestion: (q: QuestionType | null) => void
  course: Course
  setCourse: (c: Course) => void
  detailLevel: DetailLevel
  setDetailLevel: (d: DetailLevel) => void
  sidebar: boolean
  setSidebar: (s: boolean) => void
  smallScreen: boolean
  setSmallScreen: (s: boolean) => void
  disclaimerAccepted: boolean
  setDisclaimerAccepted: (s: boolean) => void
}

const ChatSettingsContext = createContext<ChatSettingsContextType | undefined>(undefined)


export function ChatSettingsProvider({ children }: { children: ReactNode }) {
  const [question, setQuestion] = useState<QuestionType | null>(null);
  const [course, setCourse] = useState<Course>(Course.MATH203);
  const [detailLevel, setDetailLevel] = useState<DetailLevel>(DetailLevel.DETAILED);
  const [sidebar, setSidebar] = useState<boolean>(true);
  const [smallScreen, setSmallScreen] = useState<boolean>(true);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(false);

  return (
    <ChatSettingsContext.Provider
      value={{
        question, setQuestion,
        course, setCourse,
        detailLevel, setDetailLevel,
        sidebar, setSidebar,
        smallScreen, setSmallScreen,
        disclaimerAccepted, setDisclaimerAccepted
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

