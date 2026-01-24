import os
import sys
import time

import asyncio

from flask import Flask, g, jsonify, request, send_from_directory, stream_with_context, Response
from flask_cors import CORS
from openai import AsyncOpenAI, OpenAI
from dotenv import load_dotenv
from supabase import Client, create_client

from supabase import create_client, Client

from functools import wraps
from api.prompt import Mode
from api.api import API, APIConfig, ModelType
from db import Database

def create_app(test_config=None):
    app = Flask(__name__, static_folder="frontend/dist")

    load_dotenv(override=True)

    mock = False
    mock_env_key = os.getenv("MOCK_MODE")
    if mock_env_key != None:
        if mock_env_key.lower() == "true":
            mock = True

    app.config.from_mapping(
        FLASK_ENV=os.getenv("FLASK_ENV", "production"),
        SUPABASE_URL=os.getenv("SUPABASE_URL"),
        SUPABASE_KEY=os.getenv("SUPABASE_SERVICE_KEY"),
        OPENROUTER_API_KEY=os.getenv("OPENROUTER_API_KEY"),
        MOCK_MODE=mock
    )

    if test_config:
            app.config.update(test_config)

    if not app.config["OPENROUTER_API_KEY"]:
        print("OPENROUTER_API_KEY not found, defaulting to mock mode")
        app.config["MOCK_MODE"] = True

    if app.config["FLASK_ENV"] == "development":
            CORS(app)

    
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

    db = Database(supabase)
    api_config = APIConfig(
        concept_model=ModelType.claude_haiku_4_5,
        problem_model=ModelType.claude_haiku_4_5,
        study_model=ModelType.claude_haiku_4_5,
        utility_model=ModelType.gemini_2_5_flash_lite,
        mode_model=ModelType.gemini_2_5_flash_lite,
        debug_mode=app.config["FLASK_ENV"] == "development",
        mock_mode=app.config["MOCK_MODE"],
    )

    api = API(
        config=api_config,
        client=openai_client,
        async_client=async_openai_client,
        db=db
    )

    def require_auth(f):
        """Decorator to require authentication for routes"""
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')

            accepted_domains = ['concordia.ca', 'live.concordia.ca']
            
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'Authorization header required'}), 401
            
            token = auth_header.split(' ')[1]
            
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = supabase.auth.get_user(token)
                    if response is None or response.user is None:
                        return jsonify({'error': 'Invalid token'}), 401

                    if response.user.email is None:
                        return jsonify({'error': 'No email address linked to user'}), 401

                    domain = response.user.email.split("@")[-1]
                    if domain not in accepted_domains:
                        return jsonify({'error': 'Email is not from a valid Concordia domain'}), 401


                    g.user = response.user
                    g.user_id = response.user.id

                    return f(*args, **kwargs)

                except Exception as e:
                    print(f"Attempt {attempt + 1} failed: {e}")
                    if attempt == max_retries - 1:
                        return jsonify({'error': 'Authentication service temporarily unavailable'}), 503
                    time.sleep(2 ** attempt)  # Exponential backoff
        
        return decorated_function


    @app.route("/assets/<path:path>")
    def serve_assets(path):
        if not app.static_folder:
            raise Exception("Static folder not found!")
        return send_from_directory(app.static_folder + os.sep + "assets", path)

    @app.route('/icon.png')
    def icon():
        if not app.static_folder:
            raise Exception("Static folder not found!")

        return send_from_directory(app.static_folder, 'icon.png', mimetype='image/png')


    @app.route('/api/summary', methods=['POST'])
    @require_auth
    def fetch_summary():
        conversation = request.get_json()
        return asyncio.run(api.getSummary(conversation))


    @app.route('/api/image', methods=['POST'])
    @require_auth
    def image():
        image = request.get_data(as_text=True)
        return asyncio.run(api.getTranscription(image))

    @app.route('/api/title', methods=['POST'])
    @require_auth
    def title():
        question = request.get_data(as_text=True)
        start_time = time.time()
        fetched_title = asyncio.run(api.getTitle(question))
        end_time = time.time()
        print('Title took ' + str(end_time - start_time))
        return fetched_title

    @app.route('/api/mode', methods=['POST'])
    @require_auth
    def mode():
        total_start = time.time()
        mode = request.headers["Mode"]
        prompt_type = None
        try:
            prompt_type = Mode[mode.upper()]
        except:
            pass
        conversation = request.get_json()
        api_start = time.time()
        prompt_type = asyncio.run(api.getMode(conversation, prompt_type))
        api_end = time.time()
        if prompt_type == None:
            return "Did not get type"

        total_end = time.time()
        total_duration = total_end - total_start
        api_duration = api_end - api_start
        print("Total get mode took %s seconds" % total_duration)
        print("API get mode took %s seconds" % api_duration)

        return prompt_type

    # Handles clicking the "Ask" button
    @app.route('/api/question', methods=['POST'])
    @require_auth
    def question():

        # Retrieve question and its context from the request
        course = request.headers["Course"]
        brevity = request.headers["Brevity"]
        mode = request.headers["Mode"]
        try:
            prompt_type = Mode[mode.upper()]
        except KeyError:
            return "Could not get prompt type! Was given \"%s\"" % mode

        conversation = request.get_json()

        stream = api.getMessage(conversation, course, prompt_type, brevity)

        res = Response(stream_with_context(stream), content_type="text/plain")
        return res

    @app.route('/db/conversations')
    @require_auth
    def get_conversations():
        conversations = db.getConversations(g.user_id)
        return jsonify(conversations)

    @app.route('/db/conversations/<int:conversation_id>')
    @require_auth
    def get_conversation(conversation_id: int):
        conversation = db.getConversation(g.user_id, conversation_id)
        return jsonify(conversation)

    @app.route('/db/conversations/settings/<int:conversation_id>')
    @require_auth
    def get_settings(conversation_id):
        settings = db.getSettings(g.user_id, conversation_id)
        return jsonify(settings)

    @app.route('/db/conversations/summary/<int:conversation_id>')
    @require_auth
    def get_summary(conversation_id):
        summary = db.getSummary(g.user_id, conversation_id)
        return jsonify(summary)


    @app.route('/db/conversations', methods=['POST'])
    @require_auth
    def add_conversation():
        data = request.get_json()

        title = data['title']
        course = data['course']
        mode = data['mode']

        id = db.addConversation(g.user_id, title, course, mode)
        return jsonify(id)

    @app.route('/db/conversations/<int:conversation_id>', methods=['POST'])
    @require_auth
    def add_message(conversation_id):
        data = request.get_json()

        role = data['role']
        content = data['content']

        db.addMessage(conversation_id, role, content)

        return jsonify(''), 201

    @app.route('/db/conversations/summary/<int:conversation_id>', methods=['POST'])
    @require_auth
    def update_summary(conversation_id):
        data = request.get_json()

        summary = data['summary']
        db.updateSummary(conversation_id, summary)
        return jsonify(''), 201

    @app.route('/db/conversations/settings/<int:conversation_id>', methods=['POST'])
    @require_auth
    def update_mode(conversation_id):
        data = request.get_json()

        mode = data['mode']

        db.updateMode(conversation_id, mode)

        return jsonify(''), 201


    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def index(path):
        if not app.static_folder:
            raise Exception("Static folder not found!")
        return send_from_directory(app.static_folder, "index.html")


    return app


app = create_app()

if __name__ == "__main__":

    if len(sys.argv) > 1 and sys.argv[1] == "--mock":
        app.config["MOCK_MODE"] = True
        print("Running in --mock mode")

    port = 8070
    print("\n" + "=" * 70)
    print(f'{"=    Enter the following url into the browser:":<69}=')
    print(f'{"=    http://127.0.0.1:" + str(port):<69}=')
    print("=" * 70 + "\n")

    app.run(port=port, debug=app.config["FLASK_ENV"] == "development")

