import { useState } from 'react'
import { Course } from '../../types/options'
import './Modal.css'
import { useChatSettings } from '../../context/useChatContext';
import { useNavigate } from 'react-router-dom';

function Modal() {
  const [showCourseSelect, setShowCourseSelect] = useState(true)

  const { 
    setCourse,
    disclaimerAccepted, setDisclaimerAccepted
  } = useChatSettings();

  const navigate = useNavigate()

  const navigateToChat = () => {
    navigate("/chat")
  }

  const courseSelectModal = () => {
    const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      setCourse(event.target.value as Course)
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md transition-all duration-300" data-testid="course-modal">
        <div className="w-full max-w-md bg-zinc-900/95 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700/80 text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
            <i className="fa-solid fa-book-open text-xl"></i>
          </div>
          <h2 className="text-xl font-bold text-zinc-100 mb-2 no-underline">Select Your Course</h2>
          <p className="text-zinc-400 text-sm mb-6">Choose your Concordia course so Sam can provide tailored assistance.</p>
          
          <div className="w-full mb-6">
            <select 
              className="w-full bg-zinc-800/90 text-zinc-100 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-zinc-600 transition-all cursor-pointer text-center font-medium shadow-sm" 
              onChange={onChange}
            > 
              {Object.values(Course).map((option) => (
                <option key={option} value={option} className="bg-zinc-900 text-zinc-100">
                  {option}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => {
              setShowCourseSelect(false)
              navigateToChat()
            }} 
            className="w-full py-3 px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/80 font-semibold rounded-xl shadow-md active:scale-[0.98] transition-all cursor-pointer"
          >
            Continue to Chat
          </button>
        </div>
      </div>
    )
  }

  const disclaimerModal = () => {
    return (
      <div id="DisclaimerModal" className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/85 backdrop-blur-md overflow-y-auto" data-testid="disclaimer-modal">
        <div className="w-full max-w-2xl my-auto bg-zinc-900/95 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col text-zinc-200 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-800">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/80 text-amber-400 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-shield-halved text-lg"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100 no-underline">Disclaimer & Ethical Use</h2>
              <p className="text-xs text-zinc-400">Concordia Sam AI Tutoring Assistant</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-zinc-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
            <p>
              This bot is designed to assist Concordia University students in understanding basic Calculus concepts, solving problems, and enhancing their learning experience. This bot is not to replace lectures, classes, or group projects. 
            </p>

            <p className="font-semibold text-zinc-200">
              By using this tool, you agree to the following:
            </p>

            <ol className="list-decimal pl-5 space-y-3 marker:text-zinc-400 marker:font-semibold">
              <li className="pl-1">
                <span className="font-semibold text-zinc-200">Accuracy:</span> Gen AI can make mistakes. It is the student's responsibility to double check any answers they are given.
              </li>
              <li className="pl-1">
                <span className="font-semibold text-zinc-200">Academic Integrity:</span> Plagiarism, including submitting work that is generated or assisted by AI tools as your own without proper understanding or citation, is a violation of academic integrity policies. Always adhere to your professor's guidelines as per how and to what extent Gen AI can be used in your studies.
              </li>
            </ol>

            <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-zinc-300 text-xs leading-normal">
              By continuing to use this tool, you acknowledge that you are using it ethically and responsibly to enhance your understanding of the material, while upholding academic honesty and integrity.
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
            <button 
              onClick={() => {
                setDisclaimerAccepted(true)
              }} 
              className="w-full sm:w-auto px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/80 font-semibold rounded-xl shadow-md active:scale-[0.98] transition-all cursor-pointer"
            >
              I Accept & Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!disclaimerAccepted) return disclaimerModal()
  if (showCourseSelect) return courseSelectModal()

  return (<></>)
}

export default Modal
