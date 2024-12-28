# Contributing

Thank you for considering contributing to this project! Any contribution is welcome. 

Issues with the "help wanted" label are those that would be the most appreciated.

## Getting Started

### Prerequisites

There are a few things that are needed to get started with this project:

- Python: Any version 3.x should work but only 3.12+ have been tested
- Git
- npm (tested with 11.0.0)

### Cloning and setting up the repository

- Clone the repository:

```bash
git clone https://github.com/peter-fh/tutoring-ai.git
```

- Install dependencies and build react project

On macos and linux:
```bash
./build.sh
```

On windows:
```bash
.\build.bat
```

### Making a contribution

- Create a new branch:

```bash
git checkout -b {new_branch_name}
```

After changes are made and pushed to this branch, open a pull request to merge this branch into main. A preview deployment is automatically made for every pull request. Click "view deployment" on the comment automatically made on the pull request to see what the site will look like after your changes are deployed.

## Interacting with ChatGPT (OpenAI API)

### Pull requests

Once a pull request is created, a preview deployment is made after every commit. This will allow you to preview your changes using the same OpenAI API key as the main website.

### Locally (optional)

If you want to interact with the OpenAI API locally, you must obtain an api key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys/) and make a minimum payment of 5 USD. To use this key, rename example.env to .env and replace secret_chatgpt_api_key with your key.

## Developing

When in development mode, the frontend and backend run on different localhost ports. Both servers must be running to test the application.

### Server

To run the server, run:

```bash
python server.py
```

Debug mode will send the same example response from ChatGPT every time regardless of the input. Use this if you did not get an OpenAI API key or do not need to interact directly with their API:

```bash
python server.py --debug
```


### Frontend

To run the frontend server, run:

```bash
cd frontend
npm run dev
```

