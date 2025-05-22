from flask import Flask, request, send_from_directory, stream_with_context, Response
from api import prompt
from api.models.o3_mini.model import OpenAI_o3_mini
from api.models.gpt_4o_mini.model import OpenAI_4o_mini
from api.models.gpt_4_1_mini.model import OpenAI_4_1_mini
from api.models.gpt_4o.model import OpenAI_4o
from api.models.gpt_4_1.model import OpenAI_4_1
from api.models.o4_mini.model import OpenAI_o4_mini
from api.prompt import PromptType
from courses.read_course_prompt import coursePrompt
from dotenv import load_dotenv
from flask_cors import CORS
import os
import sys

use_example_responses = False
load_dotenv(override=True)

dev = os.getenv("FLASK_ENV") == "development"
openai_api_key = os.getenv("OPENAI_API_KEY")

if openai_api_key == None:
    print("OPENAI_API_KEY not found, defaulting to debug mode")
    openai_api_key = ""
    use_example_responses = True

problem_model = OpenAI_o3_mini(openai_api_key,debug=dev)
problem_model.mock = use_example_responses

concept_model = OpenAI_4_1(openai_api_key,debug=dev)
concept_model.mock = use_example_responses

strategy_model = OpenAI_4_1_mini(openai_api_key, debug=dev)
strategy_model.mock = use_example_responses

utility_model = OpenAI_4_1_mini(openai_api_key,debug=dev)

# Initialize the server library
app = Flask(__name__, static_folder="frontend/dist")
if dev:
    CORS(app)

@app.route("/assets/<path:path>")
def serve_assets(path):
    if not app.static_folder:
        raise Exception("Static folder not found!")
    return send_from_directory(app.static_folder + os.sep + "assets", path)

@app.route('/api/summary', methods=['POST'])
def summary():
    conversation = request.get_json()
    return utility_model.summarize(conversation)


@app.route('/api/image', methods=['POST'])
def image():
    image = request.get_data(as_text=True)
    return utility_model.transcribe(image)

@app.route('/api/title', methods=['POST'])
def title():
    question = request.get_data(as_text=True)
    return utility_model.title(question)

# Handles clicking the "Ask" button
@app.route('/api/question', methods=['POST'])
def question():

    # Retrieve question and its context from the request
    course = request.headers["Course"]
    brevity = request.headers["Brevity"]
    question = request.headers["Type"]
    prompt_type = PromptType[question.upper()]
    conversation = request.get_json()

    course_prompt = coursePrompt(course)

    stream = None
    if prompt_type == PromptType.PROBLEM:
        stream = problem_model.ask(conversation, course_prompt, prompt_type, brevity) 
    elif prompt_type == PromptType.CONCEPT:
        stream = concept_model.ask(conversation, course_prompt, prompt_type, brevity) 
    elif prompt_type == PromptType.STUDYING:
        stream = strategy_model.ask(conversation, course_prompt, prompt_type, brevity) 
    else:
        return "Internal Server error! Invalid type of question"

    print("Estimated total cost: $%5f" % (problem_model.estimated_cost + concept_model.estimated_cost))

    return Response(stream_with_context(stream), content_type="text/plain")


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    if not app.static_folder:
        raise Exception("Static folder not found!")
    return send_from_directory(app.static_folder, "index.html")

# Run the server if this file is run
port = 8070
if __name__ == '__main__':
    print("\n\n\n")
    print("=" * 70)
    print(f'{"=    Enter the following url into the browser:":<69}=')
    print(f'{"=    http://127.0.0.1:" + str(port):<69}=')
    print("=" * 70)
    if len(sys.argv) > 1 and sys.argv[1] == "--mock":
        use_example_responses=True
    problem_model.mock = use_example_responses
    concept_model.mock = use_example_responses
    utility_model.mock = use_example_responses
    app.run(port=port, debug=True)

