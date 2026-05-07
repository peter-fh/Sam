import os
from dotenv import load_dotenv

_ = load_dotenv(override=True)

class Config:
    FLASK_ENV: str= os.getenv("FLASK_ENV", "production")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    OPENROUTER_API_KEY: str =os.getenv("OPENROUTER_API_KEY", "")

    # Microsoft Entra ID Configuration
    ENTRA_ID_TENANT_ID: str = os.getenv("ENTRA_ID_TENANT_ID", "")
    ENTRA_ID_CLIENT_ID: str = os.getenv("ENTRA_ID_CLIENT_ID", "")
    ENTRA_ID_CLIENT_SECRET: str = os.getenv("ENTRA_ID_CLIENT_SECRET", "")
    ENTRA_ID_REDIRECT_URI: str = os.getenv("ENTRA_ID_REDIRECT_URI", "http://localhost:3000/auth/callback")
    ENTRA_ID_LOGOUT_REDIRECT_URI: str = os.getenv("ENTRA_ID_LOGOUT_REDIRECT_URI", "http://localhost:3000")
    ENTRA_ID_ALLOWED_GROUPS: list[str] = os.getenv("ENTRA_ID_ALLOWED_GROUPS", "").split(",") if os.getenv("ENTRA_ID_ALLOWED_GROUPS") else []

    _mock_mode: bool = False
    _mock_env: str = os.getenv("MOCK_MODE", "false")
    if _mock_env.lower() == "true":
        _mock_mode = True
    MOCK_MODE: bool = _mock_mode

    CONVERSATION_MAX_TOKENS: int = 25000


