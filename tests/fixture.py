import os
from pathlib import Path
from dotenv import load_dotenv

from openai import AsyncOpenAI, OpenAI
# from supabase import Client, create_client

from app.core.types import ModelType
from app.core.prompt import PromptManager, PromptManagerConfig
from app.services.ai_service import AIService, AIConfig
# from app.services.db_service import Database


class Fixture:
    api: AIService
    test_iterations: int
    mode_test_case: int | None = None
    def __init__(self, iters: int = 1):
        self.api = load_test_fixture()
        self.test_iterations = iters
    def setIterations(self, iters: int):
        self.test_iterations = iters
    def setModeTestCase(self, case: int):
        self.mode_test_case = case


def load_test_fixture() -> AIService:
    _ = load_dotenv(override=True)
    # SUPABASE_URL=os.getenv("SUPABASE_URL", "")
    # SUPABASE_KEY=os.getenv("SUPABASE_SERVICE_KEY", "")
    OPENAI_API_KEY=os.getenv("OPENROUTER_API_KEY", "")

    openai_client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENAI_API_KEY
    )
    async_openai_client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENAI_API_KEY
    )

    # supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    # db = Database(supabase)
    api_config = AIConfig(
        concept_model=ModelType.gpt_5_mini,
        problem_model=ModelType.gpt_5_mini,
        study_model=ModelType.gpt_5_mini,
        utility_model=ModelType.gemini_2_5_flash_lite,
        mode_model=ModelType.gemini_2_5_flash_lite,
        debug_mode=True,
        mock_mode=False,
        conversation_max_tokens=5000,
    )
    prompt_manager_config = PromptManagerConfig(
        outline_dir = Path("./prompts/outlines"),
        problem_dir = Path("./prompts/problem-mode"),
        concept_dir = Path("./prompts/concept-mode"),
        default_dir = Path("./prompts/default-mode"),
        util_dir = Path("./api/static"),
        mode_dir = Path("./api/static/mode_prompts")
    )

    prompt_manager = PromptManager(prompt_manager_config)

    api = AIService(
        config=api_config,
        client=openai_client,
        async_client=async_openai_client,
        prompt_manager=prompt_manager,
    )

    return api
