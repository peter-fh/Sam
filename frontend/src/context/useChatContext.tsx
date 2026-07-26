import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Course } from "../types/options";

export type Theme = 'dark' | 'light';

export interface ChatSettingsContextType {
  course: Course
  setCourse: (c: Course) => void
  sidebar: boolean
  setSidebar: (s: boolean) => void
  smallScreen: boolean
  setSmallScreen: (s: boolean) => void
  disclaimerAccepted: boolean
  setDisclaimerAccepted: (s: boolean) => void
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}

export const ChatSettingsContext = createContext<ChatSettingsContextType | undefined>(undefined)

export function ChatSettingsProvider({ children }: { children: ReactNode }) {
  const [course, setCourse] = useState<Course>(Course.MATH203);
  const [sidebar, setSidebar] = useState<boolean>(true);
  const [smallScreen, setSmallScreen] = useState<boolean>(true);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(false);
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
    return 'dark'
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
  }, [theme])

  return (
    <ChatSettingsContext.Provider
      value={{
        course, setCourse,
        sidebar, setSidebar,
        smallScreen, setSmallScreen,
        disclaimerAccepted, setDisclaimerAccepted,
        theme, setTheme, toggleTheme
      }}
    >
      {children}
    </ChatSettingsContext.Provider>
  );
}

export function useChatSettings() {
  const context = useContext(ChatSettingsContext);
  if (!context) {
    throw new Error("useChatSettings must be used within a ChatSettingsProvider");
  }
  return context;
}
