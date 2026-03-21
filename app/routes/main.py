from pathlib import Path
from flask import Blueprint, abort, current_app, send_from_directory
from app.services.api_service import API

bp = Blueprint('main', __name__)

@bp.route("/health")
def health_check():
    api: API = current_app.extensions['api']
    if not api.healthCheck():
        abort(500, description="Some or all prompts are missing")


    if not current_app.static_folder:
        abort(500, description="Static folder not registered to flask")

    path = Path(current_app.static_folder)
    if not any(path.rglob('*.css')) or not any(path.rglob('*.js')) or not any(path.rglob('*.html')):
        abort(500, description="Some or all static files do not exist")

    return "Health check succeeded", 200

@bp.route("/assets/<path:path>")
def serve_assets(path: str):
    if not current_app.static_folder:
        raise Exception("Static folder not found!")
    static_path = Path(current_app.static_folder) / 'assets'
    return send_from_directory(static_path, path)

@bp.route('/icon.png')
def icon():
    if not current_app.static_folder:
        raise Exception("Static folder not found!")

    return send_from_directory(current_app.static_folder, 'icon.png', mimetype='image/png')

@bp.route('/', defaults={'path': ''})
@bp.route('/<path:path>')
def index(path: str):
    _ = path
    if not current_app.static_folder:
        raise Exception("Static folder not found!")
    return send_from_directory(current_app.static_folder, "index.html")
