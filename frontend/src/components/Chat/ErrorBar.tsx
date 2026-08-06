import './ErrorBar.css'

type ErrorBarProps = {
  message: string,
}
const ErrorBar : React.FC<ErrorBarProps> = (props: ErrorBarProps) => {
  return (
    <div className="w-full bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 mb-4 backdrop-blur-md shadow-lg flex items-center justify-between gap-4 animate-in fade-in">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
          <i className="fa-solid fa-triangle-exclamation text-base"></i>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-rose-200 m-0">An error occurred</h4>
          <p className="text-xs text-rose-300/80 font-mono mt-0.5 m-0">{`\{ ${props.message} \}`}</p>
        </div>
      </div>
    </div>
  )
}

export default ErrorBar
