import './Sidebar.css'
import { useEffect } from 'react'
import { useChatSettings } from '../../context/useChatContext';
import { Attribution, BrevitySelect, CourseSelect, SidebarButtons } from './Buttons';


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
            <CourseSelect/>
            <BrevitySelect/>
          </div>
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
