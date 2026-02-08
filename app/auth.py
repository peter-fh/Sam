from typing import Any
from flask import g, jsonify, request, current_app
import time
from functools import wraps

def require_auth(f: Any):
    """Decorator to require authentication for routes"""
    @wraps(f)
    def decorated_function(*args: Any, **kwargs: Any):
        auth_header = request.headers.get('Authorization')

        accepted_domains = ['concordia.ca', 'live.concordia.ca']

        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization header required'}), 401

        token = auth_header.split(' ')[1]

        supabase = current_app.extensions["supabase"]

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

        return jsonify({'error': 'Authentication service temporarily unavailable'}), 503
    return decorated_function
