import { createContext, ReactNode, useContext, useState } from "react";
import { Course } from "../types/options";

interface ChatSettingsContextType {
  course: Course
  setCourse: (c: Course) => void
  sidebar: boolean
  setSidebar: (s: boolean) => void
  smallScreen: boolean
  setSmallScreen: (s: boolean) => void
  disclaimerAccepted: boolean
  setDisclaimerAccepted: (s: boolean) => void
}

const ChatSettingsContext = createContext<ChatSettingsContextType | undefined>(undefined)


export function ChatSettingsProvider({ children }: { children: ReactNode }) {
  const [course, setCourse] = useState<Course>(Course.MATH203);
  const [sidebar, setSidebar] = useState<boolean>(true);
  const [smallScreen, setSmallScreen] = useState<boolean>(true);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(false);

  return (
    <ChatSettingsContext.Provider
      value={{
        course, setCourse,
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

