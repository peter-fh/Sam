from flask import Blueprint, Response, jsonify, request, current_app, stream_with_context
from werkzeug.exceptions import HTTPException
from app.auth import require_auth
from app.services.ai_service import API
from app.core.types import Mode
import asyncio


bp = Blueprint('api', __name__, url_prefix='/api')

@bp.errorhandler(Exception)
def handle_exception(e: Exception):
    if isinstance(e, HTTPException):
        return e
    return jsonify({
        "type": type(e).__name__,
        "message": str(e)
    }), 500

@bp.route('/summary', methods=['POST'])
@require_auth
def fetch_summary():
    conversation = request.get_json()
    api: API = current_app.extensions['api']
    summary = asyncio.run(api.getSummary(conversation))
    return summary

@bp.route('/image', methods=['POST'])
@require_auth
def fetch_transcription():
    image = request.get_data(as_text=True)
    api: API = current_app.extensions['api']
    transcription = asyncio.run(api.getTranscription(image))
    return transcription

@bp.route('/title', methods=['POST'])
@require_auth
def fetch_title():
    question = request.get_data(as_text=True)
    api: API = current_app.extensions['api']
    title = asyncio.run(api.getTitle(question))
    return title

@bp.route('/mode', methods=['POST'])
@require_auth
def fetch_mode():
    mode = request.headers["Mode"]
    prompt_type = None
    try:
        prompt_type = Mode[mode.upper()]
    except:
        pass
    conversation = request.get_json()
    api: API = current_app.extensions['api']
    prompt_type = asyncio.run(api.getMode(conversation, prompt_type))
    return prompt_type

@bp.route('/question', methods=['POST'])
@require_auth
def fetch_response():

    # Retrieve question and its context from the request
    course = request.headers["Course"]
    brevity = request.headers["Brevity"]
    mode = request.headers["Mode"]
    try:
        prompt_type = Mode[mode.upper()]
    except KeyError:
        return "Could not get prompt type! Was given \"%s\"" % mode

    conversation = request.get_json()

    api: API = current_app.extensions['api']
    stream = api.getMessage(conversation, course, prompt_type, brevity)

    return Response(stream_with_context(stream), content_type="text/plain")
