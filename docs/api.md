# Endpoints

## API: /api/{endpoint}

All API endpoints integrate with the OpenAI API. The instructions, models used, and content of the queries to the API differ depending on the endpoint.

### /api/question
Used for asking Sam a question. Sends the user question directly to whatever model is chosen, using instructions based on the mode selected and outline based on the course selected.

### /api/summary
Takes a list of messages in the conversation and summarizes them. Prevents conversations from getting too long and costing us a lot of input tokens.

### /api/image
Takes an image and gives a transcription of the text on it. Allows us to use models that don't take image input within Sam, since we take the transcription of the math on the image.

### /api/title

Gives each conversation a title, displayed in the threads view ({url}/threads)

## Other endpoints

### icon.png

serves frontend/dist/icon.png

### /assets/\<path:path>

serves all files in frontend/dist/assets/

### /

Serves index.html (generated automatically from the react-typescript frontent)


