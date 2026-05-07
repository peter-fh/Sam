##########################################################################################
#  
# Mock tests that use Flask's built-in testing capabilities
# These tests don't use any real API tokens and can be run any time
# They should be used as regression tests
# 
##########################################################################################

import logging
import os
from flask import Flask
from flask.testing import FlaskClient
import pytest
from dotenv import load_dotenv
import time

from app import create_app
from app.services.mock_ai_service import MOCK_RESPONSE as EXPECTED_RESPONSE
from app.services.mock_ai_service import MOCK_TEXT_RESPONSE as EXPECTED_TEXT_RESPONSE
from app.services.mock_ai_service import MOCK_SUMMARY as EXPECTED_SUMMARY

def generateExpectedResponse(index: int):
    response = EXPECTED_RESPONSE.replace("${in}", "${" + f'{index:02d}' + "}")
    expected_message = f"\n__START__\n{response}\n__END__\n"
    return expected_message

_ = load_dotenv(".local.env", override=True)

@pytest.fixture
def app():
    app = create_app({
        'TESTING': True,
        'MOCK_MODE': True,
        'MOCK_AUTH': True,
        'CONVERSATION_MAX_TOKENS': len(EXPECTED_RESPONSE)+1,
        'FLASK_ENV': 'development',
    })
    yield app

@pytest.fixture
def client_with_auth(app: Flask):
    """Create a test client with mock authentication enabled"""
    client = app.test_client()
    # Mock token for testing - with MOCK_AUTH enabled, the token content doesn't matter
    client.environ_base['HTTP_AUTHORIZATION'] = 'Bearer mock_test_token'
    yield client

    # admin_client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)
    # _ = admin_client.table('messages').delete().gte('id', 0).execute()
    # _ = admin_client.table('conversations').delete().gte('id', 0).execute()
    # admin_client.auth.admin.delete_user(auth_response.user.id)

def send_message(client_with_auth: FlaskClient, id: int, index: int):
    userMessage = "${" + f'{index:02d}' + "} hi"
    response = client_with_auth.post('/api/chat', json={
        'id': id,
        'message': userMessage,
        'image': None,
    })
    assert response.status_code == 201
    results = []
    for chunk in response.iter_encoded():
        results.append(chunk)
    streamed_message = b"".join(results).decode('utf-8')
    assert len(streamed_message) != 0
    expected_message = generateExpectedResponse(index)
    assert streamed_message == expected_message, f"Returned message: {streamed_message}, expected: {expected_message}"

def create_conversation(client_with_auth: FlaskClient) -> int:
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

def test_send_one_message(client_with_auth: FlaskClient):

    # [Act]
    messageIndex = 0
    id = create_conversation(client_with_auth)
    send_message(client_with_auth, id, messageIndex)
    time.sleep(3)

    # [Assert]
    response = client_with_auth.get('/api/conversations')
    assert response.status_code == 200
    data = response.get_json()
    assert data
    assert len(data) == 1
    conversation = data[0]
    title = conversation.get('title')
    assert title == EXPECTED_TEXT_RESPONSE

def test_send_one_message_log_intercept(client_with_auth: FlaskClient, caplog):

    # [Act]
    with caplog.at_level(logging.INFO):
        messageIndex = 0
        id = create_conversation(client_with_auth)
        send_message(client_with_auth, id, messageIndex)
        time.sleep(3)
        assert "Current conversation: ['user${00}']" in caplog.text

    # [Assert]
    response = client_with_auth.get('/api/conversations')
    assert response.status_code == 200
    data = response.get_json()
    assert data
    assert len(data) == 1
    conversation = data[0]
    title = conversation.get('title')
    assert title == EXPECTED_TEXT_RESPONSE

def test_send_messages_with_summary(client_with_auth: FlaskClient):

    # [Act]
    id = create_conversation(client_with_auth)
    send_message(client_with_auth, id, 0)
    time.sleep(3)
    send_message(client_with_auth, id, 1)
    time.sleep(3)


    # [Assert]
    response = client_with_auth.get('/api/conversations')
    assert response.status_code == 200
    data = response.get_json()
    assert data
    assert len(data) == 1
    conversation = data[0]
    summary = conversation.get('summary')
    assert summary == EXPECTED_SUMMARY
    title = conversation.get('title')
    assert title == EXPECTED_TEXT_RESPONSE

    response = client_with_auth.get(f'/api/conversations/{id}')
    assert response.status_code == 200
    data = response.get_json()
    messages = data.get("messages")
    assert messages
    # The max limit is specifically chosen to be larger than the original message but less than that message + 'hi' in our question
    # Both these messages should be summarized and not included in the getConversation
    assert len(messages) == 2

def test_send_messages_after_summary(client_with_auth: FlaskClient, caplog):

    # [Act]
    id = create_conversation(client_with_auth)
    send_message(client_with_auth, id, 0)
    time.sleep(3)
    send_message(client_with_auth, id, 1)
    time.sleep(3)

    with caplog.at_level(logging.INFO):
        send_message(client_with_auth, id, 2)
        time.sleep(3)
        assert "Current conversation: ['summary', 'user${01}', 'assistant${01}', 'user${02}']" in caplog.text


    # [Assert]
    response = client_with_auth.get('/api/conversations')
    assert response.status_code == 200
    data = response.get_json()
    assert data
    assert len(data) == 1
    conversation = data[0]
    summary = conversation.get('summary')
    assert summary == EXPECTED_SUMMARY
    title = conversation.get('title')
    assert title == EXPECTED_TEXT_RESPONSE

    response = client_with_auth.get(f'/api/conversations/{id}')
    assert response.status_code == 200
    data = response.get_json()
    messages = data.get("messages")
    assert messages
    # The max limit is specifically chosen to be larger than the original message but less than that message + 'hi' in our question
    # Both these messages should be summarized and not included in the getConversation
    assert len(messages) == 2

