from typing import Any
from flask import g, jsonify, request, current_app
from functools import wraps
import logging

from app.entra_id_auth import EntraIDTokenValidator

logger = logging.getLogger(__name__)


def _validate_entra_id_token(token: str) -> tuple[bool, dict[str, Any] | None, str]:
    """Validate token with Microsoft Entra ID
    
    Returns:
        (is_valid, user_info, error_message)
    """
    entra_validator = current_app.extensions.get("entra_id_validator")
    if not entra_validator:
        return False, None, "Entra ID not configured"
    
    try:
        token_claims = entra_validator.validate_token(token)
        
        # Check group membership if configured
        if not entra_validator.validate_group_membership(token_claims):
            return False, None, "User is not a member of an allowed group"
        
        user_info = entra_validator.get_user_info(token_claims)
        user_info["auth_provider"] = "entra_id"
        return True, user_info, ""
        
    except ValueError as e:
        logger.debug(f"Entra ID token validation failed: {e}")
        return False, None, str(e)
    except Exception as e:
        logger.error(f"Unexpected error validating Entra ID token: {e}")
        return False, None, "Token validation failed"


def require_auth(f: Any):
    """Decorator to require authentication for routes
    
    Requires Microsoft Entra ID authentication
    """
    @wraps(f)
    def decorated_function(*args: Any, **kwargs: Any):
        # Check for mock auth during testing
        if current_app.config.get("MOCK_AUTH"):
            mock_user_id = "00000000-0000-0000-0000-000000000001"
            g.user = {"id": mock_user_id, "email": "mock@example.com"}
            g.user_id = mock_user_id
            g.auth_provider = "entra_id"
            return f(*args, **kwargs)
        
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization header required'}), 401
        
        token = auth_header.split(' ')[1]
        
        # Validate Entra ID token
        entra_validator = current_app.extensions.get("entra_id_validator")
        if not entra_validator:
            return jsonify({'error': 'Entra ID authentication not configured'}), 500
        
        is_valid, user_info, error_msg = _validate_entra_id_token(token)
        if is_valid and user_info:
            g.user = user_info
            g.user_id = user_info.get("id")
            g.auth_provider = "entra_id"
            return f(*args, **kwargs)
        
        # Authentication failed
        return jsonify({'error': error_msg or 'Unauthorized'}), 401
    
    return decorated_function
