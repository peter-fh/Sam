from dotenv import load_dotenv
import os
from app import create_app

_ = load_dotenv(override=True)
SUPABASE_URL = os.getenv('LOCAL_SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('LOCAL_SUPABASE_ANON_KEY')
SUPABASE_SECRET_KEY = os.getenv('LOCAL_SUPABASE_SECRET_KEY')

app = create_app({
    'TESTING': True,
    'MOCK_MODE': True,
    'MOCK_AUTH': True,
    'SUPABASE_URL': SUPABASE_URL,
    'SUPABASE_KEY': SUPABASE_SECRET_KEY,
    'CONVERSATION_MAX_TOKENS': 1696, # Specifically selected to be the length of the AI response + 1
    'FLASK_ENV': 'development',
})
