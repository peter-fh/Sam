"""
Microsoft Entra ID (Azure AD) Authentication Module

This module provides token validation and user information retrieval
from Microsoft Entra ID OAuth2 tokens.
"""

import jwt
import requests
from typing import Dict, Any, Optional
from functools import lru_cache
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class EntraIDConfig:
    """Configuration for Microsoft Entra ID"""
    
    def __init__(
        self,
        tenant_id: str,
        client_id: str,
        client_secret: Optional[str] = None,
        allowed_app_ids: Optional[list[str]] = None,
        allowed_groups: Optional[list[str]] = None,
    ):
        self.tenant_id = tenant_id
        self.client_id = client_id
        self.client_secret = client_secret
        self.allowed_app_ids = allowed_app_ids or [client_id]
        self.allowed_groups = allowed_groups
        
        # Microsoft OIDC endpoints
        self.authority = f"https://login.microsoftonline.com/{tenant_id}"
        self.metadata_url = f"{self.authority}/v2.0/.well-known/openid-configuration"
        self.token_endpoint = f"{self.authority}/oauth2/v2.0/token"
        self.authorize_endpoint = f"{self.authority}/oauth2/v2.0/authorize"


class EntraIDTokenValidator:
    """Validates and parses Microsoft Entra ID tokens"""
    
    def __init__(self, config: EntraIDConfig):
        self.config = config
        self._jwks_cache = None
        self._jwks_expiry = None
        self.JWKS_CACHE_DURATION = timedelta(hours=24)
    
    @lru_cache(maxsize=1)
    def _get_jwks_uri(self) -> str:
        """Get the JWKS URI from OpenID Connect metadata"""
        try:
            response = requests.get(self.config.metadata_url, timeout=10)
            response.raise_for_status()
            metadata = response.json()
            return metadata.get("jwks_uri")
        except Exception as e:
            logger.error(f"Failed to get JWKS URI: {e}")
            raise
    
    def _get_jwks(self, force_refresh: bool = False) -> Dict[str, Any]:
        """Fetch and cache JWKS (JSON Web Key Set)"""
        now = datetime.utcnow()
        
        if (
            force_refresh
            or self._jwks_cache is None
            or self._jwks_expiry is None
            or now > self._jwks_expiry
        ):
            try:
                jwks_uri = self._get_jwks_uri()
                response = requests.get(jwks_uri, timeout=10)
                response.raise_for_status()
                self._jwks_cache = response.json()
                self._jwks_expiry = now + self.JWKS_CACHE_DURATION
                logger.info("JWKS cache refreshed")
            except Exception as e:
                logger.error(f"Failed to fetch JWKS: {e}")
                raise
        
        return self._jwks_cache
    
    def _get_signing_key(self, token_header: Dict[str, Any]) -> Dict[str, Any]:
        """Get the signing key from JWKS matching the token's kid"""
        kid = token_header.get("kid")
        
        if not kid:
            raise ValueError("Token header missing 'kid'")
        
        jwks = self._get_jwks()
        
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                return key
        
        # If key not found, try refreshing JWKS
        logger.warning(f"Signing key {kid} not found in cache, refreshing...")
        jwks = self._get_jwks(force_refresh=True)
        
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                return key
        
        raise ValueError(f"Unable to find signing key with kid: {kid}")
    
    def validate_token(self, token: str) -> Dict[str, Any]:
        """
        Validate and decode a Microsoft Entra ID token
        
        Args:
            token: The JWT token to validate
            
        Returns:
            Decoded token claims
            
        Raises:
            ValueError: If token is invalid
            jwt.InvalidTokenError: If JWT validation fails
        """
        try:
            # Decode without verification first to get header
            header = jwt.get_unverified_header(token)
            
            # Get the signing key
            signing_key = self._get_signing_key(header)
            public_key = jwt.PyJWK.from_dict(signing_key).key
            
            # Verify and decode the token
            decoded = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                audience=self.config.allowed_app_ids,
                issuer=f"{self.config.authority}/v2.0",
                options={"verify_exp": True}
            )
            
            return decoded
            
        except jwt.ExpiredSignatureError:
            raise ValueError("Token has expired")
        except jwt.InvalidAudienceError:
            raise ValueError("Token audience is invalid")
        except jwt.InvalidIssuerError:
            raise ValueError("Token issuer is invalid")
        except jwt.InvalidSignatureError:
            raise ValueError("Token signature is invalid")
        except jwt.DecodeError as e:
            raise ValueError(f"Failed to decode token: {e}")
        except Exception as e:
            logger.error(f"Token validation error: {e}")
            raise ValueError(f"Token validation failed: {e}")
    
    def get_user_info(self, token_claims: Dict[str, Any]) -> Dict[str, Any]:
        """Extract user information from token claims"""
        return {
            "id": token_claims.get("oid"),  # Object ID (user's unique identifier)
            "email": token_claims.get("preferred_username") or token_claims.get("email"),
            "name": token_claims.get("name"),
            "given_name": token_claims.get("given_name"),
            "family_name": token_claims.get("family_name"),
            "groups": token_claims.get("groups", []),
            "roles": token_claims.get("roles", []),
            "tenant_id": token_claims.get("tid"),
        }
    
    def validate_group_membership(self, token_claims: Dict[str, Any]) -> bool:
        """
        Validate if user belongs to allowed groups
        
        Returns True if no groups are specified in config (allow all)
        or if user belongs to at least one allowed group
        """
        if not self.config.allowed_groups:
            return True
        
        user_groups = token_claims.get("groups", [])
        return any(group in user_groups for group in self.config.allowed_groups)


class EntraIDAuthFlow:
    """Handles OAuth2 authorization code flow for Entra ID"""
    
    def __init__(self, config: EntraIDConfig):
        self.config = config
        self.validator = EntraIDTokenValidator(config)
    
    def get_authorization_url(
        self,
        redirect_uri: str,
        state: str,
        scopes: Optional[list[str]] = None,
    ) -> str:
        """Generate the authorization URL for user login"""
        if scopes is None:
            scopes = ["openid", "profile", "email"]
        
        params = {
            "client_id": self.config.client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": " ".join(scopes),
            "state": state,
        }
        
        query_string = "&".join(
            f"{key}={value}" for key, value in params.items()
        )
        return f"{self.config.authorize_endpoint}?{query_string}"
    
    def exchange_code_for_token(
        self,
        authorization_code: str,
        redirect_uri: str,
    ) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        if not self.config.client_secret:
            raise ValueError("client_secret required for token exchange")
        
        data = {
            "client_id": self.config.client_id,
            "client_secret": self.config.client_secret,
            "code": authorization_code,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
            "scope": "openid profile email",
        }
        
        try:
            response = requests.post(self.config.token_endpoint, data=data, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Token exchange failed: {e}")
            raise ValueError(f"Failed to exchange authorization code: {e}")
