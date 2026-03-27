# Concordia Sam

This project is a prototype of a tutoring AI that uses Generative AI. It sends specialized prompts that contain the relevant information about specific courses that a student is taking and asking questions about. It also contains specific instructions in order to respond to each question and type of question in the most helpful ways.

## Why is Sam better than using regular Generative AI sites?

See [Sam-Prompts/readme.md](https://github.com/peter-fh/Sam-Prompts/blob/main/README.md) for details about Sam's behaviour and how it differs and improves from regular generative AI sites for math tuturoing.

These prompts are held in a different repository: [peterfh/Sam-Prompt](https://github.com/peter-fh/Sam-Prompts).

## API

Backend is written in Flask. For information about the backend, API, and Auth, see [docs/api.md](docs/api.md)

## Database

This project uses Supabase, which is a mangaged PostgresQL instance. for more information, see [docs/database.md](./docs/database.md).

## Frontend

Frontend is a React-Typescript Single Page Application. For more information, see [docs/frontend.md](docs/frontend.md).

## Deployment

This project uses Docker for building, Supabase for the database, and integrates with Openrouter API for Generative AI integration. For more information, see [docs/deployment.md](./docs/deployment.md).

This project is deployed via Render.com to [csam.onrender.com](https://csam.onrender.com). In its current state, the site takes 50 seconds to spin up after it is inactive for some time. If it does not load, wait or try again in 50 seconds. This will be resolved when we can invest in a paid hosting service, whether onrender or something else.

## Testing

Sam uses three separate tests suite, two of which run automatically and are required to pass for each commit. For more information, see [docs/testing.md](./docs/testing.md)

## Contributing

For information about contributing to this project, see [CONTRIBUTING.md](CONTRIBUTING.md).

