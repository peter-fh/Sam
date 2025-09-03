import os
import sys
import time

from flask import Flask, jsonify, request, send_from_directory, stream_with_context, Response
from flask_cors import CORS
from openai import OpenAI
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
        OPENAI_API_KEY=os.getenv("OPENAI_API_KEY"),

        MOCK_MODE=mock
    )

    if test_config:
            app.config.update(test_config)

    if not app.config["OPENAI_API_KEY"]:
        print("OPENAI_API_KEY not found, defaulting to mock mode")
        app.config["MOCK_MODE"] = True

    if app.config["FLASK_ENV"] == "development":
            CORS(app)

    openai_client = OpenAI(api_key=app.config["OPENAI_API_KEY"])
    supabase: Client = create_client(
        app.config["SUPABASE_URL"], app.config["SUPABASE_KEY"]
    )
    db = Database(supabase)
    api_config = APIConfig(
        concept_model=ModelType.gpt_5,
        problem_model=ModelType.gpt_5,
        study_model=ModelType.gpt_5_mini,
        utility_model=ModelType.gpt_5_mini,
        debug_mode=app.config["FLASK_ENV"] == "development",
        mock_mode=app.config["MOCK_MODE"],
    )
    api = API(api_config, openai_client, db)

    def require_auth(f):
        """Decorator to require authentication for routes"""
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')

            accepted_domains = ['concordia.ca', 'live.concordia.ca']
            
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'Authorization header required'}), 401
            
            token = auth_header.split(' ')[1]
            
            try:
                print("Attempting verification")
                response = supabase.auth.get_user(token)
                print("did get_user with token")
                if response is None or response.user is None:
                    return jsonify({'error': 'Invalid token'}), 401

                if response.user.email is None:
                    return jsonify({'error': 'No email address linked to user'}), 401

                domain = response.user.email.split("@")
                if domain not in accepted_domains:
                    return jsonify({'error': 'Email is not from a valid Concordia domain'}), 401


                print("Got response.user: ", response.user)
                
                return f(*args, **kwargs)
                
            except Exception as e:
                print("Exception occurred: ", e)
                return jsonify({'error': 'Token validation failed'}), 401
        
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
    def summary():
        conversation = request.get_json()
        return api.summarize(conversation)


    @app.route('/api/image', methods=['POST'])
    def image():
        image = request.get_data(as_text=True)
        return api.transcribe(image)

    @app.route('/api/title', methods=['POST'])
    def title():
        question = request.get_data(as_text=True)
        return api.title(question)

    @app.route('/api/mode', methods=['POST'])
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
        prompt_type = api.getMode(conversation, prompt_type)
        api_end = time.time()
        if prompt_type == None:
            return "Did not get type"

        total_end = time.time()
        total_duration = total_end - total_start
        api_duration = api_end - api_start
        print("Total get mode took %s seconds" % total_duration)
        print("API get mode took %s seconds" % api_duration)

        return prompt_type.value

    # Handles clicking the "Ask" button
    @app.route('/api/question', methods=['POST'])
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

        stream = api.ask(conversation, course, prompt_type, brevity) 

        res = Response(stream_with_context(stream), content_type="text/plain")
        return res

    @app.route('/db/conversations')
    @require_auth
    def get_conversations():
        conversations = db.getConversations()
        print("Getting conversations")
        print(jsonify(conversations))
        return jsonify(conversations)

    @app.route('/db/conversations/<int:conversation_id>')
    def get_conversation(conversation_id: int):
        conversation = db.getConversation(conversation_id)
        print(jsonify(conversation))
        return jsonify(conversation)

    @app.route('/db/conversations/settings/<int:conversation_id>')
    def get_settings(conversation_id):
        settings = db.getSettings(conversation_id)
        print(jsonify(settings))
        return jsonify(settings)

    @app.route('/db/conversations/summary/<int:conversation_id>')
    def get_summary(conversation_id):
        summary = db.getSummary(conversation_id)
        print(jsonify(summary))
        return jsonify(summary)


    @app.route('/db/conversations', methods=['POST'])
    def add_conversation():
        data = request.get_json()

        title = data['title']
        course = data['course']
        mode = data['mode']

        id = db.addConversation(title, course, mode)
        return jsonify(id)

    @app.route('/db/conversations/<int:conversation_id>', methods=['POST'])
    def add_message(conversation_id):
        data = request.get_json()

        role = data['role']
        content = data['content']

        db.addMessage(conversation_id, role, content)

        return '', 201

    @app.route('/db/conversations/summary/<int:conversation_id>', methods=['POST'])
    def update_summary(conversation_id):
        data = request.get_json()

        summary = data['summary']
        db.updateSummary(conversation_id, summary)
        return '', 201

    @app.route('/db/conversations/settings/<int:conversation_id>', methods=['POST'])
    def update_mode(conversation_id):
        data = request.get_json()

        mode = data['mode']

        db.updateMode(conversation_id, mode)

        return '', 201


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

