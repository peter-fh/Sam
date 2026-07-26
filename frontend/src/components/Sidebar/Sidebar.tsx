import './Sidebar.css'
import { useEffect } from 'react'
import { useChatSettings } from '../../context/useChatContext';
import { Attribution, LogoutText, NewConversationText, SidebarButtons, Threads } from './Elements';

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
        <aside className="fixed left-0 top-0 bottom-0 w-72 bg-zinc-900/95 border-r border-zinc-800/80 backdrop-blur-xl z-40 flex flex-col justify-between transition-all duration-300 shadow-2xl">
          <div className="flex flex-col h-full overflow-hidden">
            <SidebarButtons/>
            <div className="px-3 pt-3 pb-1 space-y-1.5">
              <NewConversationText/>
              <LogoutText/>
            </div>
            <div className="my-2 px-4">
              <div className="h-px bg-zinc-800/80 w-full"></div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 min-h-0">
              <Threads/>
            </div>
            <div className="p-3 border-t border-zinc-800/80 bg-zinc-900/50">
              <Attribution/>
            </div>
          </div>
        </aside>
      )}
    </>
  )
}

export default Sidebar
