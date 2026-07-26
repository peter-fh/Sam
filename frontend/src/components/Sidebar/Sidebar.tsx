import './Sidebar.css'
import { useEffect } from 'react'
import { useChatSettings } from '../../context/useChatContext';
import { Attribution, LogoutText, NewConversationText, SidebarButtons, ThemeToggle, Threads } from './Elements';

function Sidebar() {
  const { 
    sidebar, setSidebar, 
    smallScreen, setSmallScreen,
  } = useChatSettings()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 900) {
        setSmallScreen(true); 
        setSidebar(false)
      } else {
        if (smallScreen) {
          setSidebar(true)
        }
        setSmallScreen(false)
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [smallScreen]);

  return (
    <>
      { sidebar && (
        <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white/95 dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800/80 backdrop-blur-xl z-40 flex flex-col justify-between transition-all duration-300 shadow-2xl">
          <div className="flex flex-col h-full overflow-hidden">
            <SidebarButtons/>
            <div className="px-3 pt-3 pb-1 space-y-1.5">
              <NewConversationText/>
              <ThemeToggle/>
              <LogoutText/>
            </div>
            <div className="my-2 px-4">
              <div className="h-px bg-slate-200 dark:bg-slate-800/80 w-full"></div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 min-h-0">
              <Threads/>
            </div>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
              <Attribution/>
            </div>
          </div>
        </aside>
      )}
    </>
  )
}

export default Sidebar
