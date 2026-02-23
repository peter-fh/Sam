##########################################################################################
#  
# Mock tests that use Flask's built-in testing capabilities
# These tests don't use any real API tokens and can be run any time
# They should be used as regression tests
# 
##########################################################################################

import os
from flask import Flask
from flask.testing import FlaskClient
import pytest
from dotenv import load_dotenv
from supabase import Client as SupabaseClient
from supabase import create_client
import time

from app import create_app
from app.services.mock_ai_service import MOCK_RESPONSE as EXPECTED_RESPONSE
from app.services.mock_ai_service import MOCK_TITLE as EXPECTED_TITLE
from app.services.mock_ai_service import MOCK_SUMMARY as EXPECTED_SUMMARY

_ = load_dotenv(override=True)
SUPABASE_URL = os.getenv('LOCAL_SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('LOCAL_SUPABASE_ANON_KEY')
SUPABASE_SECRET_KEY = os.getenv('LOCAL_SUPABASE_SECRET_KEY')

@pytest.fixture
def app():
    app = create_app({
        'TESTING': True,
        'MOCK_MODE': True,
        'SUPABASE_URL': SUPABASE_URL,
        'SUPABASE_KEY': SUPABASE_SECRET_KEY,
        'CONVERSATION_MAX_TOKENS': 1696, # Specifically selected to be the length of the AI response + 1
        'FLASK_ENV': 'development',
    })
    yield app

@pytest.fixture
def client_with_auth(app: Flask):
    assert SUPABASE_URL
    assert SUPABASE_ANON_KEY
    assert SUPABASE_SECRET_KEY

    auth_client: SupabaseClient = create_client(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
    )
    try:

        auth_response = auth_client.auth.sign_up({
            'email': 'test@concordia.ca',
            'password': 'testpassword123!'
        })
    except Exception:
        auth_response = auth_client.auth.sign_in_with_password({
            'email': 'test@concordia.ca',
            'password': 'testpassword123!'
        })

    assert auth_response.session
    assert auth_response.user
    jwt = auth_response.session.access_token
    client = app.test_client()
    client.environ_base['HTTP_AUTHORIZATION'] = f'Bearer {jwt}'

    admin_client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)
    # Deleting previous messages and conversations is required for the tests
    _ = admin_client.table('messages').delete().gte('id', 0).execute()
    _ = admin_client.table('conversations').delete().gte('id', 0).execute()
    yield client

    # Avoid deleting after the test so the db can be manually verified

    # admin_client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)
    # _ = admin_client.table('messages').delete().gte('id', 0).execute()
    # _ = admin_client.table('conversations').delete().gte('id', 0).execute()
    # admin_client.auth.admin.delete_user(auth_response.user.id)


def test_root(client_with_auth: FlaskClient):
    response = client_with_auth.get('/')
    assert response.status_code == 200

def test_get_no_conversations(client_with_auth: FlaskClient):
    response = client_with_auth.get('/api/conversations')
    assert response.status_code == 200, f"Failed! backend returned: {response.get_json()}"

def test_add_and_get_conversation(client_with_auth: FlaskClient):
    response = client_with_auth.post('/api/conversations', json={
        'course': 'MATH 203'
    })
    assert response.status_code == 201, f"Failed! backend returned: {response.get_json()}"
    response = client_with_auth.get('/api/conversations')
    assert response.status_code == 200, f"Failed! backend returned: {response.get_json()}"
    assert len(response.get_json()) == 1, f"Length of conversation is not 1. backend returned: {response.get_json()}"


# 
def test_send_one_message(client_with_auth: FlaskClient):
    def create_conversation() -> int:
        create_conversation_response = client_with_auth.post('/api/conversations', json={
            'course': 'MATH 203'
        })
        assert create_conversation_response.status_code == 201, f"Failed! backend returned: {create_conversation_response.get_json()}"
        conversation_json = create_conversation_response.get_json()
        assert conversation_json
        id = conversation_json['id']
        assert id
        assert id > 0
        return id

    def send_message(id: int):
        response = client_with_auth.post('/api/chat', json={
            'id': id,
            'message': 'hi',
            'image': None,
        })
        assert response.status_code == 201
        results = []
        for chunk in response.iter_encoded():
            results.append(chunk)
        streamed_message = b"".join(results).decode('utf-8')
        assert len(streamed_message) != 0
        expected_message = f"__START__{EXPECTED_RESPONSE}__END__"
        assert streamed_message == expected_message, f"Returned message: {streamed_message}, expected: {expected_message}"

    # [Act]
    id = create_conversation()
    send_message(id)
    time.sleep(3)

    # [Assert]
    response = client_with_auth.get(f'/api/conversations')
    assert response.status_code == 200
    data = response.get_json()
    assert data
    assert len(data) == 1
    conversation = data[0]
    title = conversation.get('title')
    assert title == EXPECTED_TITLE


def test_send_messages_with_summary(client_with_auth: FlaskClient):
    def create_conversation() -> int:
        create_conversation_response = client_with_auth.post('/api/conversations', json={
            'course': 'MATH 203'
        })
        assert create_conversation_response.status_code == 201, f"Failed! backend returned: {create_conversation_response.get_json()}"
        conversation_json = create_conversation_response.get_json()
        assert conversation_json
        id = conversation_json['id']
        assert id
        assert id > 0
        return id

    def send_message(id: int):
        response = client_with_auth.post('/api/chat', json={
            'id': id,
            'message': 'hi',
            'image': None,
        })
        assert response.status_code == 201
        results = []
        for chunk in response.iter_encoded():
            results.append(chunk)
        streamed_message = b"".join(results).decode('utf-8')
        assert len(streamed_message) != 0
        expected_message = f"__START__{EXPECTED_RESPONSE}__END__"
        assert streamed_message == expected_message, f"Returned message: {streamed_message}, expected: {expected_message}"

    # [Act]
    id = create_conversation()
    send_message(id)
    time.sleep(3)
    send_message(id)
    time.sleep(3)


    # [Assert]
    response = client_with_auth.get(f'/api/conversations')
    assert response.status_code == 200
    data = response.get_json()
    assert data
    assert len(data) == 1
    conversation = data[0]
    summary = conversation.get('summary')
    assert summary == EXPECTED_SUMMARY
    title = conversation.get('title')
    assert title == EXPECTED_TITLE

    response = client_with_auth.get(f'/api/conversations/{id}')
    assert response.status_code == 200
    data = response.get_json()
    messages = data.get("messages")
    assert messages
    # The max limit is specifically chosen to be larger than the original message but less than that message + 'hi' in our question
    # Both these messages should be summarized and not included in the getConversation
    assert len(messages) == 2

