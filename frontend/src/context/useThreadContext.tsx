import { createContext, ReactNode, useContext, useState } from "react";

interface ThreadSelectionContextType {
  currentThread: number | null
  setCurrentThread: (t: number | null) => void
  threadsOpen: boolean
  setThreadsOpen: (o: boolean) => void
  startingThread: number | null
  setStartingThread: (s: number | null) => void
}

const ThreadSelectionContext = createContext<ThreadSelectionContextType | undefined>(undefined)


export function ThreadSelectionProvider({children }: {children: ReactNode}) {
  const [currentThread, setCurrentThread] = useState<number | null>(null)
  const [startingThread, setStartingThread] = useState<number | null>(null)
  const [threadsOpen, setThreadsOpen] = useState<boolean>(false)
  return (
    <ThreadSelectionContext.Provider
      value={{
        currentThread, setCurrentThread,
        threadsOpen, setThreadsOpen,
        startingThread, setStartingThread,
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

