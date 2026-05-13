import { ReactNode } from 'react'
import { useEntraID } from '../context/useEntraID'
import './AuthGate.css'

interface AuthGateProps {
  children: ReactNode
}

function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, loading, login, error } = useEntraID()

  if (loading) {
    return (
      <main className="auth-gate" data-testid="auth-loading">
        <div className="auth-panel">
          <h1>Sam</h1>
          <p>Preparing secure sign in...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="auth-gate" data-testid="auth-gate">
        <div className="auth-panel">
          <h1>Sam</h1>
          <p>Sign in with your Concordia Microsoft account to continue.</p>
          {error && <p className="auth-error">{error}</p>}
          <button className="interactive auth-button" onClick={login}>
            Sign in
          </button>
        </div>
      </main>
    )
  }

  return <>{children}</>
}

export default AuthGate
