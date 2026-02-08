from pathlib import Path
from flask import Blueprint, current_app, send_from_directory

bp = Blueprint('main', __name__)

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
    print("Static folder: ", current_app.static_folder)
    return send_from_directory(current_app.static_folder, "index.html")
