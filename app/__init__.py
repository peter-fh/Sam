from typing import Any
from flask import Flask
from flask_cors import CORS
from openai import AsyncOpenAI, OpenAI
from supabase import create_client, Client
from pathlib import Path

from app.config import Config
from app.core.types import ModelType
from app.core.prompt import PromptManager, PromptManagerConfig
from app.services.ai_service import API, APIConfig
from app.services.db_service import Database

from app.routes.api import bp as api_bp
from app.routes.db import bp as db_bp
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

    openai_client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=app.config["OPENROUTER_API_KEY"]
    )
    async_openai_client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=app.config["OPENROUTER_API_KEY"]
    )

    print(app.config["SUPABASE_URL"])
    supabase: Client = create_client(
        app.config["SUPABASE_URL"], app.config["SUPABASE_KEY"]
    )

    api_config = APIConfig(
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

    ai_service = API(
        config=api_config,
        client=openai_client,
        async_client=async_openai_client,
        prompt_manager=prompt_manager,
    )
    db_service = Database(supabase)

    app.extensions['api'] = ai_service
    app.extensions['db'] = db_service
    app.extensions['supabase'] = supabase

    app.register_blueprint(api_bp)
    app.register_blueprint(db_bp)
    app.register_blueprint(main_bp)

    return app
