from flask import Blueprint, Response, jsonify, request, current_app, stream_with_context, g
from werkzeug.exceptions import HTTPException
from app.auth import require_auth
from app.services.api_service import API, ConversationResult
from app.core.types import Mode
import asyncio


bp = Blueprint('api', __name__, url_prefix='/api')

'''
@bp.errorhandler(Exception)
def handle_exception(e: Exception):
    if isinstance(e, HTTPException):
        return e
    return jsonify({
        "type": type(e).__name__,
        "message": str(e)
    }), 500

        '''

@bp.route('/conversations', methods=['POST'])
@require_auth
def new_conversation():
    settings = request.get_json()
    course = settings['course']
    api: API = current_app.extensions['api']
    id = api.newConversation(g.user_id, course)
    return jsonify({
        'id': id
    }), 201

@bp.route('/conversations', methods=['GET'])
@require_auth
def get_conversations():
    index = request.headers.get('index')
    if index is None:
        index = 0
    api: API = current_app.extensions['api']
    conversations = api.getConversationList(g.user_id, int(index))
    return jsonify(conversations), 200

@bp.route('/conversations/<int:conversation_id>', methods=['GET'])
@require_auth
def get_messages(conversation_id: int):
    api: API = current_app.extensions['api']
    res = api.getConversationMessages(g.user_id, conversation_id)
    return jsonify(res), 200

@bp.route('/chat', methods=['POST'])
@require_auth
def new_message():
    data = request.get_json()
    id = data.get('id')
    message = data.get('message')
    image = data.get('image')

    api: API = current_app.extensions['api']
    stream = api.newMessage(g.user_id, id, message, image)
    return Response(stream_with_context(stream), content_type="text/plain")

