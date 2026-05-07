"""
Microsoft Entra ID OAuth2 Routes

Provides endpoints for OAuth2 authentication flow with Microsoft Entra ID
"""

from flask import Blueprint, request, jsonify, current_app, session, redirect, url_for
from app.entra_id_auth import EntraIDAuthFlow
import secrets
import logging

logger = logging.getLogger(__name__)

bp = Blueprint('entra_id', __name__, url_prefix='/api/auth/entra')


@bp.route('/login', methods=['GET'])
def login():
    """Initiate OAuth2 login flow"""
    auth_flow = current_app.extensions.get('entra_id_auth_flow')
    if not auth_flow:
        return jsonify({'error': 'Entra ID not configured'}), 500
    
    # Generate state for CSRF protection
    state = secrets.token_urlsafe(32)
    session['entra_oauth_state'] = state
    
    # Get the redirect URI from config or query parameter
    redirect_uri = request.args.get(
        'redirect_uri',
        current_app.config.get('ENTRA_ID_REDIRECT_URI', 'http://localhost:3000/auth/callback')
    )
    
    # Generate authorization URL
    auth_url = auth_flow.get_authorization_url(
        redirect_uri=redirect_uri,
        state=state,
    )
    
    return jsonify({'authorization_url': auth_url}), 200


@bp.route('/callback', methods=['POST'])
def callback():
    """Handle OAuth2 callback
    
    Expected JSON body:
    {
        "code": "<authorization_code>",
        "state": "<state_value>",
        "redirect_uri": "<redirect_uri_used>"
    }
    """
    auth_flow = current_app.extensions.get('entra_id_auth_flow')
    if not auth_flow:
        return jsonify({'error': 'Entra ID not configured'}), 500
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400
    
    code = data.get('code')
    state = data.get('state')
    redirect_uri = data.get('redirect_uri')
    
    if not all([code, state, redirect_uri]):
        return jsonify({'error': 'Missing required parameters: code, state, redirect_uri'}), 400
    
    # Validate state token (CSRF protection)
    stored_state = session.get('entra_oauth_state')
    if not stored_state or stored_state != state:
        logger.warning("CSRF token mismatch in Entra ID callback")
        return jsonify({'error': 'Invalid state token'}), 403
    
    try:
        # Exchange authorization code for tokens
        token_response = auth_flow.exchange_code_for_token(code, redirect_uri)
        
        # Validate the ID token
        id_token = token_response.get('id_token')
        if not id_token:
            return jsonify({'error': 'No ID token in response'}), 400
        
        token_claims = auth_flow.validator.validate_token(id_token)
        
        # Check group membership if configured
        if not auth_flow.validator.validate_group_membership(token_claims):
            return jsonify({'error': 'User is not a member of an allowed group'}), 403
        
        user_info = auth_flow.validator.get_user_info(token_claims)
        
        # Return tokens to frontend
        return jsonify({
            'access_token': token_response.get('access_token'),
            'id_token': id_token,
            'refresh_token': token_response.get('refresh_token'),
            'expires_in': token_response.get('expires_in'),
            'user': user_info,
        }), 200
        
    except ValueError as e:
        logger.error(f"Token validation failed: {e}")
        return jsonify({'error': f'Token validation failed: {str(e)}'}), 401
    except Exception as e:
        logger.error(f"Unexpected error in callback: {e}")
        return jsonify({'error': 'Authentication failed'}), 500


@bp.route('/token-validate', methods=['POST'])
def validate_token():
    """Validate an Entra ID token
    
    Expected JSON body:
    {
        "token": "<id_token>"
    }
    """
    auth_flow = current_app.extensions.get('entra_id_auth_flow')
    if not auth_flow:
        return jsonify({'error': 'Entra ID not configured'}), 500
    
    data = request.get_json()
    if not data or 'token' not in data:
        return jsonify({'error': 'Token required in request body'}), 400
    
    token = data.get('token')
    
    try:
        token_claims = auth_flow.validator.validate_token(token)
        user_info = auth_flow.validator.get_user_info(token_claims)
        
        return jsonify({
            'valid': True,
            'user': user_info,
        }), 200
        
    except ValueError as e:
        logger.debug(f"Token validation failed: {e}")
        return jsonify({
            'valid': False,
            'error': str(e),
        }), 401
    except Exception as e:
        logger.error(f"Token validation error: {e}")
        return jsonify({
            'valid': False,
            'error': 'Token validation failed',
        }), 500


@bp.route('/config', methods=['GET'])
def get_config():
    """Get public Entra ID configuration for frontend
    
    Returns configuration needed by MSAL (Microsoft Authentication Library)
    """
    config = {
        'tenant_id': current_app.config.get('ENTRA_ID_TENANT_ID'),
        'client_id': current_app.config.get('ENTRA_ID_CLIENT_ID'),
        'redirect_uri': current_app.config.get('ENTRA_ID_REDIRECT_URI', 'http://localhost:3000/auth/callback'),
        'authority': f"https://login.microsoftonline.com/{current_app.config.get('ENTRA_ID_TENANT_ID')}",
    }
    
    if not config.get('tenant_id') or not config.get('client_id'):
        return jsonify({'error': 'Entra ID not configured'}), 500
    
    return jsonify(config), 200


@bp.route('/logout', methods=['POST'])
def logout():
    """Clear session and provide logout URL"""
    # Clear any session data
    session.clear()
    
    tenant_id = current_app.config.get('ENTRA_ID_TENANT_ID')
    post_logout_redirect_uri = request.get_json().get(
        'redirect_uri',
        current_app.config.get('ENTRA_ID_LOGOUT_REDIRECT_URI', 'http://localhost:3000')
    )
    
    logout_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/logout?post_logout_redirect_uri={post_logout_redirect_uri}"
    
    return jsonify({
        'logout_url': logout_url,
        'message': 'Logged out successfully'
    }), 200
