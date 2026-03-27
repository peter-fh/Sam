# Web server: Docker

This project uses a Dockerfile along with `docker-compose.yml` to build and run this project. It is deployed to `docker.io/peterfh/sam`.

## Build step

The docker build has three main steps:
- Build the frontend react project, copying the output to `/static/`
- Clone the prompts from the separate prompt repo, copying to `/prompts/`
- Install the backend dependencies

## Run step

The server is a flask app, run with [gunicorn](https://gunicorn.org/). The current command runs 4 workers and serves to the local url `0.0.0.0:5000`.

# Database

The database uses Supabase with the project url `https://qjdmulkugvgxzitgxcae.supabase.co`. All tables have row level security, which means they require a secret key that will only be present in the server environment, required to read or write any data in the database.  For more information, see [database.md](./database.md).

# AI 

The server integrates with [openrouter](https://openrouter.ai/), which allows us to use a single API key to integrate with any Generative AI API. This allows us to keep both Generative AI API integration and billing in the same place while choosing between any LLM model that is available, ensuring we can continue to use the cutting edge of AI available with few changes.
