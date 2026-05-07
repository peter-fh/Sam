import logging
from typing import Any
from flask import Flask
from flask_cors import CORS
from openai import AsyncOpenAI, OpenAI
from pathlib import Path

from app.config import Config
from app.core.types import ModelType
from app.core.prompt import PromptManager, PromptManagerConfig
from app.services.ai_service import AIConfig
from app.services.api_service import API
from app.entra_id_auth import EntraIDConfig, EntraIDTokenValidator, EntraIDAuthFlow

from app.routes.api import bp as api_bp
from app.routes.main import bp as main_bp
from app.routes.entra_id import bp as entra_id_bp

def create_app(test_config: Any = None):
    app_dir = Path(__file__).parent
    root_dir = app_dir.parent
    static_dir = root_dir / 'static'
    prompt_dir = root_dir / 'prompts'
    app_static_dir = app_dir / 'static'

    app = Flask(__name__, static_folder=static_dir)
    app.secret_key = app.config.get("SECRET_KEY", "dev-secret-key-change-in-production")

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

    # Initialize Microsoft Entra ID authentication if configured
    entra_id_validator = None
    entra_id_auth_flow = None
    if app.config.get("ENTRA_ID_TENANT_ID") and app.config.get("ENTRA_ID_CLIENT_ID"):
        try:
            entra_config = EntraIDConfig(
                tenant_id=app.config["ENTRA_ID_TENANT_ID"],
                client_id=app.config["ENTRA_ID_CLIENT_ID"],
                client_secret=app.config.get("ENTRA_ID_CLIENT_SECRET"),
                allowed_groups=app.config.get("ENTRA_ID_ALLOWED_GROUPS"),
            )
            entra_id_validator = EntraIDTokenValidator(entra_config)
            entra_id_auth_flow = EntraIDAuthFlow(entra_config)
            logging.info("Microsoft Entra ID authentication enabled")
        except Exception as e:
            logging.warning(f"Failed to initialize Entra ID: {e}")

    ai_config = AIConfig(
        concept_model=ModelType.claude_haiku_4_5,
        problem_model=ModelType.claude_haiku_4_5,
        study_model=ModelType.claude_haiku_4_5,
        utility_model=ModelType.gemini_2_5_flash_lite,
        mode_model=ModelType.gemini_2_5_flash_lite,
        debug_mode=app.config["FLASK_ENV"] == "development",
        mock_mode=app.config["MOCK_MODE"],
        conversation_max_tokens=app.config["CONVERSATION_MAX_TOKENS"]
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
                 supabaseClient=None,
                 databaseUrl=app.config["DATABASE_URL"],
                 mockMode=app.config["MOCK_MODE"],
        )

    app.extensions['api'] = api_service
    app.extensions['entra_id_validator'] = entra_id_validator
    app.extensions['entra_id_auth_flow'] = entra_id_auth_flow

    app.register_blueprint(api_bp)
    app.register_blueprint(main_bp)
    if entra_id_validator:
        app.register_blueprint(entra_id_bp)

    return app
