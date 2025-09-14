import os
import time

from dotenv import load_dotenv
from openai import OpenAI
from supabase import Client, create_client

from supabase import create_client, Client

from api.api import API, APIConfig, ModelType
from api.prompt import Mode
from db import Database
import anthropic

def testGetMode(question, type: Mode | None):

    client = anthropic.Client()

    question = "derivative of x^2"
    instructions = """
A user has asked an AI tutoring assistant the following question: '${question}'. Classify this question and respond with only the word 'Problem', 'Concept', or 'Other'.
    """.replace("${question}", question)
    start_time = time.time()
    response = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=16,
        messages=[{"role": "user", 
                   "content": instructions
                   }]
    )
    end_time = time.time()
    duration = end_time - start_time
    print("Duration for only Anthropic API call for mode: %ss" % duration)
    print("Response: %s", response.content)
    text_response = response.content[0].text.lower()
    if 'concept' in text_response:
        return Mode.CONCEPT
    if 'problem' in text_response:
        return Mode.PROBLEM
    if 'other' in text_response:
        return Mode.OTHER
    return None

load_dotenv(override=True)
ANTHROPIC_API_KEY=os.getenv("ANTHROPIC_API_KEY")
SUPABASE_URL=os.getenv("SUPABASE_URL")
SUPABASE_KEY=os.getenv("SUPABASE_SERVICE_KEY")
OPENAI_API_KEY=os.getenv("OPENAI_API_KEY")

openai_client = OpenAI()
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
db = Database(supabase)
api_config = APIConfig(
    concept_model=ModelType.gpt_5_mini,
    problem_model=ModelType.gpt_5_mini,
    study_model=ModelType.gpt_5_mini,
    utility_model=ModelType.gpt_5_mini,
    debug_mode=True,
    mock_mode=False,
)
api = API(api_config, openai_client, db)

total_start = time.time()
prompt_type = None
conversation = "Derivative of x^2"
api_start = time.time()
prompt_type = testGetMode(conversation, prompt_type)
api_end = time.time()

total_end = time.time()
total_duration = total_end - total_start
api_duration = api_end - api_start
print("Total get mode took %s seconds" % total_duration)
print("API get mode took %s seconds" % api_duration)

if prompt_type != None:
    print(prompt_type.value)
