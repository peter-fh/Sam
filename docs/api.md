# Endpoints (server.py)

## Auth

Authorization is added to each endpoint via the require_auth decorator. It uses Supabases's auth library, meaning both saving user data and ensuring a user is authorized is handled using their API. This decorator both ensures authorization and saves their info and user id for each endpoint handler to use.

## API: /api/{endpoint}

All API endpoints integrate with the OpenAI API. The instructions, models used, and content of the queries to the API differ depending on the endpoint.

### POST /api/question
Used for asking Sam a question. Sends the user question directly to whatever model is chosen, using instructions based on the mode selected and outline based on the course selected.

### POST /api/summary
Takes a list of messages in the conversation and summarizes them. Prevents conversations from getting too long and costing us a lot of input tokens.

### POST /api/image
Takes an image and gives a transcription of the text on it. Allows us to use models that don't take image input within Sam, since we take the transcription of the math on the image.

### POST /api/title

Gives each conversation a title, displayed in the threads view ({url}/threads)

## Database: /db/{endpoint}

### /db/conversations

#### GET
Returns an ordered list of conversations linked to the specific user

#### POST
Adds a new conversation to the database with a title, course and current mode collumns

### /db/conversations/<conversation_id>

#### GET
Returns an ordered list of messages in the specified conversation

#### POST
Adds a new message to a conversation with the given conversation ID

### /db/conversations/settings/<conversation_id>

#### GET
Returns the settings (course and current mode) for the specified conversation

#### POST
Updates the settings (course and mode) for the specified conversation

### /db/conversations/summary/<conversation_id>

#### GET
Returns the summary for the specified conversation

#### POST
Updates the summary for the specified conversation


## Other endpoints

### icon.png

serves frontend/dist/icon.png

### /assets/\<path:path>

serves all files in frontend/dist/assets/

### /

Serves index.html (generated automatically from the react-typescript frontent)


