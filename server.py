import os
import sys

from flask import Flask, request, send_from_directory, stream_with_context, Response
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
from supabase import Client, create_client

from api.prompt import PromptType
from api.api import API, APIConfig, ModelType
from db import Database

def create_app(test_config=None):
    app = Flask(__name__, static_folder="frontend/dist")

    load_dotenv(override=True)

    app.config.from_mapping(
        FLASK_ENV=os.getenv("FLASK_ENV", "production"),
        OPENAI_API_KEY=os.getenv("OPENAI_API_KEY"),
        SUPABASE_URL=os.getenv("SUPABASE_URL"),
        SUPABASE_KEY=os.getenv("SUPABASE_SERVICE_KEY"),
        MOCK_MODE=False,
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
        concept_model=ModelType.gpt_4_1,
        problem_model=ModelType.o3_mini,
        study_model=ModelType.gpt_4_1_mini,
        utility_model=ModelType.gpt_4_1_mini,
        debug_mode=app.config["FLASK_ENV"] == "development",
        mock_mode=app.config["MOCK_MODE"],
    )
    api = API(api_config, openai_client, db)

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
        mode = request.headers["Mode"]
        prompt_type = None
        try:
            prompt_type = PromptType[mode.upper()]
        except:
            pass
        conversation = request.get_json()
        prompt_type = api.getMode(conversation, prompt_type)
        if prompt_type == None:
            return "Did not get type"

        return prompt_type.value

    # Handles clicking the "Ask" button
    @app.route('/api/question', methods=['POST'])
    def question():

        # Retrieve question and its context from the request
        course = request.headers["Course"]
        brevity = request.headers["Brevity"]
        mode = request.headers["Mode"]
        try:
            prompt_type = PromptType[mode.upper()]
        except KeyError:
            return "Could not get prompt type! Was given \"%s\"" % mode

        conversation = request.get_json()

        stream = api.ask(conversation, course, prompt_type, brevity) 

        res = Response(stream_with_context(stream), content_type="text/plain")
        return res

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

