import { useState } from 'react'
import { Course } from '../../types/options'
import './Modal.css'
import { useChatSettings } from '../../context/useChatContext';
import { useNavigate } from 'react-router-dom';

function Modal() {

  const {
  } = useChatSettings()
  const [showCourseSelect, setShowCourseSelect] = useState(true)

  // TODO: Add "unspecified" option to course and don't allow closing the course modal
  // if unspecified is selected
  // This shouldn't be done until either more courses are added or rapid testing of the UI is not required anymore
  const { 
    setCourse,
    disclaimerAccepted, setDisclaimerAccepted
  } = useChatSettings();


  const navigate = useNavigate()

  const navigateToChat = () => {
    navigate("/chat")
  }


  /* The course-select select box can be changed to its own function/component if the sidebar version
   * should look identical to this modal version */
  const courseSelectModal = () => {
    const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      setCourse(event.target.value as Course)
    }

    return (
      <>
	<div className="course-modal">
	  <div className="course-modal-content">
	    <p className="modal-text">Select the course you are taking</p>
	    <select className="interactive select-box" onChange={onChange}> 
	      {Object.values(Course).map((option) => (
		<option key={option} value={option}>
		  {option}
		</option>
	      ))}
	    </select>
	    <button onClick={() => {
	      setShowCourseSelect(false)
	      navigateToChat()
	    }} className="interactive modal-close-button">Done</button>

	  </div>
	</div>
      </>
    )}


  const disclaimerModal = () => {
    return (
      <>
	<div id="DisclaimerModal" className="type-modal">
	  <div className="disclaimer-modal-content">
	    <span className="modal-text">
	      <h2>
		Disclaimer
	      </h2>

	      <p> 
		This bot is designed to assist Concordia University students in understanding basic Calculus concepts, solving problems, and enhancing their learning experience. This bot is not to replace lectures, classes, or group projects. 
	      </p>

	      <p> 
		By using this tool, you agree to the following:
	      </p>

	      <ol>
		<li>
		  Accuracy: Gen AI can make mistakes. It is the student's responsibility to double check any answers they are given.
		</li>

		<li>
		  Academic Integrity: Plagiarism, including submitting work that is generated or assisted by AI tools as your own without proper understanding or citation, is a violation of academic integrity policies. Always adhere to your professor's guidelines as per how and to what extent Gen AI can be used in your studies.
		</li>


	      </ol>
	      By continuing to use this tool, you acknowledge that you are using it ethically and responsibly to enhance your understanding of the material, while upholding academic honesty and integrity.

	    </span>
	    <button onClick={() => {
	      setDisclaimerAccepted(true)
	    }} className="interactive modal-close-button disclaimer-button">I Accept</button>

	  </div>
	</div>
      </>
    )
  }


  if (!disclaimerAccepted) return disclaimerModal()
  if (showCourseSelect) return courseSelectModal()

  return (<></>)
}

export default Modal
