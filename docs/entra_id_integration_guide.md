# Microsoft Entra ID Authentication - Integration Guide

This guide shows how to integrate Microsoft Entra ID authentication into your existing mathChat application.

## Quick Start

### 1. Install Dependencies

Backend (already included in requirements.txt):
```bash
pip install -r requirements.txt
```

Frontend:
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Copy `example.env` to your local environment file and update with your Azure AD credentials:

```env
ENTRA_ID_TENANT_ID=<your-tenant-id>
ENTRA_ID_CLIENT_ID=<your-app-id>
ENTRA_ID_CLIENT_SECRET=<your-client-secret>
ENTRA_ID_REDIRECT_URI=http://localhost:3000/auth/callback
ENTRA_ID_LOGOUT_REDIRECT_URI=http://localhost:3000
```

### 3. Frontend Setup

#### Update `frontend/src/main.tsx`

Add the EntraIDProvider wrapper:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { EntraIDProvider } from './context/useEntraID'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EntraIDProvider enabled={true}>
      <App />
    </EntraIDProvider>
  </React.StrictMode>,
)
```

#### Create Login Component

Create `frontend/src/components/Auth/LoginOptions.tsx`:

```typescript
import { useEntraID } from '../../context/useEntraID'
import './LoginOptions.css'

export function LoginOptions() {
  const { isAuthenticated, user, login, logout, loading } = useEntraID()

  if (loading) {
    return <div className="login-container">Loading authentication...</div>
  }

  if (isAuthenticated) {
    return (
      <div className="login-container">
        <div className="user-info">
          <p>Welcome, {user?.name || user?.email}!</p>
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <p>Please log in to continue</p>
      <button onClick={login} className="btn-microsoft">
        Sign in with Microsoft
      </button>
    </div>
  )
}
```

#### Create Auth Callback Page

Create `frontend/src/pages/AuthCallback.tsx`:

```typescript
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')

        if (code && state) {
          // The EntraIDProvider will handle token exchange
          // Just redirect to home after a brief delay
          setTimeout(() => {
            navigate('/')
          }, 1000)
        } else {
          setError('Missing authorization code or state')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Authentication failed'
        setError(message)
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Authentication Error</h1>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Return Home</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Processing login...</h1>
      <p>Please wait while we complete your authentication.</p>
    </div>
  )
}
```

#### Update App Routes

Update `frontend/src/App.tsx` to include the auth callback route:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthCallback } from './pages/AuthCallback'
import { Chat } from './components/Chat/Chat'
import { LoginOptions } from './components/Auth/LoginOptions'
import { useEntraID } from './context/useEntraID'

function App() {
  const { isAuthenticated, loading } = useEntraID()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!isAuthenticated) {
    return <LoginOptions />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<Chat />} />
        {/* Other routes */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

### 4. Update API Calls

Use the `useApi` hook instead of direct fetch:

```typescript
import { useApi } from '../hooks/useApi'

function ConversationList() {
  const api = useApi()

  const fetchConversations = async () => {
    try {
      const response = await api.get('/api/conversations')
      // Token is automatically included
      console.log(response.data)
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    }
  }

  return <>...</>
}
```

### 5. Backend Routes

Protected routes automatically work with `@require_auth` decorator:

```python
from flask import Blueprint, jsonify, g
from app.auth import require_auth

bp = Blueprint('my_api', __name__)

@bp.route('/protected-resource', methods=['GET'])
@require_auth
def get_protected_resource():
    """User must be authenticated to access this"""
    user_id = g.user_id
    auth_provider = g.auth_provider  # 'entra_id'
    
    return jsonify({
        'message': f'Hello {user_id} (authenticated via {auth_provider})',
        'user': g.user
    })
```

## File Structure

New files created:

```
app/
  entra_id_auth.py              # Entra ID token validation
  routes/
    entra_id.py                 # OAuth2 endpoints

frontend/
  src/
    context/
      useEntraID.tsx            # Auth context provider
    hooks/
      useApi.ts                 # Authenticated API client
    pages/
      AuthCallback.tsx          # OAuth callback page
    components/
      Auth/
        LoginOptions.tsx        # Login UI

docs/
  entra_id_authentication.md    # Complete setup guide

Updated files:
  app/auth.py                   # Support both providers
  app/config.py                 # Entra ID configuration
  app/__init__.py               # Initialize Entra ID
  requirements.txt              # Add Python dependencies
  frontend/package.json         # Add MSAL packages
  development.env               # Entra ID configuration
  example.env                   # Entra ID examples
```

## Styling for Auth Components

Create `frontend/src/components/Auth/LoginOptions.css`:

```css
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.user-info {
  background: rgba(255, 255, 255, 0.1);
  padding: 40px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  text-align: center;
}

.btn-microsoft,
.btn-logout {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s;
  margin-top: 20px;
}

.btn-microsoft:hover,
.btn-logout:hover {
  transform: scale(1.05);
}

.btn-logout {
  background: rgba(255, 255, 255, 0.3);
}
```

## Testing the Integration

### 1. Test Backend Entra ID Config Endpoint

```bash
curl http://localhost:5000/api/auth/entra/config
```

Expected response:
```json
{
  "tenant_id": "your-tenant-id",
  "client_id": "your-client-id",
  "redirect_uri": "http://localhost:3000/auth/callback",
  "authority": "https://login.microsoftonline.com/your-tenant-id"
}
```

### 2. Test Protected Endpoint

```bash
curl -H "Authorization: Bearer your_token" \
  http://localhost:5000/api/protected-resource
```

### 3. Test Frontend Login

1. Navigate to `http://localhost:3000`
2. Click "Sign in with Microsoft"
3. Complete the Entra ID login flow
4. Verify you're redirected back to the app

## Environment-Specific Configuration

### Development

```env
ENTRA_ID_REDIRECT_URI=http://localhost:3000/auth/callback
```

### Staging

```env
ENTRA_ID_REDIRECT_URI=https://staging.yourdomain.com/auth/callback
```

### Production

```env
ENTRA_ID_REDIRECT_URI=https://yourdomain.com/auth/callback
ENTRA_ID_LOGOUT_REDIRECT_URI=https://yourdomain.com
```

## Common Issues

### CORS Errors

If you see CORS errors, make sure:
1. Backend has CORS enabled: Check `Flask-Cors` configuration in `app/__init__.py`
2. Redirect URIs match exactly in Azure AD and code

### Token Not in Request

If tokens aren't being sent to backend:
1. Check browser DevTools → Application → Session Storage for `entra_id_token`
2. Verify `useApi` hook is being used
3. Check Network tab to see Authorization header

### Login Loop

If stuck in login loop:
1. Clear browser cookies and session storage
2. Check token expiration
3. Verify Azure AD app configuration

## Next Steps

1. [Complete Entra ID Setup](./entra_id_authentication.md)
2. Configure group-based access control
3. Set up multi-tenant support if needed
4. Deploy to production with HTTPS
