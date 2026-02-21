import logging
from typing import Any
from flask import Flask
from flask_cors import CORS
from openai import AsyncOpenAI, OpenAI
from supabase import create_client, Client
from pathlib import Path

from app.config import Config
from app.core.types import ModelType
from app.core.prompt import PromptManager, PromptManagerConfig
from app.services.ai_service import AIConfig
from app.services.api import API

from app.routes.all import bp as api_bp
from app.routes.main import bp as main_bp

def create_app(test_config: Any=None):
    app_dir = Path(__file__).parent
    root_dir = app_dir.parent
    static_dir = root_dir / 'static'
    prompt_dir = root_dir / 'prompts'
    app_static_dir = app_dir / 'static'

    app = Flask(__name__, static_folder=static_dir)

    app.config.from_object(Config)
    if test_config:
            app.config.update(test_config)

    if app.config["FLASK_ENV"] == "development":
            _ = CORS(app)
            logging.basicConfig(level=logging.INFO, format='%(asctime)s[%(levelname)s]: %(message)s')
    else: 
            logging.basicConfig(level=logging.ERROR, format='%(asctime)s[%(levelname)s]: %(message)s')

    openai_client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=app.config["OPENROUTER_API_KEY"]
    )
    async_openai_client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=app.config["OPENROUTER_API_KEY"]
    )

    supabase: Client = create_client(
        app.config["SUPABASE_URL"], app.config["SUPABASE_KEY"]
    )

    ai_config = AIConfig(
        concept_model=ModelType.claude_haiku_4_5,
        problem_model=ModelType.claude_haiku_4_5,
        study_model=ModelType.claude_haiku_4_5,
        utility_model=ModelType.gemini_2_5_flash_lite,
        mode_model=ModelType.gemini_2_5_flash_lite,
        debug_mode=app.config["FLASK_ENV"] == "development",
        mock_mode=app.config["MOCK_MODE"],
    )
    prompt_manager_config = PromptManagerConfig(
        outline_dir = prompt_dir / 'outlines',
        problem_dir = prompt_dir / 'problem-mode',
        concept_dir = prompt_dir / 'concept-mode',
        default_dir = prompt_dir / 'default-mode',
        util_dir = app_static_dir,
        mode_dir = app_static_dir / 'mode_prompts',
    )
    prompt_manager = PromptManager(prompt_manager_config)

    api_service = API(
                 aiConfig=ai_config,
                 aiClient=openai_client,
                 asyncAiClient=async_openai_client,
                 promptManager=prompt_manager,
                 supabaseClient=supabase,
        )

    app.extensions['api'] = api_service
    app.extensions['supabase'] = supabase

    app.register_blueprint(api_bp)
    app.register_blueprint(main_bp)

    return app
