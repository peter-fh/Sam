import './ErrorBar.css'

type ErrorBarProps = {
  message: string,
}
const ErrorBar : React.FC<ErrorBarProps> = (props: ErrorBarProps) => {
  return (
    <div className="error-container">
      <div className="error-content-container">
        <i 
          className="fa-solid fa-triangle-exclamation" 
          style={{
            color: "rgb(255, 59, 59)"
          }}>
        </i>
        <p className="error-message"> An error occurred </p>
        <p className="error-description"> {`\{ ${props.message} \}`}</p>
      </div>
    </div>
  )
}

export default ErrorBar
