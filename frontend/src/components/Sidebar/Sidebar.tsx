import './Sidebar.css'
import { useEffect } from 'react'
import { useChatSettings } from '../../context/useChatContext';
import { Attribution, CourseSelect, SidebarButtons, Threads } from './Elements';


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
          <hr className="sidebar-hr"/>
          <div className="options">
            <CourseSelect/>
          </div>
          <hr className="sidebar-hr"/>
          <Threads/>
          <hr className="sidebar-hr"/>
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
