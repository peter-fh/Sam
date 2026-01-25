import os
import time
import asyncio

from dotenv import load_dotenv
from openai import AsyncOpenAI, OpenAI
from supabase import Client, create_client

from supabase import create_client, Client

from api.api import API, APIConfig, ModelType
from api.types import Mode
from db import Database


def load_test_fixture() -> API:
    load_dotenv(override=True)
    ANTHROPIC_API_KEY=os.getenv("ANTHROPIC_API_KEY")
    SUPABASE_URL=os.getenv("SUPABASE_URL")
    SUPABASE_KEY=os.getenv("SUPABASE_SERVICE_KEY")
    OPENAI_API_KEY=os.getenv("OPENROUTER_API_KEY")

    openai_client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENAI_API_KEY
    )
    async_openai_client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENAI_API_KEY
    )

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    db = Database(supabase)
    api_config = APIConfig(
        concept_model=ModelType.gpt_5_mini,
        problem_model=ModelType.gpt_5_mini,
        study_model=ModelType.gpt_5_mini,
        utility_model=ModelType.gemini_2_5_flash_lite,
        mode_model=ModelType.gemini_2_5_flash_lite,
        debug_mode=True,
        mock_mode=False,
    )

    api = API(
        config=api_config,
        client=openai_client,
        async_client=async_openai_client,
        db=db
    )
    return api

api = load_test_fixture()

def benchmark_mode():
    total_start = time.time()
    prompt_type = None
    conversation = "Derivative of x^2"
    api_start = time.time()

    prompt_type = asyncio.run(api.getMode(conversation, prompt_type))
    api_end = time.time()

    total_end = time.time()
    total_duration = total_end - total_start
    api_duration = api_end - api_start
    print("Total get mode took %s seconds" % total_duration)
    print("API get mode took %s seconds" % api_duration)
    print(prompt_type)

def benchmark_title():
    conversation = "Derivative of x^2"

    api_start = time.time()
    title = asyncio.run(api.getTitle(conversation))
    api_end = time.time()

    api_duration = api_end - api_start
    print("API get mode took %s seconds" % api_duration)
    print(title)

if __name__ == "__main__":
    # benchmark_title()
    exit(0)
