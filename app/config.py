import os
from dotenv import load_dotenv

_ = load_dotenv(override=True)

class Config:
    FLASK_ENV: str= os.getenv("FLASK_ENV", "production")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    OPENROUTER_API_KEY: str =os.getenv("OPENROUTER_API_KEY", "")

    _mock_mode: bool = False
    _mock_env: str = os.getenv("MOCK_MODE", "false")
    if _mock_env.lower() == "true":
        _mock_mode = True
    MOCK_MODE: bool = _mock_mode

    CONVERSATION_MAX_TOKENS: int = 5000

