# Microsoft Entra ID Authentication Setup

This guide explains how to configure and use Microsoft Entra ID (Azure AD) authentication in the mathChat application.

## Overview

The application now uses Microsoft Entra ID (Azure AD) for authentication. The system is designed to:

- Validate tokens from Microsoft Entra ID
- Provide OAuth2 authorization code flow
- Enforce group-based access control (optional)

## Architecture

### Backend Components

1. **`app/entra_id_auth.py`** - Core authentication module
   - `EntraIDConfig` - Configuration class for Entra ID settings
   - `EntraIDTokenValidator` - Validates and decodes JWT tokens
   - `EntraIDAuthFlow` - Handles OAuth2 authorization code flow

2. **`app/routes/entra_id.py`** - OAuth2 endpoints
   - `POST /api/auth/entra/login` - Initiate login
   - `POST /api/auth/entra/callback` - Handle OAuth2 callback
   - `POST /api/auth/entra/token-validate` - Validate token
   - `GET /api/auth/entra/config` - Get public configuration
   - `POST /api/auth/entra/logout` - Logout

3. **`app/auth.py`** - Authentication decorator
   - Validates Entra ID tokens

### Frontend Components

1. **`frontend/src/context/useEntraID.tsx`** - Auth context provider
   - Initializes MSAL (Microsoft Authentication Library)
   - Manages authentication state
   - Provides login/logout functionality

2. **`frontend/src/hooks/useApi.ts`** - API client hook
   - Axios-based HTTP client
   - Automatically includes auth tokens in requests
   - Handles 401 responses by redirecting to login

## Azure AD Setup

### Step 1: Create Application Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure AD** → **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: MathChat
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: Web - `http://localhost:3000/auth/callback` (for development)

### Step 2: Generate Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Copy the secret value (save it securely)

### Step 3: Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission** → **Microsoft Graph**
3. Select **Delegated permissions**
4. Add:
   - `openid`
   - `profile`
   - `email`
   - `User.Read`
5. Click **Grant admin consent**

### Step 4: Configure Token Claims

1. Go to **Token configuration**
2. Click **Add optional claim**
3. Select **ID** token type
4. Add:
   - `email`
   - `name`
   - `given_name`
   - `family_name`
   - `groups`
5. Click **Add**

### Step 5: Group Configuration (Optional)

For group-based access control:

1. Go to **Token configuration**
2. Click **Add groups claim**
3. Select **Security groups** and **Distribution groups**
4. Click **Add**

## Environment Configuration

### Development Environment

Edit `development.env` and add Entra ID settings:

```env
ENTRA_ID_TENANT_ID=your_tenant_id
ENTRA_ID_CLIENT_ID=your_application_id
ENTRA_ID_CLIENT_SECRET=your_client_secret
ENTRA_ID_REDIRECT_URI=http://localhost:3000/auth/callback
ENTRA_ID_LOGOUT_REDIRECT_URI=http://localhost:3000
# Optional: restrict access to specific groups
ENTRA_ID_ALLOWED_GROUPS=group_id_1,group_id_2
```

### Production Environment

Set these environment variables in your deployment:

```env
ENTRA_ID_TENANT_ID=<your_tenant_id>
ENTRA_ID_CLIENT_ID=<your_application_id>
ENTRA_ID_CLIENT_SECRET=<your_client_secret>
ENTRA_ID_REDIRECT_URI=https://yourdomain.com/auth/callback
ENTRA_ID_LOGOUT_REDIRECT_URI=https://yourdomain.com
```

### Finding Your Values

- **Tenant ID**: Azure Portal → Azure AD → Overview → Directory (tenant) ID
- **Application ID**: Azure Portal → App registration → Overview → Application (client) ID
- **Client Secret**: Azure Portal → App registration → Certificates & secrets

## Frontend Integration

### 1. Wrap App with Provider

In `frontend/src/main.tsx`:

```typescript
import { EntraIDProvider } from './context/useEntraID'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EntraIDProvider enabled={true}>
      <App />
    </EntraIDProvider>
  </React.StrictMode>,
)
```

### 2. Use Authentication in Components

```typescript
import { useEntraID } from '../context/useEntraID'

function LoginButton() {
  const { isAuthenticated, user, login, logout } = useEntraID()

  if (isAuthenticated) {
    return (
      <div>
        <p>Welcome, {user?.name}!</p>
        <button onClick={logout}>Logout</button>
      </div>
    )
  }

  return <button onClick={login}>Login with Microsoft</button>
}
```

### 3. Protect Routes

```typescript
import { useEntraID } from '../context/useEntraID'

function ProtectedComponent() {
  const { isAuthenticated, loading } = useEntraID()

  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please log in</div>

  return <div>Protected content</div>
}
```

## API Integration

The `useApi` hook automatically includes authentication tokens:

```typescript
import { useApi } from '../hooks/useApi'

function ChatComponent() {
  const api = useApi()

  const sendMessage = async (message: string) => {
    const response = await api.post('/api/chat', {
      id: conversationId,
      message: message,
    })
    // Token is automatically included in request header
  }

  return <>...</>
}
```

## Backend Token Validation

Protected routes use the `@require_auth` decorator:

```python
from app.auth import require_auth

@bp.route('/protected', methods=['GET'])
@require_auth
def protected_route():
    # g.user contains user info
    # g.user_id contains user ID
    # g.auth_provider contains 'entra_id'
    return jsonify({'user_id': g.user_id})
```

The decorator automatically:
1. Checks for Bearer token in Authorization header
2. Validates the Entra ID token
3. Returns 401 if validation fails

## Testing

### Test Entra ID Token Validation

```bash
curl -X POST http://localhost:5000/api/auth/entra/token-validate \
  -H "Content-Type: application/json" \
  -d '{"token": "your_id_token"}'
```

### Test Protected Endpoint

```bash
curl -X GET http://localhost:5000/api/conversations \
  -H "Authorization: Bearer your_token"
```

## Troubleshooting

### Issue: "Entra ID not configured"

**Solution**: Verify environment variables are set:
```bash
echo $ENTRA_ID_TENANT_ID
echo $ENTRA_ID_CLIENT_ID
```

### Issue: Token validation fails with "invalid audience"

**Solution**: Ensure `ENTRA_ID_CLIENT_ID` matches the Application ID in Azure AD

### Issue: JWKS not found in cache

**Solution**: This is normal - the system fetches and caches the JWKS automatically. Check network connectivity to Azure endpoints.

### Issue: Group membership validation fails

**Solution**: 
- Verify user is member of the group
- Verify group IDs in `ENTRA_ID_ALLOWED_GROUPS` match Azure AD group IDs
- Ensure groups claim is included in token configuration

## Security Considerations

1. **Client Secret**: Never commit to version control. Use environment variables.
2. **Token Expiration**: Tokens expire; the system handles refresh via MSAL.
3. **HTTPS**: Always use HTTPS in production.
4. **CORS**: Configure CORS appropriately for your domain.
5. **Group-Based Access**: Use `ENTRA_ID_ALLOWED_GROUPS` to restrict access.

## Dependencies

### Backend
- `msal` - Microsoft Authentication Library for Python
- `azure-identity` - Azure identity management
- `PyJWT` - JWT token handling
- `requests` - HTTP client for JWKS retrieval

### Frontend
- `@azure/msal-browser` - MSAL for browser
- `@azure/msal-react` - MSAL React integration
- `axios` - HTTP client

Install with:
```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

## References

- [Microsoft Entra ID Documentation](https://learn.microsoft.com/en-us/azure/active-directory/)
- [MSAL Browser Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [OAuth2 Authorization Code Flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
