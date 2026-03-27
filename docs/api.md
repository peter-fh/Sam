# Base endpoints

These endpoints are used to serve the website, and are the standard endpoints required to serve a react application. These do not require authorization, as they serve the login page along with the site.

## GET /

Serves index.html (generated automatically from the react-typescript frontent)

## GET /assets/\<path:path>

Serves the css and js files output by the react build. This endpoint is automatically called by the index.html returned by the root `/` endpoint


## GET /icon.png

Serves the page's icon, called automatically

# API Endpoints: `/api/*`

## Auth

Authorization is added to each endpoint via the require_auth decorator. It uses Supabases's auth library, meaning both saving user data and ensuring a user is authorized is handled using their API. This decorator both ensures authorization and saves their info and user id for each endpoint handler to use. All `/api/` endpoints require authorization

Authorization should be sent as a header, as follows:

```json
"Authorization": "Bearer 12345"
```

where `12345` is an example authorization token.

## POST /api/conversations

Adds a new conversation to the database and returns the new conversation ID

### Request

Content-Type: "application/json"

Schema:
```json
{
    "course": string
}
```

### Response

Success code: 201

Content-Type: "application/json"

Schema:
```json
{
    "id": int
}
```

## GET /api/conversations

Returns all the conversations linked to the current user

### Response

Success code: 201

Content-Type: "application/json"

Schema:
```json
[
    {
        "id": int,
        "updated_at": timestamp,
        "summary": string,
        "title": string,
        "course_id": int,
        "mode_id": int | null,
        "user_id": UUID
    },
    ...
]
```

## GET /api/conversations/\<int:conversation_id\>

Returns all of the chat settings and messages linked to the conversation, if that conversation belongs to the current user 

### Response

Success code: 200

Content-Type: "application/json"

Response Schema:
```json
{
    "messages": [
    {
        "content": string,
        "role": string,
        "timestamp": timestamp
    },
    ...
    ]
    "summary": string,
    "mode": string,
    "course": string,
    "summarized_at": timestamp
}
```

## POST /api/chat

Endpoint for getting the response to the user's message, taking the message in the request body and returning a stream.

### Request

Content-Type: "application/json"

Schema:
```json
{
    "id": int,
    "message": string,
    "image": string | null
}
```

### Response

Content-Type: "text/plain"

Returns a stream with chunks separated by newlines. Each chunk is expected to be read separated by newlines, though multiple chunks may be sent at the same time. There is a start symbol, `__START__`, and end symbol, `__END__`, and a possible error symbol if an error occurs during generation, `__ERROR__`.

Example successful response:
```text
__START__\nThis\nis\nan\nexample\nresponse\n\n\n__END__\n
```

