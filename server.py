from flask import Flask, request, send_from_directory, stream_with_context, Response
from api.gpt import GPT
from prompt.prompt_manager import prompt, PromptType
from dotenv import load_dotenv
from flask_cors import CORS
import os
import sys
import time

use_example_responses = False
load_dotenv(override=True)

dev = os.getenv("FLASK_ENV") == "development"
openai_api_key = os.getenv("OPENAI_API_KEY")

if openai_api_key == None:
    print("OPENAI_API_KEY not found, defaulting to debug mode")
    openai_api_key = ""
    use_example_responses = True

gpt = GPT(openai_api_key)
gpt.debug = use_example_responses

# Initialize the server library
app = Flask(__name__, static_folder="frontend/dist")
if dev:
    CORS(app)


@app.route('/icon.png')
def icon():
    if not app.static_folder:
        raise Exception("Static folder not found!")

    return send_from_directory(app.static_folder, 'icon.png', mimetype='image/png')

@app.route('/font')
def font():
    if not app.static_folder:
        raise Exception("Static folder not found!")

    return send_from_directory(app.static_folder, 'proximanova.ttf')

# Handles showing the website's main page
@app.route('/')
def index():
    if not app.static_folder:
        raise Exception("Static folder not found!")
    return send_from_directory(app.static_folder, "index.html")

@app.route('/summary', methods=['POST'])
def summary():
    conversation = request.get_json()
    return gpt.summarize(conversation)

@app.route("/assets/<path:path>")
def serve_assets(path):
    if not app.static_folder:
        raise Exception("Static folder not found!")
    return send_from_directory(app.static_folder + os.sep + "assets", path)

@app.route('/introduction')
def introduction():
    def generateIntroduction():
        intro_message = "Hello! I'm Sam, an AI chatbot powered by Chat-GPT. I use context specific to Concordia to provide better explanations. AI makes mistakes, so please double check any answers you are given."
        split_message = intro_message.split(" ")
        for word in split_message:
            time.sleep(0.03)
            yield word + " "
    stream = generateIntroduction()
    return Response(stream_with_context(stream), content_type="text/plain")


@app.route('/image', methods=['POST'])
def image():
    image = request.get_data(as_text=True)
    return gpt.transcribe(image)

# Handles clicking the "Ask" button
@app.route('/question', methods=['POST'])
def question():

    # Retrieve question and its context from the request
    course = request.headers["Course"]
    brevity = request.headers["Brevity"]
    question = request.headers["Type"]
    prompt_type = PromptType[question.upper()]
    conversation = request.get_json()

    # Generate the prompt based on the course
    instructions = prompt(prompt_type, course, brevity)

    # Ask the question with its context
    stream = gpt.ask(conversation, instructions, prompt_type) 

    return Response(stream_with_context(stream), content_type="text/plain")


@app.route('/reset-cost')
def reset_cost():
    if app.debug:
        print("Reset costs")
        gpt.resetCost()
    return ""


# Run the server if this file is run
port = 8070
if __name__ == '__main__':
    print("\n\n\n")
    print("=" * 70)
    print(f'{"=    Enter the following url into the browser:":<69}=')
    print(f'{"=    http://127.0.0.1:" + str(port):<69}=')
    print("=" * 70)
    if len(sys.argv) > 1 and sys.argv[1] == "--no-api":
        use_example_responses=True
    gpt.debug = use_example_responses
    app.run(port=port, debug=True)

