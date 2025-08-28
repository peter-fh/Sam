from dotenv import load_dotenv
import os
from supabase import Client, create_client

from db import Database
from tests.test_db import testConversations, testGetMode


load_dotenv(override=True)
openai_api_key = os.getenv("OPENAI_API_KEY")
if openai_api_key == None:
    print("OPENAI_API_KEY not found, exiting")
    exit(1)


SUPABASE_URL=os.getenv("SUPABASE_URL")
SUPABASE_KEY=os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(
    SUPABASE_URL, SUPABASE_KEY
)

db = Database(supabase)

# testConversations(db)
testGetMode(db, "Problem")
testGetMode(db, "Concept")
testGetMode(db, "Other")

