import { createContext, ReactNode, useContext, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

interface ThreadSelectionContextType {
  currentThread: number | null
  setCurrentThread: (t: number | null) => void
  threadsOpen: boolean
  setThreadsOpen: (o: boolean) => void
  threadKey: string
  setThreadKey: (k: string) => void
}

const ThreadSelectionContext = createContext<ThreadSelectionContextType | undefined>(undefined)


export function ThreadSelectionProvider({children }: {children: ReactNode}) {
  const [currentThread, setCurrentThread] = useState<number | null>(null)
  const [threadsOpen, setThreadsOpen] = useState<boolean>(false)
  const [threadKey, setThreadKey] = useState<string>(() => uuidv4())
  return (
    <ThreadSelectionContext.Provider
      value={{
        currentThread, setCurrentThread,
        threadsOpen, setThreadsOpen,
        threadKey, setThreadKey
      }}
    >
      {children}
    </ThreadSelectionContext.Provider>
  );
}

// Custom hook to use the context
export function useThreadSelectionContext() {
  const context = useContext(ThreadSelectionContext);
  if (!context) {
    throw new Error("useThreadSelectionContext must be used within a ThreadSelectionContext provider");
  }
  return context;
}

