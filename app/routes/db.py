from flask import Blueprint, current_app, g, jsonify, request
from werkzeug.exceptions import HTTPException
from app.auth import require_auth
from app.services.db_service import Database

bp = Blueprint('db', __name__, url_prefix='/db')

@bp.errorhandler(Exception)
def handle_exception(e: Exception):
    if isinstance(e, HTTPException):
        return e
    return jsonify({
        "type": type(e).__name__,
        "message": str(e)
    }), 500

@bp.route('/conversations')
@require_auth
def get_conversations():
    db: Database = current_app.extensions['db']
    conversations = db.getConversations(g.user_id)
    return jsonify(conversations)


@bp.route('/conversations/<int:conversation_id>')
@require_auth
def get_conversation(conversation_id: int):
    db: Database = current_app.extensions['db']
    conversation = db.getConversation(conversation_id)
    return jsonify(conversation)

@bp.route('/conversations/settings/<int:conversation_id>')
@require_auth
def get_settings(conversation_id: int):
    db: Database = current_app.extensions['db']
    settings = db.getSettings(g.user_id, conversation_id)
    return jsonify(settings)

@bp.route('/conversations/summary/<int:conversation_id>')
@require_auth
def get_summary(conversation_id: int):
    db: Database = current_app.extensions['db']
    summary = db.getSummary(g.user_id, conversation_id)
    return jsonify(summary)

@bp.route('/conversations', methods=['POST'])
@require_auth
def add_conversation():
    data = request.get_json()

    title = data['title']
    course = data['course']
    mode = data['mode']

    db: Database = current_app.extensions['db']
    id = db.addConversation(g.user_id, title, course, mode)
    return jsonify(id)

@bp.route('/conversations/<int:conversation_id>', methods=['POST'])
@require_auth
def add_message(conversation_id: int):
    data = request.get_json()

    role = data['role']
    content = data['content']

    db: Database = current_app.extensions['db']
    db.addMessage(conversation_id, role, content)
    return jsonify(''), 201

@bp.route('/conversations/summary/<int:conversation_id>', methods=['POST'])
@require_auth
def update_summary(conversation_id: int):
    data = request.get_json()

    summary = data['summary']

    db: Database = current_app.extensions['db']
    db.updateSummary(conversation_id, summary)
    return jsonify(''), 201

@bp.route('/conversations/settings/<int:conversation_id>', methods=['POST'])
@require_auth
def update_mode(conversation_id: int):
    data = request.get_json()

    mode = data['mode']

    db: Database = current_app.extensions['db']
    db.updateMode(conversation_id, mode)

    return jsonify(''), 201
