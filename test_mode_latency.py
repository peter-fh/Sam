import os
import time

from dotenv import load_dotenv
from openai import OpenAI
from supabase import Client, create_client

from supabase import create_client, Client

from api.api import API, APIConfig, ModelType
from api.prompt import Mode
from db import Database


load_dotenv(override=True)
ANTHROPIC_API_KEY=os.getenv("ANTHROPIC_API_KEY")
SUPABASE_URL=os.getenv("SUPABASE_URL")
SUPABASE_KEY=os.getenv("SUPABASE_SERVICE_KEY")
OPENAI_API_KEY=os.getenv("OPENROUTER_API_KEY")

openai_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENAI_API_KEY
)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
db = Database(supabase)
api_config = APIConfig(
    concept_model=ModelType.gpt_5_mini,
    problem_model=ModelType.gpt_5_mini,
    study_model=ModelType.gpt_5_mini,
    utility_model=ModelType.gpt_5_mini,
    mode_model=ModelType.gemini_2_5_flash_lite,
    debug_mode=True,
    mock_mode=False,
)

api = API(api_config, openai_client, db)

total_start = time.time()
prompt_type = None
conversation = "Derivative of x^2"
api_start = time.time()

prompt_type = api.getMode(conversation, prompt_type)
api_end = time.time()

total_end = time.time()
total_duration = total_end - total_start
api_duration = api_end - api_start
print("Total get mode took %s seconds" % total_duration)
print("API get mode took %s seconds" % api_duration)

if prompt_type != None:
    print(prompt_type)
