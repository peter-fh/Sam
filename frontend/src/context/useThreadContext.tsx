import { createContext, ReactNode, useContext, useState } from "react";

interface ThreadSelectionContextType {
  selectedThread: number | null
  setSelectedThread: (t: number | null) => void
}

const ThreadSelectionContext = createContext<ThreadSelectionContextType | undefined>(undefined)


export function ThreadSelectionProvider({children }: {children: ReactNode}) {
  const [selectedThread, setSelectedThread] = useState<number | null>(null)
  return (
    <ThreadSelectionContext.Provider
      value={{
        selectedThread, setSelectedThread,
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

