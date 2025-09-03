import './Sidebar.css'
import { useEffect } from 'react'
import { useChatSettings } from '../../context/useChatContext';
import { Attribution, CourseSelect, LogoutText, NewConversation, NewConversationText, SidebarButtons, Threads } from './Elements';


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
      { (sidebar) ?
        <div className="sidebar">
          <SidebarButtons/>
          <div className="options">
            <LogoutText/>
            <NewConversationText/>
          </div>
          <hr className="sidebar-hr thread-top"/>
          <Threads/>
          <hr className="sidebar-hr thread-bottom"/>
          <Attribution/>
        </div>
        : 
        <div className="hidden-sidebar">
          <SidebarButtons/>
        </div>
      }
    </>
  )
}

export default Sidebar
